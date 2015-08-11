'use strict';
var fs = require('fs');
var path = require('path');
var childProcess = require('child_process');
var lookUp = require('look-up');
var minimist = require('minimist');
var arrify = require('arrify');
var argv = require('the-argv');
var DEFAULT_TEST_SCRIPT = 'echo "Error: no test specified" && exit 1';

module.exports = function (opts, cb) {
	if (typeof opts !== 'object') {
		cb = opts;
		opts = {};
	}

	cb = cb || function () {};

	var cwd = opts.cwd || process.cwd();
	var args = opts.args || argv();

	var pkg;
	var pkgPath = lookUp('package.json', {cwd: cwd});

	if (pkgPath) {
		pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
	} else {
		pkgPath = path.resolve(cwd, 'package.json');
		pkg = {};
	}

	var s = pkg.scripts = pkg.scripts ? pkg.scripts : {};

	if (s.test && s.test !== DEFAULT_TEST_SCRIPT) {
		// don't add if it's already there
		if (!/^xo( |$)/.test(s.test)) {
			s.test = 'xo && ' + s.test;
		}
	} else {
		s.test = 'xo';
	}

	var cli = minimist(args);
	var unicorn = cli.unicorn;

	delete cli._;
	delete cli.unicorn;
	delete cli.init;

	if (cli.env) {
		cli.envs = arrify(cli.env);
		delete cli.env;
	}

	if (Object.keys(cli).length) {
		pkg.xo = cli;
	} else if (pkg.xo) {
		delete pkg.xo;
	}

	fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, '  ') + '\n');

	childProcess.execFile('npm', ['install', '--save-dev', 'xo'], {cwd: cwd}, function (err) {
		if (err) {
			cb(err);
			return;
		}

		// for personal use
		if (unicorn) {
			var pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
			pkg.devDependencies.xo = '*';
			fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, '  ') + '\n');
		}

		cb();
	});
};
