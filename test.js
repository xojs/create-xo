import path from 'node:path';
import fs from 'node:fs';
import process from 'node:process';
import tempWrite from 'temp-write';
import {getProperty} from 'dot-prop';
import test from 'ava';
import createXo from './index.js';

const originalArgv = [...process.argv];

async function run(pkg) {
	const filepath = tempWrite.sync(JSON.stringify(pkg), 'package.json');

	await createXo({
		cwd: path.dirname(filepath),
		skipInstall: true,
	});

	return JSON.parse(fs.readFileSync(filepath, 'utf8'));
}

test('empty package.json', async t => {
	const pkg = await run({});
	t.is(getProperty(pkg, 'scripts.test'), 'xo');
	t.is(getProperty(pkg, 'xo'), undefined);
});

test('has scripts', async t => {
	const pkg = await run({
		scripts: {
			start: '',
		},
	});

	t.is(getProperty(pkg, 'scripts.test'), 'xo');
	t.is(getProperty(pkg, 'xo'), undefined);
});

test('has default test', async t => {
	const pkg = await run({
		scripts: {
			test: 'echo "Error: no test specified" && exit 1',
		},
	});

	t.is(getProperty(pkg, 'scripts.test'), 'xo');
	t.is(getProperty(pkg, 'xo'), undefined);
});

test('has only xo', async t => {
	const pkg = await run({
		scripts: {
			test: 'xo',
		},
	});

	t.is(getProperty(pkg, 'scripts.test'), 'xo');
	t.is(getProperty(pkg, 'xo'), undefined);
});

test('has test', async t => {
	const pkg = await run({
		scripts: {
			test: 'ava',
		},
	});

	t.is(getProperty(pkg, 'scripts.test'), 'xo && ava');
	t.is(getProperty(pkg, 'xo'), undefined);
});

test('has cli args', async t => {
	process.argv = [...originalArgv, '--space'];

	const pkg = await run({
		scripts: {
			start: '',
		},
	});

	process.argv = originalArgv;
	t.is(getProperty(pkg, 'scripts.test'), 'xo');
	t.is(getProperty(pkg, 'xo.space'), true);
});

test('has cli args and test', async t => {
	process.argv = [...originalArgv, '--env=node', '--env=browser'];

	const pkg = await run({
		scripts: {
			test: 'ava',
		},
	});

	process.argv = originalArgv;
	t.is(getProperty(pkg, 'scripts.test'), 'xo && ava');
	t.is(getProperty(pkg, 'xo.envs[0]'), 'node');
	t.is(getProperty(pkg, 'xo.envs[1]'), 'browser');
});

test('has cli args and existing config', async t => {
	process.argv = [...originalArgv, '--space'];

	const pkg = await run({
		xo: {
			esnext: true,
		},
	});

	process.argv = originalArgv;
	t.is(getProperty(pkg, 'scripts.test'), 'xo');
	t.is(getProperty(pkg, 'xo.space'), true);
	t.is(getProperty(pkg, 'xo.esnext'), true);
});

test('has existing config without cli args', async t => {
	process.argv = originalArgv;

	const pkg = await run({
		xo: {
			esnext: true,
		},
	});

	process.argv = originalArgv;
	t.is(getProperty(pkg, 'scripts.test'), 'xo');
	t.deepEqual(getProperty(pkg, 'xo'), {esnext: true});
});

test('has everything covered when it comes to config', async t => {
	process.argv = [
		...originalArgv,
		'--space',
		'--esnext',
		'--no-semicolon',
		'--env=foo',
		'--env=bar',
		'--global=foo',
		'--global=bar',
		'--ignore=foo',
		'--ignore=bar',
	];

	const pkg = await run({});

	process.argv = originalArgv;
	t.is(getProperty(pkg, 'scripts.test'), 'xo');
	t.is(getProperty(pkg, 'xo.space'), true);
	t.is(getProperty(pkg, 'xo.esnext'), true);
	t.is(getProperty(pkg, 'xo.semicolon'), false);
	t.is(getProperty(pkg, 'xo.envs[0]'), 'foo');
	t.is(getProperty(pkg, 'xo.envs[1]'), 'bar');
	t.is(getProperty(pkg, 'xo.globals[0]'), 'foo');
	t.is(getProperty(pkg, 'xo.globals[1]'), 'bar');
	t.is(getProperty(pkg, 'xo.ignores[0]'), 'foo');
	t.is(getProperty(pkg, 'xo.ignores[1]'), 'bar');
});

test('installs the XO dependency', async t => {
	const filepath = tempWrite.sync(JSON.stringify({}), 'package.json');
	await createXo({cwd: path.dirname(filepath)});
	t.truthy(getProperty(JSON.parse(fs.readFileSync(filepath, 'utf8')), 'devDependencies.xo'));
});

test('installs via yarn if there\'s a lockfile', async t => {
	const yarnLock = tempWrite.sync('', 'yarn.lock');
	await createXo({cwd: path.dirname(yarnLock)});
	t.regex(fs.readFileSync(yarnLock, 'utf8'), /xo/);
});
