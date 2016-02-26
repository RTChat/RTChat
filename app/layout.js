
$(function(){

document.GameFrameRTC = {
	channelPrefix: 'thann.GameFrameRTC.chat',
	joinRoom: function(roomName, options) {
		//TODO: close connection?

		this.connection = new RTCMultiConnection();
		// this.connection.socketURL = 'https://rtcmulticonnection.herokuapp.com:443/';
		// this.connection.socketURL = 'https://localhost:9001/';
		this.connection.socketURL = '/';
		this.connection.socketMessageEvent = 'video-conference-demo';
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
	AppLayout: Backbone.View.extend({
		el: $('body'),
		template: '\
			<div id="top-bar">\
				<div class="fa fa-bars"></div>\
				<div>IMG</div>\
				<div data-subview="user"></div>\
			</div>\
			<div id="main-bar">\
				<div id="left-side-bar" class="hidden">Side Bar</div>\
				<div data-subview="main"></div>\
				<div id="right-side-bar" class="right hidden">Right Side Bar</div>\
			</div>\
			<div id="bottom-bar">Bottom Bar</div>',
		events: {
			'click .fa-bars': function() { $('#left-side-bar').toggleClass('hidden'); },
		},
		initialize: function() {
			Backbone.Subviews.add( this );
		},
		subviewCreators: {
			user: function() { return new document.GameFrameRTC.UserMenu },
			main: function() { return new document.GameFrameRTC.MainPanel },
		},
		render: function(){
			this.$el.html(this.template);
			return this;
		}
	}),

	UserMenu: Backbone.View.extend({
		className: 'float-right dropdown navbar-right',
		template: '\
			<div class="dropdown-toggle" data-toggle="dropdown">\
				{ scope.userName } <span class="fa fa-chevron-down"></span>\
			</div>\
			<ul class="dropdown-menu">\
				<li id="edit-btn">Edit Name</li>\
				<li class="disabled">Coming Soon ----</li>\
				<li class="disabled">Sync user w/ Dropbox</li>\
				<li class="disabled">Settings</li>\
				<li class="disabled">Friends</li>\
				<li class="disabled">Switch User</li>\
			</ul>',
		editNameTemplate: '\
			<div><input type="text" rv-value="scope.userName"></div>',
		// UserService: document.GameFrameRTC.UserService
		initialize: function() {
		// 	// this.UserService = new document.GameFrameRTC.UserService;
			if(typeof(Storage) !== "undefined") {
				//TODO: use backbone.localStorage?
				this.scope.userName = window.localStorage.getItem('UserName')
				console.log("found user:", this.scope.userName)
				if (!this.scope.userName) {
					this.scope.userName = "Guest_"+parseInt(Math.random()*10000).toString();
					window.localStorage.setItem('UserName', this.scope.userName)
				}
			} else {
				console.log("Sorry! No Web Storage support..")
			}
		},
		events: {
			'click #edit-btn': function() {
				console.log("clicked!");
				this.$el.removeClass('open') //Hack?
				this.render(true);
				this.$el.find('input').select();
			},
			'keyup input': function(ev) {
				if (ev.keyCode == 13) this.updateName();
			},
			'blur input': 'updateName'
		},
		render: function(edit){
			// this.scope.userName = window.localStorage.getItem('UserName')
			if (edit)
				this.$el.html(this.editNameTemplate);
			else
				this.$el.html(this.template);
			var rvo = rivets.bind(this.$el, {scope: this.scope})
			console.log('rivets..', rvo)
			return this;
		},
		updateName: function() {
			window.localStorage.setItem('UserName', this.scope.userName)
			this.render();
		},
		scope: {} // Used for Rivets..
	}),

	// Wraps the main App
	MainPanel: Backbone.View.extend({
		id: 'main-panel',
		welcomeTemplate: '<div data-subview="welcome"></div>',
		roomTemplate: '<div data-subview="room"></div><div id="video-container"></div>',
		initialize: function() {
			Backbone.Subviews.add( this );

			var self = this;
			$(window).on('hashchange', function() { self.render(); });
		},
		subviewCreators: {
			welcome: function() { return new document.GameFrameRTC.app.WelcomePanel },
			room: function() { return new document.GameFrameRTC.app.RoomPanel }
		},
		render: function(){
			if (document.location.hash.length == 0) {
				this.$el.html(this.welcomeTemplate);
				document.GameFrameRTC.leaveRoom();
			} else {
				this.$el.html(this.roomTemplate);
				document.GameFrameRTC.joinRoom(window.location.hash,
					{videoContainer: this.$('#video-container')}
				)
			}

			return this;
		}
	}),

	// ==== INIT ====
	init: function() {
		(new this.AppLayout).render();
	}

}});

// .app is where the game.app lives...
$(function(){
document.GameFrameRTC.app = {
	WelcomePanel: Backbone.View.extend({
		template: '<h2>Welcome To GameFrameRTC!</h2>\
			A simple web-game framework for making simple social games that can be played over the internet with text/voice/video chat built right in!\
			<br><br>\
			<a class="btn btn-default" href="#global-chat">Go To global chat</a>\
		',
		render: function(){
			this.$el.html(this.template);
			return this;
		}
	}),
	RoomPanel: Backbone.View.extend({
		template: '\
			<a class="btn btn-default" href="#"><- Leave</a>\
			<br>\
			You\'re in room { scope.roomName }\
			<br><br>Users:\
			<ul id="users-panel">\
				<li rv-each-user="scope.users">\
					{ user.name }\
				</li>\
			</ul>\
		',
		render: function(){
			this.scope.roomName = window.location.hash
			this.scope.users = [
				{name: 'You!'},
				{name: 'dummy2'},
				{name: 'dummy3'},
			]

			this.$el.html(this.template);
			var rvo = rivets.bind(this.$el, {scope: this.scope})
			return this;
		},
		scope: {},
	}),
}});


// Demos extending GamePanel.
// $(function() {
// 	document.GameFrameRTC.GamePanel = document.GameFrameRTC.GamePanel.extend({
// 		template: 'blaaaaaah'
// 	})
// })
