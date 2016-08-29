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
// 	"upload_account": "RTChat_LiveSlide",
// 	"refresh_token": "xxx" // Obtained once for the account.
// }

// var access_token;
// refreshAccessToken(function(at) { console.log("AT", at); access_token = at; });
//TODO: refresh on 403

module.exports = function(request, response, next) {
	console.log("RRRRRRT", request.url, request.headers)
	// request.on('data', function(data) {
	// 	console.log("DD", data.toString())
	// })
	// if (!request.url.match(/^\/imgur\/?$/)) return next();

	if (request.url == "/imgur_upload") {
		handleUpload(request, response);
	} else if (request.url == "/imgur_upload") {
		handleDelete(request, response);
	} else { next(); }

	// if (req.method == "DELETE") return req.on('data', function(d) {
	// 	s3_delete(d.toString(), function() {
	// 		res.writeHead(200, { 'Connection': 'close' });
	// 		res.end();
	// 	});
	//  return;
	// });


	// Upload
	// https.request({
	// 	host: 'api.imgur.com',
	// 	path: '/3/image',
	// 	method: 'POST',
	// 	headers: {'Authorization': 'Bearer '+Keys.access_token}
	// }, function(resp) {
	// 	console.log("II_RESP", resp)

	// });



}

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
		console.log("IR_RESP", resp.statusCode)
		var body = ''
		resp.on('data', function(chunk) {
			body += chunk;
			// console.log("IR_BODY:", chunk.toString())
		});
		resp.on('end', function() {
			if (typeof callback == "function") callback(JSON.parse(body).access_token)
		})
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
				var tf = fs.createWriteStream(path.join(tmpDir.name, 'original_file'))
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
			console.log("BB_finish")
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

		tmpDir && tmpDir.removeCallback();
		response.writeHead(500, {'Content-Type': 'text/plain'});
		response.write("A server error occurred while trying to process the request.");
		response.end();
	}
}

function splitAndUpload(dir, fields, access_token, callback) {
	var og_file = ReadChunk.sync(path.join(dir, 'original_file'), 0, 262);
	var type = FileType(og_file).ext;

	// Split file into images.
	switch (type) {
		case 'msi', 'zip': // MS format like ppt or doc... //FIXME: For some reason pptx shows up as 'zip'...
			var res = spawn('unoconv', ['-f', 'pdf', path.join(dir, 'original_file')]); // convert to pdf
			var res = spawn('convert', [path.join(dir, 'original_file.pdf'), path.join(dir, 'i.png')])
			fs.unlinkSync(path.join(dir, 'original_file.pdf')); //TODO: remove "original_file.*" from upload.
			break;

		case 'pdf':
			var res = spawn('convert', [path.join(dir, 'original_file'), path.join(dir, 'i.png')])
			break;
		default:
			// Just upload the original_file.
	}

	// Upload whatever is in tmpDir.
	var list = fs.readdirSync(dir)
	console.log("LIST:", list)

	// Only upload original_file when it's the only thing.
	if (list.length > 1) { // Remove 'original_file'.
		var i = list.indexOf('original_file');
		list.splice(i, 1);
	}

	var finishedUploading = [];
	// var uploadProgress = []; //TODO:
	//TODO: error handling!!

	for(var i in list) {
		console.log("Uploading:", list[i])
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
