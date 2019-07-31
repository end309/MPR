var db = require('../db')

module.exports = {
    // async getTrajectoryRec(ctx) {
    //     let data;
    //     await db.Trajectory.findAll().then(trajectory => {
    //         data = JSON.stringify(trajectory);
    //     })
    //     ctx.response.body = data;
    // },
    async getTrajectoryRec(ctx) {
        const src = ctx.query.src
        const dest = ctx.query.dest
        let runPy = new Promise(function(success, nosuccess) {
            const { spawn } = require('child_process');
            const pyprog = spawn('python3.7', ['/Users/Ryan/Documents/GitHub/my-personalized-route-BE/controllers/hello.py', src, dest]);
        
            pyprog.stdout.on('data', function(data) {
                success(data);
            });
            pyprog.stderr.on('data', (data) => {
                nosuccess(data);
            });
        });
        await runPy.then(function(testMLFunction) {
            data = testMLFunction.toString()
            console.log(data)
        });
    }
}