import EventBus from "./EventBus";

class Controller extends EventBus {
  // constructor({ el, html, render, data, eventBus, events }) {
  constructor(options) {
    super();
    Object.assign(this, options);
  }
}

export default Controller;
