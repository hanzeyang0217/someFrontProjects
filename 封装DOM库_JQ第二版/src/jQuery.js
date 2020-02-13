window.$ = function(selector, back) {
  let targetEle;
  window.__backList__;
  if (selector instanceof Object) {
    targetEle = selector;
  } else if (typeof selector === "string") {
    selector = selector.trim();
    if (selector[0] === `<`) {
      //create
      let result = this.document.createElement(`template`);
      result.innerHTML = selector;
      targetEle = [result.content.firstChild];
    } else {
      //select
      targetEle = document.querySelectorAll(selector);
      // debugger;
    }
  }
  // debugger;
  if (window.__backList__ === undefined) {
    window.__backList__ = [targetEle];
  } else if (!back) {
    window.__backList__.push(targetEle);
  }
  // debugger;
  return {
    targetEle: targetEle,
    back(num) {
      // debugger;
      if (window.__backList__.length === 0) {
        return;
      }
      num = num || 1;
      num <= 0 && (num = 1);
      if (num >= window.__backList__.length - 1) {
        //留下第一个 别的删掉
        //返回第一个
        window.__backList__.splice(1, window.__backList__.length - 1);
        return $(window.__backList__[0], true);
      } else {
        for (let index = 0; index < num; index++) {
          window.__backList__.pop();
        }
        return $(window.__backList__[window.__backList__.length - 1], true);
      }
    },
    each(fn, length) {
      for (let index = 0; index < (length || targetEle.length); index++) {
        // debugger;
        fn(targetEle[index], index);
      }
    },
    has(selector) {
      let newTargetElement = [];
      this.each(element => {
        if (element.querySelectorAll(selector)) {
          newTargetElement.push(element);
        }
      });
      return $(newTargetElement);
    },
    find(selector) {
      let newTargetElement = [];
      this.each(element => {
        newTargetElement = newTargetElement.concat(
          Array.from(element.querySelectorAll(selector))
        );
      });
      return $(newTargetElement);
    },
    not(selector) {
      let NewTargetEle = [];
      //1 要么 找到爸爸 用新的条件搜一下 然后判断里面有没有自己 有的话跳过
      //2 要么 不知道爸爸 就看自己身上 中的话 跳下一个 没找到
      this.each(element => {
        let key = true;
        $(element.parentElement.querySelectorAll(selector)).each(
          newTargetElement => {
            if (newTargetElement === element) {
              key = false;
            }
          }
        );
        if (key) {
          NewTargetEle.push(element);
        }
      });
      return $(NewTargetEle);
    },
    filter(selector) {
      let NewTargetEle = [];
      this.each(element => {
        let key = false;
        $(element.parentElement.querySelectorAll(selector)).each(
          newTargetElement => {
            if (newTargetElement === element) {
              key = true;
            }
          }
        );
        if (key) {
          NewTargetEle.push(element);
        }
      });
      return $(NewTargetEle);
    },
    // 废除 用 eq(0)可以完全代替
    // first() {
    //   return $(Array.from(targetEle).slice(0, 1));
    // },
    eq(index) {
      // debugger;
      return $(Array.from(targetEle).slice(index, index + 1));
    },
    parent() {
      let parentElement = [];
      this.each(element => {
        if (parentElement.indexOf(element.parentElement) === -1) {
          parentElement.push(element.parentElement);
        }
      });
      return $(parentElement);
    },
    children() {
      let childrenEle = [];
      this.each(element => {
        childrenEle = childrenEle.concat(Array.from(element.children));
      });
      return $(childrenEle);
    },
    siblings() {
      let siblingsEle = [];
      this.each(element => {
        siblingsEle = siblingsEle.concat(
          Array.from(element.parentElement.children)
        );
      });
      return $(siblingsEle);
    },
    html(htmlString, position) {
      if (arguments.length === 2) {
        //insertAdjacentHTML
        this.each(element => {
          element.insertAdjacentHTML(position, htmlString);
        });
        return this;
      } else if (arguments.length === 1) {
        //set innerHTML
        this.each(element => {
          element.innerHTML = htmlString;
        });
        return this;
      } else {
        //get innerHTML
        return targetEle[0].innerHTML;
      }
    },
    text(string) {
      if (arguments.length === 1) {
        //set innerText
        this.each(element => {
          element.innerText = string;
        });
        return this;
      } else {
        //get innerHTML
        return targetEle[0].innerText;
      }
    },
    attr(attributeName, attributeValue) {
      if (arguments.length === 2) {
        //setAttribute
        this.each(element => {
          element.setAttribute(attributeName, attributeValue);
        });
      } else if (arguments.length === 1) {
        //getAttribute by attributeName
        return targetEle[0].getAttribute(attributeName);
      } else {
        //get attributes
        return targetEle[0].attributes;
      }
    },
    width(num) {
      if (arguments.length === 1) {
        this.each(element => {
          element.style.width = num + `px`;
        });
      } else {
        return targetEle[0].style.width;
      }
    },
    height(num) {
      if (arguments.length === 1) {
        this.each(element => {
          element.style.height = num + `px`;
        });
      } else {
        return targetEle[0].style.height;
      }
    },
    insertAfter(api) {
      //tar=>api
      api.each(apiEle => {
        this.each(element => {
          apiEle.parentElement.insertBefore(element, apiEle.nextSibling);
        });
      });
      return this;
    },
    after(api) {
      //api=>tar
      this.each(element => {
        api.each(apiElement => {
          element.parentElement.insertBefore(apiElement, element.nextSibling);
        });
      });
      return this;
    },
    insertBefore(api) {
      //tar=>api
      api.each(apiEle => {
        this.each(element => {
          apiEle.parentElement.insertBefore(element, apiEle.previousSibling);
        });
      });
      return this;
    },
    before(api) {
      //api=>tar
      this.each(element => {
        api.each(apiElement => {
          element.parentElement.insertBefore(
            apiElement,
            element.previousSibling
          );
        });
      });
      return this;
    },
    appendTo(api) {
      this.each(element => {
        api.each(apiEle => {
          apiEle.append(element);
        });
      });
      return this;
    },
    append(api) {
      // debugger;
      if (typeof api === `string`) {
        api = $(api);
      }
      api.each(apiEle => {
        this.each(element => {
          element.append(apiEle);
        });
      });
      return this;
    },
    prependTo(api) {
      this.each(element => {
        api.each(apiEle => {
          apiEle.append(element);
        });
      });
      return this;
    },
    prepend(api) {
      api.each(apiEle => {
        this.each(element => {
          element.append(apiEle);
        });
      });
      return this;
    },
    clone(deep) {
      let cloneElements = [];
      this.each(element => {
        let cloneEle = element.cloneNode(deep);
        cloneElements.push(cloneEle);
      });
      // debugger;
      return $(cloneElements);
    },
    remove() {
      this.each(element => {
        element.remove();
      });
      return this;
    },
    detach() {
      let length = targetEle.length;
      this.each(element => {
        removeEle.push(element);
        element.remove();
      });
      return $(removeEle);
    },
    empty() {
      this.each(targetEle => {
        let childrenLength = targetEle.children.length;
        for (let index = 0; index < childrenLength; index++) {
          targetEle.firstElementChild.remove();
        }
      });
      return this;
    },
    addClass(className) {
      // debugger;
      this.each(element => {
        element.classList.add(className);
      });
      return this;
    }
  };
};

window.$.__proto__ = {
  type(operand) {
    if (typeof operand === `object`) {
      var toString = Object.prototype.toString;
      return toString.call(operand);
    } else {
      return typeof operand;
    }
  },
  each(node, fn) {
    for (let index = 0; index < node.length; index++) {
      fn.call(null, node[index]);
    }
  },
  trim(string) {
    return string.trim();
  },
  isEmptyObject(obj) {
    //ES5
    // return Object.keys(obj).length === 0 && obj.constructor === Object;
    //preES5
    for (var prop in obj) {
      if (obj.hasOwnProperty(prop)) {
        return false;
      }
    }
    return JSON.stringify(obj) === JSON.stringify({});
  },
  makeArray(willBeArray) {
    return Array.from(willBeArray);
  },
  isArray(array) {
    return array instanceof Array;
  },
  isFunction(obj) {
    return obj instanceof Function;
  }
};
