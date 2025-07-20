// webpack.config.js
const path = require('path');

module.exports = {
  entry: './src/client/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'public'),
  },
  module: {
    rules: [
      // 1) JS / JSX via Babel
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            // ensure modules get transpiled for Webpack
            presets: [
              ['@babel/preset-env', { modules: 'commonjs' }],
              '@babel/preset-react'
            ]
          }
        }
      },
      // 2) CSS imports
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx']
  },
  devServer: {
    static: path.resolve(__dirname, 'public'),
    port: 3000,
    proxy: {
      '/api': 'http://localhost:5000'
    },
    historyApiFallback: true
  }
};
