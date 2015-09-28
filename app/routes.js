module.exports = (app) => {
  let passport = app.passport

	app.get('/', (req, res) => res.render('index.ejs'))	

  // GET signup
  app.get('/signup', (req, res) => {
    res.render('signup.ejs', {message: req.flash('error')})
  })

  // POST signup
  app.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/profile',
    failureRedirect: '/signup',
    failureFlash: true
  }))

  // GET login
  app.get('/login', (req, res) => {
    res.render('login.ejs', {message: req.flash('error')})
  })

  // POST login
  app.post('/login', passport.authenticate('local', {
    successRedirect: '/profile',
    failureRedirect: '/login',
    failureFlash: true
  }))
}