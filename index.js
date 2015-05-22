"use strict";

var Middleware = require('./lib/middleware');

var createApp = function createApp() {
  var mid = new Middleware();

  var proxy = function() {
    mid.init.apply(mid, arguments);
  };

  Object.keys(Middleware.prototype).forEach(function(key) {
    proxy[key] = mid[key].bind(mid);
  });

  return proxy;
};

module.exports = createApp;
