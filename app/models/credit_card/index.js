const Promise = require('bluebird');
const Sequelize = require('sequelize');


module.exports = (config, providers) => {
  const CreditCard = providers.sequelize.define('credit_card', {
    name: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    type: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    number: {
      type: Sequelize.VIRTUAL,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    encrypted_number: {
      type: Sequelize.STRING,
      validate: {
        notEmpty: true
      }
    }
  }, {
    freezeTableName: true
  });

  CreditCard.beforeCreate((creditCard, options) => {
    return Promise.resolve(creditCard)
      .then(creditCard => {
        if (!creditCard.number) { return null; }

        return providers.cc_crypt.encrypt(creditCard.number);
      }).then(encryptedNumber => {
        creditCard.encrypted_number = encryptedNumber;
      });
  });
  CreditCard.beforeUpdate((creditCard, options) => {
    return Promise.resolve(creditCard)
      .then(creditCard => {
        if (!creditCard.number) { return null; }

        return providers.cc_crypt.encrypt(creditCard.number);
      }).then(encryptedNumber => {
        creditCard.encrypted_number = encryptedNumber;
      });
  });

  function postSetup(models) {
    models.CreditCard.belongsTo(models.User);
  }

  return { CreditCard, postSetup };
};
