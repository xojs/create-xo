# xa-init

> Add [xa](https://github.com/AXA-GROUP-SOLUTIONS/xa) to your project


## Install

```
$ npm install --save xa-init
```


## Usage

```js
var xaInit = require('xa-init');

xaInit(function (err) {
	console.log('done');
});
```


## API

### xaInit([options], [callback])

#### options.cwd

Type: `string`  
Default: `process.cwd()`

Current working directory.

#### options.args

Type: `array`  
Default: CLI arguments *(`process.argv.slice(2)`)*

Options to put in [xa's config](https://github.com/AXA-GROUP-SOLUTIONS/xa#config) in `package.json`.

For instance, with the arguments `['--space', '--env=node']` the following will be put in `package.json`:

```json
{
  "name": "your-awesome-project",
  "xa": {
    "space": true,
    "envs": ["node"]
  }
}
```


## CLI

Install [xa](https://github.com/AXA-GROUP-SOLUTIONS/xa) globally and run `$ xa --init [<options>]`.


## License

MIT © [Sindre Sorhus](http://sindresorhus.com)
