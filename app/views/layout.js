// Layout - The parent view of the whole app, and also the router.

require('styles/layout.css');
var RTCWrapper = require('utils/rtc_wrapper.js');

module.exports = Backbone.View.extend({
	el: 'body',
	template: `
		<div class="header">
			<div data-subview="header"></div>
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
		header: function() { return new RTChat.Views.Header(); },
		sidebar: function() { return new RTChat.Views.Sidebar(); },
	},
	render: function(){
		document.title = RTChat.AppConfig.AppName+' '+document.location.hash;

		this.$el.html(this.template);

		// "Router"
		if (document.location.hash.length === 0) {
			this.$('.main-panel').html(this.welcomeTemplate);
		} else {
			this.$('.main-panel').html(this.roomTemplate);
		}

		return this;
	},
});
