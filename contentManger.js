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
    relativePath: ".",
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
              !dir.startsWith(".") &&
              !dir.startsWith("0.") &&
              !dir.startsWith("15.") &&
              !dir.startsWith("99.")
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
      node.relativePath = parent.relativePath? parent.relativePath + "/" + node.name : parent.name? parent.name + "/" + node.name : node.name
      parent.children.push(node);
    } catch (e) {
      console.log("路径中可能存在特殊字符", dirPath, e);
    }
  }
  return root;
};

const renderContents = (tree) => {
  const htmlSource = utf8decoder.decode(
    fs.readFileSync(path.posix.join(__dirname, "blog", "index.html"))
  );
  const htmlRoot = Parser.parse(htmlSource);

  const rootNode = querySelector(htmlRoot, "#left-section4 div");
  // console.log("---", rootNode)
  rootNode.childNodes.forEach(node => {
    defaultTreeAdapter.detachNode(node)
  });
  rootNode.childNodes = []


  // 第一个节点需要特殊处理
  const firstP = defaultTreeAdapter.createElement("p", html.NS.HTML, []);
  const firstText = defaultTreeAdapter.createTextNode(`目录`);
  defaultTreeAdapter.appendChild(firstP, firstText);
  defaultTreeAdapter.appendChild(rootNode, firstP)
  const ul = defaultTreeAdapter.createElement("ul", html.NS.HTML, []);
  defaultTreeAdapter.appendChild(rootNode, ul)

  const root = {...tree, parentNode: ul};
  const queue = [root]; 
  while (queue.length > 0) {
    const node = queue.shift();
    if (node.isDirectory) {
      // 1) nav menu setup
      const li = defaultTreeAdapter.createElement("li", html.NS.HTML, []);
      const p = defaultTreeAdapter.createElement("p", html.NS.HTML, []);
      const text = defaultTreeAdapter.createTextNode(`${node.chapter === "."? "Collcetion" : node.chapter}`);
      const nestUl = defaultTreeAdapter.createElement("ul", html.NS.HTML, [{name: "data-path", value: node.relativePath}]);

      defaultTreeAdapter.appendChild(p, text)
      defaultTreeAdapter.appendChild(li, p)
      defaultTreeAdapter.appendChild(li, nestUl)
      defaultTreeAdapter.appendChild(node.parentNode, li)
      if (node.children?.length > 0) {
        const temp = node.children.map(item => {
          return {
            ...item,
            parentNode: nestUl,
          }
        })
        queue.unshift(...temp);
      }
      // 2) post chapter setup
    } else if (node.name.endsWith(".md")) {
      // 1) nav menu setup
      const li = defaultTreeAdapter.createElement("li", html.NS.HTML, []);
      const a = defaultTreeAdapter.createElement("a", html.NS.HTML, [{ name: "href", value: `/blog/post/html/${node.relativePath.replaceAll(/\.md$/g, ".html")}` }, { name: "data-path", value: node.relativePath}]);
      const text = defaultTreeAdapter.createTextNode(`${node.title}`);
      
      defaultTreeAdapter.appendChild(a, text);
      defaultTreeAdapter.appendChild(li, a);

      defaultTreeAdapter.appendChild(node.parentNode, li);
      // 2) post chapter setup
    }
  }

  const indexHtml = serialize(htmlRoot);
  fs.writeFileSync(path.posix.join(__dirname, "blog", "index.html"), indexHtml);

  const markedRoot = {...tree};
  const markedQueue = [markedRoot];
  while (markedQueue.length > 0) {
    const node = markedQueue.shift();
    if (node.isDirectory) {
      // create dir
      const dirpath = path.posix.join("blog/post/html", node.relativePath);
      if (!node.name.startsWith(".")) {
        if (!fs.existsSync(dirpath)) {
          fs.mkdirSync(dirpath);
        }
      }
      if (node.children?.length > 0) {
        markedQueue.unshift(...node.children);
      }
    } else if (node.name.endsWith(".md")) {
      // create html
      const templateRoot = parse(indexHtml);
      const content = queryElementById(templateRoot, "content");
      const value = parseFragment(node.html);
      value.childNodes.forEach((nd) => {
        defaultTreeAdapter.appendChild(content, nd);
      });
      const temp = serialize(templateRoot);
      const filepath = path.posix.join("blog/post/html", node.relativePath);
      fs.writeFileSync(filepath.replaceAll(/\.md$/g, ".html"), temp);
    }
  }
};


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



export const contentPlugin = () => {
  if (fs.existsSync("blog/post/html")) {
    fs.rmSync("blog/post/html", {force: true, recursive: true});
  }
  fs.mkdirSync("blog/post/html");
  const tree = getContentsTree();
  const parsedTree = parseMarkdownContent(tree);
  renderContents(parsedTree); 
}