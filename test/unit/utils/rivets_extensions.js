
var Rivets = RTChat.Rivets;

describe("Rivets Extensions", function() {

	var element = $('body');

	beforeEach(function() {
		element.html('');
	});

	describe("htmlEscape", function() {

		it("should break tags", function() {
			element.html("<div rv-html='text | htmlEscape'></div>");
			Rivets.bind(element, {text: "<bold>text</bold>"});
			expect(element.find('div').html()).toEqual("&lt;bold&gt;text&lt;/bold&gt;");
		});
	});

	describe("Linky", function() {

		it("should work with http links", function() {
			element.html("<div rv-html='text | linky'></div>");
			Rivets.bind(element, {text: "http://example.com"});
			expect(element.find('div').html()).toEqual('<a class="linky" href="http://example.com" target="_blank" rel="nofollow">http://example.com</a>');
		});

		it("should not work with ahttp links", function() {
			element.html("<div rv-html='text | linky'></div>");
			Rivets.bind(element, {text: "ahttp://example.com"});
			expect(element.find('div').html()).toEqual('ahttp://example.com');
		});

		it("should work with padding", function() {
			element.html("<div rv-html='text | linky'></div>");
			Rivets.bind(element, {text: "before http://example.com end"});
			expect(element.find('div').html()).toEqual('before <a class="linky" href="http://example.com" target="_blank" rel="nofollow">http://example.com</a> end');
		});
	});

	describe("chatMarkdown", function() {

		it("should trim whitespace", function() {
			element.html("<div rv-html='text | chatMarkdown'></div>");
			Rivets.bind(element, {text: " 	text 	"});
			expect(element.find('div').html()).toEqual("text");
		});

		it("should render newlines", function() {
			element.html("<div rv-html='text | chatMarkdown'></div>");
			Rivets.bind(element, {text: "one\ntwo\n\nfour"});
			expect(element.find('div').html()).toEqual("one<br>two<br><br>four");
		});

		it("should render _italic_ text", function() {
			element.html("<div rv-html='text | chatMarkdown'></div>");
			Rivets.bind(element, {text: "one _two_ three"});
			expect(element.find('div').html()).toEqual("one <i>two</i> three");
		});

		it("should render *bold* text", function() {
			element.html("<div rv-html='text | chatMarkdown'></div>");
			Rivets.bind(element, {text: "one *two* three"});
			expect(element.find('div').html()).toEqual("one <b>two</b> three");
		});

		it("should render ~strike~ text", function() {
			element.html("<div rv-html='text | chatMarkdown'></div>");
			Rivets.bind(element, {text: "one ~two~ three"});
			expect(element.find('div').html()).toEqual("one <s>two</s> three");
		});

		it("should render `code` text", function() {
			element.html("<div rv-html='text | chatMarkdown'></div>");
			Rivets.bind(element, {text: "one `two` three"});
			expect(element.find('div').html()).toEqual("one <code>two</code> three");
		});

		it("should render regexp's 'lazily'", function() {
			element.html("<div rv-html='text | chatMarkdown'></div>");
			Rivets.bind(element, {text: "one ` two ` three ` four ` five"});
			expect(element.find('div').html()).toEqual("one <code> two </code> three <code> four </code> five");
		});

		it("should not render underscored words as italics, etc", function() {
			element.html("<div rv-html='text | chatMarkdown'></div>");
			Rivets.bind(element, {text: "one_two three_four"});
			expect(element.find('div').html()).toEqual("one_two three_four");
		});

		it("should render properly with escape characters", function() {
			element.html("<div rv-html='text | chatMarkdown'></div>");
			Rivets.bind(element, {text: "one ` two \\` three ` four"});
			expect(element.find('div').html()).toEqual("one <code> two \\` three </code> four");
		});

	});

	describe("EmojiOne", function() {
		it("should render :short_names: emoji", function() {
			element.html("<div rv-html='text | emojiOne'></div>");
			Rivets.bind(element, {text: "one :two: three"});
			expect(element.find('div').html()).toEqual('one <img class="emojione" alt="2⃣" src="https://cdnjs.cloudflare.com/ajax/libs/emojione/2.1.4/assets/png/0032-20e3.png"> three');
		});
	});

	describe("Logical operators", function() {
		it("'gt' should work", function() {
			var scope = {num: 5}
			element.html("<div rv-html='num |gt 4'></div>");
			Rivets.bind(element, scope);
			expect(element.find('div').html()).toEqual('true');
			scope.num = 4;
			expect(element.find('div').html()).toEqual('false');
		});

		it("'gte' should work", function() {
			var scope = {num: 5}
			element.html("<div rv-html='num |gte 4'></div>");
			Rivets.bind(element, scope);
			expect(element.find('div').html()).toEqual('true');
			scope.num = 4;
			expect(element.find('div').html()).toEqual('true');
			scope.num = 3;
			expect(element.find('div').html()).toEqual('false');
		});

		it("'lt' should work", function() {
			var scope = {num: 5}
			element.html("<div rv-html='num |lt 4'></div>");
			Rivets.bind(element, scope);
			expect(element.find('div').html()).toEqual('false');
			scope.num = 3;
			expect(element.find('div').html()).toEqual('true');
		});

		it("'lte' should work", function() {
			var scope = {num: 5}
			element.html("<div rv-html='num |lte 4'></div>");
			Rivets.bind(element, scope);
			expect(element.find('div').html()).toEqual('false');
			scope.num = 4;
			expect(element.find('div').html()).toEqual('true');
			scope.num = 3;
			expect(element.find('div').html()).toEqual('true');
		});

		it("'eq' should work", function() {
			var scope = {num: 5}
			element.html("<div rv-html='num |eq 4'></div>");
			Rivets.bind(element, scope);
			expect(element.find('div').html()).toEqual('false');
			scope.num = 4;
			expect(element.find('div').html()).toEqual('true');
		});

		it("'and' should work", function() {
			var scope = {bool: true}
			element.html("<div rv-html='bool |and true'></div>");
			Rivets.bind(element, scope);
			expect(element.find('div').html()).toEqual('true');
			scope.bool = false;
			expect(element.find('div').html()).toEqual('false');
		});

		it("'or' should work", function() {
			var scope = {bool: true}
			element.html("<div rv-html='bool |or false'></div>");
			Rivets.bind(element, scope);
			expect(element.find('div').html()).toEqual('true');
			scope.bool = false;
			expect(element.find('div').html()).toEqual('false');
		});
	});

	describe("Basic operators", function() {
		it("'length' should work", function() {
			element.html("<div rv-html='text | length'></div>");
			Rivets.bind(element, {text: "something"});
			expect(element.find('div').html()).toEqual('9');
		});

		it("'+' should work with text", function() {
			element.html("<div rv-html='text |+ more'></div>");
			Rivets.bind(element, {text: "something", more: ' else'});
			expect(element.find('div').html()).toEqual('something else');
		});

		it("'+' should work with numbers", function() {
			element.html("<div rv-html='num |+ 2'></div>");
			Rivets.bind(element, {num: 3});
			expect(element.find('div').html()).toEqual('5');
		});

		it("'to_a' should turn objects to arrays", function() {
			element.html("<div rv-each-item='obj | to_a'>{index} : {item.key}, {item.value}</div>");
			Rivets.bind(element, {obj: {one: 1, two: 2}});
			expect(element.html()).toEqual('<!-- rivets: each-item --><div>0 : one, 1</div><div>1 : two, 2</div>');
		});
	});

});
