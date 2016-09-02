// UserService - stores multiple users information in the browser.

require('backbone.localstorage');

module.exports = {
	init: function() { // sets up the username, and stuff.
		if(typeof(Storage) !== "undefined") {
			// Stores information of the user.
			this.localUsers = new (Backbone.Collection.extend({
				localStorage: new Backbone.LocalStorage("RTChat_Users"),
			}))();
			this.localUsers.fetch();

			// Stores arbitrary data for each user and app.
			this.userAppData = new (Backbone.Collection.extend({
				localStorage: new Backbone.LocalStorage("RTChat_UserAppData"),
			}))();
			this.userAppData.fetch();

			this.currentUser = this.localUsers.get(window.localStorage.getItem('RTChat_LatestUser')) ||
				this.localUsers.first();

			// console.log("found user:", this.currentUser)
			if (!this.currentUser) { this.create(); }

			window.localStorage.setItem('RTChat_LatestUser', this.currentUser.id);

		} else {
			console.log("Sorry! No Web Storage support..");
		}
	},
	create: function(name) {
		this.currentUser = this.localUsers.create({
			name: name || "Guest_"+parseInt(Math.random()*10000).toString()
		});
	},
	updateName: function(newName) {
		this.currentUser.name = newName;
		this.currentUser.save();
	},
	getExtras: function() {
		return {
			fullId: this.currentUser.id,
			name: this.currentUser.get('name')
		};
	},
	_appDataId: function() {
		return RTChat.AppConfig.AppName+'_'+this.currentUser.id;
	},
	getAppData: function() {
		var d = this.userAppData.get(this._appDataId());
		if (!d) {
			this.userAppData.create({
				id: this._appDataId(),
				data: {}
			})
			d = this.userAppData.get(this._appDataId());
		}
		return _.clone(d.get('data'));
	},
	// Merges object into userAppData
	setAppData: function(data) {
		var d = this.userAppData.get(this._appDataId());
		var old_data = this.getAppData();
		d.set('data', _.extend(old_data, data));
		d.save();
	}
};

module.exports.init();
