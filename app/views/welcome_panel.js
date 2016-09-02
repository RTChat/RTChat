// WelcomePanel

require('styles/welcome_panel.css');

var UserService = require('utils/user_service.js');

module.exports = Backbone.View.extend({
	id: 'WelcomePanel',
	template: `<h2>Welcome To RTChat!</h2>
		<h4>
			An <a href="https://github.com/rtchat/rtchat" target="_blank" rel="nofollow">open source</a>
			chat platform that respects your privacy and freedom of speech!
		</h4>
		It's also a simple web-game framework for making apps and social games that can be played over the internet with text/voice/video chat built right in.
		<br>
		For help and to chat with the community visit <a href="#global-chat">global chat</a>
		<br><br>
		<div class="fluid-container"> <div class="row">
			<div class="col-md-6">
				<h4> Get started in a Random room &nbsp;<span class="fa fa-refresh"></span></h4>
				<ul class="random-rooms">
					<li rv-each-room="scope.random_rooms">
						<a rv-href="'#' |+ room">{room}</a>
					</li>
				</ul>
			</div>
			<div class="col-md-6" rv-show="scope.appData.room_history |length |gt 0">
				<h4> Recently visited rooms </h4>
				<ul class="random-rooms">
					<li rv-each-room="scope.appData.room_history">
						<a rv-href="'#' |+ room">{room}</a>
					</li>
				</ul>
			</div>
		</div> </div>
	`,
	events: {
		'click .fa-refresh': function() {this.generateRandomRooms();},
	},
	generateRandomRooms: function() {
		this.scope.random_rooms = [
			RTChat.Random.shortid()
			// RTChat.Random.adjective()+'_'+RTChat.Random.animal()
		]

	},
	render: function(){
		this.scope = {};
		this.$el.html(this.template);
		Rivets.bind(this.$el, {scope: this.scope});

		this.scope.appData = UserService.getAppData();
		this.generateRandomRooms();

		return this;
	},
});