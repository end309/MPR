var Router = require('koa-router');
var router = new Router();

var Heat = require('../controllers/heat.js')
var Temporal = require('../controllers/temporal.js')
var Route = require('../controllers/route.js')

router.get('/heat',Heat.getHeat);
router.get('/temporal',Temporal.getTemporal);
router.get('/personalized',Route.getPersonalizedRoute);
router.get('/popular',Route.getPopularRoute);

module.exports = router