
var mongo = require("./mongoController.js");

  var p = function( docker){
    this.docker = docker; /// docker modem 겍체 설정
    this.getInfo = null; /// docker get method 설정
    this.getLists = null; /// docker getlists method 설정
    this.attr = null; /// docker key attr 설정
    this.remoteDocker = null; /// 원격 docker 설정
  };

  (function(){ //// this =  p.prototype
    var self = this;

    /** @method  - successCallback
    *  @description promise 성공 시 callback
    *  @param {Function} callback - 콜백 함수
    *  @param {Object} data - promise 데이터
    *  @return {Function} callback - 콜백 함수
    */
    this.successCallback = function (callback, data){
      console.log("success");
      // console.log(arguments);
      // console.log(data);
      var result = {
        "state" : true,
        "statusCode" : 200,
        "msg" : data
      };
      return callback(result);
    };

    /** @method  - failureCallback
    *  @description promise 실패 시 callback
    *  @param {Function} callback - 콜백 함수
    *  @param {Object} data - promise 데이터
    *  @return {Function} callback - 콜백 함수
    */
    this.failureCallback = function (callback, err){
      console.log("failed");
      console.log(err);
      var result = {
        "state" : false ,
        "statusCode" : err.statusCode,
        "msg" : err.json.message,
        "error" : err.reason
      }
      return callback(result);
    };


    /** @method  - get
    *  @description 실행할 Promise를 GET함
    *  @param {Object} data - promise 데이터
    *  @param {Object} opts - docker 실행 시 필요한 옵션
    *  @param {String} method - docker에서 실행할 메소드
    *  @return {Array} lists - Promise Array
    */
    this.get = function (data, opts, method) {
      var self = this;
      var hasOpts = true;
      var hasGetInfo = false;
      if(self.hasOwnProperty("getInfo")){
        hasGetInfo = true;
      }
      if(arguments.length === 2) {
        method = opts;
        opts = null;
        hasOpts = false;
      }
      var list = [];

      for(var i in data) {
        if(hasGetInfo){  /// getInfo 있는지 여부
          var dockerInfo = self.docker[self.getInfo](data[i][(self.attr)]);
        }else {
          return ;
        }
        if(hasOpts){ /// opts 있는지 여부
          list.push( new Promise(function (resolve, reject) {
            resolve(dockerInfo[method](opts) );
          }));
        }else {
          list.push( new Promise(function (resolve, reject) {
            resolve(dockerInfo[method]() );
          }));
        }
      };
      return list;
    };

    /** @method  - dockerPromiseEvent
    *  @description Promise 실행한다. 이때 전부 성공 시  Event는 successCallback, 하나 이상의 실패가 발생 시 failureCallback
    *  @param {Object} promiselist - 실행할 promise 목록
    *  @param {Function} callback - client로 보낼 콜백함수
    *  @return {Object} Promise
    */
    this.dockerPromiseEvent = function(promiselist, callback) {
        return Promise.all(promiselist).then(this.successCallback.bind(null, callback) , this.failureCallback.bind(null, callback));
    }


    /** @method  - doTask
    *  @description parameter에 따라 get 과 dockerPromiseEvent를 호출한다.
    *  @param {Object} data - 실행할 promise 목록
    *  @param {Function} callback - client로 보낼 콜백함수
    *  @param {Object} opts - docker 실행 시 필요한 옵션
    *  @param {String} method - 실행할 메소드
    *  @return {Function} callback - client로 보낼 콜백함수
    */
    this.doTask = function(data, callback, opts, method){
      var self = this ;

      var promiseList = null;
      if(arguments.length === 3){
        method = opts;
        opts = null;
        promiseList = self.get(data, method);
      }else {
        promiseList = self.get(data, opts, method);
      }
      return self.dockerPromiseEvent(promiseList, callback);
    };

    /** @method  - getAllLists
    *  @description self.getLists 와 opts에 따라 promise 생성 후 리턴
    *  @param {Object} opts - docker 실행 시 필요한 옵션
    *  @param {Function} callback - client로 보낼 콜백함수
    *  @return {Function} callback - res로 보낼 콜백함수
    */
    this.getAllLists = function (opts, successCallback, failCallback){
      var self = this;

      if(self.getLists !== null){
        var dockerInfo = self.docker[self.getLists](opts);
      }
      return new Promise(function(resolve, reject){
        resolve(dockerInfo);
      }).then(successCallback, failCallback);


    };

    /** @method  - setRemoteDocker
    *  @description 다른 호스트의 도커에 접속하기 위한 값 설정, p 객체에 remotedocker SET
    *  @param {Object} config - 원격 docker 접속 시 필요한 옵션
    */
    this.setRemoteDocker = function (config) {
      this.remoteDocker = require("./docker")(config);
    }

    /** @method  - setDocker
    *  @description 다른 호스트의 도커에 접속하기 위한 값 설정
    *  @return {Object} 원격 docker 리턴
    */
    this.setDocker = function (config) {
      // this.docker = require("./docker")(data);
      return require("./docker")(config);
    }

    /** @method  - getDocker
    *  @description docker modem 객체 GET
    *  @return {Object} docker modem 객체
    */
    this.getDocker = function () {
      // this.docker = require("./docker")(data);
      return this.docker;
    }

  }).call(p.prototype);

  var docker = require("./docker")();

  var test = new p(docker);

   var container = Object.create(test);

   (function(){
     var self = this;
     self.getInfo = "getContainer";
     self.getLists = "listContainers";
     self.attr = "Id";

     /** @method  - create
     *  @description docker container 생성
     *  @param {Object} data - 설정 데이터
     *  @param {Function} callback - 클라이언트로 보낼 callback
     *  @return {Object} docker.createContainer
     */
     self.create = function (data, callback) {
      //  console.log(data);
       return (self.docker).createContainer(data).then(self.successCallback.bind(self, callback) , self.failureCallback.bind(self, callback));
     }

     /** @method  - start
     *  @description docker container 시작
     *  @param {Object} data - 설정 데이터
     *  @param {Function} callback - 클라이언트로 보낼 callback
     *  @return {Function} doTask
     */
     self.start  = function (data, callback) {
       return self.doTask(data, callback, "start");
     }

     /** @method  - stop
     *  @description docker container 멈춤
     *  @param {Object} data - 설정 데이터
     *  @param {Function} callback - 클라이언트로 보낼 callback
     *  @return {Function} doTask
     */
     self.stop =  function (data, callback) {
       return self.doTask(data, callback, "stop");
     }

     /** @method  - remove
     *  @description docker container 삭제
     *  @param {Object} data - 설정 데이터
     *  @param {Function} callback - 클라이언트로 보낼 callback
     *  @return {Function} doTask
     */
     self.remove = function (data, callback) {
       return self.doTask(data, callback, "remove");
     }

     /** @method  - kill
     *  @description docker container kill
     *  @param {Object} data - 설정 데이터
     *  @param {Function} callback - 클라이언트로 보낼 callback
     *  @return {Function} doTask
     */
     self.kill = function (data, callback) {
       return self.doTask(data, callback, "kill");
     }

     /** @method  - getArchive
     *  @description docker container getArchive
     *  @param {Object} data - 설정 데이터
     *  @param {Function} callback - 클라이언트로 보낼 callback
     *  @return {Function} doTask
     */
     self.getArchive = function (data, callback) {
       return self.doTask(data, callback, "getArchive");
     }

     /** @method  - pause
     *  @description docker container 정지
     *  @param {Object} data - 설정 데이터
     *  @param {Function} callback - 클라이언트로 보낼 callback
     *  @return {Function} doTask
     */
     self.pause = function (data, callback) {
       return self.doTask(data, callback, "pause");
     }

     /** @method  - unpause
     *  @description docker container 정지 해제
     *  @param {Object} data - 설정 데이터
     *  @param {Function} callback - 클라이언트로 보낼 callback
     *  @return {Function} doTask
     */
     self.unpause = function (data, callback) {
       return self.doTask(data, callback, "unpause");
     }

     /** @method  - stats
     *  @description docker container stats GET
     *  @param {Object} data - 설정 데이터
     *  @param {Function} callback - 클라이언트로 보낼 callback
     *  @return {object} Promise
     */
     self.stats = function (data, callback) {
       var container = (self.docker).getContainer(data);

       return new Promise(function (resolve, reject) {
         resolve(container.stats({"stream": false}));
       }).then(callback);
     }

     /** @method  - top
     *  @description docker container top GET
     *  @param {Object} data - 설정 데이터
     *  @param {Function} callback - 클라이언트로 보낼 callback
     *  @return {object} Promise
     */
     self.top = function (data, callback){
       var container = (self.docker).getContainer(data);
       return new Promise(function (resolve, reject) {
         resolve(container.top ({"ps_args": "aux"}));
       }).then(callback);
     };

     /** @method  - logs
     *  @description docker container logs GET
     *  @param {Object} data - 설정 데이터
     *  @param {Function} callback - 클라이언트로 보낼 callback
     *  @return {object} Promise
     */
     self.logs = function (data, callback){
       var container = self.docker.getContainer(data);
       return new Promise(function (resolve, reject) {
         //  "follow" : true, , "stderr": true
         container.logs ({ "stdout" : true}).then((data)=>{
           console.log(data);
         });
         resolve(container.logs ({ "stdout" : true}));
       });
     }

   }).call(container);

   var network = Object.create(test);

   (function(){
     var self = this;
     self.getInfo = "getNetwork";
     self.getLists = "listNetworks";
     self.attr = "Id"

     /** @method  - logs
     *  @description p.get overwrite EndpointConfig.NetworkID 추가 설정을 위함
     *  @param {Object} data - promise 데이터
     *  @param {Object} opts - docker 실행 시 필요한 옵션
     *  @param {String} callback - docker 메소드
     *  @return {Array} lists - Promise Array
     */
     self.get = function ( data, opts, method) {
       if(arguments.length === 2) {
         method = opts;
         opts = null;
       }
       var list = [];
       var self = this;

       for(var i in data) {

         var dockerInfo = docker[self.getInfo](data[i][self.attr]);
         if(opts !== null && opts.EndpointConfig){
           opts.EndpointConfig.NetworkID = data[i].Id;
         }
         list.push( new Promise(function (resolve, reject) {
           resolve(dockerInfo[method](opts) );
         }));
       };
       return list;
     };


     /** @method  - create
     *  @description network 생성
     *  @param {Object} data - 설정 데이터
     *  @param {Function} callback - 클라이언트로 보낼 callback
     *  @return {object} Promise
     */
     self.create = function (data, callback) {
       return (self.docker).createNetwork(data).then(self.successCallback.bind(self, callback) , self.failureCallback.bind(self, callback));
     }

     /** @method  - remove
     *  @description network 제거
     *  @param {Object} data - 설정 데이터
     *  @param {Function} callback - 클라이언트로 보낼 callback
     *  @return {object} Promise
     */
     self.remove =  function (data, callback) {
       self.doTask(data, callback, "remove");
     }

     /** @method  - connect
     *  @description network에 container 연결
     *  @param {Object} data - 설정 데이터
     *  @param {Function} callback - 클라이언트로 보낼 callback
     *  @return {object} Promise
     */
     self.connect =  function (data, callback) {

       var lists = data.checkedRowLists;
       var container = (data.opts.container);
       var opts = {
         "Container" : container,
         "EndpointConfig" : {"NetworkID" : ""}
       };
      //  console.log(opts);
       var promiseList = self.get( lists, opts, "connect");
       return self.dockerPromiseEvent(promiseList, callback);

     }

     /** @method  - disconnect
     *  @description network에 container 연결 해제
     *  @param {Object} data - 설정 데이터
     *  @param {Function} callback - 클라이언트로 보낼 callback
     *  @return {object} Promise
     */
     self.disconnect =  function (data, callback) {

       var lists = data.checkedRowLists;
       var opts = data.opts;

       var promiseList = self.get( lists, opts, "disconnect");
       return  self.dockerPromiseEvent(promiseList, callback);

     };

   }).call(network);


  var image = Object.create(test);

  (function(){
    var self = this;
    self.getInfo = "getImage";
    self.getLists = "listImages";
    self.attr = "Id";

    /** @method  - search
    *  @description hub.docker.com에 있는 이미지 검색
    *  @param {Object} filters - 검색할 데이터
    *  @param {Function} callback - 클라이언트로 보낼 callback
    *  @return {object} Promise
    */
    self.search =  function (filters, callback) {
      return (self.docker).searchImages(filters).then(self.successCallback.bind(self, callback) , self.failureCallback.bind(self, callback));
    };

    /** @method  - remove
    *  @description 이미지 제거
    *  @param {Object} data - 설정 데이터
    *  @param {Function} callback - 클라이언트로 보낼 callback
    *  @return {Function} doTask
    */
    self.remove = function (data, callback) {
      return self.doTask(data, callback,  "remove");
    };


    /** @method  - push
    *  @description docker 레퍼지토리에 이미지 올림
    *  @param {Object} data - 설정 데이터
    *  @param {Function} callback - 클라이언트로 보낼 callback
    *  @return {Function} doTask
    */
      self.push = function (opts, callback) {
          if(opts){
            var image = self.docker.getImage(opts.name);
            mongo.auth.show((result)=>{
              var auth = (result[0]);

              // return new Promise(function(resolve, reject){
              // resolve(image.push(opts, undefined,auth))
              image.push(opts,
                  function(err, stream) {
                    // console.log(stream);
                    if (err) return self.failureCallback(callback, err) ;
                    // var docker = require("./docker")();
                    self.docker.modem.followProgress(stream, onFinished, onProgress);

                    function onFinished(err, output) {
                      console.log("onFinished");
                      return self.successCallback(callback, output);
                    }
                    function onProgress(event) {
                      // console.log("onProgress");
                      // console.log(event);
                    }
                  },

                auth);

            });
          }
        //  self.doTask(data, callback, opts ,"push");
      };

      /** @method  - create
      *  @description 이미지 다운로드
      *  @param {Object} data - 설정 데이터
      *  @param {Function} callback - 클라이언트로 보낼 callback
      */
      self.create = function (data,  callback) {
        data.forEach( (images) => {
          (self.docker).createImage({ "fromImage" : images.name , "tag" : "latest"}, callback);
        });
      };

      /** @method  - build
      *  @description 이미지 빌드
      *  @param {Object} data - 설정 데이터
      *  @param {Function} callback - 클라이언트로 보낼 callback
      *  @return {Function} doTask
      */
      self.build = function(data, callback) {
        var path = require("path");

        var filePath = data.path + ".tgz";
        var fileName = path.basename(data.path);
        var dirPath = path.dirname(filePath);
        var imageTag = data.imageTag;
        if(imageTag === null || imageTag === "") {
          imageTag = "default"
        }

        console.log(dirPath);
        console.log(imageTag);
      return  (self.docker).buildImage( {
          context :  dirPath,
          src : [fileName]
        }, {
          "dockerfile" : fileName,
          "t" : imageTag.toString()
        }, callback);

      };

  }).call(image);


    var volume = Object.create(test);
    (function(){ /// this =  volume
      var self = this;
      self.getInfo = "getVolume";
      self.getLists = "listVolumes";
      self.attr = "Name";

      /** @method  - create
      *  @description volume create
      *  @param {Object} data - 설정 데이터
      *  @param {Function} callback - 클라이언트로 보낼 callback
      *  @return {Object} Promise
      */
      self.create =  function (data, callback) {
        return (self.docker).createVolume(data).then(self.successCallback.bind(self, callback) , self.failureCallback.bind(self, callback));
      }

      /** @method  - remove
      *  @description volume remove
      *  @param {Object} data - 설정 데이터
      *  @param {Function} callback - 클라이언트로 보낼 callback
      *  @return {Object} Promise
      */
      self.remove = function (data, callback) {
        return self.doTask(data, callback, "remove");
      }
    }).call(volume);


    var settings = Object.create(test);

    (function(){
      var self = this;

      /** @method  - ping
      *  @description docker host ping test
      *  @param {Object} data - 설정 데이터
      *  @param {Function} callback - 클라이언트로 보낼 callback
      */
      self.ping = function (data, callback) {

        if(data.hasOwnProperty("host") && data.hasOwnProperty("port")){
          var docker = require("./docker")(data);
          docker.ping((err,data)=>{
            callback(err, data);
          });
        }else {
          callback({data : "IP or Port is null"});
        }

      };

      /** @method  - delete
      *  @description docker host 정보 삭제
      *  @param {Object} data - 설정 데이터
      *  @param {Function} callback - 클라이언트로 보낼 callback
      */
      self.delete = function (data, callback) {
        var dbLists = require("./mongo.js");

        dbLists.docker.remove(data, function(err, output){
          if(err) {
            callback(err);
          }
          callback(true);
        });
      };

      /** @method  - connectDocker
      *  @description docker host 원격 연결
      *  @param {Object} data - 설정 데이터
      *  @return {Object} setRemoteDocker -> return remotedocker
      */
      self.connectDocker = function (data, callback) {
        return self.setRemoteDocker(data);
      };

      self.authCheck = function(data, callback){
        mongo.auth.find(data, (result)=>{
          self.docker.checkAuth(result).then(self.successCallback.bind(self, callback) , self.failureCallback.bind(self, callback));

        });
      }
    }).call(settings);


    var os = require("os");
    function getServerIp() {
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

    var swarm = Object.create(test);

    (function(){
      var self = this;
      self.getLists = "swarmInspect";
      self.getAllLists = function(data, callback){
        var self = this;

        if(self.getLists !== null){
          var dockerInfo = self.docker[self.getLists]();
        }
        mongo.docker.show( (result)=>{
          // callback(result);
          // console.log(result);
          for(var i in result){
            // console.log(result[i]);
            var hostconfig = {
              host : result[i].ip,
              port : result[i].port
            }
            if(getServerIp() === result[i].ip){
              // console.log(hostconfig.host);
              var dockerInfo = self.docker[self.getLists]();
              dockerInfo.then((data)=>{
                callback(data);

              }).catch((err)=>{
                // console.log(err);
              });
            }else {
              // console.log("else");
              // console.log(hostconfig.host);

              self.setRemoteDocker(hostconfig);
              var dockerInfo = self.remoteDocker[self.getLists]();
                  dockerInfo.then((data)=>{
                    callback(data);
                  }).catch((err)=>{
                    // console.log(err);
                  });

            }
          }
        });
        // return new Promise(function(resolve, reject){
        //   resolve(dockerInfo);
        // }).then(successCallback, failCallback);

      };
      var os = require("os");
      function getServerIp() {
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
      /** @method  - update
      *  @description swarm join
      *  @param {Object} data - 설정 데이터
      *  @param {Function} callback - 클라이언트로 보낼 callback
      */
      self.update = function (data, callback) {
        // return;
        var managerToken = data.managerToken;
        var workerToken = data.workerToken;
        var swarmJoin = {
          "AdvertiseAddr": "",
          "ListenAddr": "0.0.0.0:" +  data.swarmPort,
          "RemoteAddrs": [data.leader[0].ip + ":" + data.swarmPort],
          "JoinToken": ""
        }


        var hostconfig = {};
        function setSwarm(node, token){
          hostconfig.host = node.ip;
          hostconfig.port = node.port;

          swarmJoin.AdvertiseAddr = node.ip;
          swarmJoin.JoinToken = token;
          var docker = null;
          if(hostconfig.host === getServerIp()){
            docker = self.docker;
          }else{
            self.setRemoteDocker(hostconfig);
            docker = self.remoteDocker;
          }
          docker.swarmJoin(swarmJoin).then(self.successCallback.bind(self, callback) , self.failureCallback.bind(self, callback));
          ;
        }
        var workers = data.workers;
        if(workers.length > 0){

          for(var i in workers){
            setSwarm(workers[i], workerToken);
          }
        }
        var managers = data.managers;
        if(managers.length > 0 ){
          for(var i in managers){
             setSwarm(managers[i], managerToken);
          }
        }
      };

      /** @method  - init
      *  @description swarm 초기화
      *  @param {Object} data - 설정 데이터
      *  @param {Function} callback - 클라이언트로 보낼 callback
      */
      self.init = function (data, callback) {
        var docker = null;
        if(data.host === getServerIp()) {
          docker = self.docker;
          console.log(docker);
        }else {
          var hostconfig = {
            host : data.host,
            port : data.port
          }
          console.log(hostconfig);
          self.setRemoteDocker(hostconfig);
          docker = self.remoteDocker;
        }
        return docker.swarmInit(data).then(self.successCallback.bind(self, callback) , self.failureCallback.bind(self, callback));

      };

      /** @method  - Load
      *  @description swarm Load
      *  @param {Object} data - 설정 데이터
      *  @param {Function} callback - 클라이언트로 보낼 callback
      *  @return {Object} promise
      */
      self.load = function (data, callback){
        // console.log(data);
        var docker = null;
        if(data.host === getServerIp()){
          docker = self.docker;
        }else{
          var hostconfig = data;
          docker = self.setRemoteDocker(hostconfig);
        }
        console.log(docker);
        docker.swarmInspect().then(self.successCallback.bind(self, callback) , self.failureCallback.bind(self, callback));
        // return new Promise(function(resolve, reject){
        //   resolve(docker.swarmInspect())
        // }).then(self.successCallback.bind(self, callback) , self.failureCallback.bind(self, callback));
      };

      /** @method  - leave
      *  @description swarm leave
      *  @param {Object} data - 설정 데이터
      *  @param {Function} callback - 클라이언트로 보낼 callback
      *  @return {Object} promise
      */
      self.leave = function (data, callback){
        return self.docker.swarmLeave({force : data}).then(self.successCallback.bind(self, callback) , self.failureCallback.bind(self, callback));
      };

      /** @method  - getToken
      *  @description swarm manager, worker token 정보 얻기
      *  @param {Object} data - 설정 데이터
      *  @param {Function} callback - 클라이언트로 보낼 callback
      *  @return {Object} promise
      */
      self.getToken = function (data, callback) {
        return new Promise(function (resolve, reject) {
          resolve(self.docker.swarmInspect());
        });
      };

      /** @method  - join
      *  @description swarm join
      *  @param {Object} data - 설정 데이터
      *  @param {Function} callback - 클라이언트로 보낼 callback
      */
      self.join = function (data, callback){

        var hostconfig = {
          host : data.AdvertiseAddr,
          port : data.port
        }
        delete data.port;

        // console.log(hostconfig);
        self.setRemoteDocker(hostconfig);

          // console.log(self.remoteDocker);
        return   self.remoteDocker.swarmJoin(data).then(self.successCallback.bind(self, callback) , self.failureCallback.bind(self, callback));
        // });

      };

      /** @method  - throwNode
      *  @description swarm throw 다른 호스트를 swarm에서 버림
      *  @param {Object} data - 설정 데이터
      *  @param {Function} callback - 클라이언트로 보낼 callback
      *  @return {Object} promise
      */
      self.throwNode = function (data, callback){
        // console.log("Throw");
        // console.log(data);
        var docker = null;
        if(data.ip === getServerIp()){
          docker = self.docker;
        }else{
          var opts = {
            host : data.ip,
            port : data.port
          }
          var hostconfig = opts;
          console.log(hostconfig);
          self.setRemoteDocker(hostconfig);
          docker = self.remoteDocker;
        }

        console.log(docker);
        docker.swarmLeave({force : true}).then(self.successCallback.bind(self, callback) , self.failureCallback.bind(self, callback));
      };

    }).call(swarm);

    var node = Object.create(test);
    (function(){
      var self = this;
      self.getInfo = "getNode";
      self.getLists = "listNodes";
      self.attr = "ID"

      /** @method  - load
      *  @description node load
      *  @param {Object} data - 설정 데이터
      *  @param {Function} callback - 클라이언트로 보낼 callback
      *  @return {Object} dotask
      */
      self.load = function (data, callback){

        // var hostconfig = data;
        // self.setRemoteDocker(hostconfig);
        var docker = null;
        if(data.host === getServerIp()){
          docker = self.docker;
        }else{
          var hostconfig = data;
          docker = self.setRemoteDocker(hostconfig);
        }

        return new Promise(function(resolve, reject){
          resolve(docker.listNodes())
        }).then(self.successCallback.bind(self, callback) , self.failureCallback.bind(self, callback));
      };
      /** @method  - remove
      *  @description node remove
      *  @param {Object} data - 설정 데이터
      *  @param {Function} callback - 클라이언트로 보낼 callback
      *  @return {Object} dotask
      */
      self.remove = function (data, callback){
        // var hostconfig = data.leader;
        console.log(data);
        var docker = null;
        if(data.leader.host === getServerIp()){
          docker = self.docker;
        }else{
          var hostconfig = data.leader;
          self.setRemoteDocker(hostconfig);
          docker = self.remoteDocker;
        }
        console.log(data.nodeID);
        var node = docker[self.getInfo](data.remove.nodeID);
        // console.log(node);
        // var opts = {
        //       "id" : data.remove.nodeID,
        //       // "version" : tmp[i].Version.Index,
        //       "Role" : "worker"
        //       // "Availability" : data.Availability
        //     };
        //     // var node = (self.docker).getNode(tmp[i].ID);
        //     node.update(opts).catch((err)=>{
        //       console.log(err);
        //     }).then(callback);

        return node.remove({force : true}).then(self.successCallback.bind(self, callback) , self.failureCallback.bind(self, callback));
        // return self.doTask(data, callback, {force: true},"remove");
      };
      //
      // /** @method  - update
      // *  @description node update
      // *  @param {Object} data - 설정 데이터
      // *  @param {Function} callback - 클라이언트로 보낼 callback
      // */
      // self.update = function (data, callback){
      //
      //   var tmp = data.lists;
      //   for(var i in tmp){
      //     var opts = {
      //       "id" : tmp[i].ID,
      //       "version" : tmp[i].Version.Index,
      //       "Role" : "worker",
      //       "Availability" : data.Availability
      //     };
      //     var node = (self.docker).getNode(tmp[i].ID);
      //     node.update(opts).catch((err)=>{
      //       console.log(err);
      //     }).then(callback);
      //   }
      // }

    }).call(node);

    var service = Object.create(test);

    (function(){
      var self = this;
      self.getInfo = "getService";
      self.getLists = "listServices";
      self.attr = "ID";

      /** @method  - create
      *  @description service create
      *  @param {Object} data - 설정 데이터
      *  @param {Function} callback - 클라이언트로 보낼 callback
      *  @return {Object} promise
      */
      self.create = function(data, callback){
        return (self.docker).createService(data).then(self.successCallback.bind(self, callback) , self.failureCallback.bind(self, callback));
      };

      /** @method  - remove
      *  @description service remove
      *  @param {Object} data - 설정 데이터
      *  @param {Function} callback - 클라이언트로 보낼 callback
      *  @return {Object} dotask
      */
      self.remove = function(data, callback){
        return self.doTask(data, callback, "remove");
      };

      /** @method  - remove
      *  @description service remove
      *  @param {Object} data - 설정 데이터
      *  @param {Function} callback - 클라이언트로 보낼 callback
      *  @return {Object} dotask
      */
      self.update = function(data, callback){
        console.log(data.Id);
        var getService = (self.docker)[self.getInfo](data.Id);
        delete data.Id

        console.log(data.version);
        console.log(getService);
        console.log(data);
        return getService.update( data).then(self.successCallback.bind(self, callback) , self.failureCallback.bind(self, callback));
        // mongo.auth.show((result)=>{
        //   var auth = (result[0]);
        //   console.log(auth);
        //   // auth.version = 100;
        //   return getService.update( data).then(self.successCallback.bind(self, callback) , self.failureCallback.bind(self, callback));
        // })
      };

      /** @method  - inspect
      *  @description service inspect
      *  @param {Object} data - 설정 데이터
      *  @param {Function} callback - 클라이언트로 보낼 callback
      *  @return {Object} dotask
      */
      self.inspect = function(data, callback){
        return self.doTask(data, callback, "inspect");
      };

    }).call(service);

    var task = Object.create(test);
    (function(){
        var self = this;
        self.getInfo = "getTask";
        self.getLists = "listTasks";

        /** @method  - inspect
        *  @description task inspect
        *  @param {Object} data - 설정 데이터
        *  @param {Function} callback - 클라이언트로 보낼 callback
        *  @return {Object} dotask
        */
        self.inspect = function(data, callback){
            return self.doTask(data, callback, "inspect");
        };

   }).call(task);



   var lists = {
     "container" : container,
     "network" : network,
     "image" : image,
     "volume" : volume,
     "settings" : settings,
     "swarm" : swarm,
     "node" : node,
     "service" : service,
     "task" : task
   }

module.exports = lists;
