/* eslint-disable no-console, func-names, no-unused-vars */
'use strict';

var path = require('path');
var fs = require('fs');
var toc = require('markdown-toc');
var lint = require('markdownlint');
var marked = require('marked');
var middleware = require('../');
var app = middleware();

app.use(function readFile(opts, data, next) {
  fs.readFile(opts.path, 'utf8', function(err, content) {
    if (err) { return next(err); }

    data.content = content;
    next();
  });
});

app.use(function lintMarkdown(opts, data, next) {
  var lintOpts = { strings: {} };
  lintOpts.strings[path.basename(opts.path)] = data.content;

  lint(lintOpts, function(err, result) {
    if (err) { return next(err); }

    data.lintErrors = result.toString();
    next();
  });
});

app.use(function outputHtmlToFile(opts, data, next) {
  // add the table of contents
  data.toc = toc(data.content).content;

  fs.writeFile(opts.out, marked(data.toc + data.content), function(err) {
    if (err) { return next(err); }

    console.log(fs.readFileSync(opts.out, 'utf8'));
  });
});

app.use(function handleError(err, opts, data, next) {
  console.error('an error occured with markdowner');

  throw err;
});

// initialize
app({
  path: __dirname + '/../README.md',
  out: '/tmp/generic-middleware-readme.html'
}, {});
