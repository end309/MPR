module.exports = function (sequelize, DataTypes) {
    const Edge = sequelize.define('edge', {
        e_id: {
            type: DataTypes.INTEGER,
            primaryKey: true
        },
        s_vertex: {
            type: DataTypes.INTEGER
        },
        e_vertex: {
            type: DataTypes.INTEGER
        }
    }, {
        freezeTableName: true
    })

    Edge.removeAttribute('id');

    return Edge;
}