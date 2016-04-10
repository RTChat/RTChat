
require('rtcmulticonnection-v3/dist/rmc3.js')

var UserService = require('utils/user_service.js');

//TODO:
// require('utils/resume.js'); // Adds the Window:resume event.
// $(window).on("resume", function() { console.log("RESUMING!"); self.render(); });

// RTCWrapper
module.exports = {
	// === Room API ===  (and users)
	users: [],
	joinRoom: function(roomName, options) {
		//TODO: close connection?
		var self = this;
		this.users = [];
		this.leaveRoom();

		this.connection = new RTCMultiConnection();
		this.connection.socketURL = RTChat.AppConfig['SocketHost'];

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
		this.connection.extra = UserService.getExtras();
		console.log("EE", this.connection.extra)
		// this.connection.extra = UserService.currentUser.attributes

		this.connection.onopen = function(sess) {
			console.log("onopen", sess)
			// console.log("new_user", cc.peers[sess.userid])
			// console.log("users", cc.peers, cc.peers.getLength())
			// if (cc.peers[sess.userid].extra.name == undefined) {
			// 	cc.peers[sess.userid].extra.name = "[you]"
			// }
			self.users.push(self.connection.peers[sess.userid]);

			if (self.connection.isInitiator) {
				self.updateState(AppState, false);
				//TODO: send only to requester!
			}
		}

		this.connection.onleave = function(sess) {
			console.log("onclose", sess)
			var ii = _.findIndex(self.users, {remoteUserId: sess.userid});
			self.users.splice(ii, 1);
		}

		this.connection.onmessage = function(e) {
			switch(e.data.type) {
				case 'UpdateAppState':
					mergeAppState(e.data.data);
					triggerStateChange();
					break;
				case 'BroadcastChat':
					triggerBroadcastChat(e.data.data);
					break;
				default:
					console.warn("Received bad message type:", e.data.type)
			}
		}

		this.connection.openOrJoin(RTChat.AppConfig['AppName'] +'_'+ roomName)
	},
	leaveRoom: function() {
		if (this.connection) {
			this.connection.leave();
		}
	},

	// === AppState API ===
	onStateChange: function(fn) { // Register a handler: fn(oldState, newState)
		if (typeof fn !== 'function') throw "Must pass a function!";
		stateChangeHandlers.push(fn);
	},
	updateState: function(value, triggerLocally) { // triggerLocally defaults to true.
		this.connection.send({type: 'UpdateAppState', data: value});
		mergeAppState(value);
		if (triggerLocally !== false) triggerStateChange();
	},

	// === BrodcastChat API ===
	sendBroadcast: function(text) {
		var msg = {
			text: text,
			name: UserService.currentUser.get('name'),
			timestamp: new Date()
		};
		this.connection.send({type: 'BroadcastChat', data: msg});
		triggerBroadcastChat(msg); // Trigger locally
	},
	onReceiveBroadcast: function(fn) { // Register "receive" handler
		if (typeof fn !== 'function') throw "Must pass a function!";
		receiveBroadcastHandlers.push(fn);
	},
	//TODO: ...
	// getBroadcastHistory: function() {},

	// === PrivateChat API ===
	// sendPrivateMsg: function() {},
}

/* ===== PRIVATE ===== */

var AppState = {};
var oldState = {};
var stateChangeHandlers = [];
var receiveBroadcastHandlers = [];

// Instead of atomically updating the state, only update the present keys
var mergeAppState = function(newState) {
	_.each(newState, function(v, k) {
		//TODO: strip out functions from state.
		AppState[k] = v;
	});
};

// Trigger state change handlers.
var triggerStateChange = function() {
	_.forEach(stateChangeHandlers, function(fn) {
		fn.call(undefined, _.clone(oldState), _.clone(AppState)); // Clone so callee can't mess with subsequent callees.
	});
	oldState = _.clone(AppState); // Clone so changes to AppState don't effect oldState.
};

var triggerBroadcastChat = function(msg) {
	_.forEach(receiveBroadcastHandlers, function(fn) {
		fn.call(undefined, _.clone(msg)); // Clone so callee can't mess with subsequent callees.
	});
};
