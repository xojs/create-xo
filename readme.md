# create-xo

> Add [XO](https://github.com/xojs/xo) to your project

## CLI

```sh
npm init xo [options]
```

Example:

```sh
npm init xo --space --no-semicolon
```

## API

### Usage

```js
import createXo from 'create-xo';

await createXo();
```

### createXo(options?)

Returns a `Promise`.

#### options

Type: `object`

#### cwd

Type: `string`\
Default: `process.cwd()`

The current working directory.

#### args

Type: `string[]`\
Default: CLI arguments *(`process.argv.slice(2)`)*

The options to put in [XO's config](https://www.npmjs.com/package/xo#config) in `package.json`.

For instance, with the arguments `['--space', '--env=node']`, the following will be put in `package.json`:

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
