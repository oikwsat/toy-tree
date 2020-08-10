#!/usr/bin/env node
import { main } from './index';

const code = main(
    process.argv.slice(2),
    console.log,
    console.error,
);

process.exit(code);