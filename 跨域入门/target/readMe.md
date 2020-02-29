# 介绍

- 用`XMLHttpRequest` 没用`fetch`
- 用了`promise`
- 就是把上面那版用`promise`重写了一下罢了

# 测试方法

- `node server.js port`

# 具体

## 这样去用俺的库

```javascript
$.ajax({
  url: "./Async/AsyncHTML.HTML",
  cache: "no-cache"
}).then(
  html => {
    const mainHTML = document.querySelector(`#mainHTML`);
    if (!mainHTML) {
      const tempHtml = document.createElement(`template`);
      tempHtml.innerHTML = html;
      document.body.appendChild(tempHtml.content.firstChild);
    }
  },
  (request, status) => {}
);
// async / await ver
async function asyncMgr() {
  const html = await $.ajax({
    url: url,
    cache: cache
  });
  appendHtml(html);
}
asyncMgr();
function appendHtml(html) {
  const mainHTML = document.querySelector(`#mainHTML`);
  if (!mainHTML) {
    const tempHtml = document.createElement(`template`);
    tempHtml.innerHTML = html;
    document.body.appendChild(tempHtml.content.firstChild);
  }
}
```

# 写了一下发现

- 现在貌似没必要学太深 就先这样吧
- `fetch`还没有摸
- `promise`等等的一些 api 也以后再说
