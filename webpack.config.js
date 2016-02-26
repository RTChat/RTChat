var webpack = require('webpack');

module.exports = {
	// configuration
	context: __dirname + "/app",
	entry: "./main.js",
	output: {
		path: __dirname + "/dist",
		// libraryTarget: 'var',
		// library: "GameFrameRTC",
		filename: "bundle.js"
	},
	// externals: {
	// 	'jquery': '$',
	// 	'jquery': 'jQuery'
	// }
	plugins: [
		new webpack.ProvidePlugin({
			$: "jquery",
			jQuery: "jquery"
		}),
		// new webpack.optimize.UglifyJsPlugin({minimize: true})
	],
	module: {
		loaders: [
			{test:  /\.css$/, loader: "style-loader!css-loader" },
			// {test: /\.(woff|woff2)(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&mimetype=application/font-woff'},
			// {test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&mimetype=application/octet-stream'},
			// {test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: 'file'},
			// {test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&mimetype=image/svg+xml'}
		]
	}
};
