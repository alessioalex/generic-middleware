'use strict';

var slice = Array.prototype.slice;
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

  proxy.setParams = function setParamsLength() {
    var args = slice.call(arguments);

    if (Array.isArray(args[0])) {
      // setParams(['foo', 'bar', 'baz'])
      mid.paramsLength = args[0].length;
    } else {
      // setParams('foo', 'bar', 'baz')
      mid.paramsLength = args.length;
    }

    // adding +1 because of the callback
    mid.paramsLength++;
  };

  return proxy;
};

module.exports = createApp;
