var rivets = require('rivets');

var RTC_wrapper = require('../utils/rtc_wrapper.js')

module.exports = Backbone.View.extend({
	id: 'chat-box',
	template: `
		<ul id="chats"></ul>
		<input>
	`,
	render: function(){
		this.scope.roomName = window.location.hash

		// this.scope.users = RTC_wrapper.connection.peers
		this.scope.users = RTC_wrapper.users

		this.$el.html(this.template);
		var rvo = rivets.bind(this.$el, {scope: this.scope})
		return this;
	},
	scope: {},
})
