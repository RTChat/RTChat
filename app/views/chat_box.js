require('styles/chat_box.css');

var rivets = require('rivets');

var RTC_wrapper = require('utils/rtc_wrapper.js');
var UserService = require('utils/user_service.js');

module.exports = Backbone.View.extend({
	id: 'chat-box',
	template: `
		<ul id="chats">
			<li rv-each-msg="scope.messages">
				<span class="timestamp">{ msg.timestamp }</span>
				<span class="username">{ msg.name }</span>
				<span>{ msg.data }</span>
			</li>
		</ul>
		<textarea></textarea>
	`,
	events: {
		'keydown textarea': function(ev) { // Prevent cursor from moving before sending.
			if (ev.keyCode == 13 && !ev.shiftKey) { ev.preventDefault(); }
		},
		'keyup textarea': function(ev) {
			if (ev.keyCode == 13 && !ev.shiftKey) {
				this.sendChat(ev.currentTarget.value);
				ev.currentTarget.value = ''
			}
		}
	},
	initialize: function() {
		var self = this;
		RTC_wrapper.onmessage(function(e) {
			console.log("OOOM", e);
			self.scope.messages.push({
				name: e.extra.name,
				timestamp: new Date(),
				data: e.data,
				});
			});
		},
		render: function() {
			this.$el.html(this.template);
			var rvo = rivets.bind(this.$el, {scope: this.scope})
			return this;
		},
		sendChat: function(msg) {
			if (msg.length == 0) return
			console.log('sending:', msg);
			RTC_wrapper.connection.send(msg);
			this.scope.messages.push({
				name: UserService.currentUser.get('name'),
				timestamp: new Date(),
				data: msg,
			});
		},
		scope: { messages: [] },
	})
