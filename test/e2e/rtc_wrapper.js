
describe("RTC Wrapper", function() {

	beforeEach(function() {
		browser.get( browser.baseUrl + "#testing" );
		browser.waitForRender();
	});


	it('room should render alone', function() {
		// users panel should be empty.
		browser.wait(function () {
			return browser.$('.users-panel').isPresent();
		});
		expect($('.users-panel li').isPresent()).toBeFalsy();
	});

	describe("with a second user", function() {
		var browser2;

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

		it("should display that second user", function() {
			var b1Name = browser.$$( '#UserMenu span').first().getAttribute('innerHTML');
			var b2Name = browser2.$$('#UserMenu span').first().getAttribute('innerHTML');

			expect(b1Name).toContain("Guest_");
			expect(b2Name).toContain("Guest_");

			expect(browser.$$( '.users-panel li').first().getAttribute("innerHTML")).toContain(b2Name);
			expect(browser2.$$('.users-panel li').first().getAttribute("innerHTML")).toContain(b1Name);
		});

		describe("that leaves", function() {
			beforeEach(function() {
				browser2.executeScript(function() {
					window.location = "#"
				})
				browser2.wait(function() {
					return browser2.$('#WelcomePanel .btn').isPresent();
				});
			});

			it('should remove the second user', function() {
				expect(browser.$$( '.users-panel li').count()).toEqual(0);
			});
		});

		describe("that updates the state", function() {

			beforeEach(function() {
				browser2.actions().mouseMove(browser2.$('.editor')).perform();
				browser2.$('#RoomPanel .room-subject .btn').click();
				browser2.$('#RoomPanel .room-subject .editor').sendKeys(
					protractor.Key.chord(protractor.Key.CONTROL, "a")
				);
				browser2.$('#RoomPanel .room-subject .editor').sendKeys('second user rulez :fire: :cat:');
				browser2.$('#RoomPanel .room-subject .btn').click();

				browser.wait(function() {
					return browser.$('.editor').getAttribute('innerHTML').toMatch("second user rulez");
				}, 2000, "should sync the updated state");
			});


			describe("and leaves for another room", function() {
				beforeEach(function() {
					browser2.executeScript(function() {
						window.location = "#testing2"
					});
					browser2.wait(function() {
						return browser2.$('.users-panel').isPresent();
					});
				});

				it('should remove the second user', function() {
					expect(browser.$$( '.users-panel li').count()).toEqual(0);
				});

				it('the second user should have a fresh room', function() {
					browser2.wait(function() {
						return browser2.$('#RoomPanel .room-subject .editor').getAttribute('innerHTML').toMatch("Welcome to #testing2");
					}, 2000, "should reset the state");
					expect($('.users-panel li').isPresent()).toBeFalsy();
				});

				describe("before a third user joins", function() {
					var browser3;

					beforeEach(function() {
						browser3 = browser.fork();

						browser3.wait(function() {
							return browser3.$$('.users-panel li').count().then(function(count) {
								return count == 1;
							});
						});

						browser.wait(function () {
							return browser.$$('.users-panel li').count().then(function(count) {
								return count == 1;
							});
						});
					});

					afterEach(function() {
						browser3.quit();
					});

					it("should display that third user", function() {
						expect(browser.$$( '.users-panel li').count()).toEqual(1);
						expect(browser3.$$('.users-panel li').count()).toEqual(1);

						var b1Name = browser.$$( '#UserMenu span').first().getAttribute('innerHTML');
						var b3Name = browser3.$$('#UserMenu span').first().getAttribute('innerHTML');

						expect(b1Name).toContain("Guest_");
						expect(b3Name).toContain("Guest_");

						expect(browser.$$( '.users-panel li').first().getAttribute("innerHTML")).toContain(b3Name);
						expect(browser3.$$( '.users-panel li').first().getAttribute("innerHTML")).toContain(b1Name);
					});

					it('third user should have the updated state', function() {
						browser3.wait(function() {
							return browser3.$('.editor').getAttribute('innerHTML').toMatch("second user rulez");
						}, 2000, "should sync the updated state");
					});

					it('second user should rejoin and sync state', function() {
						browser2.executeScript(function() {
							window.location = "#testing"
						});

						browser3.wait(function() {
							return browser3.$$('.users-panel li').count().then(function(count) {
								return count == 2;
							});
						});

						browser2.wait(function() {
							return browser2.$$('.users-panel li').count().then(function(count) {
								return count == 2;
							});
						});

						browser.wait(function () {
							return browser.$$('.users-panel li').count().then(function(count) {
								return count == 2;
							});
						});

						browser2.wait(function() {
							return browser2.$('#RoomPanel .room-subject .editor').getAttribute('innerHTML').toMatch("second user rulez");
						}, 2000, "should re-set the state");
					});

					// describe('first user leaves')

				});

			});
		});

		describe("and a third user", function() {
			var browser3;

			beforeEach(function() {
				browser3 = browser.fork();

				browser3.wait(function() {
					return browser3.$$('.users-panel li').count().then(function(count) {
						return count == 2;
					});
				});

				browser2.wait(function() {
					return browser2.$$('.users-panel li').count().then(function(count) {
						return count == 2;
					});
				});

				browser.wait(function () {
					return browser.$$('.users-panel li').count().then(function(count) {
						return count == 2;
					});
				});
			});

			afterEach(function() {
				browser3.quit();
			});

			it("should display that third user", function() {
				expect(browser.$$( '.users-panel li').count()).toEqual(2);
				expect(browser2.$$('.users-panel li').count()).toEqual(2);
				expect(browser3.$$('.users-panel li').count()).toEqual(2);

				var b1Name = browser.$$( '#UserMenu span').first().getAttribute('innerHTML');
				var b2Name = browser2.$$('#UserMenu span').first().getAttribute('innerHTML');
				var b3Name = browser3.$$('#UserMenu span').first().getAttribute('innerHTML');

				expect(b1Name).toContain("Guest_");
				expect(b2Name).toContain("Guest_");
				expect(b3Name).toContain("Guest_");

				expect(browser.$$( '.users-panel li').first().getAttribute("innerHTML")).toContain(b2Name);
				expect(browser.$$( '.users-panel li').get(1).getAttribute("innerHTML")).toContain(b3Name);

				expect(browser2.$$( '.users-panel li').first().getAttribute("innerHTML")).toContain(b1Name);
				expect(browser2.$$( '.users-panel li').get(1).getAttribute("innerHTML")).toContain(b3Name);

				expect(browser3.$$( '.users-panel li').first().getAttribute("innerHTML")).toContain(b1Name);
				expect(browser3.$$( '.users-panel li').get(1).getAttribute("innerHTML")).toContain(b2Name);
			});

		});

	});

	//TODO: the "initiator" leaving bugs the room.
	xdescribe("first user leaves", function() {
		beforeEach(function() {
			browser.executeScript(function() {
				window.location = "#"
			});
			browser.wait(function() {
				return browser.$('#WelcomePanel .btn').isPresent();
			});
		});

		describe("then second user joins", function() {
			var browser2;

			beforeEach(function() {
				browser2 = browser.fork(browser.baseUrl + "#testing");

				browser2.wait(function() {
					return browser2.$('.users-panel').isPresent();
				});

				// "second user should be alone in the room"
				expect(browser2.$$( '.users-panel li').count()).toEqual(0);
			});

			afterEach(function() {
				browser2.quit();
			});

			// xit('dunked', function() {
			// 	// browser.pause()
			// })
			//TODO: this is a janky test, and requires tweaking
			xit("second user should be alone in the room", function() {
				browser.waitConstant(2000);
				expect(browser2.$$( '.users-panel li').count()).toEqual(0);
				// browser.pause()
			});

			//TODO:
			xit("first user should rejoin", function() {
				browser.executeScript(function() {
					window.location = "#testing"
				});

				browser2.wait(function() {
					return browser2.$$('.users-panel li').count().then(function(count) {
						return count == 1;
					});
				});

				browser.wait(function () {
					return browser.$$('.users-panel li').count().then(function(count) {
						return count == 1;
					});
				});
			});

			describe("and third user joins", function() {
				var browser3;

				beforeEach(function() {
					// browser.pause()
					browser3 = browser.fork(browser.baseUrl + "#testing");

					browser3.wait(function() {
						return browser3.$('.users-panel li').isPresent();
					});

					var b2Name = browser2.$$('#UserMenu span').first().getAttribute('innerHTML');
					var b3Name = browser3.$$('#UserMenu span').first().getAttribute('innerHTML');

					expect(b2Name).toContain("Guest_");
					expect(b3Name).toContain("Guest_");

					browser2.wait(function() {
						return browser2.$$( '.users-panel li').first().getAttribute("innerHTML").toMatch(b3Name) &&
						       browser3.$$( '.users-panel li').first().getAttribute("innerHTML").toMatch(b2Name);
					});

					expect(browser2.$$( '.users-panel li').count()).toEqual(1);
					expect(browser3.$$( '.users-panel li').count()).toEqual(1);
				});

				afterEach(function() {
					browser3.quit();
				});

				it("third user should be able to talk with second", function() {
					browser3.$('.emojionearea-editor').sendKeys("I'm number three! :cat:\n\n");

					browser3.wait(function() {
						return browser2.$$('#ChatPanel li').get(0).getAttribute('innerHTML').toMatch("I'm number three!") &&
						       browser3.$$('#ChatPanel li').get(0).getAttribute('innerHTML').toMatch("I'm number three!");
					});

					browser2.$('.emojionearea-editor').sendKeys("I'm number two! :cat2:\n\n");

					browser2.wait(function() {
						return browser3.$$('#ChatPanel li').get(1).getAttribute('innerHTML').toMatch("I'm number two!") &&
						       browser2.$$('#ChatPanel li').get(1).getAttribute('innerHTML').toMatch("I'm number two!");
					});
					// browser.pause()
				});

				it("first user should rejoin", function() {
					// browser.pause()
					browser.executeScript(function() {
						window.location = "#testing"
					});

					browser.wait(function () {
						return browser.$$('.users-panel li').count().then(function(count) {
							return count == 2;
						});
					});

					browser2.wait(function() {
						return browser2.$$('.users-panel li').count().then(function(count) {
							return count == 2;
						});
					});

					browser3.wait(function () {
						return browser.$$('.users-panel li').count().then(function(count) {
							return count == 2;
						});
					});
				});

			});

		});

	});

});
