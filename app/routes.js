let express = require("express");
let routeVideo = require("./routesVideo");

module.exports = (app) => {
  let passport = app.passport

  //var server = require("http").createServer(app);
  //var io = require("socket.io")(server);

	app.get('/', (req, res) => res.render('index.ejs'))

  // video item page
  app.get("/video", (req, res) => {
    res.render('index.ejs')
  });
  app.get("/video/sunjoe_mow_joe_14", routeVideo.bind(app));

  // GET signup
  app.get('/signup', (req, res) => {
    res.render('signup.ejs', {message: req.flash('error')})
  })

  // POST signup
  app.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/video',
    failureRedirect: '/signup',
    failureFlash: true
  }))

  // GET login
  app.get('/login', (req, res) => {
    res.render('login.ejs', {message: req.flash('error')})
  })

  // POST login
  app.post('/login', passport.authenticate('local', {
    successRedirect: '/video',
    failureRedirect: '/login',
    failureFlash: true
  }))
}
