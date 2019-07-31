const Sequelize = require('sequelize');
var config = require('./config.js')

var db = new Sequelize(config.database,config.username,config.password,{
    host: config.host,
    dialect: config.dialect,
    define: {
        timestamps: false
    }
});

// db.Trajectory = db.import('./models/trajectory.js')
db.Vertex = db.import('./models/vertex.js')
// db.User = db.import('./models/user.js')
module.exports = db;
