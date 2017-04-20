const Promise = require('bluebird');
const Sequelize = require('sequelize');


module.exports = (config, providers) => {
  const Account = providers.sequelize.define('account', {
    balance: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false
    }
  }, {
    freezeTableName: true
  });

  function postSetup(models) {
    models.Account.belongsTo(models.Currency);
    models.Account.belongsTo(models.User);
  }

  return { Account, postSetup };
};
