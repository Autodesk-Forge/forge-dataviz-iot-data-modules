//
// Copyright 2021 Autodesk
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

/**
 * @classdesc Base class of all other data gateways. Data gateways are a means
 * of fetching data from a corresponding IoT data provider (e.g. AWS SiteWise
 * or Azure IoT Hub, etc.). A DataGateway by design lives on the server-side,
 * and therefore is entrusted with the access token to various data providers'
 * REST APIs. To keep the server performant, DataGateway objects simply forward
 * the return JSON results of data providers' REST APIs to the requesting client.
 * Eventual transformation of such data to the normalized format is done on the
 * client side.
 *
 * @class
 * @memberof Autodesk.DataVisualization.Data
 * @alias Autodesk.DataVisualization.Data.DataGateway
 */
class DataGateway {
    /**
     * Constructs an instance of DataGateway object.
     *
     * @param {string} projectId The project identifier. The notion of "project"
     * may mean different things for different data providers. This parameter is
     * &nbsp;meant as a way to differentiate a logical group of device models from
     * &nbsp;another group in the same data provider. In the event that a "project"
     * &nbsp;does not make sense, derived data gateway object ignores this parameter.
     */
    constructor(projectId) {
        this._projectId = projectId;
    }

    /**
     * Gets the device models defined in a given logical group.
     *
     * @returns {any|undefined} The device models in a format that is specific
     * &nbsp;to a given data provider if any is found, or undefined otherwise.
     */
    async getDeviceModels() {
        throw new Error("'getDeviceModels' not defined in derived class");
    }

    /**
     * Gets a list of devices belonging to a given device model.
     *
     * @param {string} deviceModelId Identifier of the device model for which
     * &nbsp;a list of devices is to be retrieved. Some data providers do not support
     * &nbsp;the concept of device model, for those providers this will be undefined.
     *
     * @returns {any|undefined} The list of devices in a format that is specific
     * &nbsp;to a given data provider if any is found, or undefined otherwise.
     */
    async getDevicesInModel(deviceModelId) {
        deviceModelId;
        throw new Error("'getDevicesInModel' not defined in derived class");
    }

    /**
     * Gets the aggregated data for a property of a device.
     *
     * @param {string} deviceId The identifier of the device.
     * @param {string} propertyId The identifier of the device's property.
     * @param {number} startSecond Start of the time window in Epoch second.
     * @param {number} endSecond End of the time window in Epoch second.
     * @param {"1m"|"1h"|"1d"} resolution The resolution with which all data
     * points in the specified time window are to be aggregated.
     *
     * @returns {any|undefined} The aggregated data in a format that is specific
     * &nbsp;to a given data provider if any is found, or undefined otherwise.
     */
    async getAggregates(deviceId, propertyId, startSecond, endSecond, resolution) {
        deviceId, propertyId, startSecond, endSecond, resolution;
        throw new Error("'getAggregates' not defined in derived class");
    }
}

module.exports = DataGateway;
