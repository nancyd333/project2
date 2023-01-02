'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('air_quality_index_descs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      range_start: {
        type: Sequelize.INTEGER
      },
      range_end: {
        type: Sequelize.INTEGER
      },
      level: {
        type: Sequelize.STRING
      },
      color: {
        type: Sequelize.STRING
      },
      health_implications: {
        type: Sequelize.STRING
      },
      caution_stmt_pm2_5: {
        type: Sequelize.STRING
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
    await queryInterface.dropTable('air_quality_index_descs');
  }
};