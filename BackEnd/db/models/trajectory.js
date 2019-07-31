
module.exports = function (sequelize, DataTypes) {
    const Trajectory = sequelize.define('trajectory', {
        lon: {
            type: DataTypes.STRING
        },
        lat: {
            type: DataTypes.STRING
        }
    }, {
        freezeTableName: true
    })

    Trajectory.removeAttribute('id');

    return Trajectory;
}