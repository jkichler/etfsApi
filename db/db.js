const Sequelize = require('sequelize');
const pkg = require('../package.json');
const databaseName = pkg.name;

const db = new Sequelize(`postgres://localhost:5432/${databaseName}`, {
  logging: false
});

module.exports = db;
