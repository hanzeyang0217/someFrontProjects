// hack.onclick = () => {
//   //请求yang2的用户数据
//   //先请求自己的试试
//   $.ajax({
//     url: `http://localhost:7777/DB/registerUser.JSON`,
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

// hack.onclick = () => {
//   const dataStr = `dataStr` + Math.random();
//   script.src = `http://localhost:7777/DB/data.js?callback=${dataStr}`;

//   const script = document.createElement(`script`);
//   document.body.appendChild(script);
//   window[dataStr] = data => {
//     console.log(data);
//   };
//   script.onload = () => {
//     script.remove();
//   };
// };
hack.onclick = () => {
  const callback = `dataStr` + Math.random();
  const src = `http://localhost:7777/DB/data.js`;
  JSONP({
    callback: callback,
    src: src
  }).then(data => {
    console.log(data);
  });
};
