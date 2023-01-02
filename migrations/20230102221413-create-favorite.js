'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('favorites', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER
      },
      cityId: {
        type: Sequelize.INTEGER
      },
      date: {
        type: Sequelize.DATEONLY
      },
      aqi: {
        type: Sequelize.INTEGER
      },
      aqi_co: {
        type: Sequelize.INTEGER
      },
      aqi_pm10: {
        type: Sequelize.INTEGER
      },
      aqi_so2: {
        type: Sequelize.INTEGER
      },
      aqi_pm2_5: {
        type: Sequelize.INTEGER
      },
      aqi_o3: {
        type: Sequelize.INTEGER
      },
      aqi_no2: {
        type: Sequelize.INTEGER
      },
      comments: {
        type: Sequelize.TEXT
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('favorites');
  }
};