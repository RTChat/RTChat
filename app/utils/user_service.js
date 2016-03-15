
// UserService
module.exports = {
	init: function() { // sets up the username, and stuff.
		if(typeof(Storage) !== "undefined") {
			//TODO: use backbone.localStorage?
			this.name = window.localStorage.getItem('UserName')
			// console.log("found user:", this.name)
			if (!this.name) {
				this.name = "Guest_"+parseInt(Math.random()*10000).toString();
				window.localStorage.setItem('UserName', this.name)
			}
		} else {
			console.log("Sorry! No Web Storage support..")
		}

	},
	updateName: function(newName) {
		this.name = newName;
		window.localStorage.setItem('UserName', this.name)
	},
	getExtras: function() {
		return {
			fullId: undefined,
			name: this.name,
		}
	}
}

module.exports.init();