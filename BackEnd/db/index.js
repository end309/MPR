const Sequelize = require('sequelize');
var config = require('./config.js')

var db = new Sequelize(config.database,config.username,config.password,{
    host: config.host,
    dialect: config.dialect,
    define: {
        timestamps: false
    }
});

db.Behavior = db.import('./models/behavior.js')
db.Edge = db.import('./models/edge.js')
db.Frequency = db.import('./models/frequency.js')
db.Segment = db.import('./models/segment.js')
db.UserBehavior = db.import('./models/userbehavior.js')
db.User = db.import('./models/user.js')
db.Vertex = db.import('./models/vertex.js')


// User_Behavior -> Segment -> Vertex
db.UserBehavior.belongsTo(db.Segment, {foreignKey: 's_id', targetKey: 's_id'})

module.exports = db;
