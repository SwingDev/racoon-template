const Promise = require('bluebird');

const express = require('express')
const router = express.Router()
const winston = require('winston')

const errors = require('../../../config/errors')


module.exports = function(models, config, providers) {
  router.post('/signup', (req, res, next) => {
    return providers.sequelize.transaction(t => {
      return models.User.create(req.body);
    })
      .then(user => res.json(user))
      .catch(next);
  });

  router.post('/login', (req, res, next) => {
    models.User.findOne({ where: { email: req.body.email } })
      .then(user => {
        if (!user) {
          throw new errors.BadRequest("User not found.");
        }

        return user.authenticate(req.body.password)
          .then(isAuthenticated => {
            if (!isAuthenticated) {
              throw new errors.BadRequest("Incorrect password.");
            }

            return user;
          });
      })
      .then(user => {
        return providers.jwt.createToken({ id: user.id })
          .then(token => {
            res.cookie('token', token);
            res.json(user);
          })
      })
      .catch(next);
  });

  return {
    router: router,
    path: '/auth'
  }
}
