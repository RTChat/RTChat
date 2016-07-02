
var Rivets = RTChat.Rivets;

describe("Rivets Extensions", function() {
	var element = $('body');

	beforeEach(function() {
		element.html('');
	});

	describe("htmlEscape", function() {
		it("Should break tags", function() {
			element.html("<div rv-html='text | htmlEscape'></div>");
			Rivets.bind(element, {text: "<bold>text</bold>"});
			expect(element.find('div').html()).toEqual("&lt;bold&gt;text&lt;/bold&gt;");
		});
	});
});
