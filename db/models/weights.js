const Sequelize = require('sequelize');
const db = require('../db');

const Weights = db.define(
  'weights',
  {
    weight: {
      type: Sequelize.FLOAT,
      allowNull: true,
      defaultValue: null,
    },
  }
);

module.exports = Weights;
