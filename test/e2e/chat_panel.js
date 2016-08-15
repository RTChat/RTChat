
describe("Chat Panel", function() {

	beforeEach(function() {
		browser.get( browser.baseUrl + "#testing");
		browser.waitForRender();
	});

	describe("with a second user", function() {


		beforeEach(function() {
			browser2 = browser.fork();

			browser2.wait(function() {
				return browser2.$('.users-panel li').isPresent();
			});

			browser.wait(function () {
				return browser.$('.users-panel li').isPresent();
			});
		});

		afterEach(function() {
			browser2.quit();
		});


		it("should show chats to eachother.", function() {
			browser.$('.emojionearea-editor').sendKeys("I'm number one! :cat:\n\n");

			browser.wait(function() {
				return browser.$$('#ChatPanel li').get(0).getAttribute('innerHTML').toMatch("I'm number one!") &&
				      browser2.$$('#ChatPanel li').get(0).getAttribute('innerHTML').toMatch("I'm number one!");
			});

			browser2.$('.emojionearea-editor').sendKeys("I'm number two! :cat2:\n\n");

			browser.wait(function() {
				return browser.$$('#ChatPanel li').get(1).getAttribute('innerHTML').toMatch("I'm number two!") &&
				      browser2.$$('#ChatPanel li').get(1).getAttribute('innerHTML').toMatch("I'm number two!");
			});
		});

		//TODO:
		// it("should sync history.", function() {});
	});
});