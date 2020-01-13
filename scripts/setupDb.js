const db = require('../db');
const { User } = require('../db/models');

const setup = async () => {
  try {
    await db.sync({ force: true });
    await User.create({ userName: 'apiUser', password: 'apiPassword' });
    console.log('seeded user successfully');
  } catch (error) {
    console.error(error);
  } finally {
    console.log('closing db connection');
    await db.close();
    console.log('db connection closed');
  }
};

setup();
