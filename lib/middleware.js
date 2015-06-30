"use strict";

var getParams = require('get-parameter-names');
var noop = function() {};

function Middleware() {
  if (!(this instanceof Middleware)) {
    return new Middleware();
  }

  this._stack = [];
  this._errorHandler = noop;

  this.init = this.init.bind(this);
}

Middleware.prototype.use = function(fn) {
  var params = getParams(fn);
  var firstParam = (params && params[0]) ? params[0].toLowerCase() : '';

  if (firstParam && /err/.test(firstParam)) {
    this.addErrorHandler(fn);
  } else {
    this._stack.push(fn);
  }
};

Middleware.prototype.addErrorHandler = function(fn) {
  this._errorHandler = fn;
};

Middleware.prototype.init = function() {
  var args = Array.prototype.slice.call(arguments);
  this._args = args;

  this._handle(null, 0);
};

Middleware.prototype._handle = function(err, index) {
  var that = this;
  var args = this._args.slice(0);

  // no `next()`-ing in the error handler
  if (!err) {
    args.push(function next(e) {
      that._handle(e, ++index);
    });
  }

  if (!err) {
    this._callStackFn(this._stack, index, args);
  } else {
    args.unshift(err);
    this._errorHandler.apply(null, args);
  }
};

Middleware.prototype._callStackFn = function(stack, index, args) {
  if (index < stack.length) {
    stack[index].apply(null, args);
  }
};

module.exports = Middleware;
