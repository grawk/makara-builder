"use strict";

var path = require('path');
var glob = require('glob');
var async = require('async');
var mkdirp = require('mkdirp');
var iferr = require('iferr');
var spundle = require('spundle');
var options = require('options');

var re = new RegExp('(.*)\\' + path.sep + '(.*)');
module.exports = function build(options) {
    var default_options = {
        buildPath: '.build',
        writer: null,
        appRoot: null,
        cb: null
    };
    var opts = new options(default_options);
    opts = opts.merge(options);

    if(opts.isDefinedAndNonNull('writer')
    && opts.isDefinedAndNonNull('appRoot')
    && opts.isDefinedAndNonNull('cb')) {
        var appRoot = opts.read('appRoot');
        var cb = opts.read('cb');
        var writer = opts.read('writer');
        var localeRoot = path.resolve(appRoot, 'locales');
        var spudBundler = function (locale, cb) {
            var m = /(.*)-(.*)/.exec(locale); // Use a real BCP47 parser.
            var outputRoot = path.resolve(appRoot, path.join(opts.read('buildPath'), locale));
            var localeRoot = path.resolve(appRoot, 'locales');
            mkdirp(outputRoot, iferr(cb, function() {
                spundle(localeRoot, m[2], m[1], iferr(cb, writer(outputRoot, cb)));
            }));
        };
        glob(path.resolve(localeRoot, '*/*/'), function(err, paths) {
            if(err) {
                return cb(err);
            }
            var locales = paths.map(function(p) {
                var m = re.exec(path.relative(localeRoot, p));
                return m[2] + '-' + m[1];
            });
            async.each(locales, spudBundler, cb);
        });
    }
};
