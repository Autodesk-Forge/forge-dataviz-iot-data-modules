const AzureGateway = require("./server/gateways/Hyperion.Server.AzureGateway");
const CsvGateway = require("./server/gateways/Hyperion.Server.CsvGateway");
const DataGateway = require("./server/gateways/Hyperion.Server.DataGateway");
const SyntheticGateway = require("./server/gateways/Hyperion.Server.SyntheticGateway");

module.exports = {
    AzureGateway,
    CsvGateway,
    DataGateway,
    SyntheticGateway,
};
