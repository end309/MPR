
module.exports = function (sequelize, DataTypes) {
    const User = sequelize.define('user', {
        userid: {
            type: DataTypes.STRING
        },
        name: {
            type: DataTypes.STRING
        },
        age: {
            type: DataTypes.STRING
        }
    }, {
        freezeTableName: true
    })

    User.removeAttribute('id');

    return User;
}