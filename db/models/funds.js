const Sequelize = require('sequelize');
const db = require('../db');

const Funds = db.define('funds', {
  name: {
    type: Sequelize.STRING,
    allowNull: false
  },
  ticker: {
    type: Sequelize.STRING,
    allowNull: false
  },
  asOfDate: {
    type: Sequelize.DATEONLY,
    allowNull: false
  },
  description: {
    type: Sequelize.TEXT
  }
});

module.exports = Funds;
