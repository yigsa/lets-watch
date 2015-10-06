/**
 * routesVideo
 *
 * http://localhost:8000/video/sunjoe_mow_joe_14
 *
 * usecase:
 * user A: is watching a video1
 * user B: saw message user A is watching video1, clicked message to watch w A. user B is directed to video page and start at where User A is at, and can chat
 *
 * @TODO:
 * post
 * tiny url: share this link
 *
 * video channel
 * add socket io channel for video
 * webpack, react, firebase?
 */
// standalone io at port:3000
var io = require("socket.io")();
var _ = require("lodash");
var then = require('express-then');
var cookieParser = require('cookie-parser');
var Firebase = require("firebase");
var firebaseChat = new Firebase("https://yidea.firebaseio.com/").child("chat");

const PORT = 3000;
var clients = {},
  hostClient,
  hostTimeline = 0;

// on initial load firebase chat
var chatInitData = [];
firebaseChat.on("value", (snapshot) => {
  let data = snapshot.val();
  if (data) {
    chatInitData = _.chain(data)
      .map((value, key) => {
        value.key = key;
        return value;
      })
      .sortBy("timeline")
      .value();
  }
});

io.use(function(socket, next) {
  cookieParser("letswatch")(socket.request, {}, function(err) {
    var sessionId = socket.request.signedCookies['connect.sid'];
    socket.request.sessionID = sessionId; //set express session
    next(null, true);
  });
});

io.on("connection", (socket) => {
  console.log("client connected");
  //console.log(socket.id); //socket io id
  //console.log("page " + socket.request.sessionID);

  // sessionID: client
  var pageSessionID = socket.request.sessionID;
  if (_.size(clients) === 0) {
    hostClient = pageSessionID;
  }
  clients[pageSessionID] = socket;

  // each socket listener
  socket.on("disconnect", function() {
    console.log("client disconnect");
    //delete client socket;
    delete clients[pageSessionID];
    //host is removed
    if (hostClient === pageSessionID) {
      clients = {};
    }
  });

  // chat features
  socket.on("chat", (msgData) => {
    //socket.broadcast.emit("chat", msg); //broadcast to all rest clients
    //io.emit("chat", msgData); //emit to all clients
    var data = {
      timelineFormatted: msgData.timelineFormatted,
      timeline: msgData.timeline,
      msg: msgData.msg,
      answsers: []
    };
    firebaseChat.push(data, () => {
      io.emit("chat", data);
      console.log(data);
    });
  });

  //@ video features
  // listen to host timeupdate
  socket.on("timeupdate", (timeline) => {
    //send timeline to all sockets
    //serverIO.emit("timeupdate", timeline);
    hostTimeline = timeline;
    socket.broadcast.emit("timeupdate", timeline);

  });

  // listen to host timeupdate
  socket.on("pause", (timeline) => {
    //io.emit("pause", timeline);
    socket.broadcast.emit("pause", timeline);
  });

  socket.on("play", () => {
    socket.broadcast.emit("play");
  })
});

io.listen(PORT);
console.log("Socket.io running on http://localhost:" + PORT);

module.exports = (req, res) => {
  var host = false;
  if (_.size(clients) === 0) { host = true; }
  //console.log(clients);

  res.render("video.ejs", { isHost: host, hostTimeline: hostTimeline, chatMsg: chatInitData });
};
