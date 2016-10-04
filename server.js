// Serves up index.html, dist/*, socket.io and plugins!

var options = { // defaults
	http: false,
	ip: "0.0.0.0",
	port: 9001,
	plugin: [],
};

var getopts = require("node-getopt").create([
	['', 'http', 'Disable SSL'],
	['', 'ip=', 'Set IP'],
	['', 'port=', 'Set port'],
	['', 'watch', 'Recompile assets on file modification'],
	['', 'plugin=ARG+', 'Add "connect-style" plugins from ./lib'],
	['h', 'help', '']
]).bindHelp();
var opt = getopts.parseSystem();

if (opt.argv.length > 0) {
	console.error("ERROR: Unexpected argument(s): " + opt.argv.join(', '));
	process.stdout.write(getopts.getHelp());
	process.exit(1);
}

// Merge opts into options
for (var attrname in opt.options) { options[attrname] = opt.options[attrname]; }

var fs = require('fs'),
	// url = require('url'),
	path = require('path');

var app;
var connect = require('connect')();
var watcher;

if (!options.http) {
	var server_opts;
	try {
		server_opts = {
			key: fs.readFileSync(path.resolve('keys/privatekey.pem')),
			cert: fs.readFileSync(path.resolve('keys/certificate.pem'))
		};
	}
	catch (err) {
		console.warn("WARNING: failed to find valid SSL keys, falling back to fake-keys..");
		server_opts = {
			key: fs.readFileSync(path.join(__dirname, 'node_modules/rtcmulticonnection-v3/fake-keys/privatekey.pem')),
			cert: fs.readFileSync(path.join(__dirname, 'node_modules/rtcmulticonnection-v3/fake-keys/certificate.pem'))
		};
	}

	// Setup HTTP-redirect server.
	require('http').createServer(function(req, res) {
		res.writeHead(301, { "Location": "https://" + req.headers.host + req.url });
		res.end();
	}).on('error', function(err) {
		console.warn("WARNING: unable to start http-redirect server. GOT:", err.toString());
	}).listen(80);

	app = require('https').createServer(server_opts, connect);
} else { //HTTP
	app = require('http').createServer(connect);
}

app.listen(options.port, options.ip, function() {
		var addr = app.address();
		console.log("Server listening at", (options.http ? "http://" : "https://" ) + addr.address + ":" + addr.port);
});

app.on('error', function(err) {
	console.error('ServerError:', err.code);
	process.exit(1);
});




// Add signaling server - Copied from github.com/muaz-khan/RTCMultiConnection/server.js
require('rtcmulticonnection-v3/Signaling-Server.js')(app, function(socket) {
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

connect.use(function(req, res, next) {
	if (!options.http) {
		// HTTP Strict Transport Security. (keep using SSL for at least a year)
		res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
	}
	if (req.headers.origin) {
		// CORS - Allow all origins
		res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
		res.setHeader('Access-Control-Allow-Method', 'POST GET OPTIONS');
		res.setHeader('Vary', 'Origin');
	}
	next();
});

// Load file_server
options.plugin.push('file_server');

// Load plugins
for (var i in options.plugin) {
	try { // load module from local lib.
		connect.use(require(path.join(__dirname, 'lib', options.plugin[i])));
	} catch(err)	{
		if (err.code !== 'MODULE_NOT_FOUND') throw err;
		// load the module from './lib/'
		connect.use(require(path.join(path.resolve('lib'), options.plugin[i])));
	}
}

// --Watch
if (options.watch) {
	watcher = require('child_process').spawn('webpack', ['--watch', '--colors']);

	watcher.stdout.on('data', function(data) {
		console.log(data.toString());
	});

	watcher.stderr.on('data', function(data) {
		console.log(data.toString());
	});
}
