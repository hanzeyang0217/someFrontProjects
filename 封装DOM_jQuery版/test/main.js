
let newNode = $(`　<div>俺是无辜的</div>`)
console.log(newNode)
$("#test>.child")
  .addClass(`blue`) //三个孩子都加上blue class
  .removeClass(`blue`) //移除↑
  .style("color", "red") // 设置 style.color
  .style("color:blue") // 设置 style.color
  .find(".Grandchild")
  .addClass(`green`) //三个孙子都加上green class
  .each(n => console.log(n)) // 遍历 Grandchild
  .after(newNode) //后插
  .before(newNode) //前插
  .append(newNode) //插尾
  .perpend(newNode) //插头
  .parent(newNode) //爸爸
  .attr(`title`, `hello attr`)
  .text(`hello text`)
  .html(`<div id="one">one</div>`)
  .html(`<div id="two">two</div>`, "beforeend")
  .event(`click`, click)
  .eventRemove(`click`, click)
  .empty() //清空孩子
  .remove();
function click(n) {
  console.log("click!");
}
