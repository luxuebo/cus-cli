const path = require('path')
const {CleanWebpackPlugin} = require('clean-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
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
    module:{
        rules:[
            {
                test:/\.css$/,
                use:['style-loader','css-loader']
            },
            {
                test:/\.(jpg|png|gif|jpeg)$/,
                use:['url-loader']
            },
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
                                    },
                                    '@babel/preset-react'
                                ]
                            ],
                            plugins:[
                                '@babel/plugin-syntax-jsx',
                                '@babel/plugin-transform-react-jsx',
                                '@babel/plugin-transform-react-display-name'
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
            template:"./src/index.html"
        })  
    ]
}