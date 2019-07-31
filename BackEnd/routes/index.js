var Router = require('koa-router');
var router = new Router();

// var UserInfo = require('../controllers/get-user-info.js')
// var TrajectoryRec = require('../controllers/get-trajectory.js')
// var MongoDB = require('../controllers/test-mongo.js')
// var test = require('../controllers/test.js')
var Trajectory = require('../controllers/trajectory.js')


// router.get('/getUserInfo', UserInfo.getUserInfo);
// router.get('/getTrajectoryRec', TrajectoryRec.getTrajectoryRec);
// router.get('/mongoTest',MongoDB.readData);
// router.get('/test',test.test);
router.get('/trajectory',Trajectory.getTrajectory);




module.exports = router