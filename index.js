import process from 'node:process';
import path from 'node:path';
import fs from 'node:fs';
import minimist from 'minimist';
import {readPackageUpSync} from 'read-pkg-up';
import {writePackageSync} from 'write-pkg';
import execa, {sync as execaSync} from 'execa';
import hasYarn from 'has-yarn';

const DEFAULT_TEST_SCRIPT = 'echo "Error: no test specified" && exit 1';

const PLURAL_OPTIONS = [
	'env',
	'global',
	'ignore',
];

const CONFIG_FILES = [
	'.eslintrc.js',
	'.eslintrc.yaml',
	'.eslintrc.yml',
	'.eslintrc.json',
	'.eslintrc',
	'.jshintrc',
	'.jscsrc',
	'.jscs.json',
	'.jscs.yaml',
];

const buildTestScript = test => {
	if (test && test !== DEFAULT_TEST_SCRIPT) {
		// Don't add if it's already there
		if (!/^xo( |$)/.test(test)) {
			return `xo && ${test}`;
		}

		return test;
	}

	return 'xo';
};

const warnConfigFile = packageCwd => {
	const files = CONFIG_FILES.filter(file => fs.existsSync(path.join(packageCwd, file)));

	if (files.length === 0) {
		return;
	}

	console.log(`${files.join(' & ')} can probably be deleted now that you're using XO.`);
};

export default async function createXo(options = {}) {
	const {
		packageJson = {},
		path: packagePath = path.resolve(options.cwd || '', 'package.json'),
	} = readPackageUpSync({
		cwd: options.cwd,
		normalize: false,
	}) || {};

	const packageCwd = path.dirname(packagePath);

	packageJson.scripts = packageJson.scripts || {};
	packageJson.scripts.test = buildTestScript(packageJson.scripts.test);

	const cli = minimist(options.args || process.argv.slice(2));
	delete cli._;

	const dependencies = packageJson.dependencies || {};
	const isVueProject = Boolean(dependencies.vue) || Boolean(cli.vue);
	const isReactProject = Boolean(dependencies.react) || Boolean(cli.react);
	const createConfigFile = Boolean(cli.config);
	delete cli.vue;
	delete cli.react;
	delete cli.config;

	for (const option of PLURAL_OPTIONS) {
		if (cli[option]) {
			cli[`${option}s`] = [cli[option]].flat();
			delete cli[option];
		}
	}

	if (Object.keys(cli).length > 0) {
		packageJson.xo = {
			...packageJson.xo,
			...cli,
		};
	}

	writePackageSync(packagePath, packageJson);

	const post = () => {
		warnConfigFile(packageCwd);
	};

	if (createConfigFile) {
		writeConfigFile(path.join(packageCwd, '.xo-config.cjs'), {isVue: isVueProject, isReact: isReactProject});
	}

	if (options.skipInstall) {
		post();
		return;
	}

	const packages = [
		'xo',
		isVueProject && 'eslint-config-xo-vue',
		isReactProject && 'eslint-config-xo-react',
		createConfigFile && 'eslint-define-config',
	].filter(Boolean);

	if (hasYarn(packageCwd)) {
		try {
			const yarnVersion = execaSync('yarn', ['--version'], {cwd: packageCwd});
			const version = Number.parseFloat(yarnVersion.stdout);
			const arguments_ = version > 1 ? ['add', '--prefer-dev', ...packages] : ['add', '--dev', '--ignore-workspace-root-check', ...packages];
			execaSync('yarn', arguments_, {cwd: packageCwd, stdio: 'inherit'});
			post();
		} catch (error) {
			if (error.code === 'ENOENT') {
				console.error('This project uses Yarn but you don\'t seem to have Yarn installed.\nRun `npm install --global yarn` to install it.');
				return;
			}

			throw error;
		}

		return;
	}

	await execa('npm', ['install', '--save-dev', ...packages], {cwd: packageCwd});
	post();
}

function writeConfigFile(path, {isVue, isReact}) {
	const configFile = `
const { defineConfig } = require('eslint-define-config');
module.exports = defineConfig({
	// root: true,

	rules: {
		// intellisence supported
	},

	extends: [
		${['xo', isVue && 'xo-vue', isReact && 'xo-react']
		.filter(Boolean)
		.map(x => `'${x}',`).join('\n\t\t')
}
	],

});`;
	fs.writeFileSync(path, configFile);
}
