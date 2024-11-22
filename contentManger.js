import fs from "node:fs";
import path from "node:path";
import { Marked } from "marked";
import { markedHighlight } from "marked-highlight";
import { Parser } from "parse5";
import { serialize, defaultTreeAdapter, html } from "parse5";
import { parseFragment } from "parse5";
import hljs from "highlight.js";
import { parse } from "parse5";
import { querySelector, queryElementById } from "./utils";

const utf8decoder = new TextDecoder();
const CONTENT_DIRECTORY = "C:\\Users\\Administrator\\Documents\\笔记";

const decode = (data) => {
  return utf8decoder.decode(data);
};

/** @returns {string} */
const readMarkdown = (mdPath) => {
  try {
    if (fs.existsSync(mdPath)) {
      return decode(fs.readFileSync(mdPath));
    }
  } catch (e) {
    console.log("read markdown occur error!", mdPath, e);
  }
};

const marked = new Marked(
  markedHighlight({
    emptyLangClass: "hljs",
    langPrefix: "hljs language-",
    highlight(code, lang, info) {
      const language = hljs.getLanguage(lang) ? lang : "plaintext";
      return hljs.highlight(code, { language }).value;
    },
  })
);

export const getContentsTree = () => {
  const root = {
    name: ".",
    dirPath: path.posix.join(CONTENT_DIRECTORY, "."),
    parent: null,
    children: [],
    isDirectory: true,
  };
  root.parent = { children: [root] };

  const queue = [root];

  while (queue.length > 0) {
    const node = queue.pop();
    const { parent, dirPath } = node;
    try {
      const isDirectory =
        fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory();
      if (isDirectory) {
        const dirs = fs.readdirSync(dirPath);
        const temp = dirs
          .filter(
            (dir) =>
              dir !== "node_modules" &&
              !dir.endsWith(".js") &&
              !dir.endsWith(".jar") &&
              !dir.startsWith(".")
          )
          .map((dir) => {
            return {
              name: dir,
              dirPath: path.posix.join(dirPath, dir),
              parent: node,
              children: [],
              isDirectory: false,
            };
          });
        queue.push(...temp);
        node.isDirectory = true;
      }
      parent.children.push(node);
    } catch (e) {
      console.log("路径中可能存在特殊字符", dirName, e);
    }
  }
  return root;
};

const renderContents = (tree) => {
  const htmlSource = utf8decoder.decode(
    fs.readFileSync(path.posix.join(__dirname, "blog", "index.html"))
  );
  const htmlRoot = Parser.parse(htmlSource);

  const ul = querySelector(htmlRoot, "#left-section4 ul");

  const queue = [tree];

  while (queue.length > 0) {
    const node = queue.shift();
    if (node.isDirectory && node.name.startsWith(".")) {
      continue;
    }

    if (node.isDirectory) {
      // 1) nav menu setup
      const li = defaultTreeAdapter.createElement("li", html.NS.HTML, []);
      // index
      const a = defaultTreeAdapter.createElement("a", html.NS.HTML, []);
      const text = defaultTreeAdapter.createTextNode(`${node.chapter}`);
      // 2) post chapter setup
    } else if (node.name.endsWith(".md")) {
      // 1) nav menu setup
      const li = defaultTreeAdapter.createElement("li", html.NS.HTML, []);
      const a = defaultTreeAdapter.createElement("a", html.NS.HTML, [{ name: "href", value: `/blog/post/${node.title}.html` },]);
      const text = defaultTreeAdapter.createTextNode(`${node.title}`);
      defaultTreeAdapter.appendChild(a, text);
      defaultTreeAdapter.appendChild(li, a);
      defaultTreeAdapter.appendChild(ul, li);
      // 2) post chapter setup
    }
  }

  // // 创建<li><a>文件名</a></li>, 然后放入ul中
  // [...dataMap].forEach(({key}) => {
  //     const li = defaultTreeAdapter.createElement("li", html.NS.HTML, [])
  //     const a = defaultTreeAdapter.createElement("a", html.NS.HTML, [{ name: "href", value : `/blog/post/${key.replaceAll(".md", "")}.html`}])
  //     const text = defaultTreeAdapter.createTextNode(`${key.replaceAll(".md", "")}`)
  //     defaultTreeAdapter.appendChild(a, text);
  //     defaultTreeAdapter.appendChild(li, a);
  //     defaultTreeAdapter.appendChild(ul, li);
  // });

  // const rootSerializeResout = serialize(htmlRoot);
  // fs.writeFileSync(path.posix.join(__dirname, "blog", "index.html"), rootSerializeResout);

  // ul.childNodes = [];
  // [...dataMap].forEach(({key, value}) => {
  //     const fileName = key.replaceAll(".md", ".html");
  //     // 每次循环都重新序列化一次, (深拷贝)
  //     // const postSerializeResult = serialize(rootSerializeResout);
  //     const postHtmlRoot = parse(rootSerializeResout);
  //     const content = queryElementById(postHtmlRoot, "content");
  //     const valueHtmlNode = parseFragment(value);
  //     // console.log(postHtmlRoot.childNodes[1].childNodes[2].childNodes[1].childNodes[3].childNodes[1]); // 查看#content节点
  //     valueHtmlNode.childNodes.forEach((node) => {
  //         defaultTreeAdapter.appendChild(content, node);
  //     })
  //     const temp = serialize(postHtmlRoot);
  //     fs.writeFileSync(path.posix.join(__dirname, "blog/post", fileName), temp);
  // });
};

const tree = getContentsTree();

const parseMarkdownContent = (tree) => {
  // TODO: 还有评论, 总结没有初始化
  const root = {
    ...tree,
    chapter: "",
    title: "",
    html: "",
    modifyTime: "",
    reference: [],
    tag: "",
    demo: [],
  };
  const queue = [root];
  while (queue.length > 0) {
    const node = queue.shift();
    node.modifyTime = "2024.11.22";
    if (node.isDirectory && node.children?.length > 0) {
      node.chapter = node.name;
      queue.unshift(...node.children);
    } else if (node && node.name.endsWith(".md")) {
      node.chapter = node.parent.name ?? " - ";
      node.title = node.name.replaceAll(".md", "");
      const nodeHtml = marked.parse(readMarkdown(node.dirPath));
      node.html = nodeHtml;
    }
  }
  return root;
};

const parsedTree = parseMarkdownContent(tree);
renderContents(parsedTree);
