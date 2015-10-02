module.exports = {
	'development': {
		'type': 'mongo',
		'url': 'mongodb://127.0.0.1:27017/lets-watch'
	},
	'production' :{
		'type' : 'mongo',
		'url': process.env['MONGOLAB_URI']
	}
}