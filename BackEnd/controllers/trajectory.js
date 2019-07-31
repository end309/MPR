var db = require('../db')
var _ = require('lodash');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

module.exports = {
    async getTrajectory(ctx) {
        var res = {
            code: 0,
            data: {},
            errMsg: ''
        }
        const src = ctx.query.src
        const dest = ctx.query.dest

        let pythonProcess = new Promise(function(success, nosuccess) {
            const { spawn } = require('child_process');
            const pyprog = spawn('python3.7', ['/Users/Ryan/Documents/GitHub/my-personalized-route-BE/script/dijkstra.py', src, dest]);
            pyprog.stdout.on('data', function(data) {
                success(data);
            });
            pyprog.stderr.on('data', (data) => {
                nosuccess(data);
            });
        });

        await pythonProcess.then(function(response) {
            data = response.toString()
        });

        if (data == 'No Path between these two vertex\n'){
            res.code = 200
            res.errMsg = 'No Path between these two vertex'
        } else {
            data=data.replace("[","");
            data=data.replace("]","");
            data=data.replace("\n","");
            data = _.split(data, ', ');
            data = _.map(data, n => {
                return parseInt(n);
              });
            await db.Vertex.findAll({
                where: {
                    r_id: {
                    [Op.or]: data
                  }
                },
                attributes: ['lng', 'lat']
              }).then(vertex => {
                data = JSON.stringify(vertex);
                data = JSON.parse(data);
            })
            res.code = 200
            res.errMsg = 'Success'
            res.data = data
        }

        ctx.response.body = res
    }
}