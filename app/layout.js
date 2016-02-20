
$(function(){
document.GameFrameRTC = {
	AppLayout: Backbone.View.extend({
		el: $('body'),
		template: '\
			<div id="top-bar">\
				<div class="fa fa-bars"></div>\
				<div>IMG</div>\
				<div data-subview="user"></div>\
			</div>\
    		<div id="main-bar">\
	    		<div id="left-side-bar">Side Bar</div>\
	    		<div data-subview="game"></div>\
	    		<div id="right-side-bar" class="right hidden">Right Side Bar</div>\
	    	</div>\
    		<div id="bottom-bar">Bottom Bar</div>',
    	events: {
    		'click .fa-bars': function() { $('#left-side-bar').toggleClass('hidden'); },
    		// Global Events..
    		'click .dd-toggle': function(ev) {
    			// console.log('DD', $(ev.currentTarget).next().is(':visible'));
    			$(ev.currentTarget).next('ul').toggle().focus()
    			ev.stopPropagation()
    		},
    		// 'blur .dd-menu': function(ev) {
    		// 	console.log('hide', ev, document.activeElement)
    		// 	$(ev.target).hide()
    		'click': function() {
    			this.$('.dd-menu').hide()
    		},
    	},
		initialize: function() {
			Backbone.Subviews.add( this );
		},
		subviewCreators: {
			user: function() { return new document.GameFrameRTC.UserMenu },
			game: function() { return new document.GameFrameRTC.GamePanel }
		},
		render: function(){
			console.log('rendering layout!')
			this.$el.html(this.template);
			return this;
		},
	}),

	UserMenu: Backbone.View.extend({
		className: 'float-right',
		template: '\
			<div class="dd-toggle">{ scope.userName } <span class="fa fa-chevron-down"></span></div>\
			<ul class="dd-menu" tabindex="0" style="display: none;">\
				<li id="edit-btn">Edit</li>\
				<li>Switchhhhhhhhhhh</li>\
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
				this.render(true);
				this.$el.find('input').select();
			},
			'keyup input': function(ev) {
				if (ev.keyCode == 13) this.updateName();
			},
			'blur input': 'updateName'
			// function() {
			// 	this.render();
			// }
		},
		render: function(edit){
			// this.scope.userName = window.localStorage.getItem('UserName')
			if (edit)
				this.$el.html(this.editNameTemplate);
			else
				this.$el.html(this.template);
			var what = rivets.bind(this.$el, {scope: this.scope})
			console.log('what..', what)
			return this;
		},
		updateName: function() {
	    	window.localStorage.setItem('UserName', this.scope.userName)
			this.render();
		},
		scope: {} // Used for Rivets..
	}),

	GamePanel: Backbone.View.extend({
		id: 'game-panel',
		roomSelectTemplate: '<div data-subview="selectRoom"></div>',
		gameRoomTemplate: '<div data-subview="gameRoom"></div>',
		initialize: function() {
			Backbone.Subviews.add( this );
			var self = this;
			$(window).on('hashchange', function() {
				console.log('Loc:', window.location.hash);
				self.render();
			})
		},
		subviewCreators: {
			selectRoom: function() { return new document.GameFrameRTC.app.selectRoom },
			gameRoom: function() { return new document.GameFrameRTC.app.gameRoom }
		},
		render: function(){
			if (document.location.hash.length == 0)
				this.$el.html(this.roomSelectTemplate)
			else
				this.$el.html(this.gameRoomTemplate)
			return this;
		}
	}),

	// ==== INIT ====
	init: function() {
		(new this.AppLayout).render();
	}

}});

$(function(){
document.GameFrameRTC.app = {
	selectRoom: Backbone.View.extend({
		template: 'pick a room!',
		render: function(){
			this.$el.html(this.template);
			return this;
		}
	}),
	gameRoom: Backbone.View.extend({
		template: 'ur in room ',
		render: function(){
			this.$el.html(this.template + window.location.hash);
			return this;
		}
	}),
}});


// Demos extending GamePanel.
// $(function() {
// 	document.GameFrameRTC.GamePanel = document.GameFrameRTC.GamePanel.extend({
// 		template: 'blaaaaaah'
// 	})
// })
