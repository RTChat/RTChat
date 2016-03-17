var webpack = require('webpack');

module.exports = {
	context: __dirname + "/app",
	entry: "./main.js",
	output: {
		path: __dirname + "/dist",
		libraryTarget: 'var',
		library: "GameFrameRTC",
		filename: "bundle.js"
	},
	resolve: { alias: {
		views: __dirname + '/app/views',
		utils: __dirname + '/app/utils',
		styles: __dirname + '/app/styles',
	} },
	plugins: [
		new webpack.ProvidePlugin({
			$: "jquery",
			jQuery: "jquery",
			_: "underscore"
		}),
	],
	module: {
		loaders: [
			{ test:  /\.s?css$/, loaders: ["style", "css", "sass"] },
			// {test: /\.(woff|woff2)(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&mimetype=application/font-woff'},
			// {test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&mimetype=application/octet-stream'},
			// {test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: 'file'},
			// {test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&mimetype=image/svg+xml'}
			{ test:  /\.js$/, loader: "babel-loader", exclude: /node_modules/ }, // Adds ES6 support.
		]
	},
	devtool: 'source-map',
};

 if (process.argv.indexOf('--minify') >= 0) {
	 module.exports.plugins.push(
		 new webpack.optimize.UglifyJsPlugin({minimize: true})
	 );
 }
