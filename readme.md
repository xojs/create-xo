# create-xo [![Build Status](https://travis-ci.org/xojs/create-xo.svg?branch=master)](https://travis-ci.org/xojs/create-xo)

> Add [XO](https://github.com/xojs/xo) to your project


## CLI

```
$ npm init xo [options]
```

Example:

```
$ npm init xo --space --no-semicolon
```


## API

### Usage

```js
const createXo = require('create-xo');

(async () => {
	await createXo();
})();
```

### createXo(options?)

Returns a `Promise`.

#### options

Type: `object`

#### cwd

Type: `string`<br>
Default: `process.cwd()`

Current working directory.

#### args

Type: `string[]`<br>
Default: CLI arguments *(`process.argv.slice(2)`)*

Options to put in [XO's config](https://www.npmjs.com/package/xo#config) in `package.json`.

For instance, with the arguments `['--space', '--env=node']` the following will be put in `package.json`:

```json
{
	"name": "awesome-package",
	"xo": {
		"space": true,
		"envs": [
			"node"
		]
	}
}
```
