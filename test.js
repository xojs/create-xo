'use strict';
var path = require('path');
var fs = require('fs');
var test = require('ava');
var tempWrite = require('temp-write');
var dotProp = require('dot-prop');
var fn = require('./');

function run(t, pkg, cb) {
	var filepath = tempWrite.sync(JSON.stringify(pkg), 'package.json');

	fn({
		cwd: path.dirname(filepath)
	}, function (err) {
		t.assert(!err, err);
		var pkg2 = JSON.parse(fs.readFileSync(filepath, 'utf8'));
		t.assert(dotProp.get(pkg2, 'devDependencies.xo'));
		cb(pkg2);
	});
}

test('empty package.json', function (t) {
	t.plan(3);

	run(t, {}, function (pkg) {
		t.assert(dotProp.get(pkg, 'scripts.test') === 'xo');
	});
});

test('has scripts', function (t) {
	t.plan(3);

	run(t, {
		scripts: {
			start: ''
		}
	}, function (pkg) {
		t.assert(dotProp.get(pkg, 'scripts.test') === 'xo');
	});
});

test('has default test', function (t) {
	t.plan(3);

	run(t, {
		scripts: {
			test: 'echo "Error: no test specified" && exit 1'
		}
	}, function (pkg) {
		t.assert(dotProp.get(pkg, 'scripts.test') === 'xo');
	});
});

test('has test', function (t) {
	t.plan(3);

	run(t, {
		scripts: {
			test: 'ava'
		}
	}, function (pkg) {
		t.assert(dotProp.get(pkg, 'scripts.test') === 'xo && ava');
	});
});
