var db = require('../db')
var _ = require('lodash');
const Sequelize = require('sequelize');

module.exports = {
    async getPersonalizedRoute(ctx) {
        await db.User_Behavior.findAll({
            where: {
                r_id: {
                [Op.or]: data
              }
            },
            attributes: ['lng', 'lat']
          }).then(User_Behavior => {
            data = JSON.stringify(vertex);
            data = JSON.parse(data);
        }) 
    },
    async getPopularRoute(ctx) {

    }
}