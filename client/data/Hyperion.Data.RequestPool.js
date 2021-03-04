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
// eslint-disable-next-line no-unused-vars
import { DataStore, DateTimeSpan } from "./Hyperion.Data.Storage";
import TaskQueue from "../../shared/TaskQueue";
import { QueryParam } from "./Hyperion.Data.Adapter";
import { EventType, QueryCompletedEventArgs } from "./Hyperion.Data.Event";

const requestQueue = new TaskQueue(6, "RequestPoolTaskQueue", true);

/**
 * A request pool that collects all requests for device property data before
 * sending them after a small delay when no further requests are made.
 * The request pool also makes use of TaskQueue to ensure that no more than the
 * intended number of concurrent requests can take place thereby rate limiting
 * the number of outgoing requests.
 * @memberof Autodesk.Hyperion.Data
 * @alias Autodesk.Hyperion.Data.RequestPool
 */
export class RequestPool {
    /**
     * Constructs an instance of a RequestPool object.
     * @param {DataStore} owningDataStore The DataStore object that owns this
     * instance of RequestPool object.
     */
    constructor(owningDataStore) {
        this._dataStore = owningDataStore;

        // /** @type {DateTimeSpan} */
        this._dateTimeSpan = null;

        // /** @type {Object.<string, string[]>} */
        this._requestedData = {};

        this._throttleTimerId = 0;
    }

    /**
     * Adds a new request to the pool for a given property of a device.
     *
     * @param {string} deviceId The identifier of the device whose aggregated
     * &nbsp;property values are to be retrieved.
     * @param {string} propertyId The property of the device whose aggregated
     * &nbsp;values are to be retrieved.
     * @param {DateTimeSpan} dateTimeSpan The time range and resolution at which
     * &nbsp;aggregated values are to be retrieved.
     * @memberof Autodesk.Hyperion.Data
     * @alias Autodesk.Hyperion.Data.RequestPool#addRequest
     */
    addRequest(deviceId, propertyId, dateTimeSpan) {
        const hashCode = dateTimeSpan.hashCode;
        if (!this._dateTimeSpan || this._dateTimeSpan.hashCode !== hashCode) {
            // If the requested time span is different from the previous time
            // span, then remove all requested device properties from a prior
            // request because they won't be retrieved by any UI component
            // anymore (Hyperion operates on a main timeline that governs all
            // other UIs to display sensor data within the time span).
            //
            this._dateTimeSpan = dateTimeSpan;
            this._requestedData = {};
        }

        if (!this._requestedData[deviceId]) {
            this._requestedData[deviceId] = [];
        }

        if (!this._requestedData[deviceId].includes(propertyId)) {
            this._requestedData[deviceId].push(propertyId);
        }

        this._startThrottleTimer();
    }

    /**
     * Starts or restarts throttle timer. The timer is used to ensure multiple
     * requests are pooled before a batched request is made. If there is an
     * active throttle timer, then clear/restart it so that batch requests begin
     * only after some idle period without incoming requests.
     * @private
     */
    _startThrottleTimer() {
        if (this._throttleTimerId) {
            clearTimeout(this._throttleTimerId);
            this._throttleTimerId = 0;
        }

        // Only begin processing all requests after a delay.
        this._throttleTimerId = setTimeout(
            (thisObject) => {
                clearTimeout(thisObject._throttleTimerId);
                thisObject._throttleTimerId = 0;
                thisObject._beginProcessRequests();
            },
            100,
            this
        );
    }

    /**
     * Batch up all the outstanding requests, adding
     * them to task queue for progressive fetching.
     * @private
     */
    _beginProcessRequests() {
        const that = this;
        const queries = Object.entries(this._requestedData).map(([deviceId, propIds]) => {
            const query = new QueryParam(that._dateTimeSpan);
            query.deviceId = deviceId;
            query.propertyIds = propIds.slice(0);
            return query;
        });

        this._requestedData = {}; // Clear request list.
        queries.forEach((query) => this._makeSingleRequest(query));
    }

    /**
     * Make a fetch request for a single device with one or more properties.
     * @param {QueryParam} query The query to execute.
     * @private
     */
    _makeSingleRequest(query) {
        let retryAttempts = 0;

        const that = this;
        function requestTask(finish) {
            that._dataStore
                .fetchDeviceData(query)
                .then((deviceData) => {
                    deviceData;

                    // Notify listeners of the successful data query.
                    const eventArgs = new QueryCompletedEventArgs(query);
                    that._dataStore.emit(EventType.QueryCompleted, eventArgs);
                })
                .catch((reason) => {
                    reason;
                    if (retryAttempts++ < 4) {
                        // Only make few attempts so it won't go on forever.
                        setTimeout(() => requestQueue.addTask(requestTask), 3000);
                    }
                })
                .finally(() => finish());
        }

        requestQueue.addTask(requestTask);
    }
}
