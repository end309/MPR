
module.exports = function (sequelize, DataTypes) {
    const Vertex = sequelize.define('vertex', {
        r_id: {
            type: DataTypes.INTEGER
        },
        v_id: {
            type: DataTypes.INTEGER
        },
        lng: {
            type: DataTypes.DOUBLE
        },
        lat: {
            type: DataTypes.DOUBLE
        }
    }, {
        freezeTableName: true
    })

    Vertex.removeAttribute('id');

    return Vertex;
}