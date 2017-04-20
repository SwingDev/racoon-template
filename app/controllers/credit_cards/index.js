const Promise = require('bluebird');

const express = require('express')
const router = express.Router()
const winston = require('winston')

const auth = require('../../../config/middlewares/auth')
const errors = require('../../../config/errors')


module.exports = function(models, config, providers) {
  router.get('/:creditCardId', auth.requiresAuthenticatedUser, (req, res, next) => {
    models.CreditCard.findOne({ where: { id: req.params.creditCardId } })
      .tap(c => {
        if (!c) { throw new errors.BadRequest("Credit Card not found."); }
      })
      .then(result => res.json(result))
      .catch(next);
  });

  router.get('/:creditCardId/balance', auth.requiresAuthenticatedUser, (req, res, next) => {
    models.CreditCard.findOne({ where: { id: req.params.creditCardId, userId: req.user.id } })
      .tap(c => {
        if (!c) { throw new errors.BadRequest("Credit Card not found."); }
      })
      .then(c => {
        return providers.cc_crypt.decrypt(c.encrypted_number)
          .then(creditCardNumber => {
            return Promise.resolve(["USD", "PLN"])
              .map(currency => {
                return providers.bank.checkBalance({ creditCardNumber, currency })
                  .then(balance => {
                    return { currency, balance };
                  });
              })
          })
          .then(result => res.json(result));
      })
      .catch(next);
  });

  router.post('/:creditCardId/deposit', auth.requiresAuthenticatedUser, (req, res, next) => {
    const toAccountId = req.body.to_account_id;
    const amount = parseFloat(req.body.amount);

    return providers.sequelize.transaction(t => {
      return Promise.all([
        models.Account.findOne({ where: { id: toAccountId, userId: req.user.id } })
          .tap(a => {
            if (!a) { throw new errors.BadRequest("Account not found."); }
          }),
        models.CreditCard.findOne({ where: { id: req.params.creditCardId, userId: req.user.id } })
          .tap(c => {
            if (!c) { throw new errors.BadRequest("Credit Card not found."); }
          })
          .then(c => providers.cc_crypt.decrypt(c.encrypted_number))
      ]).spread((account, creditCardNumber) => {
        return providers.bank.transferIn({
          amount: amount,
          currency: account.currencyId,
          fromCreditCardNumber: creditCardNumber,
        }).then(() => {
          return account.update({ balance: providers.sequelize.literal(`balance + ${amount}`) });
        })
      })
    }).then(() => {
      res.json({ "status": "ok" });
    }).catch(next);
  });

  return {
    router: router,
    path: '/api/credit_card'
  }
}
