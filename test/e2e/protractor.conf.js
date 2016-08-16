exports.config = {
	// seleniumAddress: 'http://localhost:4444/wd/hub',
	specs: [
		'./*.js'
	],

	baseUrl: 'https://localhost:9201',

	capabilities: {
		'browserName': 'chrome',
		'chromeOptions': {
			'args': [
				// 'console',
				'no-sandbox',
				'use-fake-device-for-media-stream',
				'use-fake-ui-for-media-stream',
			]
		}
	},

	plugins: [{
		package: 'protractor-console',
		logLevels: [
			// 'debug',
			// 'info',
			// 'warning',
			'severe',
		]
	}],

	jasmineNodeOpts: {
		// defaultTimeoutInterval: 25000
	},

	onPrepare: function() {
		browser.ignoreSynchronization = true;

		// Add Helpers
		protractor.Protractor.prototype.fork = function(url) {
			var new_browser = browser.forkNewDriverInstance(true);
			new_browser.ignoreSynchronization = true;

			if (url) new_browser.get(url);
			return new_browser;
		};

		protractor.Protractor.prototype.waitForRender = function() {
			//TODO: reliable?
			var self = this;
			this.wait(function() {
				return self.$('body > *').isPresent()
			});
		};

		protractor.Protractor.prototype.waitConstant = function(time) {
			var ready = false;
			var first = true;
			this.wait(function() {
				if (first) {
					setTimeout(function() {ready = true;}, time);
					first = false;
				}
				return ready;
			}, time+200);
		}

		// Useful shortcut for matching in a wait.
		protractor.ElementFinder.prototype.toMatch = function(str) {
			return this.then(function(el) {
				return el && el.match(str);
			});
		};
		// USAGE:
		// browser.wait(function() {
		// 		return browser.$('.blah').getAttribute('innerHTML').toMatch("something");
		// });

	},
};

// Start server for testing on port 9201.
var server = require('child_process').spawn('node', ['server.js', '--port=9201']);

process.on('exit', function() {
	server.kill('SIGTERM');
});
