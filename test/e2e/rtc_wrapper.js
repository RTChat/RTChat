
function waitForRender(brwsr) {
	//TODO: reliable?
	(brwsr || browser).wait(function() {
		return $('body > *').isPresent()
	}, 2000);
}

function forkBrowser(url) {
	var new_browser = browser.forkNewDriverInstance(url || true);
	new_browser.ignoreSynchronization = true;

	if (url) new_browser.get(url);
	return new_browser;
}

browser.ignoreSynchronization = true;

describe("RTC Wrapper", function() {

	var BaseUrl = "https://localhost:9001";

	beforeEach(function() {
		browser.get( BaseUrl + "#testing");
		waitForRender();
	});

	describe("RoomPanel", function() {

		it('should render alone', function() {
			// users panel should be empty.
			expect($('.users-panel').isPresent()).toBeTruthy();
			expect($('.users-panel li').isPresent()).toBeFalsy();
		});

		describe("with another user", function() {
			var browser2;

			beforeEach(function() {
				browser2 = forkBrowser();

				browser2.wait(function() {
					return browser2.$('.users-panel li').isPresent();
				}, 2000);

				browser.wait(function () {
					return browser.$('.users-panel li').isPresent();
				}, 2000);
			});

			afterEach(function() {
				browser2.quit();
			});

			it("should display that other user", function() {
				expect(browser.$$( '.users-panel li').count()).toEqual(1);
				expect(browser2.$$('.users-panel li').count()).toEqual(1);

				var b1Name = browser.$$( '#UserMenu span').first().getAttribute('innerHTML');
				var b2Name = browser2.$$('#UserMenu span').first().getAttribute('innerHTML');

				expect(b1Name).toContain("Guest_");
				expect(b2Name).toContain("Guest_");

				expect(browser.$$( '.users-panel li').first().getAttribute("innerHTML")).toContain(b2Name);
				expect(browser2.$$( '.users-panel li').first().getAttribute("innerHTML")).toContain(b1Name);
			});

			describe("that leaves", function() {
				beforeEach(function() {
					browser2.$$('#Header a').first().click();
					//TODO: wait?
				});

				it('should remove that user', function() {
 					expect(browser.$$( '.users-panel li').count()).toEqual(0);
				});

			});

		});

	});

});
