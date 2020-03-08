import EventBus from "./EventBus";

class View extends EventBus {
  // constructor({ el, html, render, data, eventBus, events }) {
  constructor(options) {
    super();
    Object.assign(this, options);

    this.on("updated", () => {
      this.render({
        data: this.data
      });
    });
  }

  render(options) {
    // debugger;
    if (!this.el) {
      options.selector = options.selector.trim();
      this.el = document.querySelector(`${options.selector}`);
      this.el.on = function(part1, part2, value) {
        this.el[`$on${part1}`] === undefined
          ? (this.el[`$on${part1}`] = [
              {
                event: part1,
                selector: part2,
                fn: value
              }
            ])
          : this.el[`$on${part1}`].push({
              event: part1,
              selector: part2,
              fn: value
            });

        this.el[`on${part1}`] = function(e) {
          for (let index = 0; index < this[`$on${part1}`].length; index++) {
            const el = this.querySelector(this[`$on${part1}`][index].selector);
            if (e.target === el) {
              this[`$on${part1}`][index].fn();
            }
          }
        };
      };
    }
    let result = document.createElement(`template`);
    result.innerHTML = this.html
      .trim()
      .replace(this.dataMap.number, options.data.number); //先偷懒了

    const childrenLength = this.el.children.length;
    for (let index = 0; index < childrenLength; index++) {
      this.el.firstElementChild.remove();
    }
    this.el.append(result.content.firstChild);
  }
  bindEvents() {
    for (let key in this.events) {
      const value = this[this.events[key]];
      const spaceIndex = key.indexOf(" ");
      const part1 = key.slice(0, spaceIndex);
      const part2 = key.slice(spaceIndex + 1);
      this.el.on.call(this, part1, part2, value);
    }
  }
}

export default View;
