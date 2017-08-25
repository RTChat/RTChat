// ChatPanel

require('styles/chat_panel.css');
var RTCWrapper = require('utils/rtc_wrapper.js');
var UserService = require('utils/user_service.js');

// EmojiOne picker.
require('imports?jQuery=jquery!jquery-textcomplete');
require('imports?jQuery=jquery!emojionearea');
require('emojionearea/dist/emojionearea.css');

module.exports = Backbone.View.extend({
	id: 'ChatPanel',
	template: `
		<ul>
			<li rv-each-msg="scope.messages">
				<span class="timestamp">{ msg.timestamp }</span>
				<span class="username">{ msg.name }</span>
				<span rv-html="msg.text | htmlEscape | linky | chatMarkdown | emojione "></span>
			</li>
		</ul>
		<div>
			<div class="fa fa-cloud-upload hidden"></div>
			<div class="input-container">
				<textarea></textarea>
			</div>
		</div>
	`,
	events: {
		'keydown textarea': function(ev) { // Prevent cursor from moving before sending.
			if (ev.keyCode == 13 && !ev.shiftKey) { ev.preventDefault(); }
		},
		'keyup textarea': function(ev) {
			if (ev.keyCode == 13 && !ev.shiftKey) {
				this.sendChat(ev.currentTarget.value);
				ev.currentTarget.value = '';
			}
		},
		'click .upload-button': function(ev) {
			alert("not implemented");
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
		var self = this;
		this.scope.messages = [];
		this.$el.html(this.template);
		Rivets.bind(this.$el, {scope: this.scope});

		var stopEnter = false; //HACK: this allows us to keep track of the state of the textComplete dialog, so we cant select emoji without sending.
		var EOA = this.$('textarea').emojioneArea({
			saveEmojisAs: 'shortname',
			events: {
				keydown: function(editor, event) { // Prevent cursor from moving before sending.
					if (event.keyCode == 13 && !event.shiftKey) { event.preventDefault(); }
				},
				keyup: function(editor, ev) {
					if (ev.keyCode == 13 && !ev.shiftKey && !stopEnter) {
						self.sendChat(EOA[0].emojioneArea.getText());
						EOA[0].emojioneArea.setText('');
					}
					stopEnter = false;
				}
			}
		});
		//HACK: dont allow sending for a tenth of a second after the autocomplete closes.
		$('.emojionearea-editor').on('textComplete:hide', function(e){
			stopEnter = true;
			setTimeout(function() { stopEnter = false; }, 100);
		});
		//HACK: Focus the input if on a desktop.
		if ($(window).width() > 600) $('.emojionearea-editor').focus();

		return this;
	},
	sendChat: function(text) {
		if (text.length === 0) return;
		RTCWrapper.sendBroadcast(text);
	},
	scope: {}
});
