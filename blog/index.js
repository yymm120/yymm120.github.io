import { marked } from "https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js";

let utf8decoder = new TextDecoder();

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



const buttons = document.querySelectorAll("#left-section4 > ul > li > a")
buttons.forEach(item => {
    console.log(item.textContent)
    item.addEventListener("click", () => {
        // 更换center中的content
    })
})