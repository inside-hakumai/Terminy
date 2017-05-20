module.exports = {
   entry:  './src/js/script-newtask.js',
   output: {
      filename: 'bundle-newtask.js'
   },
   module: {
      loaders: [
         {
            test: /\.css$/,
            loaders: ['style-loader', 'css-loader']
         }
      ]
   },
   resolve: {
      modules: ["node_modules"]
   }
};