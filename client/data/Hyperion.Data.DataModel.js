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
/**
 * The following is one possible runtime data stored in "DataStore._deviceData" for
 * a given device "Device-6" and its properties "Temperature", "Humidity" and "CO₂":
 *
 *  DataStore._deviceData = {
 *      "Device-6": {
 *          "_deviceId": "Device-6",
 *          "_propData": {
 *              "Temperature": {
 *                  "_propId": "Temperature",
 *                  "_aggregatedValues": {
 *                      "1600992000-1602288000-P1D": {
 *                          "_dateTimeSpan": {
 *                              "_startSecond": 1600992000,
 *                              "_endSecond": 1602288000,
 *                              "_resolution": "P1D"
 *                          },
 *                          "_dataRange": {
 *                              "avgValues": {
 *                                  "min": 18,
 *                                  "max": 29
 *                              }
 *                          },
 *                          "_tsValues": [
 *                              1600992000,
 *                              1600995600,
 *                              ...
 *                              1602280800,
 *                              1602284400
 *                          ],
 *                          "_avgValues": [
 *                              21.50363122638656,
 *                              20.72476651436303,
 *                              ...
 *                              25.170253288026107,
 *                              25.5138736588343
 *                          ]
 *                      }
 *                  }
 *              },
 *              "Humidity": {
 *                  "_propId": "Humidity",
 *                  "_aggregatedValues": {
 *                      "1600992000-1602288000-P1D": {
 *                          "_dateTimeSpan": {
 *                              "_startSecond": 1600992000,
 *                              "_endSecond": 1602288000,
 *                              "_resolution": "P1D"
 *                          },
 *                          "_dataRange": {
 *                              "avgValues": {
 *                                  "min": 29,
 *                                  "max": 49
 *                              }
 *                          },
 *                          "_tsValues": [
 *                              1600992000,
 *                              1600995600,
 *                              ...
 *                              1602280800,
 *                              1602284400
 *                          ],
 *                          "_avgValues": [
 *                              34.64528068350356,
 *                              34.00476825266938,
 *                              ...
 *                              41.356998130417985,
 *                              42.04294462761208
 *                          ]
 *                      }
 *                  }
 *              },
 *              "CO₂": {
 *                  "_propId": "CO₂",
 *                  "_aggregatedValues": {
 *                      "1600992000-1602288000-P1D": {
 *                          "_dateTimeSpan": {
 *                              "_startSecond": 1600992000,
 *                              "_endSecond": 1602288000,
 *                              "_resolution": "P1D"
 *                          },
 *                          "_dataRange": {
 *                              "avgValues": {
 *                                  "min": 484,
 *                                  "max": 647
 *                              }
 *                          },
 *                          "_tsValues": [
 *                              1600992000,
 *                              1600995600,
 *                              ...
 *                              1602280800,
 *                              1602284400
 *                          ],
 *                          "_avgValues": [
 *                              495.86826312447585,
 *                              498.5521218219194,
 *                              ...
 *                              571.0821149790999,
 *                              575.7006353848578
 *                          ]
 *                      }
 *                  }
 *              }
 *          }
 *      }
 *  }
 *
 */

import { DateTimeSpan } from "./Hyperion.Data.Storage";

/**
 * Timestamped values of a device's property
 * @memberof Autodesk.Hyperion.Data
 * @alias Autodesk.Hyperion.Data.PropertyValue
 */
export class PropertyValue {
    /**
     * Constructs a new PropertyValue object with the associated time / value pair
     * @param {number} timestamp Timestamp this value is associated to
     * @param {number} value Value of a device's property
     */
    constructor(timestamp, value) {
        this._timestamp = timestamp;
        this._value = value;
    }

    /**
     * @returns {number} The timestamp expressed in Unix epoch seconds.
     */
    get timestamp() {
        return this._timestamp;
    }

    /**
     * @returns {number} The property value.
     */
    get value() {
        return this._value;
    }
}

/**
 * Object that holds aggregated values of a device's property
 * @memberof Autodesk.Hyperion.Data
 * @alias Autodesk.Hyperion.Data.AggregatedValues
 */
export class AggregatedValues {
    /**
     * Constructs an instance of AggregatedValues object.
     *
     * @param {DateTimeSpan} dateTimeSpan The time range with
     * &nbsp;resolution at which the aggregated values are meant for.
     */
    constructor(dateTimeSpan) {
        this._dateTimeSpan = new DateTimeSpan(
            dateTimeSpan.startSecond,
            dateTimeSpan.endSecond,
            dateTimeSpan.resolution
        );

        this._dataRange = {};
    }

    /**
     * @param {number[]} values An array of numbers, each element of which
     * represents a Unix epoch timestamp in seconds.
     */
    set tsValues(values) {
        this._tsValues = values;
    }

    /**
     * @param {number[]} values An array of numbers, each element of which
     * represents the count of data points in the time series over a time
     * interval window.
     */
    set countValues(values) {
        this._countValues = values;
    }

    /**
     * @param {number[]} values An array of numbers, each element of which
     * represents the maximum value of the time series over a time interval
     * window.
     */
    set maxValues(values) {
        this._maxValues = values;
    }

    /**
     * @param {number[]} values An array of numbers, each element of which
     * represents the minimum value of the time series over a time interval
     * window.
     */
    set minValues(values) {
        this._minValues = values;
    }

    /**
     * @param {number[]} values An array of numbers, each element of which
     * represents the average value of the time series over a time interval
     * window.
     */
    set avgValues(values) {
        this._avgValues = values;
    }

    /**
     * @param {number[]} values An array of numbers, each element of which
     * represents the sum of the time series over a time interval window.
     */
    set sumValues(values) {
        this._sumValues = values;
    }

    /**
     * @param {number[]} values An array of numbers, each element of which
     * represents the standard deviation of the time series over a time
     * interval window.
     */
    set stdDevValues(values) {
        this._stdDevValues = values;
    }

    /**
     * @returns {string} The identifier of this AggregatedValues object.
     */
    get id() {
        return this._dateTimeSpan.hashCode;
    }

    /**
     * @returns {number[]} An array of numbers, each element
     * of which represents a Unix epoch timestamp in seconds.
     */
    get tsValues() {
        return this._tsValues;
    }

    /**
     * @returns {number[]} An array of numbers, each element of which
     * represents the count of data points in the time series over a time
     * interval window.
     */
    get countValues() {
        return this._countValues;
    }

    /**
     * @returns {number[]} An array of numbers, each element of which
     * represents the maximum value of the time series over a time interval
     * window.
     */
    get maxValues() {
        return this._maxValues;
    }

    /**
     * @returns {number[]} An array of numbers, each element of which
     * represents the minimum value of the time series over a time interval
     * window.
     */
    get minValues() {
        return this._minValues;
    }

    /**
     * @returns {number[]} An array of numbers, each element of which
     * represents the average value of the time series over a time interval
     * window.
     */
    get avgValues() {
        return this._avgValues;
    }

    /**
     * @returns {number[]} An array of numbers, each element of which
     * represents the sum of the time series over a time interval window.
     */
    get sumValues() {
        return this._sumValues;
    }

    /**
     * @returns {number[]} An array of numbers, each element of which
     * represents the standard deviation of the time series over a time
     * interval window.
     */
    get stdDevValues() {
        return this._stdDevValues;
    }

    /**
     * Gets the range of values for a particular aggregate type
     * @param {string} propName The aggregate type
     * @returns {{min:number, max:number}}
     * @memberof Autodesk.Hyperion.Data
     * @alias Autodesk.Hyperion.Data.AggregatedValues#getDataRange
     */
    getDataRange(propName) {
        return this._dataRange[propName];
    }

    /**
     * Sets the range of values for a particular aggregate type
     * @param {string} propName The aggregate type
     * @param  {{min:number, max:number}} value The data range
     * @memberof Autodesk.Hyperion.Data
     * @alias Autodesk.Hyperion.Data.AggregatedValues#setDataRange
     */
    setDataRange(propName, value) {
        this._dataRange[propName] = value;
    }
}

/**
 * Property values associated with a particular property
 * @memberof Autodesk.Hyperion.Data
 * @alias Autodesk.Hyperion.Data.PropertyData
 */
export class PropertyData {
    /**
     * Constructs a new PropertyData Object
     * @param {string} propId Id of the property
     */
    constructor(propId) {
        this._propId = propId;
        this._currentValue = undefined;
        this._aggregatedValues = {};
    }

    /**
     * Gets the id of the property
     * @returns {string} The identifier of the property.
     */
    get id() {
        return this._propId;
    }

    /**
     * Gets the list of aggregated values associated with this property
     * @returns {AggregatedValues[]} The list of AggregatedValues objects.
     */
    get aggregatedValuesList() {
        return Object.values(this._aggregatedValues);
    }

    /**
     * Merges the data from another instance of PropertyData object.
     *
     * @param {PropertyData} otherPropertyData The source PropertyData object
     * &nbsp;to merge property data from.
     * @memberof Autodesk.Hyperion.Data
     * @alias Autodesk.Hyperion.Data.PropertyData#mergeFrom
     */
    mergeFrom(otherPropertyData) {
        this.setCurrentValue(otherPropertyData.getCurrentValue());

        const aggValuesList = otherPropertyData.aggregatedValuesList;
        aggValuesList.forEach((aggValues) => {
            const id = aggValues.id;
            this._aggregatedValues[id] = aggValues;
        });
    }

    /**
     * Sets the most up-to-date value of this property.
     *
     * @param {PropertyValue} propertyValue The latest value of the property.
     * @memberof Autodesk.Hyperion.Data
     * @alias Autodesk.Hyperion.Data.PropertyData#setCurrentValue
     */
    setCurrentValue(propertyValue) {
        this._currentValue = propertyValue;
    }

    /**
     * Gets the most up-to-date value of this property.
     *
     * @returns {PropertyValue} The latest value of the property if one is
     * &nbsp;currently specified or undefined otherwise.
     * @memberof Autodesk.Hyperion.Data
     * @alias Autodesk.Hyperion.Data.PropertyData#getCurrentValue
     */
    getCurrentValue() {
        return this._currentValue;
    }

    /**
     *
     * Associates the aggregated values with this property. Any existing AggregatedValues object that is of the same time range and resolution will be replaced by this new instance of AggregatedValues.
     * @param {AggregatedValues} aggregatedValues The aggregated values to be
     * &nbsp;associated with this property data object.
     *
     * @returns {string} The identifier of the AggregatedValues object.
     * @memberof Autodesk.Hyperion.Data
     * @alias Autodesk.Hyperion.Data.PropertyData#setAggregatedValues
     */
    setAggregatedValues(aggregatedValues) {
        const id = aggregatedValues.id;
        this._aggregatedValues[id] = aggregatedValues;
        return id;
    }

    /**
     * Gets the aggregated values for the property given the time range and resolution.
     *
     * @param {DateTimeSpan} dateTimeSpan The time range and resolution at which
     * &nbsp;aggregated values are to be retrieved.
     * @returns {AggregatedValues} A reference to the AggregatedValues object if
     * &nbsp;one is found that match the criteria; undefined otherwise.
     * @memberof Autodesk.Hyperion.Data
     * @alias Autodesk.Hyperion.Data.PropertyData#getAggregatedValues
     */
    getAggregatedValues(dateTimeSpan) {
        const id = dateTimeSpan.hashCode;
        return this._aggregatedValues[id];
    }
}

/**
 * Class showing the relationship of a device to its available properties and their corresponding values.
 * @memberof Autodesk.Hyperion.Data
 * @alias Autodesk.Hyperion.Data.DeviceData
 */
export class DeviceData {
    /**
     * Constructs an instance of DeviceData object.
     * @param {string} deviceId The identifier of the device.
     */
    constructor(deviceId) {
        /** @type {Object.<string, PropertyData>} */
        this._propData = {};

        /** @type {string} */
        this._deviceId = deviceId;
    }

    /**
     * Gets the identifier of the device
     * @returns {string} The identifier of the device.
     */
    get id() {
        return this._deviceId;
    }

    /**
     * Gets the property data associated to this device
     * @returns {PropertyData[]} The list of all PropertyData objects
     * currently loaded in this DeviceData object.
     */
    get propertyDataList() {
        return Object.values(this._propData);
    }

    /**
     * Merges the property data from another instance of DeviceData object.
     *
     * @param {DeviceData} otherDeviceData The source DeviceData object to
     * &nbsp;merge property data from.
     * @memberof Autodesk.Hyperion.Data
     * @alias Autodesk.Hyperion.Data.DeviceData#mergeFrom
     */
    mergeFrom(otherDeviceData) {
        const propDataList = otherDeviceData.propertyDataList;
        propDataList.forEach((propertyData) => {
            const propId = propertyData.id;

            if (this._propData[propId]) {
                // If local PropertyData exists, merge it in.
                this._propData[propId].mergeFrom(propertyData);
            } else {
                // Otherwise, simply store the incoming property data.
                this._propData[propId] = propertyData;
            }
        });
    }

    /**
     * Gets the PropertyData object given the property ID. A new PropertyData
     * object is created if none is found that matches the given property ID.
     *
     * @param {string} propId ID of the property whose data is to be retrieved.
     *
     * @returns {PropertyData} The PropertyData object. This method always
     * &nbsp;return a valid instance of PropertyData.
     * @memberof Autodesk.Hyperion.Data
     * @alias Autodesk.Hyperion.Data.DeviceData#getPropertyData
     */
    getPropertyData(propId) {
        if (!this._propData[propId]) {
            this._propData[propId] = new PropertyData(propId);
        }

        return this._propData[propId];
    }

    /**
     * Updates the current value of a specified property
     *
     * @param {string} propId ID of the property to be updated
     * @param {any} value The new current value of the specified property
     */
    updateCurrentPropertyValue(propId, value) {
        if (this._propData[propId]) {
            this._propData[propId].setCurrentValue(value);
        }
    }
}
