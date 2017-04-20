const Promise = require('bluebird');

const express = require('express')
const router = express.Router()
const winston = require('winston')

const auth = require('../../../config/middlewares/auth')
const errors = require('../../../config/errors')


module.exports = function(models) {
  router.get('/me', auth.requiresAuthenticatedUser, (req, res, next) => {
    res.json(req.user);
  });

  router.get('/me/accounts', auth.requiresAuthenticatedUser, (req, res, next) => {
    models.Account.findAll({ attributes: [ 'id' ], where: { userId: req.user.id } })
      .then((accounts) => res.json(accounts))
      .catch(next);
  });

  router.get('/me/credit_cards', auth.requiresAuthenticatedUser, (req, res, next) => {
    models.CreditCard.findAll({ attributes: [ 'id' ], where: { userId: req.user.id } })
      .then((accounts) => res.json(accounts))
      .catch(next);
  });

  return {
    router: router,
    path: '/api/user'
  }
}
