/**
 * goal
 *                   0----1----2----3----4
 * console.log(`1`); =====>
 * console.log(`2`);      =====>
 * console.log(`3`);            ====>
 */

// setTimeout(() => {
//   console.log(`1`);
// }, 1000);
// setTimeout(() => {
//   console.log(`2`);
// }, 1000);
// setTimeout(() => {
//   console.log(`3`);
// }, 1000);
// console.log(`4`);

// => ✖　不能实现

// setTimeout(() => {
//   console.log(`1`);
//   setTimeout(() => {
//     console.log(`2`);
//     setTimeout(() => {
//       console.log(`3`);
//     }, 1000);
//   }, 1000);
// }, 1000);
// console.log(`0`);

// => 〇
// callback ver
//缺点 横向发展 不利于阅读 ★
//看不懂的缺点★
//高耦合？
//每个任务只能指定一个回调函数？

// function timeout() {
//   return new Promise((resolve, reject) => {
//     setTimeout(resolve, 1000);
//   });
// }
// timeout()
//   .then(s => {
//     console.log(`1`);
//     return timeout();
//   })
//   .then(s => {
//     console.log(`2`);
//     return timeout();
//   })
//   .then(s => {
//     console.log(`3`);
//   })
//   .then(s => {
//     console.log(`4`);
//   });
// console.log(`0`);

// => 〇
// Promise ver
// 噗 好吧他现在横向发展了 但是感觉怪怪的不只是我一个人吧。。★

function timeout() {
  return new Promise(s => {
    setTimeout(s, 1000);
  });
}
async function test() {
  await timeout();
  console.log(`1`);
  await timeout();
  console.log(`2`);
  await timeout();
  console.log(`3`);
}
test();
console.log(`0`);
// => 〇
// async / await ver
// 貌似是现在最新的解决方案了
// 以后研究研究 先不管了 再见
