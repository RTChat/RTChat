
// var $ = require('jquery');
// var Backbone = require('backbone');
require('backbone-subviews');
require('bootstrap/dist/js/bootstrap.js');
// require('bootstrap/dist/css/bootstrap.css');
// require('font-awesome/css/font-awesome.css');

var AppLayout = require('./views/layout.js');

module.exports = {
	// UserService: require('./utils/user_service.js'),
	app: {
		WelcomePanel: require('./views/welcome_panel.js'),
		RoomPanel: require('./views/room_panel.js')
	},
}

$(document).ready(function() {
	(new AppLayout).render();
})
