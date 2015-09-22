'use strict';
var path = require('path');
var fs = require('fs');
var tempWrite = require('temp-write');
var dotProp = require('dot-prop');
var test = require('ava');
var fn = require('./');
var originalArgv = process.argv.slice();
var get = dotProp.get;

function run(pkg) {
	var filepath = tempWrite.sync(JSON.stringify(pkg), 'package.json');

	return fn({
		cwd: path.dirname(filepath),
		skipInstall: true
	}).then(function () {
		return JSON.parse(fs.readFileSync(filepath, 'utf8'));
	});
}

test('empty package.json', function (t) {
	return run({}).then(function (pkg) {
		t.is(get(pkg, 'scripts.test'), 'xo');
		t.is(get(pkg, 'xo'), undefined);
	});
});

test('has scripts', function (t) {
	return run({
		scripts: {
			start: ''
		}
	}).then(function (pkg) {
		t.is(get(pkg, 'scripts.test'), 'xo');
		t.is(get(pkg, 'xo'), undefined);
	});
});

test('has default test', function (t) {
	return run({
		scripts: {
			test: 'echo "Error: no test specified" && exit 1'
		}
	}).then(function (pkg) {
		t.is(get(pkg, 'scripts.test'), 'xo');
		t.is(get(pkg, 'xo'), undefined);
	});
});

test('has only xo', function (t) {
	return run({
		scripts: {
			test: 'xo'
		}
	}).then(function (pkg) {
		t.is(get(pkg, 'scripts.test'), 'xo');
		t.is(get(pkg, 'xo'), undefined);
	});
});

test('has test', function (t) {
	return run({
		scripts: {
			test: 'ava'
		}
	}).then(function (pkg) {
		t.is(get(pkg, 'scripts.test'), 'xo && ava');
		t.is(get(pkg, 'xo'), undefined);
	});
});

test('has cli args', function (t) {
	process.argv = originalArgv.concat(['--init', '--space']);

	return run({
		scripts: {
			start: ''
		}
	}).then(function (pkg) {
		process.argv = originalArgv;
		t.is(get(pkg, 'scripts.test'), 'xo');
		t.is(get(pkg, 'xo.space'), true);
	});
});

test('has cli args and test', function (t) {
	process.argv = originalArgv.concat(['--init', '--env=node', '--env=browser']);

	return run({
		scripts: {
			test: 'ava'
		}
	}).then(function (pkg) {
		process.argv = originalArgv;
		t.is(get(pkg, 'scripts.test'), 'xo && ava');
		t.is(get(pkg, 'xo.envs.0'), 'node');
		t.is(get(pkg, 'xo.envs.1'), 'browser');
	});
});

test('has cli args and existing config', function (t) {
	process.argv = originalArgv.concat(['--init', '--space']);

	return run({
		xo: {
			esnext: true
		}
	}).then(function (pkg) {
		process.argv = originalArgv;
		t.is(get(pkg, 'scripts.test'), 'xo');
		t.is(get(pkg, 'xo.space'), true);
		t.is(get(pkg, 'xo.esnext'), undefined);
	});
});

test('has existing config without cli args', function (t) {
	process.argv = originalArgv.concat(['--init']);

	return run({
		xo: {
			esnext: true
		}
	}).then(function (pkg) {
		process.argv = originalArgv;
		t.is(get(pkg, 'scripts.test'), 'xo');
		t.is(get(pkg, 'xo'), undefined);
	});
});

test('has everything covered when it comes to config', function (t) {
	process.argv = originalArgv.concat([
		'--init',
		'--space',
		'--esnext',
		'--no-semicolon',
		'--env=foo',
		'--env=bar',
		'--global=foo',
		'--global=bar',
		'--ignore=foo',
		'--ignore=bar'
	]);

	return run({}).then(function (pkg) {
		process.argv = originalArgv;
		t.is(get(pkg, 'scripts.test'), 'xo');
		t.is(get(pkg, 'xo.space'), true);
		t.is(get(pkg, 'xo.esnext'), true);
		t.is(get(pkg, 'xo.semicolon'), false);
		t.is(get(pkg, 'xo.envs.0'), 'foo');
		t.is(get(pkg, 'xo.envs.1'), 'bar');
		t.is(get(pkg, 'xo.globals.0'), 'foo');
		t.is(get(pkg, 'xo.globals.1'), 'bar');
		t.is(get(pkg, 'xo.ignores.0'), 'foo');
		t.is(get(pkg, 'xo.ignores.1'), 'bar');
	});
});

test('installs the XO dependency', function (t) {
	var filepath = tempWrite.sync(JSON.stringify({}), 'package.json');

	return fn({
		cwd: path.dirname(filepath)
	}).then(function () {
		t.ok(get(JSON.parse(fs.readFileSync(filepath, 'utf8')), 'devDependencies.xo'));
	});
});
