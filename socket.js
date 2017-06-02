var docker = require('./docker');
var p = require('./promise');
// 메시지를 전송한 클라이언트를 제외한 모든 클라이언트에게 메시지를 전송한다
//socket.broadcast.emit('chat', msg);

// 메시지를 전송한 클라이언트에게만 메시지를 전송한다
// socket.emit('s2c chat', msg);

// 접속된 모든 클라이언트에게 메시지를 전송한다
// io.emit('s2c chat', msg);

// 특정 클라이언트에게만 메시지를 전송한다
// io.to(id).emit('s2c chat', data);


var socket = function(io) {
  // connection event handler
// connection이 수립되면 event handler function의 인자로 socket인 들어온다

io.on('connection', function(socket) {

// 접속한 클라이언트의 정보가 수신되면
socket.on('login', function(data) {
  console.log('Client logged-in:\n name:' + data.name + '\n userid: ' + data.userid);

  // socket에 클라이언트 정보를 저장한다
  socket.name = data.name;
  socket.userid = data.userid;


  // 접속된 모든 클라이언트에게 메시지를 전송한다
  io.emit('login', data.name );
});

// 클라이언트로부터의 메시지가 수신되면
socket.on('CreateContainer', function(data) {
  console.log('Message from %s: %s', socket.name, JSON.stringify(data));

    socket.emit('chat', data);

    p(docker, 'CreateContainer', data);
});

socket.on('dctl', function(data){
  // console.log(data);
  var tmp = data.splice(0, 1);
  var doIt = tmp[0].doIt;

  p(docker, doIt, data).then ( (container) => {
    if (doIt == "dstart") {
      container.forEach ( (container) => {
          container.start();
      });
    }  else if (doIt == "dstop"){
      container.forEach ( (container) => {
          container.stop();
      });
    } else if (doIt == "dremove") {
      container.forEach ((container) => {
        setTimeout( () => {container.remove(); console.log("remove");}, "500");
      });
    } else {
      reject(Error("doIt parms 에러"));
    }
  });
});


// force client disconnect from server
  socket.on('forceDisconnect', function() {
    socket.disconnect();
  })

  socket.on('disconnect', function() {
    console.log('user disconnected: ' + socket.name);
  });
});

};
module.exports = socket;
