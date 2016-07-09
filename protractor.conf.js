exports.config = {
	// seleniumAddress: 'http://localhost:4444/wd/hub',
	specs: [
		'test/e2e/*.js'
	],

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
};
