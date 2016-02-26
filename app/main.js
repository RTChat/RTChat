
// var GameFrameRTC = {}

// var $ = require('jquery');

// var Backbone = require('backbone');
require('backbone-subviews');
require('bootstrap/dist/js/bootstrap.js');
// require('bootstrap/dist/css/bootstrap.css');
// require('font-awesome/css/font-awesome.css');

var AppLayout = require('./views/layout.js');

// This is what the other games should extend...
document.GameFrameRTC = { app: {
	WelcomePanel: require('./views/welcome_panel.js'),
	RoomPanel: require('./views/room_panel.js')
} }

// module.exports = {
// // 	AppLayout: require('./frame.js'),
// 	"app": {},
// 	init: function() {
// 		(new this.AppLayout).render();
// 	}
// }
//

$(document).ready(function() {
	(new AppLayout).render();
})
