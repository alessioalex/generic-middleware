'use strict';

/**
@constructor
*/
function Middleware() {
  if (!(this instanceof Middleware)) {
    return new Middleware();
  }

  this._stack = [];
  this._errorHandlers = [];
  // used to determine if a function is an error handler or not
  // (by storing the number of arguments of the 1st function injected in the stack)
  this.paramsLength = 0;

  this.init = this.init.bind(this);
}

/**
@param {Function} fn - function to inject into the stack
*/
Middleware.prototype.use = function use(fn) {
  if (this.paramsLength) {
    // more arguments, meaning it's an error handler
    // (since it looks like `err, same, arguments, as, before`)
    if (fn.length > this.paramsLength) {
      this.addErrorHandler(fn);
    } else {
      this._stack.push(fn);
    }
  } else {
    // 1st function added, is not an error handler
    this._stack.push(fn);
    this.paramsLength = fn.length;
  }
};

/**
@param {Function?} [after] - function in the stack to follow (if null, add to the tail)
@param {Function} fn - function to inject into the stack
*/
Middleware.prototype.useAfter = function useAfter(after, fn) {
  var index = this._stack.indexOf(after);
  if (!after || index < 0) {
    this._stack.push(fn);
    return;
  }
  this._stack.splice(index + 1, 0, fn);
};

/**
@param {Function?} [before] - function in the stack to precede (if null, add to the head)
@param {Function} fn - function to inject into the stack
*/
Middleware.prototype.useBefore = function useBefore(before, fn) {
  var index = this._stack.indexOf(before);
  if (!before || index < 0) {
    this._stack.unshift(fn);
    return;
  }
  this._stack.splice(index, 0, fn);
};

/**
@param {Function} fn - explicitely injecting an error handling function into the stack
*/
Middleware.prototype.addErrorHandler = function addErrorHandler(fn) {
  this._errorHandlers.push(fn);
};

Middleware.prototype.init = function init() {
  var args = Array.prototype.slice.call(arguments);

  this._handle({
    err: null,
    index: 0,
    errorHandlerIndex: 0,
    args: args
  });
};

Middleware.prototype._handle = function _handle(data) {
  var that = this;
  var args = (data.args && data.args.length) ? data.args.slice(0) : [];
  var stack = this._stack;
  var _data = {
    index: data.index,
    errorHandlerIndex: data.errorHandlerIndex,
    args: data.args
  };
  var index = 0;

  if (data.errorHandlerIndex || data.err) {
    args.unshift(data.err);

    stack = this._errorHandlers;
    _data.errorHandlerIndex = _data.errorHandlerIndex + 1;
    index = data.errorHandlerIndex;
  } else {
    index = data.index;
    _data.index = _data.index + 1;
  }

  args.push(function next(e) {
    _data.err = e;
    that._handle(_data);
  });

  this._callStackFn(stack, index, args);
};

Middleware.prototype._callStackFn = function _callStackFn(stack, index, args) {
  if (index < stack.length) {
    stack[index].apply(null, args);
  }
};

module.exports = Middleware;
