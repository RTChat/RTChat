// RTChat - loads the libraries and exports the global variable "RTChat".

require('backbone-subviews'); // also makes "Backbone" globally available.
require('imports?jQuery=jquery!bootstrap/dist/js/bootstrap.js');

// Helper to turn file names into module names.
// "./sample_view.js" becomes "SampleView".
var modularize = function(str) {
	return str.replace(/(^(\.\/)?\w|_[a-z])/g, function(s) {
    return s.slice(-1).toUpperCase();
  }).replace(/\.js$/, '');
};

// Load all views in an extensible way.
var req = require.context('app/views', true, /\.js$/);
var views = _.reduce(req.keys(), function(v, k) {
	return (v[modularize(k)] = req(k)) && v;
}, {});

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
	}

};
