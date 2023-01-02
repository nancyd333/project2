'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class city extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.city.hasMany(models.favorite)
    }
  }
  city.init({
    city: DataTypes.STRING,
    state_abbrv: DataTypes.STRING,
    state_name: DataTypes.STRING,
    state_capital_flag: DataTypes.STRING,
    lat: DataTypes.DOUBLE,
    lng: DataTypes.DOUBLE,
    country: DataTypes.STRING,
    simplemaps_city_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'city',
    timestamps: true,
  });
  return city;
};