// Connect-style server plugin for uploading images to an imgur album.
// Also supports breaking PDFs into images.

var os = require('os');
var fs = require('fs');
var tmp = require('tmp');
var path = require('path');
var https = require('https');
var Busboy = require('busboy')
var FileType = require('file-type');
var ReadChunk = require('read-chunk');
var spawn = require('child_process').spawnSync;

var Keys = require("../keys/imgur.json");
// Should be of the form:
// {
// 	"client_id": "xxx", // Obtianed when registering a client.
// 	"client_secret": "xxx",
// }

module.exports = function(request, response, next) {
	if (request.url == "/imgur_upload") {
		if (request.method == "OPTIONS") {
			response.writeHead(200); response.end();
		} else {
			handleUpload(request, response);
		}
	// } else if (request.url == "/imgur_delete") {
	// 	handleDelete(request, response);
	} else { next(); }
};

function getAccessToken(refresh_token, callback) {
	var data = [
		"grant_type=refresh_token",
		"client_id="+ Keys.client_id,
		"client_secret="+ Keys.client_secret,
		"refresh_token="+ refresh_token,
	].join("&");

	var req = https.request({
		method: 'POST',
		host: 'api.imgur.com',
		path: '/oauth2/token',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Content-Length': Buffer.byteLength(data)
		},
	}, function(resp) {
		// console.log("IR_RESP", resp.statusCode)
		var body = '';
		resp.on('data', function(chunk) {
			body += chunk;
			// console.log("IR_BODY:", chunk.toString())
		});
		resp.on('end', function() {
			if (typeof callback == "function") callback(JSON.parse(body).access_token);
		});
	});
	req.write(data);
	req.end();
}

function handleUpload(request, response) {
	var requiredFields = ['name', 'username', 'refresh_token'];

	var errorMsg, fields = {};
	var tmpDir = tmp.dirSync({ prefix: 'imgur_upload-', unsafeCleanup: true });

	// Because busboy's "finish" callback is triggered before the write is actually finished.
	var finishedWriting = false;

	try {
		var busboy = new Busboy({ headers: request.headers });

		busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
			if (fieldname != 'file') {
				errorMsg = "Unexpected fieldname: "+fieldname; file.resume();
			} else if (fields.file) {
				errorMsg = "Duplicate fieldname: "+fieldname; file.resume();
			} else {
				fields.file = filename;
				var tf = fs.createWriteStream(path.join(tmpDir.name, 'original_file'));
				tf.on('finish', function() { finishedWriting = true; });
				file.pipe(tf);
			}
		});

		busboy.on('field', function(fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype) {
			// if (fieldname != 'name' && fieldname != 'username' fieldname != 'refresh_token')
			if (requiredFields.indexOf(fieldname) < 0)
				errorMsg = "Unexpected fieldname: "+fieldname;
			else if (fields[fieldname])
				errorMsg = "Duplicate fieldname: "+fieldname;
			else
				fields[fieldname] = val;
		});

		//TODO: cancel upload on 400
		busboy.on('finish', function() {
			// console.log("BB_finish")
			// Validate required fields.
			for (var i in requiredFields) {
				if (!fields[requiredFields[i]]) errorMsg = "Missing required field: "+requiredFields[i];
			}

			if (errorMsg) {
				tmpDir.removeCallback(); // Delete all temp files.
				response.writeHead(400, {'Content-Type': 'text/plain'});
				response.write("The request was improperly formatted: " + errorMsg);
				response.end();
			} else {

				// Wait for the file to finish writing before continuing.
				var tid = setInterval(function() {
					if (!finishedWriting && refresh_token) return;
					clearInterval( tid );
					getAccessToken(fields.refresh_token, function(access_token) {
						splitAndUpload(tmpDir.name, fields, access_token, function() {
							//TODO: progress??
							tmpDir.removeCallback(); // Delete all temp files.
							response.writeHead(200, { 'Connection': 'close' });
							response.end();
						});
					});
				}, 100); //TODO: timeout.
			}
		});

		return request.pipe(busboy);
	}

	catch (err) {
		console.error("UPLOAD_ERROR:", err.toString());

		if (tmpDir) tmpDir.removeCallback();
		response.writeHead(500, {'Content-Type': 'text/plain'});
		response.write("A server error occurred while trying to process the request.");
		response.end();
	}
}

function splitAndUpload(dir, fields, access_token, callback) {
	function run() {
		var res = spawn.apply(null, arguments);
		if (res.status !== 0) {
			console.warn("WARNING, ran: ", arguments, res.status, res.stdout, res.stderr)
		}
	}

	function convert(filename) {
		run('pdftoppm', [
			'-r', '200', // density - quality
			path.join(dir, filename),
			path.join(dir, 'file'),
		]);
		run('convert', [
			path.join(dir, 'file-*.ppm'),
			path.join(dir, 'i.png')
		]);
	};

	var og_file = ReadChunk.sync(path.join(dir, 'original_file'), 0, 262);
	var type = FileType(og_file).ext;
	// console.log("FILE-TYPE:", type)

	// Split file into images.
	switch (type) {
		case 'msi': // MS format like ppt or doc...
		case 'zip': //FIXME: For some reason pptx shows up as 'zip'...
			run('unoconv', ['-f', 'pdf', path.join(dir, 'original_file')]); // convert to pdf
			convert('original_file.pdf');
			break;

		case 'pdf':
			convert('original_file');
			break;
		default:
			// Just upload the original_file.
	}

	// Upload whatever is in tmpDir.
	var list = fs.readdirSync(dir);

	// Only upload original_file when it's the only thing.
	if (list.length > 1) { // Remove 'original_file'.
		// Remove everything but the images.
		var reg = new RegExp(/^i-?(\d*)\.png$/)
		list = list.filter(function(f) {
			return f.match(reg);
		}).sort(function(a, b) { // convert to numerical order
			return parseInt(a.match(reg)[1]) - parseInt(b.match(reg)[1])
		});
	}

	var finishedUploading = [];
	// var uploadProgress = []; //TODO:
	//TODO: error handling!!

	for(var i in list) {
		// :console.log("Uploading:", list[i])
		var file = fs.createReadStream(path.join(dir, list[i]));
		var i = i.toString(); // needed in callbacks

		var req = https.request({
			method: 'POST',
			host: 'api.imgur.com',
			path: '/3/image',
			headers: {
				Authorization: "Bearer "+access_token,
			},
		}, function(resp) {
			var body = ''
			resp.on('data', function(chunk) {
				body += chunk;
			});
			resp.on('end', function() {
				//TODO: handle error
				console.log("IR_RESP", i, resp.statusCode, body)
				finishedUploading.push( JSON.parse(body).data.id );
			});
			// TODO: error handler / retry w/ fresh token.
		});
		file.pipe(req);
	}

	// Wait until finished uploading images.
	var tid = setInterval(function() {
		if (finishedUploading.length == list.length) {
			clearInterval(tid);

			var body = JSON.stringify({
				title: fields.name,
				ids: finishedUploading,
				privacy: 'public',
			});
			// Create album.
			var r = https.request({
				method: 'POST',
				host: 'api.imgur.com',
				path: '/3/album',
				headers: {
					Authorization: "Bearer "+access_token,
					// Accept: 'application/json',
					"Content-Type": "application/json",
					"Content-Length": Buffer.byteLength(body)
				},
			}, function(resp) {
				var body = ''
				resp.on('data', function(chunk) {
					body += chunk;
				});
				resp.on('end', function() {
					console.log("ALBUM_RESP", resp.statusCode, body)
					// callback(JSON.parse(body).access_token)
				});
			});
			r.write(body, 'utf-8');
			r.end();

			if (typeof callback == "function") callback();
		}
	}, 100); //TODO: timeout?
}

function handleDelete(request, response) {

}
