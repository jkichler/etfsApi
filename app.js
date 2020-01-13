const express = require('express');
const app = express();
const db = require('./db');

const PORT = process.env.PORT || 8080;

db.authenticate().
then(() => {
  console.log('connected to the database');
});

//app.use('/api', require('./api'))

app.get('/', (req, res) => res.send('Login for API access'));

  // error handling endware
  app.use((err, req, res, next) => {
    console.error(err)
    console.error(err.stack)
    res.status(err.status || 500).send(err.message || 'Internal server error.')
  });

const init = async () => {
  try {
    await db.sync({force: true})
    app.listen(PORT, () => {
      console.log(`api running on port ${PORT}`);
    });
  } catch (error) {
    console.error(error);
  }
};

init();
