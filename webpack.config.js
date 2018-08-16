let webpack = require('webpack');
let path = require('path');

const MODE = 'development';
const enabledSourceMap = (MODE === 'development');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

let commonConfig = {
   module: {
      rules: [
         {
            test: /\.ts$/,
            use: [
               {
                  loader: 'babel-loader',
                  options: {
                     sourceMap: enabledSourceMap,
                     presets: ['es2015'],
                  }
               },
               {
                  loader: 'ts-loader',
                  options: {
                     allowTsInNodeModules: true
                  }
               }
            ],
         },
         {
            test: /\.scss/,
            use: [
               'style-loader',
               {
                  loader: 'css-loader',
                  options: {
                     url: true,
                     sourceMap: enabledSourceMap,
                     importLoaders: 2
                  },
               },
               {
                  loader: 'sass-loader',
                  options: {
                     sourceMap: enabledSourceMap,
                  }
               }
            ]
         },
         {
            test: /\.tag$/,
            exclude: /node_modules/,
            loader: 'riotjs-loader',
            enforce: 'pre'
         },
         {
            test: /\.js$/,
            enforce: "pre",
            loader: "source-map-loader"
         },
         {
            test: /\.css$/,
            loaders: ['style-loader', 'css-loader']
         },
         {
            test: /\.js$|\.tag$/,
            exclude: /node_modules/,
            loader: "babel-loader",
            query: {
               presets: ['es2015', 'es2015-riot']
            }
         },
         {
            test: /\.svg$/,
            loader: 'url-loader'
         },
      ]
   },
   resolve: {
      modules: [
         "node_modules",
         path.resolve(__dirname, "src/renderer/js"),
      ],
      plugins: [
         new TsconfigPathsPlugin()
      ],
      extensions: ['.js', '.ts', '.tsx', '.jsx', '.json']
   },
   plugins: [
      new webpack.ProvidePlugin({
         riot: 'riot',
         $: 'jquery',
         jQuery: "jquery",
      }),
      new UglifyJsPlugin(),
   ],
   devtool: 'source-map',
};

const configs = [
   Object.assign({}, commonConfig, {
      target: 'electron-renderer',
      entry:  {
         'default': './src/renderer/js/script.ts',
         'newtask': './src/renderer/js/script-newtask.ts',
         'preferences': './src/renderer/js/script-preferences.ts',
      },
      output: {
         path: __dirname + "/renderer/script",
         filename: '[name]-bundle.js'
      },
   }),
   Object.assign({}, commonConfig, {
      target: 'electron-main',
      entry:  {
         'default': './src/main/main.ts',
      },
      output: {
         path: __dirname + "/main",
         filename: 'main.js'
      },
      node: {
         __dirname: false,
         __filename: false,
      },
   })
];

module.exports = configs;
