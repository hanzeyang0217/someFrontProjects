let leftDiv = document.querySelector(`.leftDiv`);
let style = document.querySelector(`.style`);
let str = `/* 这个蛮有趣的
* 其实没啥
* 就是画个小爱心
* ♡
**/
.xxx div {
    display: flex;
  }

  .heart {
    flex-direction: column;
    transition: all 0.8s ease-in-out;
  }

  .left,
  .right,
  .body {
    height: 100px;
    width: 100px;
    background-color: rgb(230, 59, 87);
  }

  .top {
    display: flex;
  }

  .bottom {
    justify-content: center;
  }

  .left,
  .right {
    border-radius: 50%;
  }

  .left {
    transform: rotate(45deg) translate(35px, 15px);
  }

  .right {
    transform: rotate(45deg) translate(15px, 35px);
  }

  .body {
    transform: rotate(45deg) translate(-20px, -20px);
  }

  @keyframes bengbengbeng {
    100% {
      transform: scale(1.2);
    }
  }
  /*
  * 注入生命*1
  * 注入生命*2
  * 注入生命*3
  * 注入生命*4
  * 注入生命*5
  * 注入生命*6
  * 注入生命*7
  * 注入生命*8
  * 注入生命*9
  * 注入生命*10
  **/
  .heart {
    animation: 0.8s infinite ease-in-out bengbengbeng;
  }
  .happy{
    display: flex;
    color: pink;
  }
  /*
  * 新年快乐呀
  **/
  `;

let n = 0;
let showStr = ``;
let drawLeft = () => {
  setTimeout(() => {
    if (n < str.length) {
      if (str[n] === `\r`) {
      } else if (str[n] === `\n`) {
        showStr += `<br>`;
      } else if (str[n] === ` `) {
        showStr += `&nbsp;`;
      } else {
        showStr += str[n];
      }
      leftDiv.innerHTML = showStr;
      style.innerHTML = str.substr(0, n);
      window.scrollTo(0, 99999);
      n++;
      leftDiv.scrollTo(0, 99999);
      drawLeft();
    }
  }, 10);
};
drawLeft();
