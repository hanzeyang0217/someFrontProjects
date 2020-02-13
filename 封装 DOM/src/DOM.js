window.$ = {
  create(str) {
    let result = document.createElement("template");
    result.innerHTML = str.trim();
    return result.content.firstChild;
  },
  find(Selector, scope) {
    return (scope || document).querySelectorAll(Selector); //这个写法不错 老师写的好
  },
  style(node, property, value) {
    if (arguments.length >= 3) {
      node.style[property] = value;
    } else if (arguments.length === 2) {
      node.style = property;
    }
  },
  each(node, fn) {
    for (let index = 0; index < node.length; index++) {
      fn.call(null, node[index]);
    }
  },
  after(node, newNode) {
    if (arguments.length === 1) {
      //查询node后面的元素
      return node.nextElementSibling;
    } else {
      //在node后插newNode
      node.parentElement.insertBefore(newNode, node.nextSibling);
    }
  },
  before(node, newNode) {
    if (arguments.length === 1) {
      //查询node后面的元素
      return node.previousElementSibling;
    } else {
      //在node后插newNode
      node.parentElement.insertBefore(newNode, node);
    }
  },
  append(parent, newNode) {
    if (arguments.length === 1) {
      //查询parent最后的Node
      return parent.lastElementChild;
    } else {
      //在parent最后插入newNode
      parent.appendChild(newNode);
    }
  },
  perpend(parent, newNode) {
    if (arguments.length === 1) {
      //查询parent最前的Node
      return parent.firstElementChild;
    } else {
      //没找到顺手的api but 第一个孩子之前插进去就好了嘛
      parent.insertBefore(newNode, parent.firstChild);
    }
  },
  parent(node, newParentNode) {
    if (arguments.length === 1) {
      return node.parentElement;
    } else {
      //先找一下有木有趁手的api
      //没有的话自己组合
      //1，在node前插新爸爸
      //2，把node插到新爸爸里面 over
      $.before(node, newParentNode);
      $.append(newParentNode, node);
    }
  },
  children(node, fn) {
    if (arguments.length === 1) {
      return node.children;
    } else {
      for (let index = 0; index < node.children.length; index++) {
        fn(node.children[index]);
      }
    }
  },
  remove(node) {
    node.remove();
    return node;
  },
  empty(node) {
    //找找有木有趁手的api
    //没有的话遍历孩子
    //一个个remove
    let removedEle = [];
    $.children(node, n => {
      n.remove();
      removedEle.push(n);
    });
    //老师的也很经典保存下
    // let x = node.firstChild
    // while(x){
    //   array.push(dom.remove(node.firstChild))
    //   x = node.firstChild
    // }
    return removedEle;
  },
  class(node, className) {
    if (arguments.length === 1 && node.length === undefined) {
      return node.className;
    } else {
      $.each(node, n => n.classList.add(className));
    }
  },
  classRemove(node, className) {
    $.each(node, n => n.classList.remove(className));
  },
  event(node, eventName, fn) {
    $.each(node, n => n.addEventListener(eventName, fn));
  },
  eventRemove(node, eventName, fn) {
    // console.dir(node[0]);
    node[0].removeEventListener("click", fn);
    $.each(node, n => n.removeEventListener(eventName, fn));
  },
  attr(node, attributeName, attributeValue) {
    if (arguments.length === 1) {
      return node.attributes;
    } else if (arguments.length === 2) {
      return node.getAttribute(attributeName);
    } else {
      node.setAttribute(attributeName, attributeValue);
    }
  },
  text(node, string) {
    if (arguments.length === 1) {
      return node.innerText;
    } else {
      node.innerText = string;
    }
  },
  html(node, htmlString, position) {
    if (arguments.length === 1) {
      return node.innerHTML;
    } else if (arguments.length === 2) {
      node.innerHTML = htmlString;
    } else {
      node.insertAdjacentHTML(position, htmlString);
    }
  },
  indexOf(node) {
    //1 有几个哥哥 +1
    // let indexValue = 1;
    // let beforEle = $.before(node)
    // while (beforEle.nodeType === 1) {
    //     beforEle = $.before(beforEle)
    //     indexValue++
    //     if (beforEle === null) { return indexValue }
    // }
    //2 把爸爸的孩子们搞成数组 找到自己 后记 这个看起来比较短就这个了
    let parentArr = Array.from($.parent(node).children);
    return parentArr.indexOf(node) + 1;
    // console.log(parentArr)
  },
  siblings(node) {
    //爸爸里面的孩子除了自己咯就是
    let siblings = Array.from($.parent(node).children);
    siblings.splice(siblings.indexOf(node), 1);
    return siblings;
  }
};
