'use strict';

const webpack = require('webpack')
const getClientEnvironment = require('./config/env')
const env = getClientEnvironment()

module.exports = {
  target: 'node',
  module: {
    rules: [
      {
        test: /\.node$/,
        use: 'node-loader'
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx', '.node', '.json'],
    modules: ["node_modules", "src"]
  },
  externals: [
    'electron'
  ],
  plugins: [
    new webpack.DefinePlugin(env.stringified)
  ]
}
