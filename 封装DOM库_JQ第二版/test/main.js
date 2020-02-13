/**第一部分 选择器
 * 1. CSS选择器
 * 2. JQ的选择器 没写 感觉蛮没意思的
 */

//1. CSS选择器
// $(document); //选择整个文档对象
// $("#myId"); //选择ID为myId的网页元素
// $("div.myClass"); // 选择class为myClass的div元素
// $("input[name=first]"); // 选择name属性等于first的input元素

//2. JQ的选择器
// $("a:first"); //选择网页中第一个a元素 //没意思 一个单选搞定的东西
// $("tr:odd"); //选择表格的奇数行 //没意思 就是拿到的东西变成数组 然后看冒号以后的 奇数的就把那个数组的奇数个造个新数组返回就好了
// $("#myForm :input"); // 选择表单中的input元素 //什么鬼www
// $("div:visible"); //选择可见的div元素 //没意思 跟上面逻辑一样 再找一下style.display 来判断的嘛
// $("div:gt(2)"); // 选择所有的div元素，除了前三个 //没意思
// $("div:animated"); // 选择当前处于动画状态的div元素 //没兴趣

/**第二部分 过滤器
 * 1. 从外开始
 * 2. 从内开始
 */

//1. 从外开始
// $(".child").has("div"); //选择有xxx孩子的他 不是find哟
// $(".child").find(".Grandchild"); //选择xx的xx孩子们
// $(".child").not(".child1"); //选择class不等于child1 并且 class为child的元素 ★★★木有想到更好的ToT
// $("div").filter(".child1"); //选择class等于chid1 并且是 div元素
// $(".child").first(); //废除 用eq(1)可以完全代替
// $(".child").eq(1);//选择第1个class为child的元素 哎 因为返回的是api 所以只能提供一个数组常用功能 简直杯具嘛ww 笑 好吧数组的话应该是从0开始 俺从一开始了 嘛 反正小事情

//2. 从内开始
// $(".child").parent(); //选择.child元素的父元素
// $(".child").children(); //选择.child的所有子元素
// $(".Grandchild").siblings()//选择div的同级元素

/**第三部分 链式操作
 * 我全部都是链式 所以pass
 * 不对 end忘记了 这个这么好玩怎能不玩
 */
$("#test") //#test 1
  .find(".child") //.child 2
  .eq(0) //.child[0] 3
  .html("Hello")
  .back(2) //.child 1
  .eq(0) //.child[1]
  .html("World");

/**第四部分 元素的操作：取值和赋值
 */

// $(`.child1`).html(`<div id="one">one</div>`);
// console.log($(`.child1`).html());
// $(`.child1`).text(`xiaoyang`);
// console.log($(`.child1`).text());
// $(`.child1`).attr(`name`, `first`);
// console.log($(`.child1`).attr(`name`));
// console.log($(`.child1`).attr());
// $(`.child1`).width(200);
// console.log($(`.child1`).width());
// .height() //取出或设置某个元素的高度
// .val() //取出某个表单元素的值 ★ //木有概念 先放弃

/**第五部分 元素的操作：移动
 */
//ABCD
// B.insertAfter(D) //把B放在D后面返回操作B的api 结果是 ACDB
// B.after(D) //把D放在B后面返回操作B的api 结果是 ABDC
// B.insertBefore(D) //ACBD B.insertAfter(C)
// B.before(D) //ADBC D.insertAfter(A) A.after(D)
// $(`.GrandchildB`).insertAfter($(`.GrandchildD`));
// $(`.GrandchildB`).after($(`.GrandchildD`));
// $(`.GrandchildB`).insertBefore($(`.GrandchildD`));
// $(`.GrandchildB`).before($(`.GrandchildD`));
// let newEle = document.createElement(`div`);
// newEle.classList.add(`newGrandchild`);
// newEle.innerText = `newGrandchild`;
// document.body.appendChild(newEle);
// $(`.newGrandchild`).appendTo($(`.child1`));
// $(`.child1`).append($(`.newGrandchild`));
// $(`.newGrandchild`).prependTo($(`.child1`));
// $(`.child1`).prepend($(`.newGrandchild`));

/**第六部分 元素的操作：复制、删除和创建
 */
// $("<p>Hello</p>");
// $(".child1").append($("<div>newGrandchild</div>")); //★★
// $(".child1").append("<div>newGrandchild</div>"); //★★
// $(".child1").clone(true);
// $(".GrandchildA").remove();
// .detach();
// $(`.child`).empty();

/**第七部分 工具方法
 */
// console.log($.type($)); //判断对象的类别（函数对象、日期对象、数组对象、正则对象等等）。
// console.log($.type(2020)); //判断对象的类别（函数对象、日期对象、数组对象、正则对象等等）。
// console.log($.type([1])); //判断对象的类别（函数对象、日期对象、数组对象、正则对象等等）。
// console.log($.type(`adsf`)); //判断对象的类别（函数对象、日期对象、数组对象、正则对象等等）。
// var myDate = new Date();
// console.log($.type(myDate)); //判断对象的类别（函数对象、日期对象、数组对象、正则对象等等）。
// $.each([1, 2, 3, 4], n => {
//   console.log(n);
// }); //遍历一个数组或对象。
// console.log($.support()); //判断浏览器是否支持某个特性。 噗IE对策 现在不想学 再见
console.log($.trim(`    asdf`)); //去除字符串两端的空格。
// console.log($.isEmptyObject({})); //判断某个对象是否为空（不含有任何属性）。★★★ 很厉害
// console.log($.isEmptyObject({ asd: 123 })); //判断某个对象是否为空（不含有任何属性）。★★★ 很厉害
// console.log($.isPlainObject({})); //判断某个参数是否为用"{}"或"new Object"建立的对象。★★★★★ 不会以后再说 ★★★★★
// console.log($.extend()); //将多个对象，合并到第一个对象。★★★★★不会以后再说★★★★★
// console.log($.makeArray(`1234`)); //将对象转化为数组。
// console.log($.isArray(`1234`)); //判断某个参数是否为数组。
// console.log($.isArray([])); //判断某个参数是否为数组。
// console.log($.grep()); //返回数组中符合某种标准的元素。★★★没看懂题意★★★
// console.log($.isFunction()); //判断某个参数是否为函数。

/**第八部分 事件操作
 */
