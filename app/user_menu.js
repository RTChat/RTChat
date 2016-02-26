var rivets = require('rivets')

// UserMenu
module.exports = Backbone.View.extend({
		className: 'float-right dropdown navbar-right',
		template: '\
			<div class="dropdown-toggle" data-toggle="dropdown">\
				{ scope.userName } <span class="fa fa-chevron-down"></span>\
			</div>\
			<ul class="dropdown-menu">\
				<li id="edit-btn">Edit Name</li>\
				<li class="disabled">---- Coming Soon ----</li>\
				<li class="disabled">Sync user w/ Dropbox</li>\
				<li class="disabled">Settings</li>\
				<li class="disabled">Friends</li>\
				<li class="disabled">Switch User</li>\
			</ul>',
		editNameTemplate: '\
			<div><input type="text" rv-value="scope.userName"></div>',
		// UserService: document.GameFrameRTC.UserService
		initialize: function() {
		// 	// this.UserService = new document.GameFrameRTC.UserService;
			if(typeof(Storage) !== "undefined") {
				//TODO: use backbone.localStorage?
				this.scope.userName = window.localStorage.getItem('UserName')
				console.log("found user:", this.scope.userName)
				if (!this.scope.userName) {
					this.scope.userName = "Guest_"+parseInt(Math.random()*10000).toString();
					window.localStorage.setItem('UserName', this.scope.userName)
				}
			} else {
				console.log("Sorry! No Web Storage support..")
			}
		},
		events: {
			'click #edit-btn': function() {
				console.log("clicked!");
				this.$el.removeClass('open') //Hack?
				this.render(true);
				this.$el.find('input').select();
			},
			'keyup input': function(ev) {
				if (ev.keyCode == 13) this.updateName();
			},
			'blur input': 'updateName'
		},
		render: function(edit){
			// this.scope.userName = window.localStorage.getItem('UserName')
			if (edit)
				this.$el.html(this.editNameTemplate);
			else
				this.$el.html(this.template);
			var rvo = rivets.bind(this.$el, {scope: this.scope})
			console.log('rivets..', rvo)
			return this;
		},
		updateName: function() {
			window.localStorage.setItem('UserName', this.scope.userName)
			this.render();
		},
		scope: {} // Used for Rivets..
	})