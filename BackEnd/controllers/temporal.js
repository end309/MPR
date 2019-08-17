var db = require('../db')
var _ = require('lodash');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

module.exports = {
    async getTemporal(ctx) {
        const userId = ctx.query.userId
        const timeID = ctx.query.timeID
        await db.User_Behavior.findAll({
            where: {
                u_id: userId,
                time_id: timeID
            },
            attributes: ['segment_id','time_id', 'frequency']
          }).then(temporalData => {
            data = JSON.stringify(temporalData)
            data = JSON.parse(data)
            ctx.response.body = data
        }) 
    }
}