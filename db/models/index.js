const Funds = require('./funds');
const Holdings = require('./holdings');
const Weights = require('./weights');
const User = require('./user');

Holdings.belongsToMany(Funds, { through: Weights });
Funds.belongsToMany(Holdings, { through: Weights });

module.exports = { Funds, Holdings, Weights, User };
