// UserMenu

var UserService = require('utils/user_service.js');

module.exports = Backbone.View.extend({
	id: 'UserMenu',
	className: 'pull-right dropdown navbar-right',
	template: `
		<div class="dropdown-toggle" data-toggle="dropdown">
			<span>{ scope.name }</span>
			<span class="fa fa-chevron-down"></span>
		</div>
		<ul class="dropdown-menu">
			<li class="edit-btn">Edit Name</li>
			<li class="disabled">---- Coming Soon ----</li>
			<li class="disabled">Sync user w/ Dropbox</li>
			<li class="disabled">Settings</li>
			<li class="disabled">Friends</li>
			<li class="disabled">Switch User</li>
		</ul>
	`,
	editNameTemplate: `
		<div><input type="text" rv-value="scope.name"></div>
	`,
	events: {
		'click .edit-btn': function() {
			this.$el.removeClass('open'); //Hack?
			this.render(true);
			this.$el.find('input').select();
		},
		'keyup input': function(ev) {
			if (ev.keyCode == 13) this.updateName();
		},
		'blur input': 'updateName'
	},
	initialize: function() {
		this.scope = UserService.currentUser.attributes;
	},
	render: function(edit){
		if (edit) this.$el.html(this.editNameTemplate);
		else this.$el.html(this.template);

		Rivets.bind(this.$el, {scope: this.scope});
		return this;
	},
	updateName: function() {
		UserService.updateName(this.scope.userName);
		this.render();
	},
	scope: {}
});
