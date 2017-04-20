const Promise = require('bluebird');
const Sequelize = require('sequelize');


module.exports = (config, providers) => {
  const Rate = providers.sequelize.define('rate', {
    rate: {
      type: Sequelize.DECIMAL(10, 4),
      allowNull: false
    }
  }, {
    freezeTableName: true
  });

  function postSetup(models) {
    models.Rate.belongsTo(models.Currency, {as: "from"});
    models.Rate.belongsTo(models.Currency, {as: "to"});
  }

  return { Rate, postSetup };
};
