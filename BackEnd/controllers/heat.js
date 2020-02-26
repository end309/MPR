var db = require('../db')
var _ = require('lodash');

module.exports = {
    async getHeat(ctx) {
        const u_id = ctx.query.user_id
        await db.UserBehavior.findAll({
            where: {
                u_id: u_id
            },
            include: [{
                model: db.Segment, 
                required: true,
                attributes: [['s_lng','lng'],['s_lat','lat']]
            }],
            attributes: ['freq']
          }).then(heatData => {
            data = JSON.stringify(heatData);
            data = JSON.parse(data);
            data = _.map(data, point => {
                temp = []
                temp[0] = point.segment.lng
                temp[1] = point.segment.lat
                temp[2] = point.freq
                return temp
            });
            ctx.response.body = data
        }) 
    }
}