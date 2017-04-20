const Promise = require('bluebird');
const Sequelize = require('sequelize');


module.exports = (config, providers) => {
  const Currency = providers.sequelize.define('currency', {
    id: {
      type: Sequelize.STRING,
      allowNull: false,
      primaryKey: true,
      validate: {
        notEmpty: true,
        isUppercase: true,
        len: 3
      }
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    }
  }, {
    freezeTableName: true
  });

  return { Currency };
};
