let routeVideo = require("./routesVideo");

module.exports = (app) => {
	app.get('/', (req, res) => res.render('index.ejs'))

	app.get("/video", routeVideo.bind(app));
}
