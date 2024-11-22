// import { rollup, RollupOptions } from 'rollup';
import css from 'rollup-plugin-css-only'
import terser from '@rollup/plugin-terser';
import commonjs from '@rollup/plugin-commonjs';
// import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import fs, { readFileSync } from "node:fs";
import { env } from 'node:process';
import path from 'node:path';
// markdown highlight
import { Marked } from "marked";
import { markedHighlight } from "marked-highlight";
import hljs from "highlight.js"


const MARKDOWN_DIRECTORY = "/blog/post/md";


const marked = new Marked(
  markedHighlight({
	emptyLangClass: 'hljs',
    langPrefix: 'hljs language-',
    highlight(code, lang, info) {
      const language = hljs.getLanguage(lang) ? lang : 'plaintext';
      return hljs.highlight(code, { language }).value;
    }
  })
);





// ---cut-start---
/** @type {import('rollup').RollupOptions} */
// ---cut-end---
const rollupConfig = {
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



export default rollupConfig;