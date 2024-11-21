import { Marked } from "marked";
import { markedHighlight } from "marked-highlight";
import hljs from "highlight.js"
import "../normalize.css";
import "../global.css";
import "./index.css";
import 'highlight.js/styles/github.css';

let utf8decoder = new TextDecoder();

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

// 定时读取post路径下的markdown文件, 如果有修改的, 就重新将最新版本输出为html
fetch("http://127.0.0.1:5500/blog/post/one.md")
  .then((response) => {
    const s = response.body.getReader().read();
    return s;
  })
  .then((data) => {
    let mdText = utf8decoder.decode(data.value);

    document.getElementById("content").innerHTML = marked.parse(mdText);
  });

const POST_DIRECTORY = "/blog/post/md";
const OUTPUT_HTML_DIRECTORY = "/blog/post/";
const updatePosts = () => {
  // 已只读方式读取所有md
  // 读取所有html
  // 获得最后修改时间
  // 如果md的修改时间大于html的修改时间超过1天, 就需要重新解析
  // 更新目录
};

// fetch("http://127.0.0.1:5500/blog/post")
//   .then((response) => {
//     const s = response.body.getReader().read()
//     return s
//   }).then((data) => {
//     console.log(utf8decoder.decode(data.value));
//   })

const buttons = document.querySelectorAll("#left-section4 > ul > li > a");
buttons.forEach((item) => {
  console.log(item.textContent);
  item.addEventListener("click", () => {
    // 更换center中的content
  });
});
