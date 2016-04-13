
require('styles/header.css');

module.exports = Backbone.View.extend({
  id: 'Header',
  template: `
    <div class="fa fa-bars"></div>
		<span>
			<span rv-unless="scope.roomName">{ scope.appName }</span>
			<span rv-if="scope.roomName"><a href="#">{ scope.appName }</a> / { scope.roomName }</span>
		</span>
    <div data-subview="user_menu"></div>
  `,
  initialize: function() {
    Backbone.Subviews.add( this );
  },
  subviewCreators: {
    user_menu: function() { return new RTChat.Views.UserMenu(); },
  },
  render: function() {
    this.scope.appName = RTChat.AppConfig.AppName;
    this.scope.roomName = document.location.hash;

    this.$el.html(this.template);
		Rivets.bind(this.$el, {scope: this.scope});

    return this;
  },
  scope: {}
});
