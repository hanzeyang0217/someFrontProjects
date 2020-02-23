# 介绍

- 用`XMLHttpRequest` 没用`fetch`
- 没用`promise`
- 参考了[jQuery.ajax](https://www.jquery123.com/jQuery.ajax/)

# 测试方法

- `node server.js port`

# 具体

## 这样去用俺的库

```javascript
$.ajax({
  url: "./Async/AsyncHTML.HTML",
  cache: "no-cache",
  success: html => {
    const mainHTML = document.querySelector(`#mainHTML`);
    if (!mainHTML) {
      const tempHtml = document.createElement(`template`);
      tempHtml.innerHTML = html;
      document.body.appendChild(tempHtml.content.firstChild);
    }
  }
});
```

# 写了一下发现

- 好简单 不写了。。
- 先去学 promise 了
