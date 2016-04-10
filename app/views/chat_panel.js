require('styles/chat_panel.css');

var rivets = require('rivets');

var RTCWrapper = require('utils/rtc_wrapper.js');
var UserService = require('utils/user_service.js');

module.exports = Backbone.View.extend({
	id: 'ChatPanel',
	template: `
		<ul id="chats">
			<li rv-each-msg="scope.messages">
				<span class="timestamp">{ msg.timestamp }</span>
				<span class="username">{ msg.name }</span>
				<span>{ msg.text }</span>
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
		// RTCWrapper.onmessage("BroadcastChat", function(e) {
		RTCWrapper.onReceiveBroadcast(function(msg) {
			console.log("OOOM", msg);
			self.scope.messages.push(msg);

			// Scroll down
			var chats = self.$("ul")[0];
			chats.scrollTop = chats.scrollHeight;
		});
	},
	render: function() {
		this.scope.messages = [];
		this.$el.html(this.template);
		var rvo = rivets.bind(this.$el, {scope: this.scope})
		return this;
	},
	sendChat: function(text) {
		if (text.length == 0) return
		RTCWrapper.sendBroadcast(text);
	},
	scope: {},
});
