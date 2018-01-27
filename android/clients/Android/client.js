var socket;
var path = require('path');
var fs = require('fs-extra');
var Config ;

require('colors');

var init = exports.init = function(config){
	
	Config = config;

}


var remote_callback = function (err, response, body){
  if (err || response.statusCode != 200) {
    warn("HTTP Error: ", err, response, body);
	return;
  }
};


var remote = function(qs, cb){
  var url = 'http://' + Config.http.remote.ip + ':' + Config.http.remote.port + '/';
  var querystring = require('querystring');
  url += '?' + querystring.stringify(qs);

  info('Remote: '+ url);

  var request = require('request');
  request({ 'url' : url }, cb || remote_callback);
};



var speak = function(tts, cb) {
	
	var qs = { 'cmd': 'speak'}; 
	if (cb) {
		return remote(qs, function() { 
					setTimeout(function(){								
						cb();
					}, Config.speech.timeout);
				});
	}
	
	remote(qs);

};



function ttsToWav (tts, callback) {

	var exec = require('child_process').exec
	, child;
	
	tts = tts.replace(/[\n]/gi, "" ).replace(/[\r]/gi, "" );	
	
	// Construct a filesystem neutral filename
	var webroot = path.resolve(__dirname);
	var filename = 'speech.mp3';
	var dir = path.resolve(webroot + '/../../tts/' + Config.client);
	var filepath = path.resolve(dir, filename);
	fs.ensureDirSync(dir);
	
	// Decode URI
	tts = decodeURIComponent(tts);
	
	// tts to wav
	var execpath = webroot + '/../../lib/vbs/ttstowav.vbs';

	child = exec( execpath + ' "'+ tts + '" "' + filepath + '"',
	  function (err, stdout, stderr) {
			if (err !== null) {
				error('tts to wav error: ' + err.red);
			} else 
				callback(filepath);
	  });
}


function speak_states (filename, callback) {
	
	var exec = require('child_process').exec
	, child;
	
	// Construct a filesystem neutral filename
	var webroot = path.resolve(__dirname);
	var fileresult = 'speech.wav';
	var dir = path.resolve(webroot + '/../../tts/' + Config.client);
	var filepath = path.resolve(dir, fileresult);
	
	// Listen for speak
	var cmd = webroot + '/../../lib/sox/sox -q ' + filename + ' ' + filepath + ' stat -−json';
	var stats; 
	var child = exec(cmd, function (err, stdout, stderr) {
		if (err) { 
			error('Sox error:', err.red || 'Unable to start Sox'.red);
			callback();
		} 
	});
	
	if (child)
		child.stdout.on("close", function() {
			setTimeout(function(){								
				try {
					var json = fs.readFileSync(webroot + '/../../../../state.json','utf8');
						stats = JSON.parse(json);
						callback(stats.Length_seconds);
				} catch(ex){ 
					error("error: " + ex.message.red); 
					callback();
				}
			}, 200);
		});
	
}


var prepareSpeak = function (qs, callback) {
	
	if (!qs.tts) {
		var tmp = {};
		tmp.tts = qs;
		tmp.sync = (callback) ? true : false;
		qs = tmp;
	}
	
	var tts = qs.tts.replace(/[\n]/gi, "" ).replace(/[\r]/gi, "" );	
	if (tts.indexOf('|') != -1) 
	  tts = tts.split('|')[Math.floor(Math.random() * tts.split('|').length)];
  
 // if (Config.speech.server_speak) 
	if (Avatar.Socket.isServerSpeak(Config.client))
		return socket.emit('server_speak', tts, callback);

	ttsToWav (tts, function(filename) {
		speak_states (filename, function(timeout) {
			if (!timeout) {
				timeout = Config.speech.default_length * 1000;
				warn('Set default timeout Android speak:', (timeout.toString() + 's').yellow);
			} 
			
			info('Timeout Android speak:', (parseInt((((timeout * Config.speech.add_timeout_percent) / 100) + timeout) * 1000).toString() + 'ms').yellow); 
			if (qs.sync) {
				speak( tts, function() { 
					setTimeout(function(){
						if (qs.askme || qs.local)
							callback();
						else
							socket.emit('callback', callback);
					}, parseInt((((timeout * Config.speech.add_timeout_percent) / 100) + timeout ) * 1000));
				});
			} else
				speak(tts);
		});
	});
	
}

var options;
var Promise = require('q').Promise;	
var soundex   = require('./node_modules/soundex/soundex.js').soundex;
var clj_fuzzy = require('./node_modules/clj-fuzzy');
var askme = function(qs){
	
	if (!qs.tts) 
		return warn('Askme:', 'No tts'.yellow);
	
	// options askme
	qs.askme = true;
	qs.sync = true;
	// backup
	options = qs;
	
	mute();
	prepareSpeak (qs, function() { 
		start();
	});
}


function start() {
	var qs = {'cmd': 'askme'}; 
	remote(qs);	
}



function is_grammar(sentence, rules) {
	
	if (!sentence || !rules) {
		var qs = { 'cmd': 'askme_done'}; 
		remote(qs);
		options = null;
		warn('Empty rules for askme, exit...');
		return;
	}
	
	for (var i=0; i < rules.grammar.length; i++){
		if (sentence.toLowerCase() == rules.grammar[i].toLowerCase()) {
			return rules.tags[i];
		}
	}
	
	// dernière chance en distance de Levenshtein
	var sdx = soundex(sentence);
	var score = 0;
	var match;
	for (var i=0; i < rules.grammar.length; i++){
		var sdx_gram = soundex(rules.grammar[i]);
		var levens  = clj_fuzzy.metrics.levenshtein(sdx, sdx_gram);
        levens  = 1 - (levens / sdx_gram.length); 
		if (levens > score && levens >= Config.speech.threashold){
		  info('Levenshtein distance:', levens.toString().yellow, 'grammar:', rules.grammar[i].yellow);
		  score = levens;
		  match = rules.tags[i];
		}
	}	
	
	// Prise en compte du générique
	if (!match) {
		for (var i=0; i < rules.grammar.length; i++){
			if (rules.grammar[i] == '*') {
				info('Generic sentence:', sentence.toLowerCase().yellow);
				match = rules.tags[i] + ':' + sentence.toLowerCase();
				break;
			}
		}
	} 
	
	return match ? match : null;
	
}


function answer_askme (sentence) {
	
	getTag(sentence, options) 
	.then(function(tag) { 
		if (tag)
			socket.emit('answer', tag);
		else {
			var qs = {local: true, sync: true, tts: Config.locale[Config.speech.locale].restart};
			options = null;
			prepareSpeak(qs , function() {
				socket.emit('reset_token');
				start();
			});
		}
	})
	.catch(function(err) { 
		if (options) {
			var qs = { 'cmd': 'askme_done'}; 
			remote(qs);
			options = null;
		}
		error(err.red);
	})
		
}


function getTag(sentence, rules) {
	
	return new Promise(function (resolve, reject) {
	   socket.emit('reset_token');
	   var tag = is_grammar(sentence, rules);
	   return resolve (tag);
	
	});

}




var connect = exports.connect = function () {
	
	if (Config.client.length == 0) 
		return error('Unable to etablish a connection with Avatar server. No client name in property file'.red);

	var io = require('socket.io-client');
	var records = []; 
	
	socket = io.connect('http://' + Config.http.server.ip + ':' + Config.http.server.port, {forceNew: true , autoConnect: true, reconnection: true, reconnectionDelay: 3000})
		.on('connect_error', function(err) {
			warn("Avatar Server not started".red);
		})
		.on('connect', function() {
			socket.emit('client_connect', Config.client, Config.http.remote.ip, Config.http.remote.port, false);
		})
		.on('disconnect', function() {
			warn("Avatar Server gone".red);
		})
		.on('reconnect_attempt', function () { 
			info("Attempting to (re)connect to the Avatar Server...".yellow);
		})
		.on('connected', function() {
			info("Connected to Avatar Server on port", Config.http.server.port.toString().yellow);
		})
		.on('askme', function(qs) {
			options = null;
			askme(qs);	
		})
		.on('answer_askme', function (tts) {
			answer_askme(tts);
		})
		.on('stop_record', function() {
			info('stop_record');
			if (options) {
				var qs = { 'cmd': 'askme_done'}; 
				remote(qs);
				options = null;
			}
		})
		.on('askme_done', function() {
			info('askme done');
			if (options) {
				var qs = { 'cmd': 'askme_done'}; 
				remote(qs, function() { 
					unmute();
				});
				options = null;		
			}
		})
		.on('speak', function(qs, callback) {
			prepareSpeak (qs, callback);
		})
		.on('listen_again', function() {	
			var qs = { 'cmd': 'respeak'}; 
			remote(qs);
		})
		.on('client_speak', function(tts, callback) {
			prepareSpeak (tts, callback);
		})
		.on('callback_client_speak', function(callback) {
			if (callback) callback();
		})
		.on('end', function(full) {
			unmute();
		})
		.on('mute', function(qs, callback) {
			mute();
			if (qs.sync)
				socket.emit('callback', callback);
		})
		.on('start_listen', function() {
			var qs = {local: true, sync: true, tts: Config.locale[Config.speech.locale].tts_restoreContext};
			prepareSpeak(qs, function() { 
				var qs = { 'cmd': 'respeak'}; 
				remote(qs);
			});
		})
		.on('reset_volume', function(level_micro) {
			var qs = {local: true, sync: true, tts: Config.locale[Config.speech.locale].noWay};
			prepareSpeak(qs, function() { 
				var qs = { 'cmd': 'speak'}; 
				remote(qs);
			});
		}) 
		.on('speaker_volume', function(level_speaker) {
			var qs = {local: true, sync: true, tts: Config.locale[Config.speech.locale].noWay};
			prepareSpeak(qs, function() { 
				var qs = { 'cmd': 'speak'}; 
				remote(qs);
			});
		}) 
		.on('keyPress', function(qs) {
			var qs = {local: true, sync: true, tts: Config.locale[Config.speech.locale].noWay};
			prepareSpeak(qs, function() { 
				var qs = { 'cmd': 'speak'}; 
				remote(qs);
			});
		}) 
		.on('keyDown', function(qs) {
			var qs = {local: true, sync: true, tts: Config.locale[Config.speech.locale].noWay};
			prepareSpeak(qs, function() { 
				var qs = { 'cmd': 'speak'}; 
				remote(qs);
			});
		})
		.on('keyUp', function(qs) {
			var qs = {local: true, sync: true, tts: Config.locale[Config.speech.locale].noWay};
			prepareSpeak(qs, function() { 
				var qs = { 'cmd': 'speak'}; 
				remote(qs);
			});
		})
		.on('keyText', function(qs) {
			var qs = {local: true, sync: true, tts: Config.locale[Config.speech.locale].noWay};
			prepareSpeak(qs, function() { 
				var qs = { 'cmd': 'speak'}; 
				remote(qs);
			});
		})
		.on('activate', function(qs) {
			info('Action not managed for this client type'.yellow);
		})
		.on('stop', function(qs) {
			info('Action not managed for this client type'.yellow);
		})
		.on('play', function(qs, callback) {
			
			var webroot = path.resolve(__dirname);
			var filesrc;
			if(qs.play.indexOf('%TRANSFERT%') != -1) 
				filesrc = qs.play.replace('%TRANSFERT%', path.resolve(webroot + '/../../tts/' + Config.client) + '/transfert');	
			else if (qs.play.indexOf('%CD%') != -1) 
				filesrc = qs.play.replace('%CD%', path.resolve(__dirname));
			else
				filesrc = path.resolve(__dirname + '/' + qs.play);
			
			fs.ensureFile(filesrc, err => {
				if (err) {
				  error('Play:', err.red);
				  if (callback) socket.emit('callback', callback);
				  return;
				}
				
				fs.copy(filesrc, path.resolve(webroot + '/../../tts/' + Config.client) + "/speech.wav", err => {
					if (err) {
						error(err.red);
						if (callback) socket.emit('callback', callback);
						return;
					}

					var qs = {'cmd': 'speak'}; 
					if (qs.sync)
						remote(qs, function() { 
							socket.emit('callback', callback);
						});
					else
						remote(qs);
				});			
			});	
		})
		.on('run', function(qs) {
			var qs = {local: true, sync: true, tts: Config.locale[Config.speech.locale].noWay};
			prepareSpeak(qs, function() { 
				var qs = { 'cmd': 'speak'}; 
				remote(qs);
			});
		})
		.on('receive_data', function(qs, callback) {
			receiveStream (qs, function() { 
				if (qs.sync)
					socket.emit('callback', callback);
			}); 
		})
		.on('notts', function(qs) {
			var qs = {local: true, sync: true, tts: Config.locale[Config.speech.locale].noWay};
			prepareSpeak(qs, function() { 
				var qs = { 'cmd': 'speak'}; 
				remote(qs);
			});
		})
		.on('listen', function(qs) {
			var qs = {local: true, sync: true, tts: Config.locale[Config.speech.locale].noWay};
			prepareSpeak(qs, function() { 
				var qs = { 'cmd': 'speak'}; 
				remote(qs);
			});
		})
		.on('context', function(qs) {
			var qs = {local: true, sync: true, tts: Config.locale[Config.speech.locale].noWay};
			prepareSpeak(qs, function() { 
				var qs = { 'cmd': 'speak'}; 
				remote(qs);
			});
		})
		.on('grammar', function(qs) {
			var qs = {local: true, sync: true, tts: Config.locale[Config.speech.locale].noWay};
			prepareSpeak(qs, function() { 
				var qs = { 'cmd': 'speak'}; 
				remote(qs);
			});
		})
		.on('intercom', function(to) {
			var qs = {local: true, sync: true, tts: Config.locale[Config.speech.locale].noWay};
			prepareSpeak(qs, function() { 
				var qs = { 'cmd': 'speak'}; 
				remote(qs);
			});
		})
		.on('init_intercom', function(from) {
			info('Receive intercom from', from.yellow);
			records = []; 
		})
		.on('send_intercom', function(from, data) {
			if (data === 'end') {
				if (records){ 
					if (!Avatar.Socket.isServerSpeak(Config.client)) {
					//if (!Config.speech.server_speak) {
						var file = get_wavfile(from);
						fs.writeFile(file, toBuffer(records));
						clean_wav(from, function (wav) {
				
							var qs = { 
							'cmd'  : 'speak',
							};
							remote(qs);    
						});
					} else {
						socket.emit('play_intercom', records, from);
					}	
				} else {
					info('no intercom file from', from);
				}
			
			} else {
				records.push(data);
			}
		});

}


function normalize(folder) {
	
	
	return path.normalize(folder)
		.replace(path.parse(folder)
		.root, path.sep)
		.split( path.sep)
		.join('/');
	
}



function get_wavfile(from) {
	
	var dir = path.normalize(__dirname)
				.replace(path.parse(__dirname)
				.root, path.sep)
				.split( path.sep)
				.join('/') + '/intercom';
	fs.ensureDirSync(dir);
	dir += '/intercom-from-'+from+'.wav'
	
	return dir;
		
}



var streamBuffers = require('stream-buffers');
var toBuffer = function(records){
  var osb = new streamBuffers.WritableStreamBuffer({
    initialSize: (100 * 1024),   // start at 100 kilobytes.
    incrementAmount: (10 * 1024) // grow by 10 kilobytes each time buffer overflows.
  });
  for(var i = 0 ; i < records.length ; i++) {
    osb.write(new Buffer(records[i], 'binary'));
  }
  osb.end();
  return osb.getContents();
}



function clean_wav (from, callback) {
	
	var dir = path.normalize(__dirname)
				.replace(path.parse(__dirname)
				.root, path.sep)
				.split( path.sep)
				.join('/') + '/intercom';
	var wav = dir + '/intercom-from-'+from+'.wav'
	var wav_clean = dir + '/intercom-from-'+from+'-clean.wav'
	var webroot = path.resolve(__dirname);
	var cmd = webroot + '/bin/sox -q ' + wav + ' ' + wav_clean;
	var exec = require('child_process').exec;
	var child = exec(cmd, function (err, stdout, stderr) {
		if (err) { 
			error('Sox error:', err.red || 'Unable to start Sox'.red);
		} 
	});
	
	if (child)
		child.stdout.on("close", function() {
			setTimeout(function(){								
				try {
					callback(wav_clean);
				} catch(ex){ 
					error("error: " + ex.message.red); 
				}
			}, 200);
		});
	
}



var receiveStream = function (data, callback) {
	
	var webroot = path.resolve(__dirname);
	var dir = path.resolve(webroot + '/../../tts/' + Config.client + '/transfert/');
	fs.ensureDirSync(dir);
	
	ss = require('socket.io-stream');
	var stream = ss.createStream(); 
	ss(socket).emit('get_data', data.src, stream); 

	stream.pipe(fs.createOutputStream(webroot + '/../../tts/' + Config.client + '/transfert/' + data.dest));
	
	stream.on('end', function (data) {
		callback ();
	});
	
}



var mute = function () {
	socket.emit('mute');
}


var unmute = function () {
	
	socket.emit('unmute');

}
