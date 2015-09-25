let express = require('express')
require('songbird')
let routes = require('./routes')
let path = require('path')
let morgan = require('morgan')
let cookieParser = require('cookie-parser')
let mongoose = require('mongoose')
let session = require('express-session')
let MongoStore = require('connect-mongo')(session)
let bodyParser = require('body-parser')

module.exports = class App {
  constructor(config) {
    let expressServer = this.expressServer = express()

    this.expressServer.use(morgan('dev')) // log requests
    this.expressServer.use(cookieParser('letswatch')) // read cookies (needed for auth)
    this.expressServer.set('views', path.join( __dirname, '..', 'views'))
    this.expressServer.set('view engine', 'ejs')
    this.expressServer.use(bodyParser.json()) // get information from html forms
    this.expressServer.use(bodyParser.urlencoded({ extended: true }))


    this.expressServer.use(session({
      secret: 'letswatch',
      store: new MongoStore({db: 'lets-watch'}),
      resave: true,
      saveUninitialized: true
    }))

    // auth setup
    // this.expressServer.use()

    routes(this.expressServer)
  }

  async initialize(port) {
    await this.expressServer.promise.listen(port)
    return this
  }
}