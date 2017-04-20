const Promise = require('bluebird');

const jwt = require('jsonwebtoken');
Promise.promisifyAll(jwt);

const errors = require('../../config/errors');


module.exports = ({secret}) => {
  function createToken(data, expiresInSecs=3600) {
    const algorithm = "HS512";
    const expiresIn = Math.floor(Date.now() / 1000) + expiresInSecs;

    return jwt.signAsync(data, secret, { algorithm, expiresIn });
  }

  function verifyTokenOrThrow(token) {
    return jwt.verifyAsync(token, secret)
      .catch(e => {
        throw new errors.Forbidden("Incorrect JWT token.");
      });
  }

  function decodeToken(token) {
    return Promise.resolve(token).then(jwt.decode);
  }

  return { createToken, verifyTokenOrThrow, decodeToken };
};