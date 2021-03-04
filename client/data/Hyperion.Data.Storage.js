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

/*
    eslint no-unused-vars: [ "error", {
        "varsIgnorePattern": "(QueryParam|DataAdapter|DeviceData|DeviceModel)"
    }]
*/

import { QueryParam } from "./Hyperion.Data.Adapter";
import { DataAdapter } from "./Hyperion.Data.Adapter";
// eslint-disable-next-line no-unused-vars
import { DeviceData, AggregatedValues } from "./Hyperion.Data.DataModel";
import { DeviceModel,DeviceProperty } from "./Hyperion.Data.DeviceModel";
// eslint-disable-next-line no-unused-vars
import { EventSource, QueryCompletedEventArgs, EventType } from "./Hyperion.Data.Event";
import { RequestPool } from "./Hyperion.Data.RequestPool";

/**
 * Specifies the start and end points of a window in time,
 * along with a resolution that helps determine at which interval the time series
 * data is to be aggregated.
 * @memberof Autodesk.Hyperion.Data
 * @alias Autodesk.Hyperion.Data.DateTimeSpan
 */
class DateTimeSpan {
    /**
     * Constructs an instance of DateTimeSpan object.
     *
     * @param {number} startSecond Start time expressed in Unix epoch second,
     * &nbsp;which is the number of seconds that have elapsed since January 1, 1970
     * &nbsp;(midnight UTC/GMT).
     * @param {number} endSecond End time expressed in Unix epoch second,
     * &nbsp;which is the number of seconds that have elapsed since January 1, 1970
     * &nbsp;(midnight UTC/GMT).
     * @param {string} resolution The interval at which time series data is to
     * &nbsp;be aggregated. This parameter is specified in ISO-8601 duration format.
     * &nbsp;For example, 1 minute is "PT1M", 1 millisecond is "PT0.001S". For more
     * &nbsp;information, see https://www.w3.org/TR/xmlschema-2/#duration.
     */
    constructor(startSecond, endSecond, resolution) {
        this._startSecond = startSecond;
        this._endSecond = endSecond;
        this._resolution = resolution;
    }

    /**
     * @returns {number} Start time expressed in Unix epoch second, which
     * &nbsp;is the number of seconds that have elapsed since January 1, 1970
     * &nbsp;(midnight UTC/GMT).
     */
    get startSecond() {
        return this._startSecond;
    }

    /**
     * @returns {number} End time expressed in Unix epoch second, which
     * &nbsp;is the number of seconds that have elapsed since January 1, 1970
     * &nbsp;(midnight UTC/GMT).
     */
    get endSecond() {
        return this._endSecond;
    }

    /**
     * @returns {string} The interval at which time series data is to be
     * &nbsp;aggregated. This parameter is specified in ISO-8601 duration format.
     * &nbsp;For example, 1 minute is "PT1M", 1 millisecond is "PT0.001S". For more
     * &nbsp;information, see https://www.w3.org/TR/xmlschema-2/#duration.
     */
    get resolution() {
        return this._resolution;
    }

    /**
     * @returns {string} The hash code that represents this instance of
     * &nbsp;DateTimeSpan object. Two instances of the DateTimeSpan objects that
     * &nbsp;have the same start time, end time and resolution value will produce
     * &nbsp;the same hash code.
     */
    get hashCode() {
        return `${this._startSecond}-${this._endSecond}-${this._resolution}`;
    }
}
export { DateTimeSpan };

/**
 * Class that provides a view into the data source
 * @memberof Autodesk.Hyperion.Data
 * @alias Autodesk.Hyperion.Data.DataView
 * @augments EventSource
 */
class DataView extends EventSource {
    /**
     *
     * Constructs an instance of DataView object. This method should not be used
     * directly. A DataView object should be created through {@link Autodesk.Hyperion.Data.DataStore#createView} method of DataStore.
     * @param {DataStore} dataStore The owning DataStore object
     */
    constructor(dataStore) {
        super();

        // /** @type {Object.<string, string[]>} */
        this._deviceProperties = {};
        this._dataStore = dataStore;

        this.handleQueryCompleted = this.handleQueryCompleted.bind(this);
        this._dataStore.addEventListener(EventType.QueryCompleted, this.handleQueryCompleted);
    }

    /**
     * @returns {Object.<string, string[]>} All the devices and their
     * &nbsp;corresponding property IDs registered in this DataView object.
     */
    get deviceProperties() {
        const results = {};
        Object.entries(this._deviceProperties).forEach(([deviceId, propIds]) => {
            results[deviceId] = [...propIds];
        });

        return results;
    }

    /**
     * Add a device and its properties to DataView given its identifier.
     *
     * @param {string} deviceId Identifier of the device to be added to the view
     * @param {string|string[]} propertyIds Property identifier(s) to be added
     * &nbsp;to the view
     * @memberof Autodesk.Hyperion.Data
     * @alias Autodesk.Hyperion.Data.DataView#addDeviceProperties
     */
    addDeviceProperties(deviceId, propertyIds) {
        if (!this._deviceProperties[deviceId]) {
            this._deviceProperties[deviceId] = [];
        }

        const propIds = Array.isArray(propertyIds) ? propertyIds : [propertyIds];
        propIds.forEach((propId) => {
            if (!this._deviceProperties[deviceId].includes(propId)) {
                this._deviceProperties[deviceId].push(propId);
            }
        });
    }

    /**
     * Sets the time window into which the DataView provides its view of the
     * &nbsp;underlying data. This call merely sets the time span without actually
     * &nbsp;fetching the data. Subsequent calls to getAggregatedValues method will
     * &nbsp;fetch the device data based on this given time window.
     *
     * @param {DateTimeSpan} dateTimeSpan The time window to set to view on.
     * @memberof Autodesk.Hyperion.Data
     * @alias Autodesk.Hyperion.Data.DataView#setTimeWindow
     */
    setTimeWindow(dateTimeSpan) {
        this._dateTimeSpan = dateTimeSpan;
    }

    /**
     * Gets the aggregated values for a property of a given device. Note that
     * &nbsp;this call returns only the aggregated data that was previously loaded
     * &nbsp;through a call to 'fetchDeviceData' function. If the data has not been
     * &nbsp;fetched before, this call returns undefined. In either case the function
     * &nbsp;returns immediately.
     *
     * @param {string} deviceId The identifier of the device whose aggregated
     * &nbsp;property values are to be retrieved.
     * @param {string} propertyId The property of the device whose aggregated
     * &nbsp;values are to be retrieved.
     *
     * @returns {AggregatedValues|undefined} The aggregated values of a device
     * &nbsp;property if it has been loaded before, or undefined otherwise.
     * @memberof Autodesk.Hyperion.Data
     * @alias Autodesk.Hyperion.Data.DataView#getAggregatedValues
     */
    getAggregatedValues(deviceId, propertyId) {
        return this._dataStore.getAggregatedValues(deviceId, propertyId, this._dateTimeSpan);
    }

    /**
     * Handle QueryCompleted event originated from DataStore object.
     * @param {QueryCompletedEventArgs} eventArgs The event argument.
     * @memberof Autodesk.Hyperion.Data
     * @alias Autodesk.Hyperion.Data.DataView#handleQueryCompleted
     */
    handleQueryCompleted(eventArgs) {
        const dts = eventArgs.query.dateTimeSpan;
        if (dts.hashCode === this._dateTimeSpan.hashCode) {
            // A DataView object will only propagate a QueryCompleted event if it is
            // meant for the same time window that is set to this DataView object.
            this.emit(EventType.QueryCompleted, eventArgs);
        }
    }
}
export { DataView };

/**
 * The following is one possible runtime data stored in "DataStore._deviceData"
 * for given devices "device-9" and "device-12", also their corresponding nested
 * property data. See "Hyperion.Data.DataModel.js" for expanded details of the data.
 *
 *  DataStore._deviceData = {
 *      "device-9": {
 *          _deviceId: "device-9",
 *          _propData: { ... }
 *      },
 *      "device-12": {
 *          _deviceId: "device-12",
 *          _propData: { ... }
 *      }
 *  }
 */

/**
 * The storage of runtime device property data, both latest and aggregated.
 * @memberof Autodesk.Hyperion.Data
 * @alias Autodesk.Hyperion.Data.DataStore
 */
class DataStore extends EventSource {
    /**
     * Constructs a new DataStore object
     */
    constructor() {
        super();

        // /** @type {Object.<string, DeviceModel>} */
        this._deviceModels = {};

        // /** @type {Object.<string, DeviceData>} */
        this._deviceData = {};

        // /** @type {DataAdapter[]} */
        this._dataAdapters = [];

        this._requestPool = new RequestPool(this);
    }

    /**
     * @returns {DeviceModel[]} All loaded device models in the storage.
     */
    get deviceModels() {
        return Object.values(this._deviceModels);
    }

    /**
     * @returns {DeviceData[]} All loaded device data in the storage.
     */
    get deviceData() {
        return Object.values(this._deviceData);
    }

    /**
     * Registers a data adapter in the DataStore. At least one DataAdapter
     * &nbsp;must be registered in the DataStore before device data can be fetched.
     *
     * @param {DataAdapter} dataAdapter One of the derived classes of
     * &nbsp;DataAdapter object to be registed as a data source.
     *
     * @throws {Error} Data adapter with the same ID already registered.
     * @memberof Autodesk.Hyperion.Data
     * @alias Autodesk.Hyperion.Data.DataStore#registerDataAdapter
     */
    registerDataAdapter(dataAdapter) {
        const id = dataAdapter.id;
        const found = this._dataAdapters.findIndex((da) => da.id === id);

        if (found != -1) {
            throw new Error(`Data adapter with id '${id}' already registered`);
        }

        this._dataAdapters.push(dataAdapter);
    }

    /**
     * Begin loading all device models from registered data adapters
     * @returns {Promise<boolean>} Result of device model loading.
     * @memberof Autodesk.Hyperion.Data
     * @alias Autodesk.Hyperion.Data.DataStore#loadDeviceModelsFromAdapters
     */
    async loadDeviceModelsFromAdapters() {
        this._deviceModels = {}; // Clear existing loaded device models.

        // Get promises each resolves in DeviceModel[] (list of list).
        const loadPromises = this._dataAdapters.map((dataAdapter) => {
            return dataAdapter.loadDeviceModels();
        });

        return Promise.all(loadPromises).then((deviceModelsList) => {
            // Turn 2D deviceModelsList into a flattened 1D array.
            const allDeviceModels = deviceModelsList.flat(Infinity);

            allDeviceModels.forEach((deviceModel) => {
                const deviceModelId = deviceModel.id;
                this._deviceModels[deviceModelId] = deviceModel;
            });

            return Promise.resolve(true);
        });
    }

    /**
     * Creates an instance of DataView object for this DataStore.
     *
     * @returns {DataView} Returns a new instance of DataView object.
     * @memberof Autodesk.Hyperion.Data
     * @alias Autodesk.Hyperion.Data.DataStore#createView
     */
    createView() {
        return new DataView(this);
    }

    /**
     * Gets the Device object given its identifier.
     *
     * @param {string} deviceId Identifier of the device.
     * @returns {Device} The Device object if one is found,
     * &nbsp;or undefined otherwise.
     * @memberof Autodesk.Hyperion.Data
     * @alias Autodesk.Hyperion.Data.DataStore#getDevice
     */
    getDevice(deviceId) {
        const deviceModel = this.getDeviceModelFromDeviceId(deviceId);
        return deviceModel ? deviceModel.getDevice(deviceId) : undefined;
    }

    /**
     * Find the matching DeviceModel given its identifier.
     *
     * @param {string} deviceModelId Identifier of the device model.
     *
     * @returns {DeviceModel} The DeviceModel object if one is found, or
     * &nbsp;undefined otherwise.
     * @memberof Autodesk.Hyperion.Data
     * @alias Autodesk.Hyperion.Data.DataStore#getDeviceModel
     */
    getDeviceModel(deviceModelId) {
        return this._deviceModels[deviceModelId];
    }

    /**
     * Find the matching DeviceModel given a device ID.
     *
     * @param {string} deviceId Identifier of the device whose DeviceModel is
     * &nbsp;to be determined.
     *
     * @returns {DeviceModel} The DeviceModel object if one is found, or
     * &nbsp;undefined otherwise.
     * @memberof Autodesk.Hyperion.Data
     * @alias Autodesk.Hyperion.Data.DataStore#getDeviceModelFromDeviceId
     */
    getDeviceModelFromDeviceId(deviceId) {
        const deviceModelId = this._getDeviceModelIdFromDeviceId(deviceId);
        return deviceModelId ? this._deviceModels[deviceModelId] : undefined;
    }

    /**
     * Fetches device property data based on the query specified. A
     * &nbsp;corresponding data adapter downloads relevant device property
     * &nbsp;data through the service provider REST APIs.
     *
     * @param {QueryParam} query Parameters of this query.
     *
     * @returns {Promise<DeviceData>} The aggregated property data for
     * &nbsp;the queried device.
     * @memberof Autodesk.Hyperion.Data
     * @alias Autodesk.Hyperion.Data.DataStore#fetchDeviceData
     */
    async fetchDeviceData(query) {
        const deviceId = query.deviceId;
        const adapter = this._getAdapterFromDeviceId(deviceId);

        if (!adapter) {
            return Promise.resolve(null);
        } else {
            return adapter.fetchDeviceData(query).then((deviceData) => {
                const deviceId = deviceData.id;
                if (this._deviceData[deviceId]) {
                    // Local device data exists, merge incoming data.
                    this._deviceData[deviceId].mergeFrom(deviceData);
                } else {
                    // Local device data does not exist, take the incoming data.
                    this._deviceData[deviceId] = deviceData;
                }

                return Promise.resolve(deviceData);
            });
        }
    }

    /**
     * Gets the cached aggregated values for a property of a given device within
     * &nbsp;a time window. If the aggregated values have not been downloaded with a
     * &nbsp;prior call to 'fetchDeviceData', then this function returns 'undefined'.
     * &nbsp;In either case the function returns immediately.
     *
     * @param {string} deviceId The identifier of the device whose aggregated
     * &nbsp;property values are to be retrieved.
     * @param {string} propertyId The property of the device whose aggregated
     * &nbsp;values are to be retrieved.
     * @param {DateTimeSpan} dateTimeSpan The time range with resolution at which
     * &nbsp;aggregated values are to be retrieved.
     *
     * @returns {AggregatedValues|undefined} The aggregated values of a device
     * &nbsp;property if it has been loaded before, or 'undefined' otherwise.
     * @memberof Autodesk.Hyperion.Data
     * @alias Autodesk.Hyperion.Data.DataStore#getAggregatedValues
     */
    getAggregatedValues(deviceId, propertyId, dateTimeSpan) {
        const dd = this._deviceData[deviceId];
        const pd = dd ? dd.getPropertyData(propertyId) : undefined;
        const av = pd ? pd.getAggregatedValues(dateTimeSpan) : undefined;

        if (!av) {
            // If an aggregated value does not already exist in the cache,
            // place it under pending requests pool so that its value becomes
            // available at a later time.
            //
            this._requestPool.addRequest(deviceId, propertyId, dateTimeSpan);
        }

        return av; // Could be undefined as designed.
    }

    /**
     * Updates the current property value for a specific device id
     *
     * @param {string} deviceId ID of the device that is to be updated
     * @param {string} propertyId ID of the property to be updated
     * @param {any} value New value of the property
     */
    updateCurrentPropertyValue(deviceId, propertyId, value) {
        if (this._deviceData[deviceId]) {
            this._deviceData[deviceId].updateCurrentPropertyValue(propertyId, value);
        }
    }

    /**
     * Find the matching DeviceModel given a device ID.
     *
     * @param {string} deviceId Identifier of the device whose DeviceModel is
     * to be determined.
     *
     * @returns {string} Idenifier of the DeviceModel object if one is found,
     * or undefined otherwise.
     * @private
     */
    _getDeviceModelIdFromDeviceId(deviceId) {
        const deviceModels = Object.values(this._deviceModels);
        const deviceModel = deviceModels.find((dm) => dm.contains(deviceId));
        return deviceModel ? deviceModel.id : undefined;
    }

    /**
     * Find the corresponding DataAdapter ID given a device ID.
     *
     * @param {string} deviceId Identifier of the device whose DataAdapter is
     * to be determined.
     *
     * @returns {string} Idenifier of the DataAdapter object if one is found,
     * or undefined otherwise.
     * @private
     */
    _getAdapterIdFromDeviceId(deviceId) {
        const deviceModelId = this._getDeviceModelIdFromDeviceId(deviceId);
        if (deviceModelId) {
            const deviceModel = this._deviceModels[deviceModelId];
            return deviceModel.adapterId;
        }
    }

    /**
     * Find the corresponding DataAdapter given a device ID.
     *
     * @param {string} deviceId Identifier of the device whose DataAdapter is
     * to be determined.
     *
     * @returns {DataAdapter} The DataAdapter object if one is found, or
     * undefined otherwise.
     * @private
     */
    _getAdapterFromDeviceId(deviceId) {
        const adapterId = this._getAdapterIdFromDeviceId(deviceId);
        if (adapterId) {
            return this._dataAdapters.find((da) => da.id === adapterId);
        }
    }

    /**
     * Gets a map of all uninque properties from all the deviceModels in the datastore.
     * @returns {Map.<string,DeviceProperty>} Map of all the properties across all devicesModels in a {@link Autodesk.Hyperion.Data.DataStore} object.
     */
    getPropertiesFromDataStore() {
        const deviceModels = Object.values(this._deviceModels);
        const nestedList = deviceModels.map((dm) => Object.values(dm.properties)).flat();
        let filteredMap = new Map(nestedList.map(obj => [`${obj.id}`, obj]));
        return filteredMap;
    }
}
export { DataStore };
