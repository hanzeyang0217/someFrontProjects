> MVC 三个对象分别做什么，给出伪代码示例

1. model 操作数据

   1. 使用时代码

      ```javascript
      const model = new Model({
        data: {
          number: parseInt(localStorage.getItem(`n`)) || 100
        },
        update: function() {
          localStorage.setItem("n", model.data.number);
          model.trigger("updated");
        }
      });
      ```

   2. [封装](./src/base/Model.js)

2. view 跟描画有关

   1. 使用时代码

      ```javascript
      const view = new View({
        el: null,
        data: model.data,
        dataMap: {
          number: `{{number}}`
        },
        html: `
        <div>
          <div class="output">
              <span class="text">{{number}}</span>
          </div>
          <div class="input">
              <button class="add">加1</button>
              <button class="minus">减1</button>
              <button class="cheng">乘2</button>
              <button class="chu">除2</button>
          </div>
        </div>
      `,
        events: {
          "click .add": "add",
          "click .minus": "minus",
          "click .cheng": "cheng",
          "click .chu": "chu"
        },
        init: function(selector) {
          view.render({
            selector: selector,
            data: model.data
          });
          view.bindEvents();
        },

        add() {
          model.update(model.data.number++);
        },
        minus() {
          model.update(model.data.number--);
        },
        cheng() {
          model.update((model.data.number *= 2));
        },
        chu() {
          model.update((model.data.number /= 2));
        }
      });
      ```

   2. [封装](./src/base/View.js)

3. controller 其他

> EventBus 有哪些 API，是做什么用的，给出伪代码示例

1. trigger => 发信号的
2. on => 监听的
3. off => 取消监听的
4. [封装](./src/base/EventBus.js)

> 表驱动编程是做什么的（可以自己查查资料）

1. 目前就感觉比较帅
2. 然后感觉可能以后写好模板以后拿到数据就可以直接变成代码 感觉大规模开发会很轻松

> 我是如何理解模块化的

1. 随手写的小程序估计不是很需要这个 接口那边处理好一点就好了
2. 但是大的程序的时候，感觉用模块化的思想很必要
   1. 第一是自己写的时候会不晕点
   2. 第二是会意识的写低耦合的代码
