let addCSSFlg;
let addJsFlg;
let pageIndex;

// addCSS.onclick = () => {
//   const httpRequest = new XMLHttpRequest();
//   httpRequest.open("GET", "./Async/AsyncCSS.CSS", true);
//   httpRequest.onreadystatechange = () => {
//     // console.log(httpRequest.readyState);
//     // console.log(httpRequest.status);
//     if (httpRequest.readyState === 4) {
//       if (httpRequest.status === 200) {
//         console.log(`亲 好评`);
//         if (!addCSSFlg) {
//           const style = document.createElement(`style`);
//           style.innerHTML = httpRequest.response;
//           document.head.appendChild(style);
//           addCSSFlg = true;
//         }
//       } else {
//         console.log(`货是送到了 但是东西貌似有问题`);
//       }
//     } else {
//       console.log(`快递还木有到`);
//     }
//   };
//   httpRequest.send();
// };
// addJs.onclick = () => {
//   const httpRequest = new XMLHttpRequest();
//   httpRequest.open("GET", "./Async/AsyncJs.js", true);
//   httpRequest.onreadystatechange = () => {
//     if (httpRequest.readyState === 4) {
//       if (httpRequest.status === 200) {
//         console.log(`亲 好评`);
//         const mainHTML = document.querySelector(`#mainHTML`);
//         if (!addJsFlg && mainHTML) {
//           const script = document.createElement(`script`);
//           script.innerHTML = httpRequest.response;
//           document.body.appendChild(script);
//           addJsFlg = true;
//         }
//       } else {
//         console.log(`货是送到了 但是东西貌似有问题`);
//       }
//     } else {
//       console.log(`快递还木有到`);
//     }
//   };
//   httpRequest.send();
// };
// addHTML.onclick = () => {
//   const httpRequest = new XMLHttpRequest();
//   httpRequest.open("GET", "./Async/AsyncHTML.HTML", true);
//   httpRequest.onreadystatechange = () => {
//     if (httpRequest.readyState === 4) {
//       if (httpRequest.status === 200) {
//         console.log(`亲 好评`);
//         const mainHTML = document.querySelector(`#mainHTML`);
//         if (!mainHTML) {
//           const html = document.createElement(`template`);
//           html.innerHTML = httpRequest.response;
//           document.body.appendChild(html.content.firstChild);
//         }
//       } else {
//         console.log(`货是送到了 但是东西貌似有问题`);
//       }
//     } else {
//       console.log(`快递还木有到`);
//     }
//   };
//   httpRequest.send();
// };

// addXML.onclick = () => {
//   const httpRequest = new XMLHttpRequest();
//   httpRequest.open("GET", "./Async/AsyncXML.XML", true);
//   httpRequest.onreadystatechange = () => {
//     if (httpRequest.readyState === 4) {
//       if (httpRequest.status === 200) {
//         console.log(`亲 好评`);
//         const xml = httpRequest.responseXML;
//         const text = xml
//           .querySelectorAll(`message > warning`)[0]
//           .innerHTML.trim();
//         Title.innerText = text;
//       } else {
//         console.log(`货是送到了 但是东西貌似有问题`);
//       }
//     } else {
//       console.log(`快递还木有到`);
//     }
//   };
//   httpRequest.send();
// };
// addJSON.onclick = () => {
//   const httpRequest = new XMLHttpRequest();
//   httpRequest.open("GET", "./Async/AsyncJSON.JSON", true);
//   httpRequest.onreadystatechange = () => {
//     if (httpRequest.readyState === 4) {
//       if (httpRequest.status === 200) {
//         console.log(`亲 好评`);
//         const JSONObj = JSON.parse(httpRequest.response);
//         Title.innerText = JSONObj.title;
//       } else {
//         console.log(`货是送到了 但是东西貌似有问题`);
//       }
//     } else {
//       console.log(`快递还木有到`);
//     }
//   };
//   httpRequest.send();
// };

registerUser.onclick = () => {
  //拿数据
  let userNameEle = document.querySelector(`#userName`);
  let passWordEle = document.querySelector(`#passWord`);
  const userDta = {
    userName: userNameEle.value,
    passWord: passWordEle.value
  };
  //做请求
  const httpRequest = new XMLHttpRequest();
  httpRequest.open("POST", "./registerUser", true);
  httpRequest.setRequestHeader("Content-type", "application/json");
  httpRequest.setRequestHeader("Cache-Control", "no-cache");
  httpRequest.send(JSON.stringify(userDta));
  //监听响应
  httpRequest.onreadystatechange = () => {
    if (httpRequest.readyState === 4) {
      if (httpRequest.status === 200) {
        // console.log(`亲 好评`);
        const URLStr = httpRequest.response;
        // console.log(URLStr);
        // location.href = URLStr;
        // location = URLStr;
        // window.open(URLStr);
        // window.open();
      } else {
        const m = httpRequest.response;
        window.alert(m);
        // console.log(`货是送到了 但是东西貌似有问题`);
      }
    } else {
      // console.log(`快递还木有到`);
    }
  };
};

console.log(`Hello AJAX`);
