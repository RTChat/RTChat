var rivets = require('rivets');

// RoomPanel
module.exports = Backbone.View.extend({
	template: '\
		<a class="btn btn-default" href="#"><- Leave</a>\
		<br>\
		You\'re in room { scope.roomName }\
		<br><br>Users:\
		<ul id="users-panel">\
			<li rv-each-user="scope.users">\
				{ user.name }\
			</li>\
		</ul>\
	',
	render: function(){
		this.scope.roomName = window.location.hash
		this.scope.users = [
			{name: 'You!'},
			{name: 'dummy2'},
			{name: 'dummy3'},
		]

		this.$el.html(this.template);
		var rvo = rivets.bind(this.$el, {scope: this.scope})
		return this;
	},
	scope: {},
})