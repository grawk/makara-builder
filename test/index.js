'use strict';

var tap = require('tap');
var builder = require('../');
var locales = ['en-US', 'fr-FR', 'de-FR'];
var path = require('path');
var appRoot = path.resolve(__dirname);

var writer = function (root) {
    return function (locale, cb) {
        var deleted = locales.splice(locales.indexOf(locale), 1);
        if (deleted.length === 0) {
            return cb(new Error('tried deleting a locale not in the array'));
        }
        cb(null);
    };
}

tap.test('check that locale directories are properly identified', function (t) {
    t.plan(3);
    t.type(builder, 'function');
    t.equal(builder.length, 3);
    builder(appRoot, writer, function (err) {
        if (err) {
            throw err;
        }
        t.equal(locales.length, 0);
        t.end();
    });
});

//
// module.exports = function build(appRoot, writer, cb) {
// var localeRoot = path.resolve(appRoot, 'locales');
//
// glob(path.resolve(localeRoot, '*/*/'), function (err, paths) {
//if (err) {
//    return cb(err);
//}
//var locales = paths.map(function (p) {
//    var m = re.exec(path.relative(localeRoot, p));
//    return m[2] + '-' + m[1];
//});
//async.each(locales, writer(appRoot), cb);
//});
//};