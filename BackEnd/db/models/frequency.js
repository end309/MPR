module.exports = function (sequelize, DataTypes) {
    const Frequency = sequelize.define('frequency', {
        u_id: {
            type: DataTypes.INTEGER
        },
        b_id: {
            type: DataTypes.INTEGER
        },
        freq: {
            type: DataTypes.INTEGER
        }
    }, {
        freezeTableName: true
    })

    Frequency.removeAttribute('id');

    return Frequency;
}