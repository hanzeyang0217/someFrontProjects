registerUser.onclick = () => {
  let userNameEle = document.querySelector(`#userName`);
  let passWordEle = document.querySelector(`#passWord`);
  const userData = {
    userName: userNameEle.value,
    passWord: passWordEle.value
  };

  $.ajax({
    method: "POST",
    url: "./registerUser",
    contentType: "application/json",
    data: JSON.stringify(userData),
    success: URL => {
      location.href = URL;
    }
  });
};

addHTML.onclick = () => {
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
};

let addCSSFlg;
let addJsFlg;

addCSS.onclick = () => {
  $.ajax({
    url: "./Async/AsyncCSS.CSS",
    success: css => {
      if (!addCSSFlg) {
        const style = document.createElement(`style`);
        style.innerHTML = css;
        document.head.appendChild(style);
        addCSSFlg = true;
      }
    }
  });
};
addJs.onclick = () => {
  $.ajax({
    url: "./Async/AsyncJs.js",
    success: js => {
      const mainHTML = document.querySelector(`#mainHTML`);
      if (!addJsFlg && mainHTML) {
        const script = document.createElement(`script`);
        script.innerHTML = js;
        document.body.appendChild(script);
        addJsFlg = true;
      }
    }
  });
};
addJSON.onclick = () => {
  $.ajax({
    url: "./Async/AsyncJSON.JSON",
    success: JSONStr => {
      const mainHTML = document.querySelector(`#mainHTML`);
      const JSONObj = JSON.parse(JSONStr);
      Title.innerText = JSONObj.title;
    }
  });
};
