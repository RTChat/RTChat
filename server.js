// Mostly copied from github.com/muaz-khan/RTCMultiConnection/server.js

// Serves up index.html, dist/*, and socket.io

var options = { // defaults
	https: false,
	ip: "0.0.0.0",
	port: 9001,
}

var opt = require("node-getopt").create([
	['', 'https', 'Enable Https'],
	['', 'ip=ARG', 'Set IP'],
	['', 'port=ARG', 'Set port'],
	['h', 'help', '']
]).bindHelp().parseSystem()

// Merge opts into options
for (var attrname in opt.options) { options[attrname] = opt.options[attrname]; }

var allowedDir = "/dist/"

var server = require(options.https ? 'https' : 'http'),
	url = require('url'),
	path = require('path'),
	fs = require('fs');

function serverHandler(request, response) {
	var uri = url.parse(request.url).pathname,
		filename = path.join(process.cwd(), uri);

	// console.log("uri", uri);
	if (uri == '/') filename = "index.html"
	//TODO:
	// else if (uri.substring(0, allowedDir.length) !== allowedDir) { // not in dist/
	//     response.writeHead(403, {
	//         'Content-Type': 'text/plain'
	//     });
	//     response.write('403 Forbidden: ' + path.join('/', uri) + '\n');
	//     response.end();
	//     return;
	// }

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

var app;

if (options.https) {
	var opts = {
		key: fs.readFileSync(path.join(__dirname, 'node_modules/rtcmulticonnection-v3/fake-keys/privatekey.pem')),
		cert: fs.readFileSync(path.join(__dirname, 'node_modules/rtcmulticonnection-v3/fake-keys/certificate.pem'))
	};
	app = server.createServer(opts, serverHandler);
} else app = server.createServer(serverHandler);

app = app.listen(options.port, options.ip, function() {
	var addr = app.address();
	console.log("Server listening at", addr.address + ":" + addr.port);
});

app.on('error', function(err) {
	console.log('ServerError:', err.code)
})

require('./node_modules/rtcmulticonnection-v3/Signaling-Server.js')(app, function(socket) {
	try {
		var params = socket.handshake.query;

		// "socket" object is totally in your own hands!
		// do whatever you want!

		// in your HTML page, you can access socket as following:
		// connection.socketCustomEvent = 'custom-message';
		// var socket = connection.getSocket();
		// socket.emit(connection.socketCustomEvent, { test: true });

		if (!params.socketCustomEvent) {
			params.socketCustomEvent = 'custom-message';
		}

		socket.on(params.socketCustomEvent, function(message) {
			try {
				socket.broadcast.emit(params.socketCustomEvent, message);
			} catch (e) {}
		});
	} catch (e) {}
});
