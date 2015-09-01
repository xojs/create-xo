'use strict';
var fs = require('fs');
var path = require('path');
var childProcess = require('child_process');
var lookUp = require('look-up');
var minimist = require('minimist');
var arrify = require('arrify');
var argv = require('the-argv');
var pathExists = require('path-exists');
var DEFAULT_TEST_SCRIPT = 'echo "Error: no test specified" && exit 1';

var PLURAL_OPTIONS = [
	'env',
	'global',
	'ignore'
];

var CONFIG_FILES = [
	'.jshintrc',
	'.eslintrc',
	'.jscsrc'
];

function warnConfigFile(pkgCwd) {
	var files = CONFIG_FILES.filter(function (x) {
		return pathExists.sync(path.join(pkgCwd, x));
	});

	if (files.length === 0) {
		return;
	}

	console.log(files.join(' & ') + ' can probably be deleted now that you\'re using XA.');
}

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

	var pkgCwd = path.dirname(pkgPath);
	var s = pkg.scripts = pkg.scripts ? pkg.scripts : {};

	if (s.test && s.test !== DEFAULT_TEST_SCRIPT) {
		// don't add if it's already there
		if (!/^xa( |$)/.test(s.test)) {
			s.test = 'xa && ' + s.test;
		}
	} else {
		s.test = 'xa';
	}

	var cli = minimist(args);
	var unicorn = cli.unicorn;

	delete cli._;
	delete cli.unicorn;
	delete cli.init;

	PLURAL_OPTIONS.forEach(function (option) {
		if (cli[option]) {
			cli[option + 's'] = arrify(cli[option]);
			delete cli[option];
		}
	});

	if (Object.keys(cli).length) {
		pkg.xa = cli;
	} else if (pkg.xa) {
		delete pkg.xa;
	}

	fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, '  ') + '\n');

	childProcess.execFile('npm', ['install', '--save-dev', 'xa'], {cwd: cwd}, function (err) {
		if (err) {
			cb(err);
			return;
		}

		warnConfigFile(pkgCwd);

		// for personal use
		if (unicorn) {
			var pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
			pkg.devDependencies.xa = '*';
			fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, '  ') + '\n');

			CONFIG_FILES.forEach(function (x) {
				try {
					fs.unlinkSync(path.join(pkgCwd, x));
				} catch (err) {}
			});
		}

		cb();
	});
};
