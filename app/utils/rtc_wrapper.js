// RTCWrapper

require('rtcmulticonnection-v3/dist/rmc3.js');

var UserService = require('utils/user_service.js');

//TODO:
// require('utils/resume.js'); // Adds the Window:resume event.
// $(window).on("resume", function() { console.log("RESUMING!"); self.render(); });

// Tracks what the user has enabled.
var userStreams = {
	audio: false,
	video: false,
	oneway: true
}

var AppState = {};
var oldState = {};
var peerJoinHandlers = [];
var stateChangeHandlers = [];
var receiveBroadcastHandlers = [];
var startFriendChatHandlers = [];

module.exports = {
	// === Room API ===  (and users)
	users: [],
	joinRoom: function(roomName, options, callback) {
		var self = this;
		this.users = [];
		console.log("Joining", roomName, !this.connection)

		if (!this.connection) this.connection = new RTCMultiConnection();
		this.connection.socketURL = RTChat.AppConfig.SocketHost;

		// ===
		if(typeof webkitMediaStream !== 'undefined') {
			this.connection.attachStreams.push(new webkitMediaStream());
		}
		else if(typeof MediaStream !== 'undefined'){
			this.connection.attachStreams.push(new MediaStream());
		}
		else {
			console.error('Neither Chrome nor Firefox. This demo may NOT work.');
		}
		// ===


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

		if (!options) options = {};
		var videoContainer = options.xVideoContainer;

		this.connection.onstream = function(ev) {
			console.log('eEE', ev, videoContainer)
			// if(!ev.stream.getAudioTracks().length && !ev.stream.getVideoTracks().length) {
			// 	console.log("appending..")
				videoContainer[0].appendChild(ev.mediaElement);
			// }
		// 	setTimeout(function() {
		// 		ev.mediaElement.play();
		// 	}, 5000);

		}

		// this.connection.onNewSession = function(session) {
		// 	console.log("new seshh", session)
		// }
		this.connection.extra = UserService.getExtras();
		console.log("EE", this.connection.extra);
		// this.connection.extra = UserService.currentUser.attributes

		this.connection.onopen = function(sess) {
			console.log("onopen", sess, sess.extra);
			// console.log("new_user", cc.peers[sess.userid])
			// console.log("users", cc.peers, cc.peers.getLength())
			// if (cc.peers[sess.userid].extra.name == undefined) {
			// 	cc.peers[sess.userid].extra.name = "[you]"
			// }
			self.users.push(self.connection.peers[sess.userid]);

			if (self.connection.isInitiator) {
				self.updateState(AppState, false);
				//TODO: send only to requester!
				self.connection.updateExtraData(); //TODO: This is needed because of a bug in RTCMultiConnection =/
			}

			_.forEach(peerJoinHandlers, function(fn) {
				fn.call(sess);
			})
		};

		this.connection.onleave = function(sess) {
			var ii = _.findIndex(self.users, {userid: sess.userid});
			// console.log("onclose", sess, self.users, ii);
			if(ii >= 0) self.users.splice(ii, 1);
			// _.each(self.connection.peers, console.log)
			// console.log("QQQQ",self.connection.peers.getAllParticipants())
		};

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
					console.warn("Received bad message type:", e.data.type);
			}
		};

		this.connection.openOrJoin(RTChat.AppConfig.AppName +'_'+ roomName, callback);
	},
	leaveRoom: function() {
		if (this.connection) {
			console.log("LLLEAVING", this.connection, this.connection && this.connection.peers)
			// this.connection.leave();
			this.connection.close();
			// _.each(this.connection.session.peers, function(xx) {
			// });
			// this.connection.peers.forEach(function(peer) {
			// 	console.log("cc". peer)
			// });

			peerJoinHandlers = [];
			stateChangeHandlers = [];
			receiveBroadcastHandlers = [];
			startFriendChatHandlers = [];

			// Wipe out state
			AppState = {}
			triggerStateChange();
		}
	},
	onPeerJoin: function(fn) { // Register handler to be triggered when someone joins.
		if (typeof fn !== 'function') throw "Must pass a function!";
		peerJoinHandlers.push(fn);
	},

	// === User Streams API ===
	addVoiceStream: function() {
		console.log("Adding Voice Stream..");
		var self = this;
		this.connection.dontCaptureUserMedia = false;
		if(this.connection.attachStreams.length) {
				this.connection.getAllParticipants().forEach(function(p) {
						self.connection.attachStreams.forEach(function(stream) {
								self.connection.peers[p].peer.removeStream(stream);
						});
				});
				this.connection.attachStreams = [];
		}

		userStreams.audio = true;

		this.connection.addStream(userStreams);
	},
	addVideoStream: function() {
		var self = this;
		this.connection.dontCaptureUserMedia = false;
		if(this.connection.attachStreams.length) {
				this.connection.getAllParticipants().forEach(function(p) {
						self.connection.attachStreams.forEach(function(stream) {
								self.connection.peers[p].peer.removeStream(stream);
						});
				});
				this.connection.attachStreams = [];
		}

		userStreams.video = true;

		this.connection.addStream(userStreams);
	},
	removeStreams: function() {
		console.log("REMOVING STREAMS")
		var self = this;
		this.connection.dontCaptureUserMedia = false;
		if(this.connection.attachStreams.length) {
				this.connection.getAllParticipants().forEach(function(p) {
						self.connection.attachStreams.forEach(function(stream) {
								self.connection.peers[p].peer.removeStream(stream);
						});
				});

				this.connection.attachStreams.forEach(function(stream) {
					stream.stop();
				});

				this.connection.attachStreams = [];
		}
		this.connection.renegotiate();

		userStreams.voice = false;
		userStreams.video = false;
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

	// === Request Connection API == //
	// Creates a small secondary connection to a pool, to request a private session.
	//TODO: should this exist? maybe the wrapper shouldnt create singleton connetcions instead..
	requestPrivateSession: function(public_room, private_room) {
		console.log("PPP", public_room, private_room)
		this.reqConnection = new RTCMultiConnection();
		this.reqConnection.socketURL = RTChat.AppConfig.SocketHost;
		this.reqConnection.extra = {requestPrivateSession: private_room};
		this.reqConnection.session = {data : true};
		this.reqConnection.sdpConstraints.mandatory = {
			OfferToReceiveAudio: false,
			OfferToReceiveVideo: false
		};

		this.reqConnection.openOrJoin(RTChat.AppConfig.AppName +'_'+ public_room);
	},

	// // === Friends API === //
	// //TODO: ??
	// // connection.onNewParticipant = function(participantId, userPreferences) {
	// enableFriends: function() { // go online
	// 	this.friendConnection = new RTCMultiConnection();
	// 	this.friendConnection.socketURL = RTChat.AppConfig.SocketHost;
	// 	// this.reqConnection.extra = {requestPrivateSession: private_room};
	// 	this.friendConnection.openOrJoin("RTChat_" + UserService.getExtras().fullId);
	// },
	// disableFriends: function() { // go offline
	// 	//TODO: close chats?
	// 	this.friendConnection && this.friendConnection.close();
	// },
	// addFriend: function(fid) {

	// },
	// removeFriend(fid) {

	// },
	// onFriendRequest(fid) {

	// },
	// onStartFriendChat(fn) {
	// 	if (typeof fn !== 'function') throw "Must pass a function!";
	// 	startFriendChatHandlers.push(fn);
	// },
};

/* ===== PRIVATE ===== */



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
