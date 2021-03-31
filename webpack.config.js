const path = require('path');

module.exports = {
	context: path.resolve(__dirname, 'tests'),
	entry: {
		'json-error-hl': './json-error-hl/style.js',
		'js-hl': './js-hl/style.js',
	},
	output: {
		path: path.resolve(__dirname, 'tests'),
		filename: '[name]/bundle-style.js',
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