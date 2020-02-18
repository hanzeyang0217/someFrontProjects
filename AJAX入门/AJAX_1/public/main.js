// const addCSS = document.querySelector(`#addCSS`);
// addCSS.addEventListener(`click`, addCSSClick);
// function addCSSClick(params) {
//   let httpRequest = new XMLHttpRequest();
//   httpRequest.open("GET", "./Async/AsyncCSS.CSS");
//   httpRequest.onload = () => {
//     console.log(`请求成功`);
//   };
//   httpRequest.onerror = () => {
//     console.log(`请求失败`);
//   };
//   httpRequest.send();
// }

//这边偷懒 因为正式写法太长了 改用ID

// addCSS.onclick = () => {
//   const httpRequest = new XMLHttpRequest();
//   httpRequest.open("GET", "./Async/AsyncCSS.CSS", true);
//   httpRequest.onload = () => {
//     const style = document.createElement(`style`);
//     style.innerHTML = httpRequest.response;
//     document.head.appendChild(style);
//   };
//   httpRequest.onerror = () => {
//     console.log(`请求失败`);
//   };
//   httpRequest.send();
// };
//onerror不管用所以换 onreadystatechange
let addCSSFlg;
let addJsFlg;
let pageIndex;

addCSS.onclick = () => {
  const httpRequest = new XMLHttpRequest();
  httpRequest.open("GET", "./Async/AsyncCSS.CSS", true);
  httpRequest.onreadystatechange = () => {
    // console.log(httpRequest.readyState);
    // console.log(httpRequest.status);
    if (httpRequest.readyState === 4) {
      if (httpRequest.status === 200) {
        console.log(`亲 好评`);
        if (!addCSSFlg) {
          const style = document.createElement(`style`);
          style.innerHTML = httpRequest.response;
          document.head.appendChild(style);
          addCSSFlg = true;
        }
      } else {
        console.log(`货是送到了 但是东西貌似有问题`);
      }
    } else {
      console.log(`快递还木有到`);
    }
  };
  httpRequest.send();
};
addJs.onclick = () => {
  const httpRequest = new XMLHttpRequest();
  httpRequest.open("GET", "./Async/AsyncJs.js", true);
  httpRequest.onreadystatechange = () => {
    if (httpRequest.readyState === 4) {
      if (httpRequest.status === 200) {
        console.log(`亲 好评`);
        const mainHTML = document.querySelector(`#mainHTML`);
        if (!addJsFlg && mainHTML) {
          const script = document.createElement(`script`);
          script.innerHTML = httpRequest.response;
          document.body.appendChild(script);
          addJsFlg = true;
        }
      } else {
        console.log(`货是送到了 但是东西貌似有问题`);
      }
    } else {
      console.log(`快递还木有到`);
    }
  };
  httpRequest.send();
};
addHTML.onclick = () => {
  const httpRequest = new XMLHttpRequest();
  httpRequest.open("GET", "./Async/AsyncHTML.HTML", true);
  httpRequest.onreadystatechange = () => {
    if (httpRequest.readyState === 4) {
      if (httpRequest.status === 200) {
        console.log(`亲 好评`);
        const mainHTML = document.querySelector(`#mainHTML`);
        if (!mainHTML) {
          const html = document.createElement(`template`);
          html.innerHTML = httpRequest.response;
          document.body.appendChild(html.content.firstChild);
        }
      } else {
        console.log(`货是送到了 但是东西貌似有问题`);
      }
    } else {
      console.log(`快递还木有到`);
    }
  };
  httpRequest.send();
};
addPage.onclick = () => {
  if (!pageIndex) {
    pageIndex = 1;
  }
  const maxPageIndex = 1;
  const httpRequest = new XMLHttpRequest();
  httpRequest.open("GET", `./DB/data${pageIndex}.JSON`, true);
  httpRequest.onreadystatechange = () => {
    if (httpRequest.readyState === 4) {
      if (httpRequest.status === 200) {
        console.log(`亲 好评`);
        if (pageIndex <= maxPageIndex) {
          const JSONObj = JSON.parse(httpRequest.response);
          JSONObj.forEach(item => {
            let id = item.id;
            let text = item.text;
            let liEle = document.createElement(`li`);
            // console.log(liEle);
            liEle.innerText = text;
            liEle.id = id;
            list.appendChild(liEle);
          });
        }
        pageIndex++;
      } else {
        console.log(`货是送到了 但是东西貌似有问题`);
      }
    } else {
      console.log(`快递还木有到`);
    }
  };
  if (pageIndex <= maxPageIndex) {
    httpRequest.send();
  }
};
addXML.onclick = () => {
  const httpRequest = new XMLHttpRequest();
  httpRequest.open("GET", "./Async/AsyncXML.XML", true);
  httpRequest.onreadystatechange = () => {
    if (httpRequest.readyState === 4) {
      if (httpRequest.status === 200) {
        console.log(`亲 好评`);
        const xml = httpRequest.responseXML;
        const text = xml
          .querySelectorAll(`message > warning`)[0]
          .innerHTML.trim();
        Title.innerText = text;
      } else {
        console.log(`货是送到了 但是东西貌似有问题`);
      }
    } else {
      console.log(`快递还木有到`);
    }
  };
  httpRequest.send();
};
addJSON.onclick = () => {
  const httpRequest = new XMLHttpRequest();
  httpRequest.open("GET", "./Async/AsyncJSON.JSON", true);
  httpRequest.onreadystatechange = () => {
    if (httpRequest.readyState === 4) {
      if (httpRequest.status === 200) {
        console.log(`亲 好评`);
        const JSONObj = JSON.parse(httpRequest.response);
        Title.innerText = JSONObj.title;
      } else {
        console.log(`货是送到了 但是东西貌似有问题`);
      }
    } else {
      console.log(`快递还木有到`);
    }
  };
  httpRequest.send();
};
console.log(`Hello AJAX`);
