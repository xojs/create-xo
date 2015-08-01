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


## CLI

Install [XO](https://github.com/sindresorhus/xo) globally and run `$ xo --init`.


## License

MIT © [Sindre Sorhus](http://sindresorhus.com)
