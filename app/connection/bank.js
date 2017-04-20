const Promise = require('bluebird');
const request = require('request-promise');

const errors = require('../../config/errors');


module.exports = ({ url, secret }) => {
  function transferIn({ amount, currency, fromCreditCardNumber }) {
    const amountInCents = Math.floor(amount * 100);

    return request.post({
      url: `${url}/creditcard/${fromCreditCardNumber}/charge`,
      headers: {
        'Authorization': secret
      },
      json: true,
      body: { currency, amount: amountInCents }
    }).catch(e => {
      throw new errors.BadRequest({ msg: ((e.error || {}).error || e.message) });
    });
  }

  function transferOut({ amount, currency, toCreditCardNumber }) {
    const amountInCents = Math.floor(amount * 100);

    return request.post({
      url: `${url}/creditcard/${toCreditCardNumber}/refund`,
      headers: {
        'Authorization': secret
      },
      json: true,
      body: { currency, amount: amountInCents }
    }).catch(e => {
      throw new errors.BadRequest({ msg: ((e.error || {}).error || e.message) });
    });
  }

  function checkBalance({ creditCardNumber, currency }) {
    return request.get({
      url: `${url}/creditcard/${creditCardNumber}/balance/${currency}`,
      headers: {
        'Authorization': secret
      },
      json: true
    }).then(payload => {
      const balanceInCents = payload.balance;

      return (balanceInCents / 100).toFixed(2);
    }).catch(e => {
      throw new errors.BadRequest({ msg: ((e.error || {}).error || e.message) });
    });
  }

  return { transferIn, transferOut, checkBalance };
};
