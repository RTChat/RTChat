// Layout - The parent view of the whole app, and also the router.

require('styles/layout.css');
var RTCWrapper = require('utils/rtc_wrapper.js');

module.exports = Backbone.View.extend({
	el: 'body',
	template: `
		<div class="header">
			<div class="fa fa-bars"></div>
			<span>
				<span rv-unless="scope.roomName">{ scope.appName }</span>
				<span rv-if="scope.roomName"><a href="#">{ scope.appName }</a> / { scope.roomName }</span>
			</span>
			<div data-subview="user_menu"></div>
		</div>
		<div class="main-bar">
			<div class="left-side-bar hidden">
				<div data-subview="sidebar"></div>
			</div>
			<div class="main-panel"></div>
			<div class="right-side-bar hidden">Right Side Bar</div>
		</div>
		<div class="footer"></div>
	`,
	welcomeTemplate: '<div data-subview="welcome"></div>',
	roomTemplate: '<div data-subview="room"></div>',
	events: {
		'click .header .fa-bars': function() {
			this.$('.left-side-bar').toggleClass('hidden');
		},
	},
	initialize: function() {
		var self = this;
		Backbone.Subviews.add( this );
		$(window).on('hashchange', function() { self.render(); });
	},
	subviewCreators: {
		room: function() { return new RTChat.Views.RoomPanel(); },
		welcome: function() { return new RTChat.Views.WelcomePanel(); },
		sidebar: function() { return new RTChat.Views.Sidebar(); },
		user_menu: function() { return new RTChat.Views.UserMenu(); }
	},
	render: function(){
		this.scope.appName = RTChat.AppConfig.AppName;
		this.scope.roomName = document.location.hash;
		document.title = this.scope.appName+' '+this.scope.roomName;

		this.$el.html(this.template);
		Rivets.bind(this.$el, {scope: this.scope});

		// "Router"
		if (document.location.hash.length === 0) {
			this.$('.main-panel').html(this.welcomeTemplate);
			RTCWrapper.leaveRoom();
		} else {
			this.$('.main-panel').html(this.roomTemplate);
		}

		return this;
	},
	scope: {} // Used by Rivets..
});
