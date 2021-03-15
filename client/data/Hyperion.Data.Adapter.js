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

/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "(DeviceModel|DeviceData)" }] */

import { DeviceModel } from "./Hyperion.Data.DeviceModel";
import { DeviceData, AggregatedValues } from "./Hyperion.Data.DataModel";
import { getTimeInEpochSeconds, getPaddedRange } from "../../shared/Utility";
import { DateTimeSpan } from "./Hyperion.Data.Storage";

/**
 * Parameters used for device property data query.
 * @memberof Autodesk.DataVisualization.Data
 * @alias Autodesk.DataVisualization.Data.QueryParam
 */
class QueryParam {
    /**
     * Constructs an instance of QueryParam object.
     * @param {DateTimeSpan} dateTimeSpan The time range and resolution at which
     * &nbsp;aggregated values are to be retrieved.
     */
    constructor(dateTimeSpan) {
        this._dateTimeSpan = new DateTimeSpan(
            dateTimeSpan.startSecond,
            dateTimeSpan.endSecond,
            dateTimeSpan.resolution
        );
    }

    /**
     * @returns {string} The ID of device whose properties are to be queried.
     * @private
     */
    get deviceId() {
        return this._deviceId;
    }

    /**
     * @returns {string[]} The ID of the properties whose values are to be queried.
     * @private
     */
    get propertyIds() {
        return this._propertyIds;
    }

    /**
     * @returns {DateTimeSpan} The time range with resolution at which aggregated
     * values are to be retrieved.
     * @private
     */
    get dateTimeSpan() {
        return this._dateTimeSpan;
    }

    /**
     * The ID of device whose property is to be queried.
     * @param {string} value
     */
    set deviceId(value) {
        this._deviceId = value;
    }

    /**
     * The ID of the properties whose value is to be queried.
     * @param {string[]} values
     */
    set propertyIds(values) {
        this._propertyIds = values;
    }
}
export { QueryParam };

/**
 * Base class for all data adapters.
 * @memberof Autodesk.DataVisualization.Data
 * @alias Autodesk.DataVisualization.Data.DataAdapter
 */
export class DataAdapter {
    /**
     * Constructs an instance of DataAdapter class. Note that DataAdapter is
     * &nbsp;only constructed as a result of constructing one of its derived classes.
     * DataAdapter should not be used by itself.
     *
     * @param {string} id The identifier of the adapter as generated by derived
     * &nbsp;data adapter class.
     * @param {string} [baseName] The base URL used to fetch data.
     */
    constructor(id, baseName = "") {
        this._adapterId = id;
        this._baseName = baseName;
    }

    /**
     * Gets the identifier of this instance of data adapter.
     *
     * @returns {string} The identifier of this data adapter.
     */
    get id() {
        return this._adapterId;
    }

    /**
     * Loads all DeviceModel objects from the corresponding data provider. This
     * &nbsp;method must be implemented in the derived class.
     *
     * @returns {Promise<DeviceModel[]>} A promise that resolves to a single
     * &nbsp;dimensional array containing a list of loaded DeviceModel objects. If no
     * &nbsp;DeviceModel is available, the promise resolves to an empty array.
     *
     * @throws {Error} This method must be implemented in derived class.
     * @memberof Autodesk.DataVisualization.Data.DataAdapter
     * @alias Autodesk.DataVisualization.Data.DataAdapter#loadDeviceModels
     */
    async loadDeviceModels() {
        throw new Error("'loadDeviceModels' not implemented");
    }

    /**
     * Fetches actual device IDs and populates DeviceModel objects with them.
     *
     * @param {DeviceModel[]} deviceModels The DeviceModel objects for which
     * &nbsp;actual device IDs are to be populated.
     *
     * @returns {Promise<DeviceModel[]>} A promise that resolves to the
     * &nbsp;DeviceModel objects populated with actual device IDs.
     *
     * @throws {Error} This method must be implemented in derived class.
     * @memberof Autodesk.DataVisualization.Data.DataAdapter
     * @alias Autodesk.DataVisualization.Data.DataAdapter#fetchDevicesForModels
     */
    async fetchDevicesForModels(deviceModels) {
        deviceModels;
        throw new Error("'fetchDevicesForModels' not implemented");
    }

    /**
     * Fetches the property data based on the given device ID. Derived data
     * &nbsp;adapters implement this method to download relevant property data.
     *
     * @param {QueryParam} query Parameters of this query.
     *
     * @returns {Promise<DeviceData>} A promise that resolves to aggregated
     * &nbsp;property data for the queried device.
     *
     * @throws {Error} This method must be implemented in derived class.
     * @memberof Autodesk.DataVisualization.Data.DataAdapter
     * @alias Autodesk.DataVisualization.Data.DataAdapter#fetchDeviceData
     */
    async fetchDeviceData(query) {
        query;
        throw new Error("'fetchDeviceData' not implemented");
    }
}

/**
 * Data adapter class dealing with Azure service.
 * @memberof Autodesk.DataVisualization.Data
 * @alias Autodesk.DataVisualization.Data.AzureDataAdapter
 * @augments DataAdapter
 */
export class AzureDataAdapter extends DataAdapter {
    /**
     * Constructs an instance of AzureDataAdapter.
     */
    constructor(id, baseName) {
        super("AzureDataAdapter", baseName);
    }

    async getDevices(deviceModelId) {
        let devices = await fetch(`${this._baseName}/api/devices?provider=azure&project=test&model=${deviceModelId}`)
            .then((response) => {
                if (!response.ok) {
                    return Promise.reject(response.json());
                }
                return response.json();
            })
            .then((rawData) => {
                return rawData.filter((item) => item.status == "Enabled");
            })
            .catch((err) => {
                console.error(err);
            });
        return devices;
    }

    /**
     * Loads all DeviceModel objects from the current active Azure session.
     *
     * @returns {Promise<DeviceModel[]>} A promise that resolves to a single
     * &nbsp;dimensional array containing a list of loaded DeviceModel objects. If no
     * &nbsp;DeviceModel is available, the promise resolves to an empty array.
     * @memberof Autodesk.DataVisualization.Data
     * @alias Autodesk.DataVisualization.Data.AzureDataAdapter#loadDeviceModels
     */
    async loadDeviceModels() {
        const adapterId = this.id;
        return fetch(`${this._baseName}/api/device-models?provider=azure&project=test`)
            .then((response) => response.json())
            .then((rawDeviceModels) => {
                /** @type {DeviceModel[]} */
                const normalizedDeviceModels = [];

                rawDeviceModels.forEach((rdm) => {
                    // Create a normalized device model representation.
                    const ndm = new DeviceModel(rdm.deviceModelId, adapterId);
                    ndm.name = rdm.deviceModelName;
                    ndm.description = rdm.deviceModelDesc;

                    // Generate device property representation.
                    rdm.deviceProperties.forEach((rdp) => {
                        const propId = rdp.propertyId;
                        const propName = rdp.propertyName;

                        const ndp = ndm.addProperty(propId, propName);
                        ndp.description = rdp.propertyDesc;
                        ndp.dataType = rdp.propertyType;
                        ndp.dataUnit = rdp.propertyUnit;
                        ndp.rangeMin = rdp.rangeMin ? rdp.rangeMin : undefined;
                        ndp.rangeMax = rdp.rangeMax ? rdp.rangeMax : undefined;
                    });

                    normalizedDeviceModels.push(ndm);
                });

                // Fetch actual devices for each of the device models.
                return this.fetchDevicesForModels(normalizedDeviceModels);
            });
    }

    /**
     * Fetches actual device IDs and populate DeviceModel objects with them.
     *
     * @param {DeviceModel[]} deviceModels The DeviceModel objects for which
     * &nbsp;actual device IDs are to be populated.
     *
     * @returns {Promise<DeviceModel[]>} A promise that resolves to the
     * &nbsp;DeviceModel objects populated with actual device IDs.
     * @memberof Autodesk.DataVisualization.Data
     * @alias Autodesk.DataVisualization.Data.AzureDataAdapter#fetchDevicesForModels
     */
    async fetchDevicesForModels(deviceModels) {
        const promises = deviceModels.map((deviceModel) => {
            const model = deviceModel.id;
            return this.getDevices(model);
        });

        return Promise.all(promises).then((deviceList) => {
            deviceModels.forEach((deviceModel, index) => {
                // Turn data provider specific device data format into
                // the unified data format stored in Device object.
                const devices = deviceList[index];
                devices.forEach((device) => {
                    let deviceObj = deviceModel.addDevice(device.deviceId);
                    if (device.tags) {
                        deviceObj.name = device.tags.name;
                        deviceObj.deviceModel = deviceModel;
                        deviceObj.sensorTypes = deviceModel.propertyIds;

                        if (device.tags.position) {
                            let p = device.tags.position;
                            deviceObj.position = new THREE.Vector3(parseFloat(p.x), parseFloat(p.y), parseFloat(p.z));
                        }
                        deviceObj.lastActivityTime = new Date(device.lastActivityTime);
                    }
                })
            });
            return deviceModels;
        });
    }

    /**
     * Fetches the property data based on the given device ID.
     *
     * @param {QueryParam} query Parameters of this query.
     *
     * @returns {Promise<DeviceData>} A promise that resolves to an aggregated
     * &nbsp;property data for the queried device.
     * @memberof Autodesk.DataVisualization.Data
     * @alias Autodesk.DataVisualization.Data.AzureDataAdapter#fetchDeviceData
     */
    async fetchDeviceData(query) {
        const qs = this.getQueryString(query);
        const url = `${this._baseName}/api/aggregates?provider=azure&project=test&${qs}`;

        return fetch(url)
            .then((response) => {
                if (!response.ok) {
                    return Promise.reject(response.json());
                }
                return response.json();
            })
            .then((rawAggregates) => {
                const deviceData = new DeviceData(query.deviceId);
                for (let prop of query.propertyIds) {
                    const aggrValues = new AggregatedValues(query.dateTimeSpan);
                    aggrValues.tsValues = rawAggregates.timestamps.map((item) => getTimeInEpochSeconds(item));
                    for (let property of rawAggregates.properties) {
                        if (property.name === prop + "Count") {
                            aggrValues.countValues = property.values;
                        } else if (property.name === prop + "Max") {
                            aggrValues.maxValues = property.values;
                        } else if (property.name === prop + "Min") {
                            aggrValues.minValues = property.values;
                        } else if (property.name === prop + "Avg") {
                            aggrValues.avgValues = property.values;
                            aggrValues.setDataRange("avgValues", getPaddedRange(property.values));
                        } else if (property.name === prop + "Sum") {
                            aggrValues.sumValues = property.values;
                        } else if (property.name === prop + "StdDev") {
                            aggrValues.stdDevValues = property.values;
                        }
                    }

                    const propertyData = deviceData.getPropertyData(prop);
                    propertyData.setAggregatedValues(aggrValues);
                }

                return deviceData;
            })
            .catch((err) => {
                console.log(err);
                return Promise.reject(err);
            });
    }

    /**
     * Gets query string from query parameters.
     * @param {QueryParam} query Parameters of this query.
     * @returns {string} Query string representing the specified query parameters.
     * @private
     */
    getQueryString(query) {
        const did = query.deviceId;
        const pids = query.propertyIds.join(",");
        const st = query.dateTimeSpan.startSecond;
        const et = query.dateTimeSpan.endSecond;
        const res = query.dateTimeSpan.resolution;

        return `device=${did}&property=${pids}&startTime=${st}&endTime=${et}&resolution=${res}`;
    }
}

/**
 * Data adapter class dealing with sample data.
 * @memberof Autodesk.DataVisualization.Data
 * @alias Autodesk.DataVisualization.Data.RestApiDataAdapter
 * @augments DataAdapter
 */
export class RestApiDataAdapter extends DataAdapter {
    /**
     * Constructs an instance of RestApiDataAdapter.
     */
    constructor(provider = "synthetic", baseName = "") {
        super("RestApiDataAdapter", baseName);
        /* eslint-disable no-undef */
        this._provider = provider;
    }

    /**
     * Loads all DeviceModel objects from the sample REST API.
     *
     * @returns {Promise<DeviceModel[]>} A promise that resolves to a single
     * &nbsp;dimensional array containing a list of loaded DeviceModel objects. If no
     * &nbsp;DeviceModel is available, the promise resolves to an empty array.
     * @memberof Autodesk.DataVisualization.Data
     * @alias Autodesk.DataVisualization.Data.RestApiDataAdapter#loadDeviceModels
     */
    async loadDeviceModels() {
        const adapterId = this.id;
        return fetch(this._getResourceUrl("api/device-models"))
            .then((response) => response.json())
            .then((rawDeviceModels) => {
                /** @type {DeviceModel[]} */
                const normalizedDeviceModels = [];

                rawDeviceModels.forEach((rdm) => {
                    // Create a normalized device model representation.
                    const ndm = new DeviceModel(rdm.deviceModelId, adapterId);
                    ndm.name = rdm.deviceModelName;
                    ndm.description = rdm.deviceModelDesc;

                    // Generate device property representation.
                    rdm.deviceProperties.forEach((rdp) => {
                        const propId = rdp.propertyId;
                        const propName = rdp.propertyName;

                        const ndp = ndm.addProperty(propId, propName);
                        ndp.description = rdp.propertyDesc;
                        ndp.dataType = rdp.propertyType;
                        ndp.dataUnit = rdp.propertyUnit;
                        ndp.rangeMin = rdp.rangeMin ? rdp.rangeMin : undefined;
                        ndp.rangeMax = rdp.rangeMax ? rdp.rangeMax : undefined;
                    });

                    normalizedDeviceModels.push(ndm);
                });

                // Fetch actual devices for each of the device models.
                return this.fetchDevicesForModels(normalizedDeviceModels);
            });
    }

    /**
     * Fetches actual device IDs and populate DeviceModel objects with them.
     *
     * @param {DeviceModel[]} deviceModels The DeviceModel objects for which
     * &nbsp;actual device IDs are to be populated.
     *
     * @returns {Promise<DeviceModel[]>} A promise that resolves to the
     * &nbsp;DeviceModel objects populated with actual device IDs.
     * @memberof Autodesk.DataVisualization.Data
     * @alias Autodesk.DataVisualization.Data.RestApiDataAdapter#fetchDevicesForModels
     */
    async fetchDevicesForModels(deviceModels) {
        const promises = deviceModels.map((deviceModel) => {
            const model = deviceModel.id;
            return fetch(this._getResourceUrl("api/devices", { model: model }))
                .then((response) => response.json())
                .then((jsonData) => jsonData.deviceInfo);
        });

        return Promise.all(promises).then((deviceInfosList) => {
            // Assign devices to each device model.
            deviceModels.forEach((deviceModel, index) => {
                // Turn data provider specific device data format into
                // the unified data format stored in Device object.
                //
                const deviceInfos = deviceInfosList[index];
                deviceInfos.forEach((deviceInfo) => {
                    const device = deviceModel.addDevice(deviceInfo.id);
                    device.name = deviceInfo.name;

                    const p = deviceInfo.position;
                    device.position = new THREE.Vector3(parseFloat(p.x), parseFloat(p.y), parseFloat(p.z));
                    device.lastActivityTime = deviceInfo.lastActivityTime;
                    device.deviceModel = deviceModel;
                    device.sensorTypes = deviceModel.propertyIds;
                });
            });

            return deviceModels;
        });
    }

    /**
     * Fetches the property data based on the given device ID.
     *
     * @param {QueryParam} query Parameters of this query.
     *
     * @returns {Promise<DeviceData>} A promise that resolves to an aggregated
     * &nbsp;property data for the queried device.
     * @memberof Autodesk.DataVisualization.Data
     * @alias Autodesk.DataVisualization.Data.RestApiDataAdapter#fetchDeviceData
     */
    async fetchDeviceData(query) {
        const pids = query.propertyIds;
        const promises = pids.map((pid) => this._fetchPropertyData(query, pid));

        return Promise.all(promises).then((deviceDataList) => {
            const deviceData = new DeviceData(query.deviceId);
            deviceDataList.forEach((devData) => deviceData.mergeFrom(devData));
            return deviceData;
        });
    }

    /**
     * Fetches data for a single property based on the given device ID.
     *
     * @param {QueryParam} query Parameters of this query.
     * @param {string} propertyId The ID of the property.
     *
     * @returns {Promise<DeviceData>} A promise that resolves to an aggregated
     * &nbsp;property data for the queried device.
     */
    async _fetchPropertyData(query, propertyId) {
        const url = this._getResourceUrl("api/aggregates", {
            device: query.deviceId,
            property: propertyId,
            startTime: query.dateTimeSpan.startSecond,
            endTime: query.dateTimeSpan.endSecond,
            resolution: query.dateTimeSpan.resolution,
        });

        return fetch(url)
            .then((response) => response.json())
            .then((rawAggregates) => {
                // Convert 'rawAggregates' which is in the following format, into 'AggregatedValues'
                //
                // rawAggregates = {
                //     timestamps: number[],
                //     count: number[],
                //     min: number[],
                //     max: number[],
                //     avg: number[],
                //     sum: number[],
                //     stdDev: number[]
                // }
                //
                const aggrValues = new AggregatedValues(query.dateTimeSpan);
                aggrValues.tsValues = rawAggregates.timestamps;
                aggrValues.countValues = rawAggregates.count;
                aggrValues.maxValues = rawAggregates.max;
                aggrValues.minValues = rawAggregates.min;
                aggrValues.avgValues = rawAggregates.avg;
                aggrValues.sumValues = rawAggregates.sum;
                aggrValues.stdDevValues = rawAggregates.stdDev;
                aggrValues.setDataRange("avgValues", getPaddedRange(aggrValues.avgValues));

                const deviceData = new DeviceData(query.deviceId);
                const propertyData = deviceData.getPropertyData(propertyId);
                propertyData.setAggregatedValues(aggrValues);

                return deviceData;
            })
            .catch((err) => {
                console.error(err);
            });
    }

    /**
     * Gets the resource URL for a given endpoint with query parameters
     *
     * @param {string} endpoint The endpoint for the URL to generate
     * @param {Object.<string, string>} parameters Key-value pairs of query parameters
     *
     * @returns {string} The string that represents the complete resource URL
     * @private
     */
    _getResourceUrl(endpoint, parameters) {
        parameters = parameters || {};

        parameters["provider"] = this._provider;
        parameters["project"] = "unused";
        const ps = Object.entries(parameters).map(([k, v]) => `${k}=${v}`);
        return `${this._baseName}/${endpoint}?${ps.join("&")}`;
    }
}
