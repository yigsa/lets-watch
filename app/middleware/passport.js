let passport = require('passport')
let LocalStrategy = require('passport-local').Strategy
let nodeifyit = require('nodeifyit')
let User = require('../models/user')
require('songbird')

function configure() {
  // for session support and persistent login sessions
  passport.serializeUser(nodeifyit(async(user) => user._id))

  passport.deserializeUser(nodeifyit(async(id) => {
    return await User.promise.findById(id)
  }))

  // Local Login
  passport.use(new LocalStrategy({
    usernameField: 'username',
    failureFlash: true
  }, nodeifyit(async(username, password) => {
    let user;
    if (username.indexOf('@') !== -1) {
      let email = username.toLowerCase()
      user = await User.promise.findOne({email})
      if (!user || username !== user.email) {
        return [false, {message: 'Invalid email.'}]
      }
    } else {
      let regexp = new RegExp(username, 'i')
      user = await User.promise.findOne({
        username: {$regex: regexp}
      })
      if (!user || username !== user.username) {
        return [false, {message: 'Invalid username.'}]
      }
    }

    if (!await user.validatePassword(password)) {
      return [false, {message: 'Invalid password.'}]
    }  
    return user
  }, {spread: true})))

  // Local Signup
  passport.use('local-signup', new LocalStrategy({
    usernameField: 'email',
    failureFlash: true,
    passReqToCallback: true
  }, nodeifyit(async (req, email, password) => {
      email = (email || '').toLowerCase()
      if (await User.promise.findOne({email})) {
        return [false, {message: 'That email is already taken!'}]
      }

      // get username from the body
      let {username} = req.body
      let regexp = new RegExp(username, 'i')
      let query = {username: {$regex: regexp}}

      if (await User.promise.findOne(query)) {
        return [false, {message: 'That username is already taken!'}]
      }

      // create the user
      let user = new User()
      user.email = email
      user.username = username
      user.password = password

      try {
        return await user.save()
      } catch(e) {
        return [false, {message: e.message}]
      }
  }, {spread: true})))

  return passport
}
module.exports = {passport, configure}