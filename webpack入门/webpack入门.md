# 入门 webpack

## 概要

- 就是常用的部分摸一遍然后写下来忘掉
- 0309 第一次写 就写一些初级的 以后做项目的时候碰到的新的东西会在这里更新 花了好几个小时 总是错

## 概念部分

1. webpack 是干什么的？
   1. 转译代码
      1. ES6=>ES5
      2. SCSS=>CSS
   2. 构建 build
   3. 代码压缩
   4. 代码分析

## 历史课

1. 已经快要死掉的类似工具
   1. `Grunt` => 速度太慢 几乎已死
   2. `Gulp` => 速度还行 不过没有 webpack 火
   3. `Require.js` => 几乎已死
   4. `Sea.js` => 死了
   5. `Browserify` => 死了
2. 跟 webpack 在竞争的工具
   1. `Rollup`
      1. 比较小
      2. 生态不够丰富
      3. 适合库的开发
   2. `Parcel`
      1. 配置简单
      2. 适合 demo 学习
3. 基于 webpack 的工具
   1. `@vue/cli`
   2. `create-react-app`
   3. `@angular/cli`
   4. 都是快速创建
   5. 基本不用再配置了
   6. 想要配置看文档

## 准备

1. 下载 webpack
   1. 先看[官网](https://www.webpackjs.com/)文档咯 肯定会有教你怎么用的
2. 为了本地预览下载 webpack-dev-server
   1. [搜索](https://webpack.docschina.org/configuration/dev-server/)

## 继续看文档

1. [起步](https://webpack.docschina.org/guides/getting-started/)
   1. 话说这里能用命令行的尽量用命令行，鼠标操作不学编程的都会多没意思呀
   2. `npx webpack`有时候有空格？啥的会报错
   3. 上面不行的话`./node_modules/.bin/webpack`
   4. 搞到`CSS 提取`的时候浪费了很多时间
   5. 不是动态生成的`html`不会帮你自动挂上`提取出来的css`
   6. 然后就碰到一个问题 **重点 ★**
      1. 开发模式
         1. development
         2. start
      2. 生产模式
         1. production
         2. build
         3. `--config webpack.config.production.js`
      3. 然后两个`config`重复很高所以建立一个公共的`config`再继承的用
      4. 也可以用 `webpack merge`
   7. 看到开发环境 累死了 不看了下载有机会再看
   8. https://webpack.docschina.org/guides/development

## 开始

1. 看文档的时候用过的会删除
2. ~~转译 JS~~
   1. webpack 内置 babel 转译器，运行以后直接转译了
3. 理解文件名 hash
   1. 还有 HTTP 缓存机制
      1. 浏览器基本都有的一个功能
      2. 就是设了 HTTP 响应头`Cache-Control`的文件
      3. 在第一次被下载后，在`↑设定时间内`会会被保存到缓存，
      4. 后面需要下载的时候如果缓存里有就不需要去下载了，这样速度快
   2. 于是问题来了，我们做了一个改动以后因为缓存就很有可能看不到最新状态，
      1. 这个 hash 的功能可以帮我们解决这个问题
      2. 通过每次生成不一样的 hash 文件名，这样你修改一次，名字就变了，以前的缓存也就不起作用了，也就是可以看到最新的代码了
   3. 注意，首页一般不用 hash 文件名`TODO`为啥？
4. ~~生成 HTML~~
   1. 自动改文件名
5. ~~引入 CSS~~
   1. 使用 JS 生成 style
      1. style-loader 和 css-loader
   2. 抽成文件
      1. 必须这种，你忘了浏览器的缓存功能？
   3. 需要`loader`把`input里面的css`转换成`某某`
6. 引入 SCSS
   1. 注意`node-sass`已经过时 用`dart-sass`
   2. 俺装的时候貌似好了 根据攻略来的话
   3. https://webpack.docschina.org/loaders/sass-loader
7. 引入 LESS
8. ~~引入图片~~
9. ~~实现懒加载~~
10. 部署到 Github-pages
11. 完成一键部署
12. 自己写一个 loader
13. 自己写一个 plugin

## 其他

1. webpack 学到什么程度？
   1. 出现需求是能够快速搜到，并解决问题
2. 面试的时候？
   1. 看老师的押题
3. 需要深入学习吗？
   1. 不需要看源码
   2. 不过可以看看相关博客
   3. 自己写几个 webpack config 的项目
   4. 所以不要直接用`@vue/cli,create-react-app`不够装逼
