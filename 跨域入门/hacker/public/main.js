/**
 * 普通的去拿数据试试看
 * 感受一下同源策略
 */

// hack.onclick = () => {
//   $.ajax({
//     url: `http://localhost:9999/DB/registerUser.JSON`,
//     contentType: `application/x-www-form-urlencoded`
//   }).then(
//     s => {
//       console.log(s);
//     },
//     f => {
//       console.log(f);
//     }
//   );
// };
/**
 * 再试试拿CSS JS什么的
 */
// hack.onclick = () => {
//   $.ajax({
//     // url: `http://localhost:9999/style.css`,
//     url: `http://localhost:9999/main.js`,
//     contentType: `application/x-www-form-urlencoded`
//   }).then(
//     s => {
//       console.log(s);
//     },
//     f => {
//       console.log(f);
//     }
//   );
// };
/**
 * OK 也不让拿 但是引用可以ww
 * 1. CORS可以解决这个跨域时候的限制
 * 在服务端写下
 * response.setHeader("Access-Control-Allow-Origin", "*");
 * 之后再试试上面的 就会发现可以跨域拿数据了
 * 但是IE听说不支持 CORS
 * 2. 为了IE的跨域出现了 叫JSONP的家伙
 */

// hack.onclick = () => {
//   const dataStr = `dataStr` + Math.random();
//   const script = document.createElement(`script`);
//   script.src = `http://localhost:9999/DB/data.js?callback=${dataStr}`;

//   document.body.appendChild(script);
//   window[dataStr] = data => {
//     console.log(data);
//   };
//   script.onload = () => {
//     script.remove();
//   };
// };

//封装一下JSONP以后 ↓
hack.onclick = () => {
  const callback = `dataStr` + Math.random();
  const src = `http://localhost:9999/DB/data.js`;
  JSONP({
    callback: callback,
    src: src
  }).then(data => {
    console.log(data);
  });
};
