// RTChat - loads the libraries and exports the global variable "RTChat".

require('backbone-subviews'); // also makes "Backbone" globally available.
require('imports?jQuery=jquery!bootstrap/dist/js/bootstrap.js');

require('utils/rivets_extensions.js');

// Load all views in an extensible way.
// "views/sample_view.js" becomes "views.SampleView".
var views = load_module(require.context('app/views', true, /\.js$/));

// Make PUBLIC modules accessible.
module.exports = {

	// DemoApp - Extend these with your own app or game!
	Views: views,
	AppConfig: require('app/config.json'),

	// Core Services - don't extend.
	RTCWrapper: require('utils/rtc_wrapper.js'),
	UserService: require('utils/user_service.js'),

	// Run this after extensions have been loaded.
	init: function() {
		var self = this;
		$(document).ready(function() {
			// Init Socket.io
			$.getScript((self.AppConfig.SocketHost||'')+'/socket.io/socket.io.js').
				then(function(e) {
					// Make initial render.
					(new self.Views.Layout()).render();
			});
		});
	},

	// Helpers
	Rivets: Rivets,
	load_module: load_module,
};

// Load all files from a "context" into a single object.
function load_module(context) {
	// Helper to turn "snake_case" filenames into module names.
	// "./sample_view.js" becomes "SampleView".
	function modularize(str) {
		return str.replace(/(^(\.\/)?\w|_[a-z])/g, function(s) {
			return s.slice(-1).toUpperCase();
		}).replace(/\.js$/, '');
	}

	return _.reduce(context.keys(), function(module, filename) {
		return (module[modularize(filename)] = context(filename)) && module;
	}, {});
}
