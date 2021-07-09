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
export const DataType = {
    None: "None",
    Long: "Long",
    Double: "Double",
};

export const DataUnit = {
    Celsius: "Celsius",
    Fahrenheit: "Fahrenheit",
};

/**
 * A class that represents an actual instance of a device. Each device
 * instance contains an ID that is used to identify the device and
 * optionally a name that is more human readable. A device contains its
 * position in world coordinates (relative to the 3D model that it
 * belongs in), which is essential for it to show up at the right spot
 * in the 3D model.
 * @memberof Autodesk.DataVisualization.Data
 * @alias Autodesk.DataVisualization.Data.Device
 */
export class Device {
    /**
     * Constructs a new device
     * @param {string} deviceId Id of the new device
     */
    constructor(deviceId) {
        this._deviceId = deviceId;
        this._name = "";
    }

    /**
     * @param {string} value The optional name of this device instance.
     */
    set name(value) {
        this._name = value;
    }

    /**
     * @param {string} value The optional description of the device instance.
     */
    set description(value) {
        this._description = value;
    }

    /**
     * @param {THREE.Vector3} value The world position of this device instance.
     */
    set position(value) {
        this._position = value;
    }

    /**
     * @param {string} value The last recorded activity time for
     * this device instance, expressed as a string in UTC format.
     */
    set lastActivityTime(value) {
        this._lastActivityTime = value;
    }

    /**
     * @returns {string} The ID of this device instance.
     */
    get id() {
        return this._deviceId;
    }

    /**
     * @returns {string} The name of this device instance. If a name
     * was not previously assigned, the device ID will be returned.
     */
    get name() {
        return this._name || this._deviceId;
    }

    /**
     * @returns {string} The optional description of the device instance.
     */
    get description() {
        return this._description;
    }

    /**
     * @returns {THREE.Vector3} The world position of this device instance.
     */
    get position() {
        return this._position;
    }

    /**
     * @returns {string} The last recorded activity time for
     * this device instance, expressed as a string in UTC format.
     */
    get lastActivityTime() {
        return this._lastActivityTime;
    }
}

/**
 * Attributes related to a property
 * @memberof Autodesk.DataVisualization.Data
 * @alias Autodesk.DataVisualization.Data.DeviceProperty
 */
export class DeviceProperty {
    /**
     * Construct a new DeviceProperty object
     * @param {string} propId Id of the property
     * @param {string} name Common name for this property
     */
    constructor(propId, name) {
        this._propId = propId;
        this._propName = name;
        this._rangeMin = Infinity;
        this._rangeMax = -Infinity;
    }

    /**
     * @param {string} value The optional description of the property.
     */
    set description(value) {
        this._description = value;
    }

    /**
     * @param {string} value The type of the property in DataType.
     */
    set dataType(value) {
        this._dataType = value;
    }

    /**
     * @param {string} value The unit of the property in DataUnit.
     */
    set dataUnit(value) {
        this._dataUnit = value;
    }

    /**
     * @param {number} value The lower bound of the value range that is
     * possible for this device property. This value is used to generate
     * a normalized range of [0.0, 1.0] given the actual property value.
     */
    set rangeMin(value) {
        this._rangeMin = Math.min(value, this._rangeMin);
    }

    /**
     * @param {number} value The upper bound of the value range that is
     * possible for this device property. This value is used to generate
     * a normalized range of [0.0, 1.0] given the actual property value.
     */
    set rangeMax(value) {
        this._rangeMax = Math.max(value, this._rangeMax);
    }

    /**
     * @returns {string} The ID of this property.
     */
    get id() {
        return this._propId;
    }

    /**
     * @returns {string} The name of this property.
     */
    get name() {
        return this._propName;
    }

    /**
     * @returns {string} value The optional description of the property.
     */
    get description() {
        return this._description;
    }

    /**
     * @returns {string} value The type of the property in DataType.
     */
    get dataType() {
        return this._dataType;
    }

    /**
     * @returns {string} value The unit of the property in DataUnit.
     */
    get dataUnit() {
        return this._dataUnit;
    }

    /**
     * @returns {number} The lower bound of the value range that is
     * possible for this device property. This value is used to generate
     * a normalized range of [0.0, 1.0] given the actual property value.
     */
    get rangeMin() {
        return this._rangeMin;
    }

    /**
     * @returns {number} The upper bound of the value range that is
     * possible for this device property. This value is used to generate
     * a normalized range of [0.0, 1.0] given the actual property value.
     */
    get rangeMax() {
        return this._rangeMax;
    }
}

/**
 * Data representation of what properties a particular device has
 * @memberof Autodesk.DataVisualization.Data
 * @alias Autodesk.DataVisualization.Data.DeviceModel
 */
class DeviceModel {
    constructor(deviceModelId, adapterId) {
        this._deviceModelId = deviceModelId;
        this._adapterId = adapterId;

        /** @type {Object.<string, DeviceProperty>}
         * The properties belonging to this DeviceModel.
         */
        this._properties = {};

        /** @type {Object.<string, Device>}
         * The list of devices belonging to this DeviceModel.
         */
        this._devices = {};
    }

    /**
     * The name of this device model, if any.
     * @param {string} value The name of this device model, if any.
     */
    set name(value) {
        this._name = value;
    }

    /**
     * The description of this device model, if any.
     * @param {string} value The description of this device model, if any.
     */
    set description(value) {
        this._description = value;
    }

    /**
     * The identifier of this instance of DeviceModel object.
     * @returns {string} The identifier of this instance of DeviceModel object.
     */
    get id() {
        return this._deviceModelId;
    }

    /**
     * The identifier of the DataAdapter that this instance
     * &nbsp;of DeviceModel object originated from.
     * @returns {string} The identifier of the DataAdapter that this instance
     * of DeviceModel object originated from.
     */
    get adapterId() {
        return this._adapterId;
    }

    /**
     * The name of this device model, if any.
     * @returns {string} The name of this device model, if any.
     */
    get name() {
        return this._name;
    }

    /**
     * The description of this device model, if any.
     * @returns {string} The description of this device model, if any.
     */
    get description() {
        return this._description;
    }

    /**
     * All property identifiers for this DeviceModel.
     * @returns {string[]} All property identifiers for this DeviceModel.
     */
    get propertyIds() {
        return Object.keys(this._properties);
    }

    /**
     * The properties belonging to this DeviceModel.
     * @returns {DeviceProperty[]} The properties belonging to this DeviceModel.
     */
    get properties() {
        return Object.values(this._properties);
    }

    /**
     * All device identifiers found within this DeviceModel.
     * @returns {string[]} All device identifiers found within this DeviceModel.
     */
    get deviceIds() {
        return Object.keys(this._devices);
    }

    /**
     * The list of devices belonging to this DeviceModel.
     * @returns {Device[]} The list of devices belonging to this DeviceModel.
     */
    get devices() {
        return Object.values(this._devices);
    }

    /**
     * Adds a new property to the device model given its ID and name. If a
     * property with the same ID exists, this method thrown an exception. The
     * caller should populate the resulting DeviceProperty object with further
     * data (e.g. data type).
     *
     * @param {string} propId The ID of the property to add.
     * @param {string} name The name of the property to add.
     *
     * @returns {DeviceProperty} The resulting DeviceProperty object that has
     * &nbsp;been added to the device model.
     *
     * @throws {Error} Property with the same ID already exists.
     * @memberof Autodesk.DataVisualization.Data
     * @alias Autodesk.DataVisualization.Data.DeviceModel#addProperty
     */
    addProperty(propId, name) {
        if (this._properties[propId]) {
            throw new Error(`Property with ID ${propId} already exists`);
        }

        const property = new DeviceProperty(propId, name);
        this._properties[propId] = property;
        return property;
    }

    /**
     * Adds a new device to the device model. If a device with the same ID
     * exists, this method thrown an exception. The caller should populate
     * the resulting Device object with further data (e.g. data type).
     *
     * @param {string} deviceId The identifier of a device.
     *
     * @returns {Device} The Device object that is added to the model.
     *
     * @throws {Error} Device with the same ID already exists.
     * @memberof Autodesk.DataVisualization.Data
     * @alias Autodesk.DataVisualization.Data.DeviceModel#addDevice
     */
    addDevice(deviceId) {
        if (this._devices[deviceId]) {
            throw new Error(`Device with ID ${deviceId} already exists`);
        }

        this._devices[deviceId] = new Device(deviceId);
        return this._devices[deviceId];
    }

    /**
     * Checks to see if a device belongs to this DeviceModel.
     *
     * @param {string} deviceId Identifier of the device.
     *
     * @returns {boolean} Returns true if the device with a given ID belongs
     * &nbsp;to this DeviceModel, or false otherwise.
     * @memberof Autodesk.DataVisualization.Data
     * @alias Autodesk.DataVisualization.Data.DeviceModel#contains
     */
    contains(deviceId) {
        return !!this._devices[deviceId];
    }

    /**
     * Gets the Device object given its identifier.
     *
     * @param {string} deviceId Identifier of the device.
     * @returns {Device} The Device object if one is found
     * or undefined otherwise.
     * @memberof Autodesk.DataVisualization.Data
     * @alias Autodesk.DataVisualization.Data.DeviceModel#getDevice
     */
    getDevice(deviceId) {
        return this._devices[deviceId];
    }
}
export { DeviceModel };
