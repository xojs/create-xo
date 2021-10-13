#!/usr/bin/env node
import process from 'node:process';
import createXo from './index.js';

createXo({
	args: process.argv.slice(2),
});
