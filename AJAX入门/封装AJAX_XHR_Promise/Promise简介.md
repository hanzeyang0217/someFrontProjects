## 前言

- 没怎么深挖
- 感觉以后做项目的时候边写边挖比较效率
- 就罗列了一些基本用法

## 为什么诞生了？

- 为了解决`callback`地狱而诞生的
- 方便你理解 ↓

  ```javascript
  /**
   * 如果有个需求
   * 第一秒后打印1，第二秒后打印2，第三秒后打印3 如何实现？
   * goal
   *                   0----1----2----3----4
   * console.log(`1`); =====>
   * console.log(`2`);      =====>
   * console.log(`3`);            ====>
   */

  setTimeout(() => {
    console.log(`1`);
  }, 1000);
  setTimeout(() => {
    console.log(`2`);
  }, 1000);
  setTimeout(() => {
    console.log(`3`);
  }, 1000);
  // console.log(`4`);

  // => ✖　不能实现

  setTimeout(() => {
    console.log(`1`);
    setTimeout(() => {
      console.log(`2`);
      setTimeout(() => {
        console.log(`3`);
      }, 1000);
    }, 1000);
  }, 1000);
  // console.log(`0`);

  // => 〇
  // callback ver
  //缺点 横向发展 不利于阅读 ★
  //高耦合？
  //每个任务只能指定一个回调函数？

  function timeout() {
    return new Promise((resolve, reject) => {
      setTimeout(resolve, 1000);
    });
  }
  timeout()
    .then(s => {
      console.log(`1`);
      return timeout();
    })
    .then(s => {
      console.log(`2`);
      return timeout();
    })
    .then(s => {
      console.log(`3`);
    });
  //console.log(`0`);

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
  ```

## 用法介绍

### 创建

```javascript
const myFirstPromise = new Promise((resolve, reject) => {
  // 做一些异步操作，最终会调用下面两者之一:
  resolve(someValue); // fulfilled
  reject("failure reason"); // rejected
});
```

- 比如

  ```javascript
  ajax(obj) {
      if (obj) {
      return new Promise((resolve, reject) => {
          const method = obj.method || "GET";
          const url = obj.url || "/";
          const async = !!obj.async || true;
          const contentType = obj.contentType || "text/html; charset=utf-8";
          const cache = obj.cache || "no-cache ";
          const data = obj.data;
          const httpRequest = new XMLHttpRequest();
          httpRequest.open(method, url, async);

          httpRequest.setRequestHeader("Content-type", contentType);
          httpRequest.setRequestHeader("Cache-control", cache);
          httpRequest.send(data);
          httpRequest.onreadystatechange = () => {
          if (httpRequest.readyState === 4) {
              if (httpRequest.status === 200) {
              resolve.call(null, httpRequest.response);
              } else {
              reject.call(null, httpRequest, httpRequest.status);
              }
          } else {
          }
          };
      });
      } else {
      }
  }
  ```

### `Promise.prototype`

1. `Promise.prototype.then(onFulfilled, onRejected)`
   1. 第一个参数是成功时被传的值
   2. 第二个参数是失败是被传得值
   3. 比如
      ```javascript
      $.ajax({
          url: "./Async/AsyncHTML.HTML",
          cache: "no-cache"
      }).then(
          html => {
          const mainHTML = document.querySelector(`#mainHTML`);
          if (!mainHTML) {
              const tempHtml = document.createElement(`template`);
              tempHtml.innerHTML = html;
              document.body.appendChild(tempHtml.content.firstChild);
          }
          },
          (request, status) => {}
      ```
2. `Promise.prototype.catch(onRejected)`

   1. 就是一个只接受失败结果的`then`

      ```javascript
      var p1 = new Promise(function(resolve, reject) {
        resolve("Success");
      });

      p1.then(function(value) {
        console.log(value); // "Success!"
        throw "oh, no!";
      })
        .catch(function(e) {
          console.log(e); // "oh, no!"
        })
        .then(
          function() {
            console.log("after a catch the chain is restored");
          },
          function() {
            console.log("Not fired due to the catch");
          }
        );

      // 以下行为与上述相同
      p1.then(function(value) {
        console.log(value); // "Success!"
        return Promise.reject("oh, no!");
      })
        .catch(function(e) {
          console.log(e); // "oh, no!"
        })
        .then(
          function() {
            console.log("after a catch the chain is restored");
          },
          function() {
            console.log("Not fired due to the catch");
          }
        );
      ```

3. `Promise.prototype.catch(onFinally)`
   1. Promise 结束时调用的函数=>`onFinally`

### `Promise`

1. `Promise.resolve(value)`
   1. create promise 的时候设的函数
2. `Promise.reject(reason)`
   1. 发生错误了会接到错误信息然后走`reject`
      ```javascript
      Promise.reject(new Error("fail")).then(
        function() {
          // not called
        },
        function(error) {
          console.error(error); // Stacktrace
        }
      );
      ```
3. `Promise.all(iterable)`

   1. 复数 promise 时候的操作
   2. 如果`iterable`里面都成功回调`resolve`
   3. 有一个失败就回调`reject`传的参是第一个失败的时候的结果

      ```javascript
      const promise1 = Promise.resolve(3);
      const promise2 = 42;
      const promise3 = new Promise(function(resolve, reject) {
        setTimeout(resolve, 100, "foo");
      });

      Promise.all([promise1, promise2, promise3]).then(function(values) {
        console.log(values);
      });
      // expected output: Array [3, 42, "foo"]
      ```

4. `Promise.race(iterable)`
   1. 也是复数 promise 处理系列
   2. 不过他设计的时候思考的开发者用法不一样
   3. `all`是为了 `复数异步都 OK 的时候=>xxx` 而做的方法叭 俺猜
   4. `race`就比较骚了 是为了 `复数异步哪个都行有一个OK的话就=>xxx` 而做的方法
