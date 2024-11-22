export const textContainsWord = (text, word) => {
  return text.split(" ").reduce((pre, cur) => pre || cur === word, false);
};

/**
 * @param {string} id
 */
export const queryElementById = (root, id) => {
  let result;
  let queue = [root];
  while (queue.length > 0) {
    const node = queue.pop();
    if ("childNodes" in node && node.childNodes.length > 0) {
      queue.push(...node.childNodes);
    }
    if (node?.attrs && node.attrs.length > 0) {
      const isMatch =
        [...node.attrs].filter(
          ({ name, value }) => name === "id" && value === id
        ).length > 0;
      if (isMatch) {
        result = node;
        break;
      }
    }
  }
  return result;
};

export const queryElementByTagName = (root, tagName) => {
  let result;
  let queue = [root];
  while (queue.length > 0) {
    const node = queue.pop();
    if (node && node.tagName === tagName) {
      result = node;
    }
    if ("childNodes" in node && node.childNodes.length > 0) {
      queue.push(...node.childNodes);
    }
  }
  return result;
};

export const queryElementByClassName = (root, className) => {
  let result;
  let queue = [root];
  while (queue.length > 0) {
    const node = queue.pop();
    if (node?.attrs && node.attrs.length > 0) {
      const isMatch =
        [...node.attrs].filter(({ name, value }) => {
            return name === "class" && textContainsWord(value, className)
        }).length > 0;
      if (isMatch) {
        result = node;
        break;
      }
    }
    if ("childNodes" in node && node.childNodes.length > 0) {
      queue.push(...node.childNodes);
    }
  }
  return result;
};

export const querySelector = (node, selectors) => {
  const doQuery = (n, selectors) => {
    if (selectors.length <= 0) {
      return n;
    } else {
      /** @type {string} */
      const s = selectors.shift();
      let result;
      if (s.startsWith("#")) {
        result = queryElementById(n, s.slice(1));
      } else if (s.startsWith(".")) {
        result = queryElementByClass(n, s.slice(1));
      } else if (s.match(new RegExp("^[a-z]"))) {
        result = queryElementByTagName(n, s);
      }
      return doQuery(result, selectors);
    }
  };
  return doQuery(node, selectors.split(" "));
};
