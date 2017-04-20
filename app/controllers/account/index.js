const Promise = require('bluebird');

const express = require('express')
const router = express.Router()
const winston = require('winston')

const auth = require('../../../config/middlewares/auth')
const errors = require('../../../config/errors')


module.exports = function(models, config, providers) {
  router.get('/:accountId', auth.requiresAuthenticatedUser, (req, res, next) => {
    models.Account.findOne({ where: { id: req.params.accountId, userId: req.user.id } })
      .tap(a => {
        if (!a) { throw new errors.BadRequest("Account not found."); }
      })
      .then((account) => res.json(account))
      .catch(next);
  });

  router.post('/:accountId/convert', auth.requiresAuthenticatedUser, (req, res, next) => {
    const toAccountId = req.body.to_account_id;
    const amount = parseFloat(req.body.amount);

    return providers.sequelize.transaction(t => {
      return Promise.all([
        models.Account.findOne({ where: { id: req.params.accountId, userId: req.user.id } })
          .tap(a => {
            if (!a) { throw new errors.BadRequest("Source account not found."); }
          }),
        models.Account.findOne({ where: { id: toAccountId, userId: req.user.id } })
          .tap(a => {
            if (!a) { throw new errors.BadRequest("Target account not found."); }
          })
      ])
      .spread((fromAccount, toAccount) => {
        if (fromAccount.balance < amount) {
          throw new errors.BadRequest("Insufficient funds");
        }

        return models.Rate.findOne({ where: { fromId: fromAccount.currencyId, toId: toAccount.currencyId } })
          .tap(rate => {
            if (!rate) { throw new errors.BadRequest("Rate not found."); }
          })
          .then(rate => amount * rate.rate)
          .then((convertedAmount) => {
            return Promise.all([
              fromAccount.update({ balance: providers.sequelize.literal(`balance - ${amount}`) }),
              toAccount.update({ balance: providers.sequelize.literal(`balance + ${convertedAmount}`) })
            ]);
          });
      });
    }).then(() => {
      res.json({ "status": "ok" });
    }).catch(next);
  });

  router.post('/:accountId/withdraw', auth.requiresAuthenticatedUser, (req, res, next) => {
    const toCreditCardId = req.body.to_credit_card_id;
    const amount = parseFloat(req.body.amount);

    return providers.sequelize.transaction(t => {
      return Promise.all([
        models.Account.findOne({ where: { id: req.params.accountId, userId: req.user.id } })
          .tap(a => {
            if (!a) { throw new errors.BadRequest("Account not found."); }
          }),
        models.CreditCard.findOne({ where: { id: toCreditCardId, userId: req.user.id } })
          .tap(c => {
            if (!c) { throw new errors.BadRequest("Credit Card not found."); }
          })
          .then(c => providers.cc_crypt.decrypt(c.encrypted_number))
      ])
      .spread((account, creditCardNumber) => {
        if (account.balance < amount) {
          throw new errors.BadRequest("Insufficient funds");
        }

        return providers.bank.transferOut({
          amount: amount,
          currency: account.currencyId,
          toCreditCardNumber: creditCardNumber
        }).then(() => {
          return account.update({ balance: providers.sequelize.literal(`balance - ${amount}`) });
        })
      })
    }).then(() => {
      res.json({ "status": "ok" });
    }).catch(next);
  });

  return {
    router: router,
    path: '/api/account'
  }
}
