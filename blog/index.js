const pathname = new URL(window.location.href).pathname;

document.querySelector("#left-section4 > div > ul > li > ul")?.style.setProperty("display", "flex");
console.log(document.querySelector("#left-section4 > div > ul"))
const expandMenu = decodeURI(pathname).split("/").slice(4).forEach((_, i, items) => {
    const relativePath = items.slice(0, i + 1).join("/");
    if (relativePath.endsWith(".md") || relativePath.endsWith(".html") ) {
        document.querySelector(`#left-section4 > div li a[data-path='./${relativePath}']`)?.style.setProperty("background-color", "#3F3F3F");
        document.querySelector(`#left-section4 > div li a[data-path='./${relativePath.replaceAll(".html", ".md")}']`)?.style.setProperty("background-color", "#3F3F3F");
    } else {
        document.querySelector(`#left-section4 > div ul[data-path='./${relativePath}']`)?.style.setProperty("display", "flex")
    }
})

const menuData = ["工具", "模板", "项目", "笔记", "简历", "文章"];
// 下拉框
document
  .querySelector("#left-section1 svg:first-child")
  .addEventListener("click", (e) => {
    const dropdown = document.createElement("div");
    const menuContainer = document.createElement("ul");
    menuData.forEach((item) => {
        const menu = document.createElement("li");
        menu.innerText = item
        menuContainer.appendChild(menu);
    });
    dropdown.appendChild(menuContainer);
    dropdown.style.setProperty("position", "absolute");
    
    document.getElementById("left-section1").appendChild(dropdown);
  });
document
  .querySelector("#left-section1 svg:last-child")
  .addEventListener("click", (e) => {
    // 侧边栏隐藏/显示
  });
document.querySelector("#left-section2 h4").addEventListener("click", (e) => {
  // 标题变更
});
document
  .querySelector("#left-section3 .search > button")
  .addEventListener("click", (e) => {
    // search
  });

document.querySelectorAll("#left-section4 > div p").forEach((node) =>
  node.addEventListener("click", (e) => {
    if (e.target.nextSibling.style.display === "flex") {
      e.target.nextSibling.style.setProperty("display", "none");
    } else {
      e.target.nextSibling.style.setProperty("display", "flex");
    }
  })
);
