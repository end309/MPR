var db = require('../db')
var _ = require('lodash');
const Sequelize = require('sequelize');

module.exports = {
    async getHeat(ctx) {
        const s_id = ctx.query.s_id
        await db.UserBehavior.findAll({
            where: {
                u_id: 1
            },
            include: [{
                model: db.Segment, 
                required: true,
                attributes: [['s_lng','lng'],['e_lng','lat']]
            }],
            attributes: ['frequency']
          }).then(heatData => {
            data = JSON.stringify(heatData);
            data = JSON.parse(data);
            data = _.map(data, point => {
                temp = []
                temp[0] = point.segment.lng
                temp[1] = point.segment.lat
                temp[2] = point.frequency
                return temp
            });
            ctx.response.body = data
        }) 
    }
}