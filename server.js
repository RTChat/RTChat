// Serves up index.html, dist/*, socket.io and plugins!

var options = { // defaults
	http: false,
	ip: "0.0.0.0",
	port: 9001,
	plugin: [],
}

var opt = require("node-getopt").create([
	['', 'http', 'Disable SSL'],
	['', 'ip=ARG', 'Set IP'],
	['', 'port=ARG', 'Set port'],
	['', 'watch', 'Recompile assets on file modification'],
	['', 'plugin=ARG+', 'Add "connect-style" plugin'],
	['h', 'help', '']
]).bindHelp().parseSystem();

if (opt.argv.length > 0) {
	console.error("ERROR: Unexpected argument(s): " + opt.argv.join(', '));
	process.exit(1);
}

// Merge opts into options
for (var attrname in opt.options) { options[attrname] = opt.options[attrname]; }

var fs = require('fs'),
	// url = require('url'),
	path = require('path');

var server_opts = {};
var connect = require('connect')();
var server = require(options.http ? 'http' : 'https');

if (!options.http) {
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
		// HTTP Strict Transport Security. (keep using SSL for at least a year)
		// if (!options.http)
		// 	response.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

  // Setup HTTP-redirect server.
  require('http').createServer(function(req, res) {
    res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
    res.end();
  }).on('error', function(err) {
    console.warn("WARNING: unable to start http-redirect server. GOT:", err.toString());
  }).listen(80);

}

var app = server.createServer(server_opts, connect).
	listen(options.port, options.ip, function() {
		var addr = app.address();
		console.log("Server listening at", (options.http ? "http://" : "https://" ) + addr.address + ":" + addr.port);
});

app.on('error', function(err) {
	console.error('ServerError:', err.code);
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

// HTTP Strict Transport Security. (keep using SSL for at least a year)
if (!options.http) {
	connect.use(function(req, res, next) {
		res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
		next();
	});
}

// Load file_server
options.plugin.push('file_server');

// Load plugins
for (var i in options.plugin) {
	try { // load module from local lib.
		connect.use(require(path.join(__dirname, 'lib', options.plugin[i])));
	} catch(err)	{
		if (err.code !== 'MODULE_NOT_FOUND') throw err;
	  connect.use(require(path.resolve(options.plugin[i])));
	}
}

// --Watch
if (options.watch) {
	var watcher = require('child_process').spawn('webpack', ['--watch', '--colors']);

	watcher.stdout.on('data', function(data) {
		console.log(data.toString());
	});

	watcher.stderr.on('data', function(data) {
		console.log(data.toString());
	});
}
