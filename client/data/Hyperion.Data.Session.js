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

/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "(DataStore)" }] */

import { DataStore } from "./Hyperion.Data.Storage";

let sessionCount = 0;

/**
 * An instance of this object represents an active session that manages IoT
 * device data storage along with the data adapters that interact with specific
 * data providers to download device telemetry data.
 * @memberof Autodesk.DataVisualization.Data
 * @alias Autodesk.DataVisualization.Data.Session
 */
class Session {
    /**
     * Constructs a new session object
     */
    constructor() {
        this._sessionId = `session-${sessionCount++}`;
        this._dataStore = new DataStore();
    }

    /**
     * @returns {DataStore} The DataStore object for this session.
     */
    get dataStore() {
        return this._dataStore;
    }
}
export { Session };
