const path = require('path');
const config = require('./config');

module.exports = {
  entry: './src/init.js',
  mode: 'production',
  output: {
    filename: config.app.build_output,
    path: path.resolve(__dirname, config.app.public_dirname),
    publicPath: "",   
  },
};
// Webpack takes all JS files of the project
// and bundles everything into a single file: index_bundle.js
// Then index.html loads that bundle
// After that, the browser executes the bundle and the game starts