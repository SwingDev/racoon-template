const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');

app.set('views', './app/controllers/front');
app.set('view engine', 'pug');

module.exports = function (models) {

  app.use('/favicon.ico', express.static(__dirname + '/favicon.ico'));
  app.use('/static/*', function (req, res, next) {
      const prefixedPath = path.resolve(__dirname, 'static', decodeURIComponent(req.params[0]));
      res.sendFile(prefixedPath, function(err) { next () })
  });

  app.get('/', (req, res, next) => {
    res.render('index', {
      title: ':)'
    });
  });

  return {
    router: app,
    path: '/'
  }
};
