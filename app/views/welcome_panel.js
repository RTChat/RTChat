
require('styles/welcome_panel.css');

// WelcomePanel
module.exports = Backbone.View.extend({
	id: 'WelcomePanel',
	template: `<h2>Welcome To RTChat!</h2>
		A simple web-game framework for making simple social games that can be played over the internet with text/voice/video chat built right in!
		<br><br>
		<a class="btn btn-default" href="#global-chat">Go To global chat</a>
	`,
	render: function(){
		this.$el.html(this.template);
		return this;
	}
});