# forge-dataviz-iot-data-modules

[![npm version](https://badge.fury.io/js/forge-dataviz-iot-data-modules.svg)](https://badge.fury.io/js/forge-dataviz-iot-data-modules)
![npm downloads](https://img.shields.io/npm/dw/forge-dataviz-iot-data-modules.svg)
![platforms](https://img.shields.io/badge/platform-windows%20%7C%20osx%20%7C%20linux-lightgray.svg)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

Re-usable Iot data modules that can be used to create your own Autodesk Forge Viewer-based IoT application. For a reference example, checkout the [Forge Dataviz IoT Reference App](https://github.com/Autodesk-Forge/forge-dataviz-iot-reference-app).

## Installation
```bash
npm install forge-dataviz-iot-data-modules
```

## Usage
```javascript
    //To import client-side data modules.
    import { X } from "forge-dataviz-iot-sample-modules/client"
    
    // To import server-side data modules.
    const { Y } = require("forge-dataviz-iot-sample-modules/server")
```

## Contents
This package contains client-side and server-side modules. Server-side modules (or gateways) interact with the corresponding data provider. For example, AzureGateway interacts with Azure Time Series Insights API in order to retrieve specific sensor data.

Client-side modules convert the data obtained from the corresponding DataGateway object into a consistent data format. For more details on how the client-side and server-side iot data modules interact, please read https://shrikedoc.github.io/data-visualization-doc/#/md/md/adv-data-adapter-gateway

### Client-side modules:
- QueryParam
- PropertyValue
- AggregatedValues
- PropertyData
- DeviceData
- Device
- DeviceProperty
- DeviceModel
- EventType
- EventSource
- QueryCompletedEventArgs
- Session
- DateTimeSpan
- DataView
- DataStore
- DataAdapter
- AzureDataAdapter
- RestApiDataAdapter

### Server-side modules:
- AzureGateway
- CsvGateway
- DataGateway
- SyntheticGateway
