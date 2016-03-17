
require('utils/resume.js'); // Adds the Window:resume event.
var RTC_wrapper = require('utils/rtc_wrapper.js')

// MainPanel (and router)
module.exports = Backbone.View.extend({
	id: 'main-panel',
	welcomeTemplate: '<div data-subview="welcome"></div>',
	roomTemplate: '<div data-subview="room"></div><div id="video-container"></div>',
	initialize: function() {
		Backbone.Subviews.add( this );

		var self = this;
		$(window).on('hashchange', function() { self.render(); });
		// $(window).on("resume", function() { console.log("RESUMING!"); self.render(); });
	},
	subviewCreators: {
		welcome: function() { return new GameFrameRTC.app.WelcomePanel },
		room: function() { return new GameFrameRTC.app.RoomPanel }
	},
	render: function(){
		if (document.location.hash.length == 0) {
			this.$el.html(this.welcomeTemplate);
			RTC_wrapper.leaveRoom();
		} else {
			this.$el.html(this.roomTemplate);
			RTC_wrapper.joinRoom(window.location.hash,
				{videoContainer: this.$('#video-container')}
			);
		}

		return this;
	}
});