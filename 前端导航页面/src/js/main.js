/**
 * LOGO部分
 * 1. 加事件 => 改了以后会传到localStorage被保存
 * 2.1 显示的文字从localStorage获取
 * 2.2 第一次的时候使用temp
 * 2.3 即时的效果 反正自动会变不去管
 */
const LOGOText = document.querySelector(`.logoTextEdit`);
LOGOText.addEventListener("change", changeLOGOText, false);
let LOGOTextStr = localStorage.getItem("LOGOText");
if (!LOGOTextStr) {
  localStorage.setItem("LOGOText", `一切的美好都会到来`);
}
LOGOText.value = localStorage.getItem("LOGOText");
function changeLOGOText(e) {
  localStorage.setItem("LOGOText", e.target.value);
}
/**
 * 搜索
 * 1. placeholder
 * 2. 按钮按的时候变成蓝色
 * 3. 回车键也能搜索
 * 过去历史啥的以后再说 ★
 * 额 原来用表单就搞定了 啥都不用写。。。哎 下一个
 */

/**
 * 标签
 * 1.1 和LOGO文字一样 tagListData从localStorage取来
 * 1.2 当然第一次用tempTagListData
 * 1.3 取到tagList 向里面一个一个插
 * 1.4 关于DOM 分成2种 一种是添加的标签(makeTag) 一种是有加标签功能的标签(makeAddTag)
 * 1.5 遍历 加编辑标签事件addOpenChangeDlgEvent
 * ？？ 可以拖
 * ？？ 各种限制
 */

const tempTagListData = [
  {
    name: `当你拔剑的那一刻，世界：你毛都不是`,
    URL: `https://www.bilibili.com/video/av79028837?t=11`
  },
  {
    name: `俺的GitHub`,
    URL: `https://github.com/hanzeyang0217`
  },
  {
    name: `2019前端报告`,
    URL: `https://qiita.com/rana_kualu/items/4727a0d64657aa837ce3`
  },
  {
    name: `JS的秘密花园`,
    URL: `https://bonsaiden.github.io/JavaScript-Garden/zh/`
  },
  {
    name: `前端算法`,
    URL: `https://juejin.im/post/5958bac35188250d892f5c91`
  },
  {
    name: `关于渲染性能`,
    URL: `https://developers.google.com/web/fundamentals/performance/rendering/`
  },
  {
    name: `阮大佬的blog`,
    URL: `http://www.ruanyifeng.com/blog/javascript/`
  },
  {
    name: `caniuse`,
    URL: `https://caniuse.com/`
  }
];
let tagListData = JSON.parse(localStorage.getItem("tagListData"));
if (!tagListData) {
  tagListData = tempTagListData;
  localStorage.setItem("tagListData", JSON.stringify(tagListData));
}

const addTagEle = makeAddTag();
function makeAddTag() {
  let templateTag = `<div class="tagListItem">
  <div class="tagListItemLinkAdd">
    <div class="tagListItemBox">
      <div class="tagListItemImgDiv">
        <i class="material-icons tagListItemImgAdd">
          add
        </i>
      </div>
      <div class="tagListItemTextAdd">
        <span class="tagListItemTextSpanAdd">添加新标签</span>
      </div>
    </div>
  </div>
</div>`;
  let newTag = document.createElement(`template`);
  newTag.innerHTML = templateTag;
  return newTag.content.firstChild;
}
function makeTag(dialogName, dialogURL) {
  let faviconURL = dialogURL;
  if (faviconURL === `https://`) {
    faviconURL = `../src/img/小黄鸡.png`;
  } else {
    faviconURL = `http://www.google.com/s2/favicons?domain=` + faviconURL;
    // faviconURL = `` + faviconURL + `favicon.ico`;
  }
  let templateTag = `<div class="tagListItem">
      <a href="${dialogURL}" class="tagListItemLink">
        <div class="tagListItemBox">
            <div class="tagListItemImgDiv">
                <div alt="" class="tagListItemImg" />
                  <img src="${faviconURL}" class="tagListItemImgTRUE"/>
                </div>
            </div>
            <div class="tagListItemText">
                <span class="tagListItemTextSpan">${dialogName}</span>
            </div>
        </div>
        <div class="tagListItemBtn">
            <button class="editTagBtn">
                <i class="material-icons">
                    more_vert
                </i>
            </button>
        </div>
      </a>
    </div>
    `;
  let newTag = document.createElement(`template`);
  newTag.innerHTML = templateTag;
  return newTag.content.firstChild;
}

const tagListEle = document.querySelector(`.tagList`);
showTagList();
function showTagList() {
  let newTagEle;
  tagListEle.children = {};
  for (let index = 0; index < tagListData.length; index++) {
    newTagEle = makeTag(tagListData[index].name, tagListData[index].URL);
    tagListEle.append(newTagEle);
  }
  tagListEle.append(addTagEle);
}
addOpenChangeDlgEvent();
function addOpenChangeDlgEvent() {
  let canEditEle = document.querySelectorAll(`.tagListItemBtn`);
  for (let index = 0; index < canEditEle.length; index++) {
    canEditEle[index].addEventListener("click", openChangeDlg, false);
  }
}
const addTagBtn = document.querySelector(`.tagListItemLinkAdd`);
addTagBtn.addEventListener("click", openAddTagDlg, false);
/**
 * 这边开始是dlg里面的功能
 * 1. 共同部分
 * 1.1 openDlg 打开dlg
 * 1.2 closeDlg 关闭dlg
 */

function openDlg() {
  //共同
  //打开的时候会加防护罩
  //会focus第一个edit
  // debugger;
  Shape.classList.remove(`displayNone`);
  content.classList.add(`huimengmeng`);
  let dialogNameEdit = document.querySelector(`.dialogNameEdit`);
  dialogNameEdit.focus();
}
function closeDlg() {
  Shape.classList.add(`displayNone`);
  content.classList.remove(`huimengmeng`);
}
function URLTransformer(URLStr) {
  // debugger;
  function needTransform(URLStr) {
    // debugger;
    const URLHeader = [`https://`, `http://`];
    for (let index = 0; index < URLHeader.length; index++) {
      if (URLStr.indexOf(URLHeader[index]) !== -1) {
        return false;
      }
    }
    return true;
  }
  let needTransformFlg = needTransform(URLStr);
  if (needTransformFlg) {
    return `https://` + URLStr;
  } else {
    return URLStr;
  }
}
function setLocalStorage(key, something) {
  localStorage.setItem(key, something);
}

const content = document.querySelector(`#content`);
const Shape = document.querySelector(`#Shape`);

const OKTagBtn = document.querySelector(`.OKTagBtn`);
const cancelTagBtn = document.querySelector(`.cancelTagBtn`);
const deleteTagBtn = document.querySelector(`.deleteTagBtn`);
const OKBtn = document.querySelector(`.OKBtn`);

cancelTagBtn.addEventListener("click", cancel, false);
OKTagBtn.addEventListener("click", addTagOK, false);

//各个按钮的处理
//cancel
function cancel() {
  closeDlg();
}
//OK
function addTagOK() {
  // debugger;
  let dialogNameEdit = document.querySelector(`.dialogNameEdit`);
  let dialogURLEdit = document.querySelector(`.dialogURLEdit`);
  let dialogURLStr = URLTransformer(dialogURLEdit.value);
  tagListData.push({
    name: dialogNameEdit.value,
    URL: dialogURLStr
  });
  localStorage.setItem("tagListData", JSON.stringify(tagListData));
  //把名字和URL传过去 创建新tag append
  addTag(dialogNameEdit.value, dialogURLStr);
  //绑上编辑的事件
  addOpenChangeDlgEvent();
  //关闭dlg
  closeDlg();
}
//编辑的时候 的OK按钮直接在打开dlg时候赋予

function addTag(dialogName, dialogURL) {
  const tagList = document.querySelectorAll(`.tagListItem`);
  let newTag = makeTag(dialogName, dialogURL);
  let last = tagList[tagList.length - 1];
  last.parentElement.insertBefore(newTag, last);
}

//新规dlg
function openAddTagDlg() {
  //   debugger;
  //删除键不表示
  deleteTagBtn.classList.add(`displayNone`);
  OKBtn.classList.add(`displayNone`);
  OKTagBtn.classList.remove(`displayNone`);
  let dialogTitleText = document.querySelector(`.dialogTitleText`);
  dialogTitleText.innerText = `多一个不多 ！`;
  openDlg();
  let dialogNameEdit = document.querySelector(`.dialogNameEdit`);
  let dialogURLEdit = document.querySelector(`.dialogURLEdit`);
  dialogNameEdit.value = ``;
  dialogURLEdit.value = ``;
}

//编辑dlg
function openChangeDlg(e) {
  e.stopPropagation();
  e.preventDefault();
  OKBtn.classList.remove(`displayNone`);
  OKTagBtn.classList.add(`displayNone`);
  deleteTagBtn.classList.remove(`displayNone`);
  //打开dlg
  let tagEle = searchParent(e.target, `tagListItem`);
  const tagList = document.querySelectorAll(`.tagListItem`);
  let tagEleIndex = Array.from(tagList).indexOf(tagEle);
  let dialogTitleText = document.querySelector(`.dialogTitleText`);
  dialogTitleText.innerText = `编辑一下咯`;
  //开的时候值传进去了
  let dialogNameEdit = document.querySelector(`.dialogNameEdit`);
  let dialogURLEdit = document.querySelector(`.dialogURLEdit`);
  dialogNameEdit.value = tagListData[tagEleIndex].name;
  dialogURLEdit.value = tagListData[tagEleIndex].URL;
  openDlg();
  //按OK的时候值会传入localStorage 并在关闭dlg之后也更新
  OKBtn.addEventListener(
    "click",
    function OKBtnClick() {
      let dialogURLEdit = document.querySelector(`.dialogURLEdit`);
      let dialogURLStr = URLTransformer(dialogURLEdit.value);
      tagListData[tagEleIndex].name = dialogNameEdit.value;
      tagListData[tagEleIndex].URL = dialogURLStr;
      localStorage.setItem("tagListData", JSON.stringify(tagListData));
      let list = document.querySelectorAll(`.tagListItem`);
      let tarTagListItemLink = searchChild(
        list[tagEleIndex],
        `.tagListItemLink`
      );
      // debugger;
      let tarTagListItemTextSpan = searchChild(
        list[tagEleIndex],
        `.tagListItemTextSpan`
      );
      // console.dir(tarTagListItemLink.href);
      tarTagListItemLink.href = tagListData[tagEleIndex].URL;
      // debugger;
      tarTagListItemTextSpan.innerText = tagListData[tagEleIndex].name;
      closeDlg();
      OKBtn.removeEventListener("click", OKBtnClick);
    },
    false
  );
  //删除键
  deleteTagBtn.addEventListener(
    "click",
    function deleteTagBtnClick() {
      tagListData.splice(tagEleIndex, 1);
      localStorage.setItem("tagListData", JSON.stringify(tagListData));
      let list = document.querySelectorAll(`.tagListItem`);
      list[tagEleIndex].remove();
      // debugger;
      closeDlg();
      deleteTagBtn.removeEventListener("click", deleteTagBtnClick);
    },
    false
  );
}
function searchParent(targetEle, className) {
  //找targetEle的父级里面class为className的 返回
  //   debugger;
  if (targetEle.classList.contains(className)) {
    return targetEle;
  } else {
    return searchParent(targetEle.parentElement, className);
  }
}

function searchChild(targetEle, className) {
  return targetEle.querySelector(className);
}
