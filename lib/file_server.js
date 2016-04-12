
var allowedDir = "/dist/";

var fs = require('fs'),
	url = require('url'),
	path = require('path');

module.exports = function(request, response) {
	var uri = url.parse(request.url).pathname,
		filename = path.join(process.cwd(), uri);

	// Parse and handle the route.
	if (uri == '/') filename = "index.html";
	else if (uri.indexOf(allowedDir) !== 0) {
		filename = '';
		response.writeHead(403, {
			'Content-Type': 'text/plain'
		});
		response.write('403 Forbidden: Only certain paths are allowed. \n');
		response.end();
		return;
	}

	var stats;

	try {
		stats = fs.lstatSync(filename);
	} catch (e) {
		response.writeHead(404, {
			'Content-Type': 'text/plain'
		});
		response.write('404 Not Found: ' + path.join('/', uri) + '\n');
		response.end();
		return;
	}

	fs.readFile(filename, 'binary', function(err, file) {
		if (err) {
			response.writeHead(500, {
				'Content-Type': 'text/plain'
			});
			response.write('500 File Error: ' + path.join('/', uri) + '\n');
			response.end();
			return;
		}

		response.writeHead(200);
		response.write(file, 'binary');
		response.end();
	});
}
