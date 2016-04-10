

module.exports = Backbone.View.extend({
	template: `
		SideBar
	`,
	render: function() {
		this.$el.html(this.template);
		return this;
	}

});
