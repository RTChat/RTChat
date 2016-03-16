var rivets = require('rivets');

var RTC_wrapper = require('../utils/rtc_wrapper.js')

// RoomPanel
module.exports = Backbone.View.extend({
	template: '\
		<a class="btn btn-default" href="#"><- Leave</a>\
		<br>\
		You\'re in room { scope.roomName }\
		<br><br>Users:\
		<ul id="users-panel">\
			<li rv-each-user="scope.users" rv-show="user.extra.name">\
				{ user.extra.name }\
			</li>\
		</ul>\
	',
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