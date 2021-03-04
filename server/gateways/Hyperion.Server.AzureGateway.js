//
// Copyright 2020 Autodesk
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "(AuthResponse|Twin)" }] */

const DataGateway = require("./Hyperion.Server.DataGateway");
const { AuthResponse } = require("@azure/ms-rest-nodeauth");
const TaskQueue = require("../../shared/TaskQueue.js");

const tsiQueue = new TaskQueue(20, "tsiQueue", false);

const msRestNodeAuth = require("@azure/ms-rest-nodeauth");
const { IotHubClient } = require("@azure/arm-iothub");
const { Registry, Twin } = require("azure-iothub");
const Q = require("q");
const {loadJSONFile} = require("./FileUtility.js")

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

const fetch = _interopDefault(require("node-fetch"));

/**
 * @classdesc A data gateway that supplies sensor data from Azure IoT Hub.
 * @class
 * @augments DataGateway
 * @memberof Autodesk.Hyperion.Data
 * @alias Autodesk.Hyperion.Data.AzureGateway
 */
class AzureGateway extends DataGateway {
    constructor(deviceModelFile) {
        super("AzureGateway");
        this.deviceModelFile = deviceModelFile;
        this.resourceGroup = "hyperion";
        this.resourceName = "hyperion-demo-iothub";
    }

    async getDeviceModels() {
        return loadJSONFile(this.deviceModelFile);
    }

    async getDevicesInModel(deviceModelId) {
        let registry = this.getRegistry();
        let res = registry.createQuery(
            "SELECT deviceId, properties.desired, tags, lastActivityTime, status FROM devices"
        );
        let result = [];
        do {
            let page = await res.next(res.continuationToken);
            for (let properties of page.result) {
                let modelProperties = properties.desired;
                delete modelProperties.$metadata;
                delete modelProperties.$version;
                const modelId = properties.tags.modelId ? properties.tags.modelId : undefined;
                if (!modelId){
                    console.warn(`Skipped ${properties.deviceId} as it is missing the modelId tag.
                    Please add modelId : < your device-model-id> under tags in IoT hub Device Twin.`); 
                    continue;
                }
        
                if (modelId === deviceModelId) {
                    result.push({
                        deviceId: properties.deviceId,
                        modelProperties,
                        tags: properties.tags,
                        lastActivityTime: properties.lastActivityTime,
                        status: properties.status,
                        modelId: modelId,
                    });
                }
            }
        } while (res.hasMoreResults);
        return result;
    }

    /**
     * Gets authenticated through service principle and secret to services in Azure
     *
     * @returns {Promise<AuthResponse>} The authentication response object.
     */
    async connectAzure() {
        if (!this.authRes) {
            this.authRes = await msRestNodeAuth.loginWithServicePrincipalSecretWithAuthResponse(
                process.env.AZURE_CLIENT_ID,
                process.env.AZURE_APPLICATION_SECRET,
                process.env.AZURE_TENANT_ID
            );

            const client = new IotHubClient(this.authRes.credentials, process.env.AZURE_SUBSCRIPTION_ID);
            this.client = client;
        }
        return this.authRes;
    }

    /**
     * Gets authenticated to Time Series services.
     * @returns {Promise<AuthResponse>} The authentication response object.
     *
     * @todo Implement token refresh
     */
    async connectTsi() {
        if (!this.tsiAuthRes) {
            //The token audience is required in order to get a token that works with timeseries API
            let tsiAuthRes = await msRestNodeAuth.loginWithServicePrincipalSecretWithAuthResponse(
                process.env.AZURE_CLIENT_ID,
                process.env.AZURE_APPLICATION_SECRET,
                process.env.AZURE_TENANT_ID,
                { tokenAudience: "https://api.timeseries.azure.com/" }
            );
            this.tsiAuthRes = tsiAuthRes;
        }
        return this.tsiAuthRes;
    }

    /**
     * Constructs a Registry object that provides access to the IoT Hub device
     * identity service.
     *
     * @returns {Registry} The instance of Registry object that is
     * created with a specific connection string.
     */
    getRegistry() {
        if (!this.registry) {
            this.registry = Registry.fromConnectionString(process.env.AZURE_IOT_HUB_CONNECTION_STRING);
        }
        return this.registry;
    }

    /**
     * Gets the Device Twin of the device with the specified device identifier.
     *
     * @param {string} deviceId The device identifier
     * @returns {Promise<Twin>} The Device Twin
     */
    async getDeviceTwin(deviceId) {
        let defer = Q.defer();
        let registry = this.getRegistry();
        registry.getTwin(deviceId, function (err, twin) {
            if (err) {
                defer.reject(err.message);
            } else {
                defer.resolve(twin);
            }
        });

        return defer.promise;
    }

    async getAggregates(deviceId, propertyId, startSecond, endSecond, resolution) {
        await this.connectTsi();
        let token = await this.tsiAuthRes.credentials.getToken();
        // API Documentation
        // https://docs.microsoft.com/en-us/rest/api/time-series-insights/dataaccessgen2/query/execute
        // TSX Documentation
        // https://docs.microsoft.com/en-us/rest/api/time-series-insights/reference-time-series-expression-syntax

        let body = {
            aggregateSeries: {
                timeSeriesId: [deviceId],
                searchSpan: {
                    from: new Date(startSecond * 1000).toISOString(),
                    to: new Date(endSecond * 1000).toISOString(),
                },
                filter: null,
                interval: resolution,
                inlineVariables: {},
                projectedVariables: [],
            },
        };

        for (const pId of propertyId.split(",")) {
            const variable = pId + "Avg";
            body.aggregateSeries.inlineVariables[variable] = {
                kind: "numeric",
                value: {
                    tsx: "$event." + pId,
                },
                filter: null,
                aggregation: {
                    tsx: "avg($value)",
                },
            };
            body.aggregateSeries.projectedVariables.push(variable);
        }

        let defer = Q.defer();

        tsiQueue.addTask((finish) => {
            fetch(process.env.AZURE_TSI_ENV, {
                method: "POST",
                cache: "no-cache",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token.accessToken}`,
                },
                redirect: "follow",
                referrerPolicy: "no-referrer",
                body: JSON.stringify(body),
            })
                .then(function (response) {
                    response.json().then((body) => {
                        if (!response.ok) {
                            defer.reject(body);
                        } else {
                            defer.resolve(body);
                        }
                    });
                })
                .catch(function (err) {
                    defer.reject(err);
                })
                .finally(() => {
                    finish();
                });
        });

        return defer.promise;
    }
}

module.exports = AzureGateway;
