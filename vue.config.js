var webpack = require('webpack');
var MangleJsClassPlugin = require('mangle-js-webpack-plugin');

module.exports = {
    filenameHashing: false,
    productionSourceMap: false,
    lintOnSave: false,
    baseUrl:"./",
    pages: {
        main: {
            entry: 'src/main.ts'
        },
        app: {
            entry: 'src/app.ts',
            filename: 'index.html'
        }
    },
    css: {
        extract: true,
        sourceMap: false,
        loaderOptions: {},
        modules: false
    },
    configureWebpack: {
        target: "electron-renderer",
        optimization: {
            //splitChunks: {
            //    chunks: 'all',
            //    //minSize: 30000,
            //    minChunks: 10,
            //    //maxAsyncRequests: 5,
            //    //maxInitialRequests: 3,
            //    //automaticNameDelimiter: '~',
            //    //name: true,
            //    //cacheGroups: {
            //    //    jquery: {
            //    //        name: `chunk-jquery`,
            //    //        test: /[\\/]node_modules[\\/].*?jquery.*?/,
            //    //        priority: -5,
            //    //        chunks: 'initial'
            //    //    },
            //    //    vendors: {
            //    //        name: `chunk-vendors`,
            //    //        test: /[\\/]node_modules[\\/]/,
            //    //        priority: -10,
            //    //        chunks: 'initial'
            //    //    },
            //    //    utils: {
            //    //        name: `chunk-utils`,
            //    //        test: /.*src[\\/]core[\\/]message.*/,
            //    //        priority: -15,
            //    //        chunks: 'initial'
            //    //    },
            //    //    common: {
            //    //        name: `chunk-common`,
            //    //        priority: -20,
            //    //        chunks: 'initial',
            //    //        reuseExistingChunk: false
            //    //    }
            //    //}
            //}
            splitChunks: false
        },
        plugins: [
            new webpack.ProvidePlugin({
                $: "jquery",
                jQuery: "jquery"
            })
            //, new MangleJsClassPlugin({ //调试注释该部分
            //    exclude: /chunk-vendors.*/,
            //    algorithm: 'obfuscator' // 'obfuscator' || 'jjencode' || 'aaencode'
            //})
            //,new ZipPlugin({
            //    chrome: ["applications"]
            //})
            //new BundleAnalyzerPlugin()
        ]
    }
    ,chainWebpack(webpackConfig) { //调试打开该部分
        webpackConfig.optimization.minimize(false);
    },
    pluginOptions: {
        electronBuilder: {
            nodeIntegration: true,
            //externals: ['mqtt', 'vm2', 'log4js', 'typeorm'],
            builderOptions: {
                productName: 'IMQTT',
                win: {
                    artifactName: 'MQTTX.Setup.${version}.${ext}',
                    icon: './public/icons/app.ico',
                },
                mac: {
                    icon: './public/icons/mac/Icon.icns',
                    target: [
                        {
                            target: 'dmg',
                            arch: 'universal',
                        },
                        {
                            target: 'pkg',
                            arch: 'universal',
                        },
                        {
                            target: 'zip',
                            arch: 'universal',
                        },
                    ],
                },
                linux: {
                    icon: './public/icons/app.png',
                    target: ['AppImage', 'deb', 'rpm', 'snap'],
                }
            }
        }
    }
};