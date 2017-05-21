let webpack = require('webpack');

module.exports = {
   entry:  {
      'default': './src/js/script.js',
      'newtask': './src/js/script-newtask.js'
   },
   output: {
      path: __dirname + "/public/script",
      filename: '[name]-bundle.js'
   },
   module: {
      rules: [
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
         }
      ]
   },
   resolve: {
      modules: ["node_modules"]
   },
   plugins: [
      new webpack.ProvidePlugin({
         riot: 'riot'
      }),
      new webpack.optimize.UglifyJsPlugin()
   ]
};