import path from 'path';
import fs from 'fs';
import tempWrite from 'temp-write';
import dotProp from 'dot-prop';
import test from 'ava';
import m from './';

const originalArgv = process.argv.slice();
const get = dotProp.get;

async function run(pkg) {
	const filepath = tempWrite.sync(JSON.stringify(pkg), 'package.json');

	await m({
		cwd: path.dirname(filepath),
		skipInstall: true
	});

	return JSON.parse(fs.readFileSync(filepath, 'utf8'));
}

test('empty package.json', async t => {
	const pkg = await run({});
	t.is(get(pkg, 'scripts.test'), 'xo');
	t.is(get(pkg, 'xo'), undefined);
});

test('has scripts', async t => {
	const pkg = await run({
		scripts: {
			start: ''
		}
	});

	t.is(get(pkg, 'scripts.test'), 'xo');
	t.is(get(pkg, 'xo'), undefined);
});

test('has default test', async t => {
	const pkg = await run({
		scripts: {
			test: 'echo "Error: no test specified" && exit 1'
		}
	});

	t.is(get(pkg, 'scripts.test'), 'xo');
	t.is(get(pkg, 'xo'), undefined);
});

test('has only xo', async t => {
	const pkg = await run({
		scripts: {
			test: 'xo'
		}
	});

	t.is(get(pkg, 'scripts.test'), 'xo');
	t.is(get(pkg, 'xo'), undefined);
});

test('has test', async t => {
	const pkg = await run({
		scripts: {
			test: 'ava'
		}
	});

	t.is(get(pkg, 'scripts.test'), 'xo && ava');
	t.is(get(pkg, 'xo'), undefined);
});

test('has cli args', async t => {
	process.argv = originalArgv.concat(['--init', '--space']);

	const pkg = await run({
		scripts: {
			start: ''
		}
	});

	process.argv = originalArgv;
	t.is(get(pkg, 'scripts.test'), 'xo');
	t.is(get(pkg, 'xo.space'), true);
});

test('has cli args and test', async t => {
	process.argv = originalArgv.concat(['--init', '--env=node', '--env=browser']);

	const pkg = await run({
		scripts: {
			test: 'ava'
		}
	});

	process.argv = originalArgv;
	t.is(get(pkg, 'scripts.test'), 'xo && ava');
	t.is(get(pkg, 'xo.envs.0'), 'node');
	t.is(get(pkg, 'xo.envs.1'), 'browser');
});

test('has cli args and existing config', async t => {
	process.argv = originalArgv.concat(['--init', '--space']);

	const pkg = await run({
		xo: {
			esnext: true
		}
	});

	process.argv = originalArgv;
	t.is(get(pkg, 'scripts.test'), 'xo');
	t.is(get(pkg, 'xo.space'), true);
	t.is(get(pkg, 'xo.esnext'), undefined);
});

test('has existing config without cli args', async t => {
	process.argv = originalArgv.concat(['--init']);

	const pkg = await run({
		xo: {
			esnext: true
		}
	});

	process.argv = originalArgv;
	t.is(get(pkg, 'scripts.test'), 'xo');
	t.is(get(pkg, 'xo'), undefined);
});

test('has everything covered when it comes to config', async t => {
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

	const pkg = await run({});

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

test('installs the XO dependency', async t => {
	const filepath = tempWrite.sync(JSON.stringify({}), 'package.json');
	await m({cwd: path.dirname(filepath)});
	t.truthy(get(JSON.parse(fs.readFileSync(filepath, 'utf8')), 'devDependencies.xo'));
});

test('installs via yarn if there\'s a lockfile', async t => {
	const yarnLock = tempWrite.sync('', 'yarn.lock');
	await m({cwd: path.dirname(yarnLock)});
	console.log(fs.readFileSync(yarnLock, 'utf8'));
	t.not('', fs.readFileSync(yarnLock, 'utf8'));
});
