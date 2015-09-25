let express = require('express')
let requireDir = require('require-dir')

const NODE_ENV = process.env.NODE_ENV || 'development'

let App = require('./app/app')
let config = requireDir('./config', {recurse: true})

let app = new App(config)
let port = process.env.PORT || 8000

app.initialize(port)
.then(() => console.log(`Listening at http://127.0.0.1:${port}`))
.catch(e => console.log(e.stack ? e.stack : e))