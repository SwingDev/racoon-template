const Sequelize = require('sequelize');

const cls = require('continuation-local-storage');
const namespace = cls.createNamespace('racoon-namespace');

const Promise = require('bluebird');
const clsBluebird = require('cls-bluebird');

Sequelize.cls = namespace;
clsBluebird(namespace);

module.exports = ({ url }) => {
  const sequelize = new Sequelize(url, {
    pool: { max: 1000, min: 0, idle: 10000 },
    isolationLevel: 'READ COMMITTED'
  });

  return sequelize;
}