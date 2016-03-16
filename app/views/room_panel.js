require('../styles/room_panel.css');

var rivets = require('rivets');
var RTC_wrapper = require('../utils/rtc_wrapper.js');

var ChatBox = require('./chat_box.js');

// RoomPanel
module.exports = Backbone.View.extend({
	template: `
		<a class="btn btn-default" href="#"><- Leave</a>
		<br>
		You're in room { scope.roomName }
		<br><br>Users:
		<ul id="users-panel">
			<li rv-each-user="scope.users" rv-show="user.extra.name">
				{ user.extra.name }
			</li>
		</ul>
		<div data-subview="chat"></div>
	`,
	initialize: function() {
		Backbone.Subviews.add( this );
	},
	subviewCreators: {
		chat: function() { return new ChatBox },
	},
	render: function(){
		this.scope.roomName = window.location.hash
		// this.scope.users = [
		// 	{name: 'You!'},
		// 	{name: 'dummy2'},
		// 	{name: 'dummy3'},
		// ]

		// this.scope.users = RTC_wrapper.connection.peers
		this.scope.users = RTC_wrapper.users

		this.$el.html(this.template);
		var rvo = rivets.bind(this.$el, {scope: this.scope})
		return this;
	},
	scope: {},
})