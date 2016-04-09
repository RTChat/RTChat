var webpack = require('webpack');

module.exports = {
	context: __dirname,
	entry: "app/main.js",
	output: {
		path: __dirname + "/dist",
		libraryTarget: 'var',
		library: "RTChat",
		filename: "bundle.js"
	},
	resolve: { alias: {
		app: __dirname + '/app',
		views: 'app/views',
		utils: 'app/utils',
		styles: 'app/styles',
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
			{ test:  /\.json$/, loaders: ["hson"] },
			{ test:  /\.s?css$/, loaders: ["style", "css", "sass"] },
			{ // ES6 support.
				test:  /\.js$/,
				loader: "babel",
				exclude: /node_modules/,
				query: { presets: ['es2015'] }
			},
			// {test: /\.(woff|woff2)(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&mimetype=application/font-woff'},
			// {test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&mimetype=application/octet-stream'},
			// {test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: 'file'},
			// {test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&mimetype=image/svg+xml'}
		]
	},
	devtool: 'source-map',
};

if (process.argv.indexOf('--minify') >= 0) {
	var CompressionPlugin = require("compression-webpack-plugin");

	module.exports.plugins.push(
		new webpack.optimize.UglifyJsPlugin({minimize: true})
	);
	module.exports.plugins.push(
		new CompressionPlugin({
			asset: "[path].gz[query]",
			algorithm: "gzip",
			test: /\.js$|\.html$/
		})
	);
}
