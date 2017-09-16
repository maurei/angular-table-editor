const path = require('path');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const RemoveSourceMapUrlWebpackPlugin = require('@rbarilani/remove-source-map-url-webpack-plugin');
const removeSourceMapping = new RemoveSourceMapUrlWebpackPlugin({test: /demo\.js$/})
const extractSass = new ExtractTextPlugin({
    filename: "demo.css",
});


const root = __dirname
const fonts = {
    test: /\.(eot|svg|ttf|woff|woff2)$/,
    loader: 'file?name=fonts/[name].[ext]',
};

module.exports = {
    entry: path.resolve(root, './src/demo.module.js'),
    output: {
        path: path.resolve(root, 'build'),
        filename: './demo.js'
    },
    resolve: {
        extensions: ['.html', '.js']
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
        extractSass, removeSourceMapping
    ],
};





