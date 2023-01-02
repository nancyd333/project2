'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class air_quality_index_desc extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  air_quality_index_desc.init({
    range_start: DataTypes.INTEGER,
    range_end: DataTypes.INTEGER,
    level: DataTypes.STRING,
    color: DataTypes.STRING,
    health_implications: DataTypes.STRING,
    caution_stmt_pm2_5: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'air_quality_index_desc',
    timestamps: true,
  });
  return air_quality_index_desc;
};