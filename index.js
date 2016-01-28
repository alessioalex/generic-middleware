'use strict';

var Middleware = require('./lib/middleware');

// middleware factory, used to mimic the Express API
var createApp = function createApp() {
  var mid = new Middleware();

  var proxy = function proxyToMiddleware() {
    mid.init.apply(mid, arguments);
  };

  Object.keys(Middleware.prototype).forEach(function addFns(key) {
    proxy[key] = mid[key].bind(mid);
  });

  // being explicit
  Object.defineProperty(proxy, 'paramsLength', {
    enumerable: true,
    set: function setParamsLength(val) {
      mid.paramsLength = val;
    },
    get: function getParamsLength() {
      return mid.paramsLength;
    }
  });

  return proxy;
};

module.exports = createApp;
