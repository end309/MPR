var db = require('../db')

module.exports = {
    async getUserInfo(ctx) {
        let data;
        await db.User.findAll().then(user => {
            data = JSON.stringify(user);
        })
        ctx.response.body = data;
    },

}