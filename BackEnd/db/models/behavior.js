module.exports = function (sequelize, DataTypes) {
    const Behavior = sequelize.define('behavior', {
        b_id: {
            type: DataTypes.INTEGER,
            primaryKey: true
        },
        segment_id: {
            type: DataTypes.INTEGER
        },
        time_id: {
            type: DataTypes.INTEGER
        }
    }, {
        freezeTableName: true
    })

    Behavior.removeAttribute('id');

    return Behavior;
}