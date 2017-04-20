'use strict';

/**
 * Module dependencies.
 */

const path = require('path');
const extend = require('util')._extend;

const env = process.env.NODE_ENV || 'local';

const defaults = {
  env: env,
  root: path.join(__dirname, '..'),
  bank: {
    url: process.env.BANK_URL,
    secret: process.env.BANK_SECRET
  },
  cc_crypt: {
    encryptionKey: "kOwYz4ItiymZsYgn7AmZXWmIcewAlToHDEQ-oUyfjDLOBpeBdjC"
  },
  jwt: {
    secret: "secret"
  },
  sequelize: {
    url: process.env.DATABASE_URL
  }
};

/**
 * Expose
 */

const envSpecificConfig = {}
const config = extend(envSpecificConfig, defaults)

module.exports = config
