exports.config = {
  // seleniumAddress: 'http://localhost:4444/wd/hub',
  specs: [
  	'test/e2e/*.js'
  ],

  capabilities: {
	  'browserName': 'chrome',
	  'chromeOptions': {
	    'args': [
	    	// 'show-fps-counter=true',
	    	// 'console',
	    	'use-fake-device-for-media-stream',
	    	'use-fake-ui-for-media-stream',
	    ]
	  }
	},
};
