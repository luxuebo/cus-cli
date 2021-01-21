const path = require('path')
const webpack = require('webpack')
const {CleanWebpackPlugin} = require('clean-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const VueLoaderPlugin = require('vue-loader/lib/plugin')
module.exports={
    mode:'development',
    entry:'./src/main.js',
    output:{
        path:path.resolve(__dirname,'./dist'),
        filename:'[name].[hash:8].js',
        publicPath:'./'
    },
    devServer:{
        contentBase:'./src',
        publicPath:'/',
        port:3000,
        open:true,
        hot:true
    },
    resolve:{
        extensions:['.vue','.js']
    },
    module:{
        rules:[
            {
                test:/\.vue$/,
                use:['vue-loader']
            },
            {
                test:/\.css$/,
                // use:['style-loader','css-loader'],
                use:[MiniCssExtractPlugin.loader,'css-loader']
            },
            {
                test:/\.less$/,
                // use:['style-loader','css-loader','less-loader'],
                use:[MiniCssExtractPlugin.loader,'css-loader','less-loader'],
            },
            {
                test:/\.(jpg|png|gif|jpeg)$/,
                use:['url-loader']
            },
            //element-ui的css中使用了字体图标文件
            {
                test:/\.(eot|svg|ttf|woff|woff2)$/,
                loader:'file-loader'
            },
            {
				test: /\.(js)$/,
				exclude: /node_modules/,
				use:[
                    {
                        loader:'babel-loader',
                        options:{
                            presets:[
                                [
                                    '@babel/preset-env',
                                    {
                                        useBuiltIns:'usage',//按需引入
                                        corejs:{
                                            version:3
                                        },
                                        targets:{
                                            chrome:"40",
                                            firefox:'50',
                                            ie:'9',
                                            safari:"10",
                                            edge:'17'
                                        },//兼容那些浏览器
                                    }
                                ]
                            ]
                        }
                    }
                ]
			}
        ]
    },
    plugins:[
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            template:"./src/index.html",
        }),
        new VueLoaderPlugin(),
        new MiniCssExtractPlugin({
            filename:'style[hash:8].css'
        })
    ]
}