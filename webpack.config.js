const path = require('path');

module.exports = {
  // entry: './describe-syntax.js',
  context: path.resolve(__dirname, 'tests'),
  entry: {
    'json-error-hl': './json-error-hl/describe-syntax.js',
    'js-hl': './js-hl/describe-syntax.js',
  },
  output: {
    path: path.resolve(__dirname, 'tests'),
    filename: '[name]/bundle-describe-syntax.js',
    // filename: (d) => {console.log(`d`, d);},
    library: {type: "module"}
  },
  experiments: {
    outputModule: true,
  },
  mode: 'none',
  // mode: 'development',
  // mode: 'production',
  module: {
    rules: [
      {
        test: /\.scss$/i,
        use: [
          "style-loader",  // Creates `style` nodes from JS strings
          "css-loader",    // Translates CSS into CommonJS
          "sass-loader",   // Compiles Sass to CSS
        ],
      },
    ],
  },
  devtool: "source-map",
};