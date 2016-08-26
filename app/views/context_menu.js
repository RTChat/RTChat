
module.exports = Backbone.View.extend({
	id: 'ContextMenu',
	template: `
		<ul>
			<li> Demo! </li>
			<li> Demo! </li>
		</ul>
	`,
	defaultDirection: 'right-down',
	render: function() {
		this.$el.html(this.template);
		this.hide();

		this.$el.css({
			position: 'absolute',
			top: 0,
			left: 0,
			'z-index': 1,
		});

		return this;
	},
	hide: function() {
		this.$el.hide();
	},
	show: function(target, defaultDir) {
		// Target can be relative coords {x: 10, y:20}, or an element
		// DefaultDir can be "right-down", "right-up", etc
		//TODO: validate params

		// We need to see how big it is.
		this.$el.show();
		this.$el.css({
			top: 0,
			left: 0,
			right: 'auto',
			bottom: 'auto',
		});
		window.getComputedStyle(this.el);

		// Compute the size of the menu.
		var menu_dim = {
			width: this.$el.outerWidth(),
			height: this.$el.outerHeight()
		};

		// jQuery "wrap" target if element
		if (target instanceof HTMLElement) target = $(target);
		//TODO: which browsers support HTMLElement?

		if (!defaultDir) defaultDir = this.defaultDirection || 'right-down';

		var offsetParent = this.$el.offsetParent();
		var parent_dim = {
			width: offsetParent.width(),
			height: offsetParent.height()
		};

		// Compute size of target area.
		var target_coords = {};
		if (target instanceof $) {
			var offset = target.position();
			target_coords = {
				top: offset.top,
				left: offset.left,
				right: offset.left + target.width(),
				bottom: offset.top + target.height()
			};
		} else {
			//TODO:?
			//TODO: event
			target_coords = {
				top: target.y,
				left: target.x,
				right: target.x,
				bottom: target.y
			};
		}

		// Compute the extra space for all possible targetitions.
		var extra_space = {
			up: target_coords.bottom - menu_dim.height,
			left: target_coords.right - menu_dim.width,
			down: parent_dim.height - (target_coords.top + menu_dim.height),
			right: parent_dim.width - (target_coords.left + menu_dim.width),
		};
		// console.log("Coords" , target_coords)
		// console.log("menu_dim", menu_dim);
		// console.log("parent_dim", parent_dim);
		// console.log("EXTRA_SPOACE", extra_space);

		var self = this;
		var position = function(dir) {
			var css = {
				top: 'auto',
				left: 'auto',
				right: 'auto',
				bottom: 'auto'
			};

			if (dir.match(/right/))
				css.left = target_coords.right;
			if (dir.match(/left/))
				css.left = target_coords.left;
			if (dir.match(/up/))
				css.bottom = parent_dim.height - target_coords.bottom;
			if (dir.match(/down/))
				css.top = target_coords.top;

			// console.log("positioning", dir, css);
			self.$el.css(css);
		};

		var opposite = {
			up: 'down',
			down: 'up',
			right: 'left',
			left: 'right'
		};

		// Compute order of directions to try.
		var dir;
		var order = [defaultDir];
		for (var i = 1; i <=3 ; i++) {
			dir = order[i-1].split('-');
			// Trade off toggling the first or second part.
			if (i % 2) {
				dir = dir[0] + '-' + opposite[dir[1]];
			} else {
				dir = opposite[dir[0]] + '-' + dir[1];
			}
			order.push(dir);
		}
		// console.log("ORDER", order)

		// Auto-direction - Find the first order to fit.
		for (i = 0; i < order.length; i++) {
			dir = order[i].split('-');
			if (extra_space[dir[0]] >=0 && extra_space[dir[1]] >= 0)
				return position(order[i]);
		}

		// If nothing is going to fit.
		console.warn("Unable to position context_menu nicely!");
		position(defaultDir);
	},
	// Like show, but will hide when called again with the same "target".
	toggle: function(target) {
		if (target && target == this._prevTarget && this.$el.is(':visible')) {
			this.hide();
			this._prevTarget = false;
		}
		else {
			this.show.apply(this, arguments)
			this._prevTarget = target;
		}
	},
});