
require('styles/main.css');
require('styles/layout.css');

require('utils/resume.js'); // Adds the Window:resume event.

var rivets = require('rivets');
var RTCWrapper = require('utils/rtc_wrapper.js');

var Sidebar = require('views/sidebar.js');
var UserMenu = require('views/user_menu.js');

var appName = "RTChat";

// LayoutView
module.exports = Backbone.View.extend({
	el: 'body',
	template: `
		<div id="header">
			<div class="fa fa-bars"></div>
			<span>
				<span rv-unless="scope.roomName">{ scope.appName }</span>
				<span rv-if="scope.roomName"><a href="#">{ scope.appName }</a> / { scope.roomName }</span>
			</span>
			<div data-subview="user_menu"></div>
		</div>
		<div id="main-bar">
			<div id="left-side-bar" class="hidden">
				<div data-subview="sidebar"></div>
			</div>
			<div id="main-panel"></div>
			<div id="right-side-bar" class="right hidden">Right Side Bar</div>
		</div>
		<div id="footer"></div>
	`,
	welcomeTemplate: '<div data-subview="welcome"></div>',
	roomTemplate: '<div data-subview="room"></div><!--<div id="video-container"></div>-->',
	events: {
		'click #header .fa-bars': function() {
			this.$('#left-side-bar').toggleClass('hidden');
		},
	},
	initialize: function() {
		Backbone.Subviews.add( this );

		var self = this;
		$(window).on('hashchange', function() { self.render(); });
		//TODO:
		// $(window).on("resume", function() { console.log("RESUMING!"); self.render(); });
	},
	subviewCreators: {
		user_menu: function() { return new UserMenu(); },
		sidebar: function() { return new Sidebar(); },
		welcome: function() { return new RTChat.app.WelcomePanel },
		room: function() { return new RTChat.app.RoomPanel }
	},
	render: function(){
		this.scope.appName = appName;
		this.scope.roomName = document.location.hash;
		document.title = this.scope.appName+' '+this.scope.roomName;

		this.$el.html(this.template);
		var rvo = rivets.bind(this.$el, {scope: this.scope})

		// "Router"
		if (document.location.hash.length == 0) {
			this.$('#main-panel').html(this.welcomeTemplate);
			RTCWrapper.leaveRoom();
		} else {
			this.$('#main-panel').html(this.roomTemplate);
			RTCWrapper.joinRoom(window.location.hash,
				{videoContainer: this.$('#video-container')}
			);
		}

		return this;
	},
	scope: {}
})
