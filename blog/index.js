import { marked } from "https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js";

let utf8decoder = new TextDecoder();

fetch("http://127.0.0.1:5500/blog/post/one.md")
  .then((response) => {
    const s = response.body.getReader().read();
    return s;
  })
  .then((data) => {
    let mdText = utf8decoder.decode(data.value);
    document.getElementById("content").innerHTML = marked.parse(mdText);
  });
