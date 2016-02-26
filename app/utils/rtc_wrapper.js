
require('rtcmulticonnection-v3/dist/rmc3.js')

// RTC_wrapper
module.exports = {
	joinRoom: function(roomName, options) {
		//TODO: close connection?

		this.connection = new RTCMultiConnection();
		// this.connection.socketURL = 'https://rtcmulticonnection.herokuapp.com:443/';
		this.connection.socketURL = '/';
		this.connection.token();
		this.connection.session = {
			// audio: true,
			// video: true,
			data : true
		};
		this.connection.sdpConstraints.mandatory = {
			OfferToReceiveAudio: true,
			OfferToReceiveVideo: true
		};

		this.connection.onstream = function(ev) {
			console.log('eEE', ev, options.videoContainer)
			options.videoContainer[0].appendChild(ev.mediaElement);

			setTimeout(function() {
				ev.mediaElement.play();
			}, 5000);

		}

		this.connection.openOrJoin(this.channelPrefix + roomName)
	},
	leaveRoom: function() {

	},
	users: [],
}