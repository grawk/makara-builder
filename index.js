"use strict";

var path = require('path');
var glob = require('glob');
var async = require('async');
var mkdirp = require('mkdirp');
var iferr = require('iferr');
var spundle = require('spundle');
var Options = require('options');

var re = new RegExp('(.*)\\' + path.sep + '(.*)');
var default_options = {
    buildPath: '.build',
    writer: null,
    appRoot: null,
    cb: null
};

module.exports = function build(options) {
    var opts = new Options(default_options);
    opts = opts.merge(options);
    if(opts.isDefinedAndNonNull('writer')
    && opts.isDefinedAndNonNull('appRoot')
    && opts.isDefinedAndNonNull('cb')) {
        opts = opts.copy(Object.keys(default_options));
        var localeRoot = path.resolve(opts.appRoot, 'locales');
        var spudBundler = function(locale, cb) {
            var m = /(.*)-(.*)/.exec(locale); // Use a real BCP47 parser.
            var outputRoot = path.resolve(opts.appRoot, path.join(opts.buildPath, locale));
            var localeRoot = path.resolve(opts.appRoot, 'locales');
            mkdirp(outputRoot, iferr(cb, function() {
                spundle(localeRoot, m[2], m[1], iferr(cb, opts.writer(outputRoot, cb)));
            }));
        };
        glob(path.resolve(localeRoot, '*/*/'), function(err, paths) {
            if(err) return opts.cb(err);
            var locales = paths.map(function(p) {
                var m = re.exec(path.relative(localeRoot, p));
                return m[2] + '-' + m[1];
            });
            async.each(locales, spudBundler, opts.cb);
        });
    }
};
