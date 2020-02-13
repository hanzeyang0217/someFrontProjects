window.$ = SelectorOrArray => {
  let targetEle;
  if (typeof SelectorOrArray === "string") {
    SelectorOrArray = SelectorOrArray.trim();
    if (SelectorOrArray[0] === `<`) {
      let result = document.createElement("template");
      result.innerHTML = SelectorOrArray;
      return result.content.firstChild;
    } else {
      targetEle = document.querySelectorAll(SelectorOrArray);
    }
  } else if (SelectorOrArray instanceof Array) {
    targetEle = SelectorOrArray;
  }
  return {
    targetEle: targetEle,
    addClass(className) {
      for (let index = 0; index < targetEle.length; index++) {
        targetEle[index].classList.add(className);
      }
      return this;
    },
    removeClass(className) {
      for (let index = 0; index < targetEle.length; index++) {
        targetEle[index].classList.remove(className);
      }
      return this;
    },
    style(propertyOrPropertyValue, value) {
      if (arguments.length >= 2) {
        for (let index = 0; index < targetEle.length; index++) {
          targetEle[index].style[propertyOrPropertyValue] = value;
        }
      } else if (arguments.length === 1) {
        for (let index = 0; index < targetEle.length; index++) {
          targetEle[index].style = propertyOrPropertyValue;
        }
      }
      return this;
    },
    find(Selector) {
      let targetEleArr = [];
      for (let index = 0; index < targetEle.length; index++) {
        targetEleArr = targetEleArr.concat(
          Array.from(targetEle[index].querySelectorAll(Selector))
        );
      }
      // targetEleArr.oldApi = this;
      return $(targetEleArr);
    },
    each(fn) {
      for (let index = 0; index < targetEle.length; index++) {
        fn.call(null, targetEle[index]);
      }
      return this;
    },
    after(newNode) {
      for (let index = 0; index < targetEle.length; index++) {
        targetEle[index].parentElement.insertBefore(
          newNode,
          targetEle[index].nextSibling
        );
      }
      return this;
    },
    before(newNode) {
      for (let index = 0; index < targetEle.length; index++) {
        targetEle[index].parentElement.insertBefore(newNode, targetEle[index]);
      }
      return this;
    },
    append(newNode) {
      for (let index = 0; index < targetEle.length; index++) {
        for (let j = 0; j < newNode.length; j++) {
          targetEle[index].appendChild(newNode[j], targetEle[index]);
        }
      }
      return this;
    },
    perpend(newNode) {
      for (let index = 0; index < targetEle.length; index++) {
        targetEle[index].insertBefore(newNode, targetEle[index].firstChild);
      }
      return this;
    },
    parent(newNode) {
      this.before(newNode);
      $([newNode]).append(this.targetEle);
      return this;
    },
    attr(attributeName, attributeValue) {
      if (arguments.length === 2) {
        for (let index = 0; index < targetEle.length; index++) {
          targetEle[index].setAttribute(attributeName, attributeValue);
        }
      }
      return this;
    },
    text(string) {
      if (arguments.length === 1) {
        for (let index = 0; index < targetEle.length; index++) {
          targetEle[index].innerText = string;
        }
      }
      return this;
    },
    html(htmlString, position) {
      for (let index = 0; index < targetEle.length; index++) {
        if (arguments.length === 1) {
          targetEle[index].innerHTML = htmlString;
        } else {
          targetEle[index].insertAdjacentHTML(position, htmlString);
        }
      }
      return this;
    },
    event(eventName, fn) {
      $(targetEle).each(n => n.addEventListener(eventName, fn));
      return this;
    },
    eventRemove(eventName, fn) {
      $(targetEle).each(n => n.removeEventListener(eventName, fn));
      return this;
    },
    empty() {
      for (let index = 0; index < targetEle.length; index++) {
        let childrenLength = targetEle[index].children.length;
        for (let j = 0; j < childrenLength; j++) {
          targetEle[index].firstChild.remove();
        }
      }
      return this;
    },
    remove() {
      let Length = targetEle.length;
      let removeEle = [];
      for (let j = 0; j < Length; j++) {
        removeEle.push(targetEle[j]);
        targetEle[j].remove();
      }
      return $(removeEle);
    }
  };
};
