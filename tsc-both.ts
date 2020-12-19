#!/usr/bin/env node

import * as child_process from 'child_process';
import * as fs from 'fs';
import * as glob from 'glob';
import * as rimraf from 'rimraf';
import * as path from 'path';

const tsconfig = JSON.parse(fs.readFileSync('tsconfig.json', { encoding: 'utf-8' }));
const dir = tsconfig.compilerOptions.outDir;

if (!dir) throw new Error('outDir not specified in tsconfig');

rimraf.sync(dir);

child_process.execSync('npx tsc -m esnext');

for (let fn of glob.sync(dir + '/**/*.js')) {
	const code = fs.readFileSync(fn, { encoding: 'utf-8' })
		.replace(
			/^(\/\/# sourceMappingURL=.*)\.js\.map$/m,
			'$1.mjs.map'
		);
	fs.writeFileSync(fn, code);
	fs.renameSync(fn, fn.replace(/\.js$/, '.mjs'));
}
for (let fn of glob.sync(dir + '/**/*.mjs')) {
	const code = fs.readFileSync(fn, { encoding: 'utf-8' })
		.replace(
			/(import|export)(\s.*?\sfrom)?\s+(['"])(\..*)['"]/g,
			(ss, kw, what, q, from) => {
				if (!from || from.match(/\.mjs$/)) return ss;
				const proper = from.replace(/.(ts|js)$/, '') + '.mjs';
				if (fs.existsSync(path.resolve(path.dirname(fn), proper))) return kw + (what || '') + q + proper + q;
				return ss;
			}
		);
	fs.writeFileSync(fn, code);
}

for (let fn of glob.sync(dir + '/**/*.js.map')) {
	const map = JSON.parse(fs.readFileSync(fn, { encoding: 'utf-8' }));
	map.file = map.file.replace(/\.js$/, '.mjs');
	fs.writeFileSync(fn, JSON.stringify(map));
	fs.renameSync(fn, fn.replace(/\.js\.map$/, '.mjs.map'));
}

child_process.execSync('npx tsc -m commonjs -d');
