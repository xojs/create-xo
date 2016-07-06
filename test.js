import path from 'path';
import fs from 'fs';
import tempWrite from 'temp-write';
import {get} from 'dot-prop';
import test from 'ava';
import fn from './';

const originalArgv = process.argv.slice();

function run(pkg) {
	const filepath = tempWrite.sync(JSON.stringify(pkg), 'package.json');

	return fn({
		cwd: path.dirname(filepath),
		skipInstall: true
	}).then(() => JSON.parse(fs.readFileSync(filepath, 'utf8')));
}

test('empty package.json', t => {
	return run({}).then(pkg => {
		t.is(get(pkg, 'scripts.pretest'), 'xo');
		t.is(get(pkg, 'xo'), undefined);
	});
});

test('has scripts', t => {
	return run({
		scripts: {
			start: ''
		}
	}).then(pkg => {
		t.is(get(pkg, 'scripts.pretest'), 'xo');
		t.is(get(pkg, 'xo'), undefined);
	});
});

test('has default test', t => {
	return run({
		scripts: {
			test: 'echo "Error: no test specified" && exit 1'
		}
	}).then(pkg => {
		t.is(get(pkg, 'scripts.pretest'), 'xo');
		t.is(get(pkg, 'xo'), undefined);
	});
});

test('has only xo', t => {
	return run({
		scripts: {
			pretest: 'xo'
		}
	}).then(pkg => {
		t.is(get(pkg, 'scripts.pretest'), 'xo');
		t.is(get(pkg, 'xo'), undefined);
	});
});

test('has existing pretest', t => {
	return run({
		scripts: {
			pretest: 'ava'
		}
	}).then(pkg => {
		t.is(get(pkg, 'scripts.pretest'), 'xo && ava');
		t.is(get(pkg, 'xo'), undefined);
	});
});

test('has xo with others in pretest', t => {
	return run({
		scripts: {
			pretest: 'ava && xo'
		}
	}).then(pkg => {
		t.is(get(pkg, 'scripts.pretest'), 'ava && xo');
		t.is(get(pkg, 'xo'), undefined);
	});
});

test('has cli args', t => {
	process.argv = originalArgv.concat(['--init', '--space']);

	return run({
		scripts: {
			start: ''
		}
	}).then(pkg => {
		process.argv = originalArgv;
		t.is(get(pkg, 'scripts.pretest'), 'xo');
		t.is(get(pkg, 'xo.space'), true);
	});
});

test('has cli args and pretest', t => {
	process.argv = originalArgv.concat(['--init', '--env=node', '--env=browser']);

	return run({
		scripts: {
			pretest: 'ava'
		}
	}).then(pkg => {
		process.argv = originalArgv;
		t.is(get(pkg, 'scripts.pretest'), 'xo && ava');
		t.is(get(pkg, 'xo.envs.0'), 'node');
		t.is(get(pkg, 'xo.envs.1'), 'browser');
	});
});

test('has cli args and existing config', t => {
	process.argv = originalArgv.concat(['--init', '--space']);

	return run({
		xo: {
			esnext: true
		}
	}).then(pkg => {
		process.argv = originalArgv;
		t.is(get(pkg, 'scripts.pretest'), 'xo');
		t.is(get(pkg, 'xo.space'), true);
		t.is(get(pkg, 'xo.esnext'), undefined);
	});
});

test('has existing config without cli args', t => {
	process.argv = originalArgv.concat(['--init']);

	return run({
		xo: {
			esnext: true
		}
	}).then(pkg => {
		process.argv = originalArgv;
		t.is(get(pkg, 'scripts.pretest'), 'xo');
		t.is(get(pkg, 'xo'), undefined);
	});
});

test('has everything covered when it comes to config', t => {
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

	return run({}).then(pkg => {
		process.argv = originalArgv;
		t.is(get(pkg, 'scripts.pretest'), 'xo');
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

test('installs the XO dependency', t => {
	const filepath = tempWrite.sync(JSON.stringify({}), 'package.json');

	return fn({
		cwd: path.dirname(filepath)
	}).then(() => {
		t.truthy(get(JSON.parse(fs.readFileSync(filepath, 'utf8')), 'devDependencies.xo'));
	});
});
