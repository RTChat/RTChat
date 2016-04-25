// Proxies Requests to Random.org with an API key.

var https = require('https');

var apiKey;
try { apiKey = require("../keys/random.json").apiKey } catch(err) {}
if (!apiKey) {
	console.warn("WARNING: using default Random.org API key.");
	apiKey = "00000000-0000-0000-0000-000000000000";
}

module.exports = function(request, response, next) {
	if (!request.url.match(/^\/random\/?$/)) return next();

	var body = '';
	request.on('data', function(chunk) {
		body += chunk;
	});

	request.on('end', function() {
		try {
			// Insert apiKey into body.
			body = JSON.parse(body);
			body.params.apiKey = apiKey;
			body = JSON.stringify(body);
		} catch (err) {
			response.setHeader("Status", 400);
		 	response.write("Failed to JSON.parse body.");
		 	response.end();
		 	return;
		}

		var req = https.request({
			method: 'POST',
			host: 'api.random.org',
			path: '/json-rpc/1/invoke',
		}, function(resp) {
			response.setHeader('Status', resp.statusCode);
			var body = ''
			resp.on('data', function(chunk) {
				body += chunk;
			});
			resp.on('end', function() {
				response.write(body);
				response.end();
			});
		});
		req.write(body);
		req.end();
	});
};
