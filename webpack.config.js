const HtmlWebPackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './src/index.tsx',
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react', '@babel/preset-typescript']
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
    extensions: ['.tsx', '.ts', '.js']
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
  devtool: 'source-map',
  plugins: [
    new HtmlWebPackPlugin({
      template: 'src/index.html'
    })
  ]
};
