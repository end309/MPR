module.exports = function (sequelize, DataTypes) {
    const UserBehavior = sequelize.define('userbehavior', {
        u_id: {
            type: DataTypes.INTEGER
        },
        b_id: {
            type: DataTypes.INTEGER
        },
        s_id: {
            type: DataTypes.INTEGER
        },
        time_id: {
            type: DataTypes.INTEGER
        },
        freq: {
            type: DataTypes.INTEGER
        }
    }, {
        freezeTableName: true
    })

    UserBehavior.removeAttribute('id');

    return UserBehavior;
}