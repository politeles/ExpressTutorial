const path = require('path');
const rootPath = path.normalize(__dirname + '/..');
const env = process.env.NODE_ENV || 'development';

const config = {
  development: {
    root: rootPath,
    app: {
      name: 'samplemongo'
    },
    port: process.env.PORT || 3000,
    db: 'mongodb://localhost/samplemongo'
  },

  test: {
    root: rootPath,
    app: {
      name: 'samplemongo'
    },
    port: process.env.PORT || 3000,
    db: 'mongodb://localhost/samplemongo'
  },

  production: {
    root: rootPath,
    app: {
      name: 'samplemongo'
    },
    port: process.env.PORT || 3000,
    db: 'mongodb://localhost/samplemongo'
  }
};

module.exports = config[env];
