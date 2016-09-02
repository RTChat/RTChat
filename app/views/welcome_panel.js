
require('styles/welcome_panel.css');

// WelcomePanel
module.exports = Backbone.View.extend({
	id: 'WelcomePanel',
	template: `<h2>Welcome To RTChat!</h2>
		A simple web-game framework for making simple social games that can be played over the internet with text/voice/video chat built right in!
		<br><br>
		<a class="btn btn-default" href="#global-chat">Go To global chat</a>
		<div> Choose a Random room <span class="fa fa-refresh"></span></div>
		<ul class="random-rooms">
			<li rv-each-room="scope.random_rooms">
				<a rv-href="'#' |+ room">{room}</a>
			</li>
		</ul>
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
		this.$el.html(this.template);
		Rivets.bind(this.$el, {scope: this.scope});
		this.generateRandomRooms();
		return this;
	},
	scope: {}
});