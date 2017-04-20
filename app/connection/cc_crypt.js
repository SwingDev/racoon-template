const Promise = require('bluebird');
const crypt = require('awesome-crypt');

const errors = require('../../config/errors');


module.exports = ({encryptionKey}) => {
  function encrypt(number) {
    return crypt.encrypt(number, encryptionKey, 512);
  }

  function decrypt(encryptedNumber) {
    return crypt.decrypt(encryptedNumber);
  }

  return { encrypt, decrypt };
};
