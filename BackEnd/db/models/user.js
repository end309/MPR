module.exports = function (sequelize, DataTypes) {
    const User = sequelize.define('user', {
        u_id: {
            type: DataTypes.INTEGER,
            primaryKey: true
        },
        user_name: {
            type: DataTypes.STRING
        }
    }, {
        freezeTableName: true
    })

    User.removeAttribute('id');

    return User;
}