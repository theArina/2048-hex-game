const HtmlWebPackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './src/index.jsx',
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react']
          }
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  resolve: {
    extensions: ['.jsx', '.js']
  },
  output: {
    filename: 'bundle.js',
    path: __dirname + '/dist'
  },
  devServer: {
    static: {
      directory: __dirname + '/dist',
    },
    compress: true,
    port: 3000
  },
  plugins: [
    new HtmlWebPackPlugin({
      template: 'src/index.html'
    })
  ]
};
