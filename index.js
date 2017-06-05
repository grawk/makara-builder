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
<<<<<<< HEAD

module.exports = function build(appRootOrOptions, writer, cb) {
    var opts = new Options(default_options);
    var options = default_options;
    var appRoot;

    if(typeof appRootOrOptions == 'object') {
        opts = opts.merge(appRootOrOptions);
        options = opts.copy(Object.keys(default_options));
        appRoot = options.appRoot;
        writer = options.writer;
        cb = options.cb;
    }
    else {
        appRoot = appRootOrOptions;
    }

    var localeRoot = path.resolve(appRoot, 'locales');
    var spudBundler = function(locale, cb) {
        var m = /(.*)-(.*)/.exec(locale); // Use a real BCP47 parser.
        var outputRoot = path.resolve(appRoot, path.join(options.buildPath, locale));
        var localeRoot = path.resolve(appRoot, 'locales');
        mkdirp(outputRoot, iferr(cb, function() {
            spundle(localeRoot, m[2], m[1], iferr(cb, writer(outputRoot, cb)));
        }));
    };

    glob(path.resolve(localeRoot, '*/*/'), function(err, paths) {
        if(err) return cb(err);
        var locales = paths.map(function(p) {
            var m = re.exec(path.relative(localeRoot, p));
            return m[2] + '-' + m[1];
=======

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
>>>>>>> 66756c991cc5e07c5a7e9b2245ec7a089aceed80
        });
    }
};
