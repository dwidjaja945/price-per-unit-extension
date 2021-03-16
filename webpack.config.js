const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { VueLoaderPlugin } = require('vue-loader');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
  mode: process.env.NODE_ENV,
  entry: {
    index: './src/index.js',
  },
  output: {
    publicPath: '/build/',
    path: path.resolve(__dirname, './build'),
    filename: '[name].build.js',
    clean: true,
  },
  plugins: [
    // new HtmlWebpackPlugin({
    //   filename: 'index.html',
    //   template: path.resolve(__dirname, './popup.html'),
    //   hash: true,
    //   chunks: ['main'],
    // }),
    new VueLoaderPlugin(),
  ],
  module: {
    rules: [
      {
        test: /\.(s?)css$/i,
        use: [
          'style-loader',
          'vue-style-loader',
          'css-loader',
          'sass-loader',
        ],
      },
      {
        test: /\.ts(x?)$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        // options: {
        //   loaders: {
        //     // Since sass-loader (weirdly) has SCSS as its default parse mode, we map
        //     // the "scss" and "sass" values for the lang attribute to the right configs here.
        //     // other preprocessors should work out of the box, no loader config like this necessary.
        //     scss: [
        //       'vue-style-loader',
        //       'css-loader',
        //       'sass-loader',
        //     ],
        //     sass: [
        //       'vue-style-loader',
        //       'css-loader',
        //       'sass-loader?indentedSyntax',
        //     ],
        //   },
        //   // other vue-loader options go here
        // },
      },
    ],
  },
  // resolve: {
  //   alias: {
  //     vue$: 'vue/dist/vue.esm.js', // 'vue/dist/vue.common.js' for webpack 1
  //   },
  // },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src/'),
    },
    extensions: ['*', '.js', '.ts', '.vue', '.json'],
  },

};

if (process.env.NODE_ENV === 'production') {
  module.exports.plugins = (module.exports.plugins || []).concat([
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"',
      },
    }),
    new UglifyJSPlugin({
      sourceMap: true,
    }),
    new webpack.LoaderOptionsPlugin({
      minimize: true,
    }),
  ]);
}
