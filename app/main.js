
require('backbone-subviews'); // makes "Backbone" globally available.
require('imports?jQuery=jquery!bootstrap/dist/js/bootstrap.js');

// Helper to turn file names into module names.
// ./sample_view.js becomes "SampleView".
var modularize = function(str) {
	str = str.replace(/(^\.\/|\.js$)/g, ''); // Strip file prefix and suffix.
	return str.replace(/(^\w|(_[a-z]))/g, function(letter, index) {
    return letter.slice(-1).toUpperCase();
  });
};

// Load all views in an extensible way.
var views = {};
var req = require.context('app/views', true, /\.js$/);
req.keys().map(function(name) {
	views[modularize(name)] = req(name);
});

// Make PUBLIC modules accessible.
module.exports = {

	// DemoApp - Extend these with your own app or game!
	Views: views,
	AppConfig: require('app/config.json'),

	// Core Services - don't extend.
	RTCWrapper: require('utils/rtc_wrapper.js'),
	UserService: require('utils/user_service.js'),

	// Run this after you've loaded your extensions.
	init: function() {
		var self = this;
		$(document).ready(function() {
			// Init Socket.io
			$.getScript((self.AppConfig['SocketHost']||'')+'/socket.io/socket.io.js').
				then(function(e) {
					// Make initial render.
					(new self.Views.Layout()).render();
			})
		});
	}

};
