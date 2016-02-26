
// var GameFrameRTC = {}

// var $ = require('jquery');

// var Backbone = require('backbone');
require('backbone-subviews');
require('bootstrap/dist/js/bootstrap.js');
// require('bootstrap/dist/css/bootstrap.css');
// require('font-awesome/css/font-awesome.css');

var AppLayout = require('./layout.js');

// This is what the other games should extend...
document.GameFrameRTC = { app: {
	WelcomePanel: require('./welcome_panel.js'),
	RoomPanel: require('./room_panel.js')
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
