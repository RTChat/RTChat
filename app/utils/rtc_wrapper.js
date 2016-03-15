
require('rtcmulticonnection-v3/dist/rmc3.js')

var UserService = require('../utils/user_service.js');

// RTC_wrapper
module.exports = {
	joinRoom: function(roomName, options) {
		//TODO: close connection?

		this.connection = new RTCMultiConnection();

		if (document.location.host.match(/github/)) {
			//TODO:
		} else if (document.location.host.match(/jsfiddle/)) {
			this.connection.socketURL = 'https://rtcmulticonnection.herokuapp.com:443/';
		} else {
			this.connection.socketURL = '/';
		}

		// this.connection.token();
		this.connection.session = {
			// audio: true,
			// video: true,
			data : true
		};
		this.connection.sdpConstraints.mandatory = {
			OfferToReceiveAudio: true,
			OfferToReceiveVideo: true
		};

		// this.connection.onstream = function(ev) {
		// 	console.log('eEE', ev, options.videoContainer)
		// 	options.videoContainer[0].appendChild(ev.mediaElement);

		// 	setTimeout(function() {
		// 		ev.mediaElement.play();
		// 	}, 5000);

		// }

		// this.connection.onNewSession = function(session) {
		// 	console.log("new seshh", session)
		// }
		this.connection.extra = UserService.getExtras()

		this.connection.onopen = function(sess) {
			console.log("onopen", sess)
		}

		this.connection.openOrJoin(this.channelPrefix + roomName)
	},
	leaveRoom: function() {

	},
	users: [],
}