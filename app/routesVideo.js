/**
 * routesVideo
 *
 * usecase:
 * user A: is watching a video1
 * user B: saw message user A is watching video1, clicked message to watch w A. user B is directed to video page and start at where User A is at, and can chat
 *
 * @TODO:
 * webpack, react, firebase?
 */
// standalone io at port:3000
var io = require('socket.io')();
const PORT = 3000;
io.on("connection", (socket) => {
  console.log("client connected ");

  // emit to client msg
  socket.emit("greetings", {msg:"hello"});

  // listen to client msg
  socket.on("join", (data) => {
    console.log("join");
    console.log(data);
  })
});
io.listen(PORT);
console.log("Socket.io running on http://localhost:" + PORT);

module.exports = (req, res) => {
  res.render("video.ejs")
}
