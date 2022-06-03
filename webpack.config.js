const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
    mode: 'development',
    entry: {
        main: ['./src/scripts/index.js', './src/styles/main.css'],
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'scripts/[name].bundle.js',
        clean: true
    },
    devServer: {
        static: 'dist',
        port: 3000,
        hot: true,
        open: true,
        devMiddleware: {
            writeToDisk: true
        }
    },
    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            template: './src/index.html',
            filename: 'index.html'
        }),
        new CopyWebpackPlugin({
            patterns: [
                { from: 'src/models', to: 'models' }
            ]
        }),
        new MiniCssExtractPlugin({
            filename: 'styles/[name].css',
        })
    ],
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            },
            {
                test: /\.css$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader'
                ],
            },
        ]
    },
    optimization: {
        runtimeChunk: 'single',
    },
};