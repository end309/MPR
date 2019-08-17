module.exports = function (sequelize, DataTypes) {
    const Segment = sequelize.define('segment', {
        s_id: {
            type: DataTypes.INTEGER,
            primaryKey: true
        },
        s_vertex: {
            type: DataTypes.INTEGER
        },
        e_vertex: {
            type: DataTypes.INTEGER
        },
        s_lng: {
            type: DataTypes.DOUBLE
        },
        s_lat: {
            type: DataTypes.DOUBLE
        },
        e_lng: {
            type: DataTypes.DOUBLE
        },
        e_lat: {
            type: DataTypes.DOUBLE
        }
    }, {
        freezeTableName: true
    })

    Segment.removeAttribute('id');

    return Segment;
}