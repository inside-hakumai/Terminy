let webpack = require('webpack');
let path = require('path');

const MODE = 'development';
const enabledSourceMap = (MODE === 'development');


module.exports = {
   entry:  {
      'default': './src/renderer/js/script.js',
      'newtask': './src/renderer/js/script-newtask.js',
      'preferences': './src/renderer/js/script-preferences.js',
   },
   output: {
      path: __dirname + "/renderer/script",
      filename: '[name]-bundle.js'
   },
   module: {
      rules: [
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
      ]
   },
   plugins: [
      new webpack.ProvidePlugin({
         riot: 'riot'
      }),
      new webpack.optimize.UglifyJsPlugin()
   ]
};