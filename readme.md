# xo-init [![Build Status](https://travis-ci.org/sindresorhus/xo-init.svg?branch=master)](https://travis-ci.org/sindresorhus/xo-init)

> Add [XO](https://github.com/sindresorhus/xo) to your project


## Install

```
$ npm install --save xo-init
```


## Usage

```js
var xoInit = require('xo-init');

xoInit(function (err) {
	console.log('done');
});
```


## API

### xoInit([options], [callback])

#### options.cwd

Type: `string`  
Default: `process.cwd()`

Current working directory.

#### options.args

Type: `array`  
Default: CLI arguments *(`process.argv.slice(2)`)*

Options to put in [XO's config](https://www.npmjs.com/package/xo#config) in `package.json`.

For instance, with the arguments `['--space', '--env=node']` the following will be put in `package.json`:

```json
{
  "name": "your-awesome-project",
  "xo": {
    "space": true,
    "envs": ["node"]
  }
}
```


## CLI

Install [XO](https://github.com/sindresorhus/xo) globally and run `$ xo --init [<options>]`.


## License

MIT © [Sindre Sorhus](http://sindresorhus.com)
