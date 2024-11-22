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

// fetch("http://127.0.0.1:5500/blog/post/one.md")
//   .then((response) => {
//     const s = response.body.getReader().read();
//     return s;
//   })
//   .then((data) => {
//     let mdText = utf8decoder.decode(data.value);

//     document.getElementById("content").innerHTML = marked.parse(mdText);
//   });

const buttons = document.querySelectorAll("#left-section4 > ul > li > button");
buttons.forEach((item) => {
  console.log(item.textContent);
  item.addEventListener("click", (e) => {
    console.log(e)
  });
});
