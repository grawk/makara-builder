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
    appRoot: null,
    buildPath: '.build',
    localesPath: 'locales',
    writer: null,
    cb: null
};

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
    } else {
        appRoot = appRootOrOptions;
    }

    var localeRoot = path.resolve(appRoot, options.localesPath);
    var spudBundler = function (locale, cb) {
        var m = /(.*)-(.*)/.exec(locale); // Use a real BCP47 parser.
        var outputRoot = path.resolve(appRoot, path.join(options.buildPath, locale));
        mkdirp(outputRoot, iferr(cb, function () {
            spundle(localeRoot, m[2], m[1], iferr(cb, writer(outputRoot, cb)));
        }));
    };

    glob(path.resolve(localeRoot, '*/*/'), function (err, paths) {
        if (err) return cb(err);
        var locales = paths.map(function (p) {
            var m = re.exec(path.relative(localeRoot, p));
            return m[2] + '-' + m[1];
        });
        async.each(locales, spudBundler, cb);
    });
};
