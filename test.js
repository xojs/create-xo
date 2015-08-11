'use strict';
var path = require('path');
var fs = require('fs');
var test = require('ava');
var tempWrite = require('temp-write');
var dotProp = require('dot-prop');
var fn = require('./');

var originalArgv = process.argv.slice();

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
	t.plan(4);

	run(t, {}, function (pkg) {
		t.assert(dotProp.get(pkg, 'scripts.test') === 'xo');
		t.assert(dotProp.get(pkg, 'xo') === undefined);
	});
});

test('has scripts', function (t) {
	t.plan(4);

	run(t, {
		scripts: {
			start: ''
		}
	}, function (pkg) {
		t.assert(dotProp.get(pkg, 'scripts.test') === 'xo');
		t.assert(dotProp.get(pkg, 'xo') === undefined);
	});
});

test('has default test', function (t) {
	t.plan(4);

	run(t, {
		scripts: {
			test: 'echo "Error: no test specified" && exit 1'
		}
	}, function (pkg) {
		t.assert(dotProp.get(pkg, 'scripts.test') === 'xo');
		t.assert(dotProp.get(pkg, 'xo') === undefined);
	});
});

test('has only xo', function (t) {
	t.plan(4);

	run(t, {
		scripts: {
			test: 'xo'
		}
	}, function (pkg) {
		t.assert(dotProp.get(pkg, 'scripts.test') === 'xo');
		t.assert(dotProp.get(pkg, 'xo') === undefined);
	});
});

test('has test', function (t) {
	t.plan(4);

	run(t, {
		scripts: {
			test: 'ava'
		}
	}, function (pkg) {
		t.assert(dotProp.get(pkg, 'scripts.test') === 'xo && ava');
		t.assert(dotProp.get(pkg, 'xo') === undefined);
	});
});

test('has cli args', function (t) {
	t.plan(4);

	process.argv = originalArgv.concat(['--init', '--space']);

	run(t, {
		scripts: {
			start: ''
		}
	}, function (pkg) {
		process.argv = originalArgv;
		t.assert(dotProp.get(pkg, 'scripts.test') === 'xo');
		t.assert(dotProp.get(pkg, 'xo.space') === true);
	});
});

test('has cli args and test', function (t) {
	t.plan(5);

	process.argv = originalArgv.concat(['--init', '--env=node', '--env=browser']);

	run(t, {
		scripts: {
			test: 'ava'
		}
	}, function (pkg) {
		process.argv = originalArgv;
		t.assert(dotProp.get(pkg, 'scripts.test') === 'xo && ava');
		t.assert(dotProp.get(pkg, 'xo.envs.0') === 'node');
		t.assert(dotProp.get(pkg, 'xo.envs.1') === 'browser');
	});
});

test('has cli args and existing config', function (t) {
	t.plan(5);

	process.argv = originalArgv.concat(['--init', '--space']);

	run(t, {
		xo: {
			esnext: true
		}
	}, function (pkg) {
		process.argv = originalArgv;
		t.assert(dotProp.get(pkg, 'scripts.test') === 'xo');
		t.assert(dotProp.get(pkg, 'xo.space') === true);
		t.assert(dotProp.get(pkg, 'xo.esnext') === undefined);
	});
});

test('has existing config without cli args', function (t) {
	t.plan(4);

	process.argv = originalArgv.concat(['--init']);

	run(t, {
		xo: {
			esnext: true
		}
	}, function (pkg) {
		process.argv = originalArgv;
		t.assert(dotProp.get(pkg, 'scripts.test') === 'xo');
		t.assert(dotProp.get(pkg, 'xo') === undefined);
	});
});
