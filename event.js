"use strict";

var Socket = require("./socket");

var p = require('./p');
var mongo = require("./mongoController");

const eventName = {
	STARTCONTAINER : 'StartContainer',
	STOPCONTAINER: 'StopContainer'
}
var defaultDocker = require("./docker")();

var eventLists = function(io){
  io.on('connection', onConnect);
  // // force client disconnect from server
  io.on('forceDisconnect', function(socket) {
      socket.disconnect();
  })

  io.on('disconnect', function(socket) {
      console.log('user disconnected: ' + socket.name);
  });

};
  // console.log(io);
  //  io.on('connection', function(socket) {
  function onConnect(socket) {

        var server = new Socket(socket);

        container(server);
        network(server);
        image(server)
        volume(server);
        dockerfile(server);
				terminal(server);
				settings(server);
				swarm(server);
				node(server);
				service(server);
				task(server);
  }

  var container = function(server){
		server.listen('CreateContainer', function(data, fn){
				 p.container.create(data, fn);
		});
      server.listen('StartContainer', function(data, fn){
           p.container.start(data, fn);
      });

      server.listen("StopContainer", function(data, fn){
           p.container.stop(data, fn);
      });

      server.listen("RemoveContainer", function(data, fn){
          p.container.remove(data, fn);
      });
      server.listen("KillContainer", function(data, fn){
          p.container.kill(data, fn);
      });
      server.listen("PauseContainer", function(data, fn){
          p.container.pause(data, fn);
      });
      server.listen("UnpauseContainer", function(data, fn){
          p.container.unpause(data, fn);
      });
      server.listen("StatsContainer", function(data, fn){
          p.container.stats(data, fn);
      });
      server.listen("ArchiveContainer", function(data, fn){
          p.container.getArchive(data, fn);
      });
  };
  // });


var network = function(server){

    server.listen("ConnectNetwork", function(data, fn){
          p.network.connect(data, fn);
    });

    server.listen("DisconnectNetwork", function(data, fn){
          p.network.disconnect(data, fn);
    });

    server.listen('CreateNetwork', function(data, fn) {
        p.network.create(data, fn);
    });

    server.listen('RemoveNetwork', function(data, fn) {
          p.network.remove(data, fn);
    });
};

var image = function(server){
  server.listen("SearchImages", function(data, fn){
     p.image.search(data, fn);
   });

   server.listen("PullImages", function(data, fn) {
		 			console.log(data);
         p.image.create(data,
         function(err, stream) {
					 console.log(stream);
           if (err) return console.log(err);
					 var docker = require("./docker")();
					 console.log(server);
           docker.modem.followProgress(stream, onFinished, onProgress);

            function onFinished(err, output) {
              console.log("onFinished");
              server.sendEvent("progress", true);

            }
            function onProgress(event) {
							   console.log(event);
                 server.sendEvent("progress", event);
             }
         });
     });

     server.listen("RemoveImages", function(data, fn) {
       p.image.remove(data, fn);
     });

		 server.listen("PushImages", function(data, fn) {
			 p.image.push(data, fn);
		 });
};

var volume = function(server){

     server.listen("CreateVolume", function(data, fn){
          p.volume.create(data, fn);
    });

     server.listen("RemoveVolume", function(data, fn){
        p.volume.remove(data, fn);
    });
};


var dockerfile = function(server) {
  var fs = require('fs');
  var path = require('path');

  server.listen("ReadFile", function(data, fn){
    var readFilePath = path.join(data);
    fs.readFile(readFilePath, 'utf8', (err, data) => {
       if (err) throw fn(err);
       fn(data);
     });
  });

  server.listen("CreateFile", function(data, fn){
   var jsonPath = path.join(data.path, data.name);
	 var space  = ""
    fs.writeFile(jsonPath, space, 'utf8', function(err) {
        // fn(true);
    });
  });

	server.listen("CreateDirectory", function(data, fn){
		var jsonPath = path.join(data.path, data.name);
    fs.mkdir(jsonPath, function(err) {
        // fn(true);
    });
  });



  server.listen("UpdateFile", function(data, fn){
   var jsonPath = path.join(data.path);

    fs.writeFile(jsonPath, data.context, 'utf8', function(err) {
        fn(true);
    });
  });

  var rmdir = function(dir) {
  	var list = fs.readdirSync(dir);
  	for(var i = 0; i < list.length; i++) {
  		var filename = path.join(dir, list[i]);
  		var stat = fs.statSync(filename);

  		if(filename == "." || filename == "..") {
  			// pass these files
  		} else if(stat.isDirectory()) {
  			// rmdir recursively
  			rmdir(filename);
  		} else {
  			// rm fiilename
  			fs.unlinkSync(filename);
  		}
  	}
  	fs.rmdirSync(dir);
  };

  server.listen("RemoveFile", function(data, fn){
    var jsonPath = path.join(data.path);
      if(data.type === "file"){
        fs.unlink(jsonPath);
      }else if(data.type === "directory"){
        rmdir(jsonPath);
      }
      fn(true);
  });

	server.listen("RenameFile", function(data, fn){
		var origin = path.join(data.origin);
   	var renew = path.join(data.renew);

    fs.rename(origin, renew, function(err) {
        // fn(true);
    });
  });

  server.listen("build", function(data, fn){
    console.log(data);
    p.image.build(data, function(err, stream) {
			if(err) return fn(err);
					// console.log(stream);
					// 	var docker = require("./docker")();

						var docker = require("./docker")();
						// console.log(server);
						docker.modem.followProgress(stream, onFinished, onProgress);

						 function onFinished(err, output) {
							 console.log("onFinished");
							 server.sendEvent("buildingImage", true);

						 }
						 function onProgress(event) {
							 console.log(event);
									server.sendEvent("buildingImage", event);
							}
  				});
    	fn(true);
  });


	      function jstreeList(json, parentid, leafs){
	          if (json === null) {
	            // console.log("done");
	            return null;
	          }
	          if( arguments.length === 2 ){
	            var lists = [];
	          }else {
	            var lists = leafs;
	          }
	          var ID = function () {
	            return '_' + Math.random().toString(36).substr(2, 9);
	          };
	          // console.log(JSON.stringify(json));
	              var tree = function (id, text, parent, path) {

	              function getDepth(path) {
	                var splitPath = path.split("/");

	                return splitPath.filter((val)=>{if(val) {return val;}}).length;
	              }

	                var id = null;
	                var text = null;
	                var parent = null;
	                var type = null;
	                var path = null;
	                var depth = null;
	                var getLeaf = function() {
	                    return { id : id, text : text, parent : parent, type : type, path : path, depth : depth};
	                }
	                var setLeaf = function(_id, _text, _parent, _type, _path) {
	                       id = _id;
	                       text = _text;
	                       parent = _parent;
	                       type = _type;
	                       path = _path;
	                       depth = getDepth(_path);
	                       return getLeaf();
	                }
	                var getId = function () {
	                  return id;
	                }
	                return { getLeaf : getLeaf, setLeaf : setLeaf ,getId : getId };
	            }();

	        if(parentid === null) {
	            // var splitPath = json.path.split("/").filter((val)=>{if(val) {return val;}});
	            // splitPath.pop();
	            // var parentPath = splitPath.join("/");
	            var parentPath = path.dirname(json.path);
	            var parentDir = tree.setLeaf(ID(".."), "..","#", "directory", parentPath);
	            // console.log(data.getId());
	            // console.log(parentDir);
	            var id = ID(json.name);
	            var workingDir = tree.setLeaf(id, json.name,"#", "directory", json.path);

	            lists.push(parentDir);
	            lists.push(workingDir);
	            var parentid = tree.getId();

	        }

	        var child = json.children;
	        if(typeof child === undefined) {
	          // console.log("no have child");
	          return null;
	        }

	        for(var i in child) {
	          var leaf = tree.setLeaf(ID(child[i].name), child[i].name, parentid, child[i].type , child[i].path);
	          // var leafNode = data.getLeaf();
	          if(child[i].hasOwnProperty("extension")){
	            leaf.icon = "glyphicon glyphicon-file"
	          }
	          lists.push(leaf);
	          jstreeList(child[i], tree.getId(), lists);

	        }
	        return lists;
	      }
	//
	//       /////////////////////////////////////// js tree
	        server.listen('dirtree', function(data, fn) {

	        const PATH = require('path');
	        const dirTree = require('directory-tree');
	        var tree = null;
					var home = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
					var workspace = path.join(home, "dockerfile");

					if(fs.existsSync(workspace)){
					}else {
						fs.mkdir(workspace, function(err) {
							// fn(true);
						});
					}
	        if (data === ""){

	          tree = dirTree(workspace, { exclude:/^\./  } );
	          // tree = dirTree(home, { exclude:/^\./ , extensions:/\W/ } ); file only
	        } else if (data  !== null){

						if( (data) === home){
							tree = dirTree(workspace, { exclude:/^\./ } );
						}else {
							tree = dirTree(data, { exclude:/^\./ } );
						}
						// console.log(path.dirname(data) === path.join(home));
	        }
	        var lists = jstreeList(tree, null);
	        // console.log(lists);
	        fn(lists);
	      });
}

var terminal = function (server) {
		var spawn = require('child_process').spawn;
	 var shell = spawn('/bin/bash');
	 var stdin = shell.stdin;
	//  console.log(server);
	 shell.on('exit', function (c, s){
	   console.log(c);
	   console.log(s);
	 });

	  shell.on('close', function (c, s){
	    console.log(c);
	  });

	 shell['stdout'].setEncoding('ascii');
	 shell['stdout'].on('data', function(data) {
	   server.sendEvent('stdout', data);
	 });

	 shell['stderr'].setEncoding('ascii');
	 shell['stderr'].on('data', function(data) {
	   server.sendEvent('stderr', data);
	 });


	 server.listen('stdin', function(command) {
	   stdin.write(command+"\n") || server.sendEvent('disable');
	 });

	 stdin.on('drain', function() {
	   server.sendEvent('enable');
	 });

	 stdin.on('error', function(exception) {
	   server.sendEvent('error', String(exception));
	 });

}

var settings = function(server){
	server.listen('PING', function(data, fn) {

			p.settings.ping(data, (err, data)=> {
				fn({err : err, data: data});
			});

	});

	server.listen('DELETE', function(data, fn) {

			p.settings.delete(data, fn);

	});
	function getServerIp() {
			var os = require("os");
			var ifaces = os.networkInterfaces();
			var result = '';
			for (var dev in ifaces) {
					var alias = 0;
					if(dev === "eth0"){
						ifaces[dev].forEach(function(details) {
							if (details.family == 'IPv4' && details.internal === false) {
								result = details.address;
								++alias;
							}
						});
					}
			}

			return result;
	}
	server.listen('IsConnected', function(data, fn) {


			if(data.ip === getServerIp() || data.ip === "default" ) {
				var docker = defaultDocker;
				fn(true);
			}else {
				mongo.docker.find({"ip" : data.ip}, (result)=>{

					var opts = {
						"host" : result.ip,
						"port" : result.port
					}
					p.settings.ping(opts, (err, data)=> {
						fn({err : err, data: data});
					});
				});
			}
	});

	server.listen('ConnectDocker', function(data, fn) {

		// console.log(getServerIp());
		var type = (data.docker);
		console.log(data);
		if(data.ip === getServerIp()) {
			var docker = defaultDocker;
			p[data.docker].docker = docker;
			fn(true);
		}else {
			mongo.docker.find({"ip" : data.ip}, (result)=>{
				var opts = {
					"host" : result.ip,
					"port" : result.port
				}
				p.settings.ping(opts, (err, data)=> {
					// fn({err : err, data: data});
					console.log(err);
					console.log(data);
					if(err !== null) {
						return fn({err : err.code});
					}else {
						var docker = p.settings.setDocker(opts);
						p[type].docker = docker;
						return fn(true);
					}
				});
				// fn(true);
			});
		}
	});

	server.listen('GetThisDocker', function(data, fn) {
		var docker = (p[data.docker].getDocker()).modem;
		var whoisDocker = null;
		if(docker.socketPath !== undefined){
					// console.log("default");
					whoisDocker = "default";
		}else if(docker.host !== undefined){
			// console.log("remote");
			whoisDocker = docker.host;
		}
		// console.log(docker.modem);
		// // console.log(p[data.docker].getDocker().socketPath);
		// // console.log(p[data.docker].getDocker().host);
		fn(whoisDocker);
	});

	server.listen('authCheck', function(data, fn) {
		p.settings.authCheck(data, fn);
	});
}



var swarm = function(server){

	function getServerIp() {
			var os = require("os");
			var ifaces = os.networkInterfaces();
			var result = '';
			for (var dev in ifaces) {
					var alias = 0;
					if(dev === "eth0"){
						ifaces[dev].forEach(function(details) {
							if (details.family == 'IPv4' && details.internal === false) {
								result = details.address;
								++alias;
							}
						});
					}
			}

			return result;
	}


	server.listen("swarmInit", function(data , fn){
		if(typeof data === "number"){
			var port = data;
		}else {
			port = "2377"
		}
	  var ip = getServerIp();
	  var opts = {
			"AdvertiseAddr" : ip,
	    "ListenAddr" :   "0.0.0.0:"+ data,
	    "ForceNewCluster" : true
	  };

	  p.swarm.create(opts).then(()=>{
			p.swarm.getToken().then((result)=>{
				mongo.system.destroy();
				mongo.system.save({ "swarmPort" : data,
				"swarmIP" : ip,
				"token" : {
					worker : result.JoinTokens.Worker,
					manager : result.JoinTokens.Manager
				}
			});
		});

	}).catch((err)=>{
		console.log(err);
	});
		// token : {
	  //   manager : String,
	  //   worker : String
	  // }
	});

	server.listen("swarmLeave", function(data, fn){
		var opts = {force : data};
		p.swarm.leave(opts, fn);
	});

	server.listen("swarmJoin", function(data, fn){
		p.swarm.join(data, fn);
	});

	server.listen("throwNode", function(data, fn){
		p.swarm.throwNode(data, fn);
	});
}

var node = function(server){
	// server.listen("StartNode", function(data, fn){
	// 	// var opts = {force : data};
	// 	// console.log(data);
	// 	p.node.start(data);
	// 	// mongo.system.show();
	// 	// p.node.start(data, fn);
	// 	// mongo.system.find()
	// });

	server.listen("StopNode", function(data, fn){
		// var opts = {force : data};
		// console.log(data);
		// p.swarm.throwNode(data, fn);
	});

	server.listen("RemoveNode", function(data, fn){
		p.node.remove(data, fn);
	});

	server.listen("UpdateNode", function(data, fn){
		p.node.update(data, fn);
	});
};

var service = function(server){

	server.listen("CreateService", function(data, fn){
		p.service.create(data, fn);
	});

	server.listen("RemoveService", function(data, fn){
		p.service.remove(data, fn);
	});

	server.listen("UpdateService", function(data, fn){
		// p.service.remove(data, fn);
		console.log(data);
	});
}

var task = function(server){
	// server.listen("")
}


module.exports = eventLists;