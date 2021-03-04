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
import { QueryParam } from "./Hyperion.Data.Adapter";

export const EventType = {
    QueryCompleted: "QueryCompleted",
};

/**
 * Class to encapsulate arguments for a QueryCompleted event to be used with {@link EventSource}
 * @memberof Autodesk.Hyperion.Data
 * @alias Autodesk.Hyperion.Data.QueryCompletedEventArgs
 */
export class QueryCompletedEventArgs {
    /**
     * The event argument for a QueryCompleted event.
     * @param {QueryParam} query The query parameter this event is meant for.
     */
    constructor(query) {
        this._query = query;
    }

    /**
     * @returns {QueryParam} The query parameter this event is meant for.
     */
    get query() {
        return this._query;
    }
}

/**
 * Base class for publish subscribe handling of events
 * @memberof Autodesk.Hyperion.Data
 * @alias Autodesk.Hyperion.Data.EventSource
 */
export class EventSource {
    /**
     * Constructs a new EventSource object
     */
    constructor() {
        this._eventHandlers = {};
    }

    /**
     * Register a new event handler
     * @param {string} eventType Event to be subscribed to
     * @param {Function} eventHandler Handler for the event
     * @memberof Autodesk.Hyperion.Data
     * @alias Autodesk.Hyperion.Data.EventSource#addEventListener
     */
    addEventListener(eventType, eventHandler) {
        if (!this._eventHandlers[eventType]) {
            this._eventHandlers[eventType] = [];
        }

        this._eventHandlers[eventType].push(eventHandler);
    }

    /**
     * De-register a handler
     * @param {string} eventType Event type of the handler
     * @param {Function} eventHandler Handler that is to be deregistered
     * @memberof Autodesk.Hyperion.Data
     * @alias Autodesk.Hyperion.Data.EventSource#removeEventListener
     */
    removeEventListener(eventType, eventHandler) {
        const handlers = this._eventHandlers[eventType] || [];
        const index = handlers.findIndex((eh) => eh === eventHandler);
        if (index >= 0) {
            handlers.splice(index, 1); // Remove handler given its index.
        }
    }

    /**
     * Emit a new event
     * @param {string} eventType Event type that occurred
     * @param {any} eventArgs Misc arguments for that event
     * @memberof Autodesk.Hyperion.Data
     * @alias Autodesk.Hyperion.Data.EventSource#emit
     */
    emit(eventType, eventArgs) {
        const handlers = this._eventHandlers[eventType] || [];
        handlers.forEach((handler) => handler(eventArgs));
    }
}
