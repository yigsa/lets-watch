/**
 * routesVideo
 *
 * usecase:
 * user A: is watching a video1
 * user B: saw message user A is watching video1, clicked message to watch w A. user B is directed to video page and start at where User A is at, and can chat
 *
 * @TODO:
 * add socket io channel for video
 * webpack, react, firebase?
 */
// standalone io at port:3000
var io = require('socket.io')();
var _ = require("lodash");

const PORT = 3000;
var clientList = [];

io.on("connection", (client) => {
  console.log("client connected");
  clientList.push(client);

  _.each(clientList, (client, index) => {
    if (index > 0) {
      //client.emit("timeline", )
    }
    //console.log(client._open);
    // if client still connected, remove if closed
    //if (client._open) {
      //client.emit("timeline")
    //}
  });

  // emit to client msg
  //client.emit("greetings", {msg:"hello"});

  // listen to host client timeupdate
  client.on("timeupdate", (timeline) => {
    //send timeline to all sockets
    io.emit("timeupdate", timeline);
  });

  client.on("pause", (timeline) => {
    io.emit("pause", timeline);
  })

  //client.on("disconnect", function() {
  //  console.log("client disconnect");
  //  delete client;
  //})
});


io.listen(PORT);
console.log("Socket.io running on http://localhost:" + PORT);

module.exports = (req, res) => {
  var host = false;
  if (clientList.length === 0) {
    host = true;
  }
  console.log(clientList.length);
  res.render("video.ejs", { isHost: host });

};
