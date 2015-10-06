let  cookieParser = require('cookie-parser');

module.exports = function(server, io, mongoStore) {
  io.use(function(socket, next) {
    cookieParser("letswatch")(socket.request, {}, function(err) {
      var sessionId = socket.request.signedCookies['connect.sid'];
      console.log(sessionId);

      mongoStore.get(sessionId, function(err, session) {
        socket.request.session = session;

        passport.initialize()(socket.request, {}, function() {
          passport.session()(socket.request, {}, function() {
            if (socket.request.user) {
              next(null, true);
            } else {
              next(new Error('User is not authenticated'), false);
            }
          })
        });
      });
    });
}
