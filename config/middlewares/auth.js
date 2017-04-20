'use strict'

const Promise = require('bluebird');
const config = require('..');
const errors = require('../errors');

const vary = require('vary');


/*
 *  Authentication
 */
function authenticateUserWithJWT(providers, models){
  return (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
      return next();
    }

    Promise.resolve(token)
      .then((token) => {
        return providers.jwt.decodeToken(token)
          .then(({ id }) => models.User.findOne({ where: { id } }))
          .tap((user) => providers.jwt.verifyTokenOrThrow(token))
      })
      .catch(e => {
        res.clearCookie('token');
        throw e;
      })
      .then((user) => {
        req.user = user;

        next();
      })
      .catch(next);
  };
}


/*
 *  Authorization
 */

function requiresAuthenticatedUser(req, res, next) {
  if (!req.user) {
    return next(new errors.Unauthorized("Authorization required."));
  }

  return next();
}


module.exports = { authenticateUserWithJWT, requiresAuthenticatedUser };
