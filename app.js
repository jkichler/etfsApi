const morgan = require('morgan');
const express = require('express');
const compression = require('compression');
const session = require('express-session');
const passport = require('passport');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const db = require('./db');
const sessionStore = new SequelizeStore({
  db,
  checkExpirationInterval: 15 * 60 * 1000, // The interval at which to cleanup expired sessions in milliseconds.
  expiration: 30 * 60 * 1000 //experation for sessions
});
const PORT = process.env.PORT || 8080;
const app = express();
module.exports = app;

passport.serializeUser((user, done) => done(null, user.id));

passport.deserializeUser(async (id, done) => {
  try {
    const user = await db.models.user.findByPk(id);
    done(null, user.sanitize());
  } catch (err) {
    done(err);
  }
});

db.authenticate().then(() => {
  console.log('connected to the database');
});

app.use(morgan('dev'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(compression());

// session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'developmentSecret',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      expires: 30 * 60 * 1000
    }
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use('/auth', require('./auth'));
app.use('/api', require('./api'));

app.get('/', (req, res) => res.send('Login for API access'));

// error handling endware
app.use((err, req, res, next) => {
  console.error(err);
  console.error(err.stack);
  res.status(err.status || 500).send(err.message || 'Internal server error.');
});

const init = async () => {
  try {
    await sessionStore.sync();
    await db.sync();
    await app.listen(PORT, () => {
      console.log(`api running on port ${PORT}`);
    });
  } catch (error) {
    console.error(error);
  }
};

if (require.main === module) {
  init();
}
