var extend  = require('extend')
	, fs  = require('fs-extra')
	, path   = require('path')
	 _ = require('underscore');
	 
var ROOT   = path.normalize(__dirname);
var CLIENTS = path.normalize(ROOT+'/clients');
var Config = [];

require('colors');

exports.init = function(){
	
	Config = loadClients();
	
	var appPath = require('path');
	var express = require('express');
	fs.ensureDirSync(appPath.resolve(ROOT + '/tts'));
	app.use(express.static(appPath.resolve('./plugins/android/tts')));

}


exports.action = function(data, callback){
	
	var tblCommand = {
		// Search for actions
		searchClientActions : function() {
			if (data.action.res) {
				var groupCommands = {"Groups": {}};
				for (properties in Config) {
					if (Config[properties].client == data.client && Config[properties].navigation_cmds) {
						groupCommands.Groups = Config[properties].navigation_cmds;
						break;
					}
				}
				data.action.res.json(groupCommands);
			}
		},
		listen_stop_gracefully: function() {
			for (properties in Config) {
				if (Config[properties].client == data.client) {
					Avatar.speak(Config[properties].locale[Config[properties].speech.locale].stop_listen_gracefully, data.client, function(){ 
						Avatar.Speech.end(data.client);
				   });
				   break;
				}
			}
		},
		listen_stop: function() {
			for (properties in Config) {
				if (Config[properties].client == data.client) {
					Avatar.speak(Config[properties].locale[Config[properties].speech.locale].stop_listen, data.client, function(){ 
						Avatar.Speech.end(data.client);
				   });
				   break;
				}
			}
		},
		listen: function() {
			Avatar.ia.action(data.action.speech, data.client);
		},
		askme: function() {
			var socketClient = Avatar.Socket.getClientSocket(data.client);
			if (!socketClient) return error('askme end:', ('Unable to find Android client ' + client).red);
			socketClient.emit('answer_askme', data.action.speech);
		}
	};
	
	info("Android command:", data.action.command.yellow, "From:", data.client.yellow);
	tblCommand[data.action.command]();
	
	return callback();
}



var loadClients = function(folder, json){ 
  var json   = json   || [];
  var folder = folder || CLIENTS;

  if (!fs.existsSync(folder)) { return json; } 
  
  fs.readdirSync(folder).forEach(function(file){
    var path = folder+'/'+file;
 
    // Not client directory
    if (!fs.statSync(path).isDirectory()){
      loadClients(path, json);
      return json;
    }
	
	// client directory
	if (fs.statSync(path).isDirectory()){
		fs.readdirSync(path).forEach(function(file){
		
			// client properties
			if (file.endsWith('.ini')){
			  info('Client properties:', file);
			  try {	
				var load   =  fs.readFileSync(path+'/'+file,'utf8');
				var properties = JSON.parse(load);	
				
				if (properties.client.length == 0)
					error('No client name in android client properties'.red);
				else {
			
					info('%s android client master plans ...'.yellow, properties.client);
					json.push(properties);
					
					// client js
					var Android_client = require(path +	 '/client.js');
					Android_client.init(properties);
					Android_client.connect();
				}
			  } catch(ex) { error('Error in %s: %s', file, ex.message); }
			}
		})
	}
  });
  
  return json;
  
}
