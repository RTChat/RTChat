
// var Backbone = require('backbone');
require('backbone-subviews');
require('bootstrap/dist/js/bootstrap.js');
//TODO: ??
// require('bootstrap/dist/css/bootstrap.css');
// require('font-awesome/css/font-awesome.css');

require('styles/main.css');

// Make PUBLIC modules accessible.
module.exports = {
	LayoutView: require('views/layout.js'),
	RTCWrapper: require('utils/rtc_wrapper.js'),
	UserService: require('utils/user_service.js'),
	app: { // DemoApp - Overwrite this!
		WelcomePanel: require('views/welcome_panel.js'),
		RoomPanel: require('views/room_panel.js'),
		ChatPanel: require('views/chat_panel.js')
	},
	init: function() {
		var self = this;
		$(document).ready(function() {
			(new self.LayoutView()).render();
		});
	}
}
