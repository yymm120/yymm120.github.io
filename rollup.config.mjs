// import { rollup, RollupOptions } from 'rollup';
import css from 'rollup-plugin-css-only'
import terser from '@rollup/plugin-terser';
import commonjs from '@rollup/plugin-commonjs';
// import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';

// ---cut-start---
/** @type {import('rollup').RollupOptions} */
// ---cut-end---
export default {
	input: ["blog/index.js"],
	output: [
		{
			file: 'blog/index.min.js',
			format: 'esm',
            assetFileNames: 'assets/[name]-[hash][extname]',
			plugins: [terser()]
		}
	],
	plugins: [commonjs(), resolve(), css({output: 'bundle.css'})]
}
