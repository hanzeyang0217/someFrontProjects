import _ from "lodash";
import "./style.css";
import "./scssStyle.scss";
import "./lessStyle.less";
import Icon from "./小黄鸡.png";
import Data from "./data.xml";
import printMe from "./print.js";

function component() {
  const element = document.createElement("div");
  const btn = document.createElement("button");
  const lazyBtn = document.createElement("button");

  btn.innerHTML = "点击这里，然后查看 console！";
  btn.onclick = printMe;
  lazyBtn.innerHTML = "lazyLoad";
  lazyBtn.onclick = () => {
    const lazyDate = import(`./lazyData.json`);
    lazyDate.then(module => {
      console.log(module.default);
    });
  };
  // lodash（目前通过一个 script 引入）对于执行这一行是必需的
  element.innerHTML = _.join(["Hello", "webpack"], " ");

  element.appendChild(btn);
  element.appendChild(lazyBtn);
  element.classList.add(`hello`);
  // 将图像添加到我们已经存在的 div 中。
  const myIcon = new Image();
  myIcon.src = Icon;
  console.log(Icon);
  console.log(myIcon);

  element.appendChild(myIcon);
  console.log(Data);
  return element;
}

document.body.appendChild(component());
