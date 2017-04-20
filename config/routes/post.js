'use strict'

const _ = require('lodash')
const Sequelize = require('sequelize')
const winston = require('winston')

const errors = require('../errors')

module.exports = (app, config) => {
  app.use((err, req, res, next) => {
    if (err && err.name && errors.mapping[err.name]) {
      res.status(errors.mapping[err.name]).json({error:err.message})
      return
    }

    if (err && err.name && err.name === 'RequestCodeError') {
      res.status(err.errorCode).json({error: err.message})
      return
    }

    if (err instanceof Sequelize.ValidationError) {
      const result = {
        message: err.message,
        field_errors: {}
      };
      for (let item of err.errors) {
        result.field_errors[item.path] = item.message;
      }

      res.status(400).json(result);
      return
    }

    // treat as 404
    if (err.message
      && (~err.message.indexOf('not found')
      || (~err.message.indexOf('Cast to ObjectId failed')))) {
      return next()
    }

    if (err.stack && err.stack.includes('ValidationError')) {
      res.status(422).json(err)
      return
    }

    next(err)
  })

  app.use((err, req, res, next) => {
    winston.error(err)
    res.status(500).json({
      env: _.omit(process.env, ['DATABASE_URL']),
      stack: (err.stack || "").split("\n")
    })
  });

  app.use((req, res) => {
    const payload = {
      url: req.originalUrl,
      error: 'Not found'
    }
    return res.status(404).json(payload)
  })
}
