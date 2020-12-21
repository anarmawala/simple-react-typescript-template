import * as path from 'path'
import * as webpack from 'webpack'
import * as devServer from 'webpack-dev-server'
import dotenv from 'dotenv-defaults'
import Dotenv from 'dotenv-webpack' // Support for ENV values
import HtmlWebpackPlugin from 'html-webpack-plugin' // Generates index.html
import TerserPlugin from 'terser-webpack-plugin' // Minifies the bundled JS
import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin'
import FaviconsWebpackPlugin from 'favicons-webpack-plugin'

// * Interface including the devSever types
interface WebpackConfiguration extends webpack.Configuration {
  devServer?: devServer.Configuration
}

// * Load ENV Variables from the .env and .env.defaults files
dotenv.config()

// * Check if current mode is development
const isDevelopment = process.env.NODE_ENV !== 'production'

const Configuration: WebpackConfiguration = {
  mode: isDevelopment ? 'development' : 'production',
  devtool: isDevelopment ? 'eval-source-map' : false,

  devServer: {
    contentBase: path.join(__dirname, 'build'),
    port: 3000,
    hot: true,
    historyApiFallback: true,
  },

  // * Support all JS and TS file types
  resolve: { extensions: ['.js', '.jsx', '.ts', '.tsx'] },

  entry: { bundle: path.join(__dirname, 'src/index.tsx') },

  // * Use Terser Plugin for minifying the bundle
  optimization: { minimize: true, minimizer: [new TerserPlugin()] },

  output: {
    path: path.resolve(__dirname, 'build'),
    // for production use [contenthash], for development use [hash]
    filename: isDevelopment ? '[name].[fullhash].js' : '[name].[contenthash].js',
  },

  plugins: [
    ...(isDevelopment ? [new ReactRefreshWebpackPlugin()] : []),
    new HtmlWebpackPlugin({ title: process.env.TITLE, template: 'index.ejs' }),
    new FaviconsWebpackPlugin({
      // Your source logo (required)
      logo: path.resolve(__dirname, 'src/images/logo.svg'),
      // Enable caching and optionally specify the path to store cached data
      // Note: disabling caching may increase build times considerably
      cache: true,
      inject: true,
      mode: isDevelopment ? 'light' : 'webapp',
      favicons: { orientation: 'portrait', start_url: '/' },
    }),
    new Dotenv({ safe: true, defaults: true }),
  ],

  module: {
    rules: [
      { test: /\.(css|scss|sass)$/, use: ['css-loader', 'sass-loader'] },
      { test: /\.(png|svg|jpg|gif)$/i, use: ['file-loader'] },
      { test: /\.html$/, use: [{ loader: 'html-loader' }] },
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /(node_modules|bower_components|build)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react', '@babel/preset-typescript'],
            plugins: [...(isDevelopment ? ['react-refresh/babel'] : [])],
          },
        },
      },
    ],
  },
}

export default Configuration
