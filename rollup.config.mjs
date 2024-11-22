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
import { Parser } from 'parse5';
import { serialize, defaultTreeAdapter, html } from 'parse5';
import { parseFragment } from 'parse5';
import { parse } from 'parse5';

const MARKDOWN_DIRECTORY = "/blog/post/md";
const OUTPUT_DIRECTORY = "/blog/post/";

const readMarkdown = () => {
    // const markdownDir = fs.readdirSync(MARKDOWN_DIRECTORY);
    // const m = markdownDir.filter(file => file.endsWith(".md"))
    let utf8decoder = new TextDecoder();
    const d = path.posix.join(__dirname, MARKDOWN_DIRECTORY)
    const fileNames = fs.readdirSync(d)
    const result = new Map()
    for (const name of fileNames) {
        const mdText = utf8decoder.decode(fs.readFileSync(path.posix.join(d, name)));
        result.set(name, mdText)
    }
    return result;
}


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

const parseMarkdown = (dataMap) => {
    const result = [...dataMap].map(([key, value]) => {
        return {key, value: marked.parse(value)}
    });
    return result;
}

/** 
 * @param {string} id
 */
const queryElementById = (root, id) => {
    let result;
    let queue = [root];
    while (queue.length > 0) {
        const node = queue.pop();
        if ("childNodes" in node && node.childNodes.length > 0) {
            queue.push(...node.childNodes);
        }
        if (node?.attrs && node.attrs.length > 0) {
            const isMatch = [...node.attrs].filter(({name, value}) => name === "id" && value === id).length > 0;
            if (isMatch) {
                result = node
                break;
            }
        }
    }
    return result
}


const writeResult = (dataMap) => {
    let utf8decoder = new TextDecoder();
    const htmlSource = utf8decoder.decode(fs.readFileSync(path.posix.join(__dirname, "blog", "index.html")))
    const htmlRoot = Parser.parse(htmlSource);

    // 找到 #left-section4, 也就是标签 <ul>
    let queue = [htmlRoot];
    let ul ;
    let content;
    while(queue.length > 0) {
        const node = queue.pop()
        if ("childNodes" in node && node.childNodes.length > 0) {
            queue.push(...node.childNodes);
        }
        if (node && node.tagName === "div" && node.attrs.length > 0) {
            const isLeftSection4 = [...node.attrs].filter(({name, value}) => name === "id" && value === "left-section4").length > 0;
            if (isLeftSection4) {
                ul = [...node.childNodes]
                    .filter(({tagName}) => tagName === "ul")[0];
                [...ul.childNodes].forEach((node) => defaultTreeAdapter.detachNode(node))
            }
            const isContent = [...node.attrs].filter(({name, value}) => name === "id" && value === "content").length > 0;
            if (isContent) {
                content = node
            }
        }
    }


    // 创建<li><a>文件名</a></li>, 然后放入ul中
    [...dataMap].forEach(({key}) => {
        const li = defaultTreeAdapter.createElement("li", html.NS.HTML, [])
        const a = defaultTreeAdapter.createElement("a", html.NS.HTML, [{ name: "href", value : `/blog/post/${key.replaceAll(".md", "")}.html`}])
        const text = defaultTreeAdapter.createTextNode(`${key.replaceAll(".md", "")}`)
        defaultTreeAdapter.appendChild(a, text);
        defaultTreeAdapter.appendChild(li, a);
        defaultTreeAdapter.appendChild(ul, li);
    })

    const rootSerializeResout = serialize(htmlRoot);
    fs.writeFileSync(path.posix.join(__dirname, "blog", "index.html"), rootSerializeResout);

    ul.childNodes = [];
    [...dataMap].forEach(({key, value}) => {
        const fileName = key.replaceAll(".md", ".html");
        // 每次循环都重新序列化一次, (深拷贝)
        // const postSerializeResult = serialize(rootSerializeResout);
        const postHtmlRoot = parse(rootSerializeResout);
        const content = queryElementById(postHtmlRoot, "content");
        const valueHtmlNode = parseFragment(value);
        // console.log(postHtmlRoot.childNodes[1].childNodes[2].childNodes[1].childNodes[3].childNodes[1]); // 查看#content节点
        valueHtmlNode.childNodes.forEach((node) => {
            defaultTreeAdapter.appendChild(content, node);
        })
        const temp = serialize(postHtmlRoot);
        fs.writeFileSync(path.posix.join(__dirname, "blog/post", fileName), temp);
    });

}
const dataMap = parseMarkdown(readMarkdown())
writeResult(dataMap)



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