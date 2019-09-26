#!/usr/bin/env node
'use strict';
const createXo = require('.');

createXo({
	args: process.argv.slice(2)
});
