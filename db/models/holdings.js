const Sequelize = require('sequelize');
const db = require('../db');

const Holdings = db.define('holdings', {
  name: {
    type: Sequelize.STRING
  },
  type: {
    type: Sequelize.ENUM('topHoldings', 'country', 'sector')
  }
});

module.exports = Holdings;
