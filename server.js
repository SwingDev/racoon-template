'use strict';

/**
 * Module dependencies
 */
const Promise = require('bluebird')

const fs = require('fs');
const join = require('path').join;
const express = require('express');
const config = require('./config');

const models = join(__dirname, 'app/models');
const controllers = join(__dirname, 'app/controllers');

const app = Promise.promisifyAll(express());

/**
 * Expose
 */

module.exports = app;

// Loading Providers
const providers = {
  bank: require('./app/connection/bank')(config.bank),
  cc_crypt: require('./app/connection/cc_crypt')(config.cc_crypt),
  jwt: require('./app/connection/jwt')(config.jwt),
  sequelize: require('./app/connection/sequelize')(config.sequelize)
};

// Bootstrap models
let postSetupCalls = [];

const loadedModels = fs.readdirSync(models)
  .filter(file => !(file[0] === '.'))
  .map(file => {
    const clsPath = join(models, file)
    try {
      return require(clsPath)
    } catch (e) {
      console.error(`Couldn't load model ${file} at ${clsPath} due to:`)
      console.error(e)
      return null
    }
  })
  .filter(f => !!(f && f.constructor && f.call && f.apply))
  .map(cls => {
    const objects = cls(config, providers);

    if (objects['postSetup']) {
      postSetupCalls.push(objects['postSetup']);
      delete objects['postSetup'];
    }

    return objects;
  })
  .reduce( (acc, models) => {
    return Object.assign(acc, models)
  }, {});

postSetupCalls.forEach(hook => hook(loadedModels));

// Bootstrap express
require('./config/express')(app, config);

// Load app controllers
const loadedControllers = fs.readdirSync(controllers)
  .filter(file => !(file[0] === '.'))
  .map(file => {
    const clsPath = join(controllers, file)
    try {
      return require(clsPath)
    } catch (e) {
      console.error(`Couldn't load controller ${file} at ${clsPath} due to:`)
      console.error(e)
      return null
    }
  })
  .filter(f => !!(f && f.constructor && f.call && f.apply))
  .map(cls => cls(loadedModels, config, providers))

// Bootstrap app routes
require('./config/routes')(app, config, providers, loadedControllers, loadedModels);

// Register unhandled exception / promise rejection handlers
process.on('unhandledRejection', (err, promise) => {
  console.error("Unhandled rejection: " + (err && err.stack || err));
})

// Launch
function bootstrapProviders() {
  return Promise.all([
    Promise.resolve(providers.sequelize)
      .tap(s => s.authenticate())
      .tap(s => s.sync())
      .tap(s => {
        return require('sequelize-fixtures').loadFile('fixtures/*.yml', loadedModels);
      })
  ]);
}

const port = process.env.PORT || 3000;

bootstrapProviders()
  .then(() => app.listenAsync(port))
  .then(() => {
    console.log('Express app started on port ' + port);
  })
  .catch(err => {
    console.error('Unable to launch due to:', err);
    process.exit(1);
  });
