require('babel/register');
var requireDir = require('require-dir')

var App = require('./app/app')
var config = requireDir('./config', {recurse: true})

var port = process.env.PORT || 8000
var app = new App(config)

app.initialize(port)
    .then(function () {
        console.log("Listening at http://127.0.0.1:"+port)
    })
        .catch(function (e){
            console.log(e.stack ? e.stack : e)
        })