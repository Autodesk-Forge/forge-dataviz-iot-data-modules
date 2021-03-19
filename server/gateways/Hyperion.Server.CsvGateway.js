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
/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "()"}]*/
const DataGateway = require("./Hyperion.Server.DataGateway");
const FS = require("fs");
const Q = require("q");
const Path = require("path");
const ES = require("event-stream");
const timestring = require("timestring");
const { loadJSONFile } = require("./FileUtility.js")

/**
 * @classdesc A data gateway that supplies CSV data from local
 * @class
 * @augments DataGateway
 */
class CsvDataGateway extends DataGateway {
    /**
     *
     * @param {string} deviceModelFile JSON file, please refer ./synthetic-data/device-models.json
     * @param {string} deviceFile JSON file, please refer ./synthetic-data/devices.json
     * @param {string} dataFile
     */
    constructor(
        deviceModelFile,
        deviceFile,
        dataFolder,
        options = { delimiter: "\t", lineBreak: "\n", timeStampColumn: "time" },
        dataFileExtension = ".csv"
    ) {
        super("LocalGateway");

        this.deviceModelFile = deviceModelFile;
        this.deviceFile = deviceFile;
        this.dataFolder = dataFolder;
        this.dataFileExtension = dataFileExtension;

        this.delimiter = options.delimiter;
        this.lineBreak = options.lineBreak;
        this.timeStampColumn = options.timeStampColumn;
    }

    async getDeviceModels() {
        return loadJSONFile(this.deviceModelFile);
    }

    async getDevicesInModel(deviceModelId) {
        let devices = await loadJSONFile(this.deviceFile);
        return devices.find((device) => device.deviceModelId === deviceModelId);
    }

    async getAggregates(deviceId, propertyId, startSecond, endSecond, resolutionStr) {
        let defer = Q.defer();
        let filePath = Path.join(this.dataFolder, deviceId + this.dataFileExtension);

        if (!FS.existsSync(filePath)) {
            console.error("Error File does not exists: Fallback to example", filePath);
            defer.resolve({
                timestamps: [],
                min: [],
                max: [],
                avg: []
            });
            return defer.promise;
        }

        let resolution = timestring(resolutionStr.replace(/PT/gi, ""));

        // the CSV file might be very large, and we need to handle the cocurrent situations
        let lineNumber = 0;
        let results = [];
        let min = [];
        let max = [];
        let counts = [];

        let start = startSecond - resolution / 2;
        let end = endSecond + resolution / 2;

        let timeIndex, propIndex;
        let self = this;

        const stream = FS.createReadStream(filePath)
            .pipe(ES.split())
            .pipe(ES.mapSync((line) => {
                let parts = line.split(self.delimiter);
                if (lineNumber++ == 0) {
                    timeIndex = parts.findIndex((item) => item.trim() == self.timeStampColumn);
                    propIndex = parts.findIndex((item) => item.trim() == propertyId);
                } else {
                    let time = Math.round(new Date(parts[timeIndex].trim()).getTime() / 1000);
                    if (time >= start && time <= end) {
                        let value = parseFloat(parts[propIndex]);
                        let index = Math.round((time - start) / resolution);

                        if (results[index]) {
                            let [sum, count] = results[index];
                            results[index] = [sum + value, count + 1];

                            min[index] = Math.min(min[index], value);
                            max[index] = Math.max(max[index], value);
                            counts[index] = count;
                        } else {
                            results[index] = [value, 1];

                            min[index] = value;
                            max[index] = value;
                            counts[index] = index;
                        }
                    }
                }
            }))
            .on("error", (err) => {
                defer.reject("something wrong." + err);
            })
            .on("end", () => {
                let aggregate = [];
                let timestamps = [];
                let sums = [];

                for (let i = 0; i < results.length; i++) {
                    timestamps[i] = startSecond + resolution * i;
                    if (results[i]) {
                        let [sum, count] = results[i];
                        aggregate[i] = sum / count;
                        sums[i] = sum;
                    } else {
                        aggregate[i] = null;
                    }
                }

                defer.resolve({
                    timestamps,
                    min,
                    max,
                    count: counts,
                    sum: sums,
                    avg: aggregate
                });
            });

        return defer.promise;
    }
}

module.exports = CsvDataGateway;
