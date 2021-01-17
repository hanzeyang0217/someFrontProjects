# 需求1
把选择器的部分改成属性选择器at-name
# 修正方案
```js
//除了这个选择器方法别的全都删掉
LocatorBuilders.add('xpath:attributes', function xpathAttr(e) {
  const PREFERRED_ATTRIBUTES = [
    'at-name', //限定at-name
  ]
}
```
# 代码理解
```js
//画面ロード時
LocatorBuilders.add('id', function id(e) {
  if (e.id) {
    return 'id=' + e.id
  }
  return null
})
//..
LocatorBuilders.add('xpath:attributes', function xpathAttr(e) {
  const PREFERRED_ATTRIBUTES = [
    'at-name', //ここ
    'id',
    'name',
    'value',
    'type',
    'action',
    'onclick',
  ]
  let i = 0

  function attributesXPath(name, attNames, attributes) {
    let locator = '//' + this.xpathHtmlElement(name) + '['
    for (i = 0; i < attNames.length; i++) {
      if (i > 0) {
        locator += ' and '
      }
      let attName = attNames[i]
      locator += '@' + attName + '=' + this.attributeValue(attributes[attName])
    }
    locator += ']'
    return this.preciseXPath(locator, e)
  }

  if (e.attributes) {
    let atts = e.attributes
    let attsMap = {}
    for (i = 0; i < atts.length; i++) {
      let att = atts[i]
      attsMap[att.name] = att.value
    }
    let names = []
    // try preferred attributes
    for (i = 0; i < PREFERRED_ATTRIBUTES.length; i++) {
      let name = PREFERRED_ATTRIBUTES[i]
      if (attsMap[name] != null) {
        names.push(name)
        let locator = attributesXPath.call(
          this,
          e.nodeName.toLowerCase(),
          names,
          attsMap
        )
        if (e == this.findElement(locator)) {
          return locator
        }
      }
    }
  }
  return null
})
//画面ロード時
LocatorBuilders.add = function(name, finder) {
  this.order.push(name)
  this.builderMap[name] = finder
  this._orderChanged()
}
//操作時
LocatorBuilders.prototype.buildAll = function(el) {
  let e = core.firefox.unwrap(el)
  let locator
  let locators = []
  for (let i = 0; i < LocatorBuilders.order.length; i++) {
    let finderName = LocatorBuilders.order[i]
    try {
      locator = this.buildWith(finderName, e)
      if (locator) {
        locator = String(locator)
        let fe = this.findElement(locator)
        if (e == fe) {
          locators.push([locator, finderName])
        }
      }
    } catch (e) {
    }
  }
  return locators
}
//call
LocatorBuilders.prototype.buildWith = function(name, e, opt_contextNode) {
  return LocatorBuilders.builderMap[name].call(this, e, opt_contextNode)
}
```
