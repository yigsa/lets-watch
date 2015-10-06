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
let passportMiddleware = require('./middleware/passport')
let flash = require('connect-flash')

let socketio = require('socket.io')
let http = require('http')

const NODE_ENV = process.env.NODE_ENV || 'development'

module.exports = class App {
  constructor(config) {
    let expressServer = this.expressServer = express()

    let server = http.createServer(expressServer)
    let io = socketio.listen(server)


    passportMiddleware.configure()
    this.expressServer.passport = passportMiddleware.passport

    console.log("NODE_ENV "+NODE_ENV)
    console.log(" Mongo URL "+config.database[NODE_ENV].url)

    // set app.config (can be used in routes.js)
    this.expressServer.config = {
      database: config.database[NODE_ENV]
    }

    // connect to the database
    mongoose.connect(config.database[NODE_ENV].url)

    this.expressServer.use(morgan('dev')) // log requests
    this.expressServer.use(cookieParser('letswatch')) // read cookies (needed for auth)
    this.expressServer.use(express.static("public"));
    this.expressServer.set('views', path.join( __dirname, '..', 'views'))
    this.expressServer.set('view engine', 'ejs')
    this.expressServer.use(bodyParser.json()) // get information from html forms
    this.expressServer.use(bodyParser.urlencoded({ extended: true }))

    let mongoStore = new MongoStore({url: config.database[NODE_ENV].url})
    this.expressServer.use(session({
      secret: 'letswatch',
      store: mongoStore,
      resave: true,
      saveUninitialized: true
    }))

    // auth setup
    this.expressServer.use(this.expressServer.passport.initialize())
    // for persistent login sessions
    this.expressServer.use(this.expressServer.passport.session())
    // flash messages are stored in the session
    this.expressServer.use(flash())

    //require("./socketioSetup")(server, io, mongoStore)

    // configure and setup routes
    routes(this.expressServer)
  }

  async initialize(port) {
    await this.expressServer.promise.listen(port)
    return this
  }
}
