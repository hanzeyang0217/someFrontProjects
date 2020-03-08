import "./section1.css";
import Model from "../base/Model";
import View from "../base/view";

/**
 * Model
 * 1. data
 */
const model = new Model({
  data: {
    number: parseInt(localStorage.getItem(`n`)) || 100
  },
  update: function() {
    localStorage.setItem("n", model.data.number);
    model.trigger("updated");
    // view.render();
    // eventBus.trigger("updated");
  }
});

/**
 * View
 * 1. html
 * 2. events
 * 3. init
 * 4. events function
 */
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

/**
 * controller
 * 1. init
 *  1. render(data)
 *  2. bindEvent(events)
 * 2. bindEvent
 * 3. events
 * 4. events function
 */
// const controller = {};

export default view.init;
