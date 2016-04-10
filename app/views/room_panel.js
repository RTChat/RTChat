
require('styles/room_panel.css');

var RTCWrapper = require('utils/rtc_wrapper.js');

// RoomPanel
module.exports = Backbone.View.extend({
	id: 'RoomPanel',
	template: `
		<div class="sub-panel">
			<br>
			<div class="room-subject">
				<button class="btn btn-default">EDIT</button>
				<span> { scope.roomSubject } </span>
			</div>
			<br><br>Users:
			<ul class="users-panel">
				<li rv-each-user="scope.users" rv-show="user.extra.name">
					{ user.extra.name }
				</li>
			</ul>
		</div>
		<div class="sub-panel">
			<div data-subview="chat"></div>
		</div>
	`,
	events: {
		'click .room-subject .btn': function() {
			RTCWrapper.updateState({roomSubject: window.prompt("New Subject:")});
		}
	},
	initialize: function() {
		Backbone.Subviews.add( this );
		var self = this;
		RTCWrapper.onStateChange(function(old, newState) {
			console.log("StateUpdate", old, newState)
			self.scope.roomSubject = newState.roomSubject;
		});
	},
	subviewCreators: {
		chat: function() { return new RTChat.Views.ChatPanel(); },
	},
	render: function(){
		RTCWrapper.joinRoom(window.location.hash,
			{videoContainer: this.$('#video-container')}
		);

		this.scope.roomName = window.location.hash;
		this.scope.users = RTCWrapper.users;
		this.scope.roomSubject = 'Welcome to '+window.location.hash+'!';

		this.$el.html(this.template);
		Rivets.bind(this.$el, {scope: this.scope})
		return this;
	},
	scope: {},
})