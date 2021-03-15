const Path = require("path");

const baseConfig = {
    target: "",
    entry: {},
    output: {
        filename: "[name].js",
        path: __dirname,
        libraryTarget: "umd",
        library: "hyperion",
        globalObject: "this",
    },
    mode: "development",
    module: {
        rules: [
            {
                test: /.jsx?$/,
                loader: "babel-loader",
                exclude: Path.resolve(__dirname, "node_modules"),
                query: {
                    plugins: [require.resolve("babel-plugin-transform-object-rest-spread")],
                    presets: [require.resolve("babel-preset-es2015")],
                },
            },
        ],
    },
};

const clientConfig = Object.assign({}, baseConfig);

clientConfig.target = "web";
clientConfig.entry = { client: "./index_client.js" };

const serverConfig = Object.assign({}, baseConfig);

serverConfig.target = "node";
serverConfig.entry = { server: "./index_server.js" };

var config = [
    clientConfig,
    serverConfig,
];
module.exports = config;
