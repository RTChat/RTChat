
// var Backbone = require('backbone');
require('backbone-subviews');
require('bootstrap/dist/js/bootstrap.js');
//TODO: ??
// require('bootstrap/dist/css/bootstrap.css');
// require('font-awesome/css/font-awesome.css');

var AppConfig = require('app/config');

// Make PUBLIC modules accessible.
module.exports = {
	RTCWrapper: require('utils/rtc_wrapper.js'),
	UserService: require('utils/user_service.js'),
	app: { // DemoApp - Overwrite this with your app or game!
		LayoutView: require('views/layout.js'),
		WelcomePanel: require('views/welcome_panel.js'),
		RoomPanel: require('views/room_panel.js'),
		ChatPanel: require('views/chat_panel.js')
	},
	init: function() {
		var self = this;
		$(document).ready(function() {
			// Init Socket.io
			$.getScript((AppConfig['SocketHost']||'')+'/socket.io/socket.io.js').then(function(e) {
				// Make initial render.
				(new self.app.LayoutView()).render();
			})
		});
	}
};
