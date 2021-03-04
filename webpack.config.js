const Path = require("path");
var config = [
    {
        target: "node",
        entry: {
            client: "./index_client.js",
            server: "./index_server.js",
        },
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
    },
];
module.exports = config;
