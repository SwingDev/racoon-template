'use strict'

const express = require('express');
const auth = require('../middlewares/auth');


module.exports = (app, config, providers, controllers, models) => {
  const router = express.Router()

  controllers.forEach((controller) => {
    router.use(controller.path, controller.router)
  });

  app.use('/api', auth.authenticateUserWithJWT(providers, models))
  app.use('/', router)

  require('./post')(app, config)
}
