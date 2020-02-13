let div = $.find("#test>.child")[0]; // 获取对应的元素

$.style(div, "color", "red"); // 设置 div.style.color
$.style(div, "color:green"); // 设置 div.style.color

const divList = $.find(".child");
$.each(divList, n => console.log(n)); // 遍历 divList 里的所有元素

const child1divList = $.find(".child", div);
$.each(child1divList, n => console.log(n)); // 遍历 child1divList 里的所有元素

let ele = $.create(`
    <div class='hello'>
        hello
        <span>hello</span>
    </div>`);
console.log(ele); //<div>hello $</div>

console.log("查后" + $.after(div));
$.after(div, ele); //后插

console.log("查前" + $.before(div));
$.before(div, ele); //前插

let parentDiv = $.find("#test")[0];

console.log("查尾" + $.append(parentDiv)); //查尾
$.append(parentDiv, ele); //插尾

console.log("查头" + $.perpend(parentDiv)); //查头
$.perpend(parentDiv, ele); //插头

console.log("查爸爸" + $.parent(div)); //爸爸
$.parent(div, ele); //爸爸

console.log("查孩子" + $.children(parentDiv)); //孩子们
$.children(parentDiv, n => console.log(n)); //孩子们

$.attr(ele, `title`, `hello attr`);
console.log("查属性" + $.attr(ele));
console.log("查title属性" + $.attr(ele, "title"));

console.log("查文本" + $.text(ele));
$.text(ele, `hello text`);

console.log("查HTML" + $.html(ele));
$.html(ele, `<div id="one">one</div>`);
console.log("查HTML" + $.html(ele));
$.html(ele, `<div id="two">two</div>`, "beforeend");
console.log("查HTML" + $.html(ele));

console.log("查class: " + $.class(ele)); //查class
$.class(divList, `blue`);
$.classRemove(divList, `blue`);
function click(n) {
  console.log("click!");
}
$.event(divList, `click`, click);
$.eventRemove(divList, `click`, click);

let removedEle = $.remove(ele);
$.perpend(parentDiv, removedEle);
removedEle = $.empty(ele); //清空孩子
console.log(removedEle);

let son1 = $.find(".child2")[0];
console.log($.indexOf(son1));
console.log($.siblings(son1));
