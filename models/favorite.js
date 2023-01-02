'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class favorite extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.favorite.belongsTo(models.user)
      models.favorite.belongsTo(models.city)
    }
  }
  favorite.init({
    userId: DataTypes.INTEGER,
    cityId: DataTypes.INTEGER,
    date: DataTypes.DATEONLY,
    aqi: DataTypes.INTEGER,
    aqi_co: DataTypes.INTEGER,
    aqi_pm10: DataTypes.INTEGER,
    aqi_so2: DataTypes.INTEGER,
    aqi_pm2_5: DataTypes.INTEGER,
    aqi_o3: DataTypes.INTEGER,
    aqi_no2: DataTypes.INTEGER,
    comments: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'favorite',
    timestamps: true,
  });
  return favorite;
};