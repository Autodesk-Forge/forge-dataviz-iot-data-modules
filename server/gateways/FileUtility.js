const FS = require("fs");

var FileUtility = {};

FileUtility.loadFile = async function (file) {
    return new Promise((resolve, reject) => {
        FS.readFile(file, { encoding: "utf8" }, (error, data) => {
            if (error) {
                reject(error);
            } else {
                resolve(data);
            }
        });
    });
};

FileUtility.loadJSONFile = async function (file) {
    let data = await FileUtility.loadFile(file);
    try {
        return JSON.parse(data);
    } catch (e) {
        console.error("Unable to parse file data. " + e);
        return {};
    }
};

module.exports = FileUtility;
