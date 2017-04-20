const Promise = require('bluebird');

const express = require('express')
const router = express.Router()
const winston = require('winston')

const auth = require('../../../config/middlewares/auth')
const errors = require('../../../config/errors')


module.exports = function(models) {
  router.get('/', (req, res, next) => {
    models.Currency.findAll()
      .then(currencies => res.json(currencies))
      .catch(next);
  });

  return {
    router: router,
    path: '/api/currency'
  }
}
