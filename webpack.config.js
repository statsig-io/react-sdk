// webpack.config.js
var path = require('path');

module.exports = {
  entry: './dist/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.js',
    library: 'statsig-react-pre-release',
    libraryTarget: 'umd',
    libraryExport: 'default',
    globalObject: 'this',
  },
  optimization: {
    sideEffects: false,
  },
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.js$/,
        include: path.resolve(__dirname, 'src'),
        exclude: /(node_modules|dist)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['env'],
          },
        },
      },
    ],
  },
  externals: {
    react: 'react',
  },
};
