import "./section2.css";

const tabs = document.querySelector(`.up`);
const pages = document.querySelector(`.down`);
let activeText;
let activeEle;

tabs.onclick = e => {
  if (e.target.classList.contains(`tab1`)) {
    activeText = `page1`;
  } else if (e.target.classList.contains(`tab2`)) {
    activeText = `page2`;
  } else if (e.target.classList.contains(`tab3`)) {
    activeText = `page3`;
  } else {
    console.log(`空白区`);
  }
  activeEle = document.querySelector(`.${activeText}`);
  Array.from(pages.children).forEach(element => {
    element.classList.remove(`active`);
  });
  activeEle.classList.add(`active`);
};
