
var UserMenu = require('./user_menu.js');
var MainPanel = require('./main_panel.js');

// AppLayout
module.exports = Backbone.View.extend({
	el: 'body',
	template: '\
		<div id="top-bar">\
			<div class="fa fa-bars"></div>\
			<div>IMG</div>\
			<div data-subview="user"></div>\
		</div>\
		<div id="main-bar">\
			<div id="left-side-bar" class="hidden">Side Bar</div>\
			<div data-subview="main"></div>\
			<div id="right-side-bar" class="right hidden">Right Side Bar</div>\
		</div>\
		<div id="bottom-bar">Bottom Bar</div>',
	events: {
		'click .fa-bars': function() { $('#left-side-bar').toggleClass('hidden'); },
	},
	initialize: function() {
		Backbone.Subviews.add( this );
	},
	subviewCreators: {
		// user: function() { return new document.GameFrameRTC.UserMenu },
		// user: function() { return new document.GameFrameRTC.UserMenu },
		user: function() { return new UserMenu },
		main: function() { return new MainPanel },
	},
	render: function(){
		this.$el.html(this.template);
		return this;
	}
})
