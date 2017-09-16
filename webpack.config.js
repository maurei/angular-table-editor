/*global __dirname, require, module*/

const webpack = require('webpack');
const path = require('path');
const env = require('yargs').argv.env; // use --env with webpack 2
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const RemoveSourceMapUrlWebpackPlugin = require('@rbarilani/remove-source-map-url-webpack-plugin');
const removeSourceMapping = new RemoveSourceMapUrlWebpackPlugin({test: /\.js$/})
const removeSourceMapping2 = new RemoveSourceMapUrlWebpackPlugin({test: /\.css$/})
const extractSass = new ExtractTextPlugin({
    filename: "demo.css",
});
let libraryName = 'angular-table-editor';

let plugins = [],
    outputFile;

if (env === 'build') {
    outputFile = libraryName + '.js';
} else {
    outputFile = libraryName + '.js';
}

const config = {
    entry: __dirname + '/src/table-editor.module.js',
    output: {
        path: __dirname + '/lib',
        filename: outputFile,
        library: libraryName,
        libraryTarget: 'umd',
        umdNamedDefine: true
    },
    module: {
        // rules: [{
        //     test: /(\.jsx|\.js)$/,
        //     loader: 'babel-loader',
        //     exclude: /(node_modules|bower_components)/,
        //     query: {
        //         presets: ["latest"]
        //     }
        // }]
    },
    module: {
        rules: [{
            test: /\.scss$/,
            use: extractSass.extract({
                use: [{
                    loader: "css-loader"
                }, {
                    loader: "sass-loader"
                }],
                fallback: "style-loader"
            })
        }, 
        {
            test: /\.(eot|svg|ttf|woff|woff2)$/,
            loader: 'file-loader?name=fonts/[name].[ext]',
        }]
    },
    plugins: [
        extractSass, removeSourceMapping, removeSourceMapping2
    ],
};

module.exports = config;
