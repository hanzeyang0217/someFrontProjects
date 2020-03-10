# script标签
## 有几个问题
1. HTML引用script标签的顺序是什么？
2. JS动态引用script标签的顺序是什么？
3. 同步异步？

## 结论
1. 一般的js静态加载都是同步 sync1=>sync2=>sync3
2. 标签里加上`async`属性的话加载会变成异步
3. 标签里加上`defer`属性的话会等到页面渲染之后再加载
4. 动态引用的时候 先跑完文件内的 别的线程再开始跑加载 加载的时候的顺序不知 看起来满神奇的
   1. 举个例子
        ```
        //html部分
        sync1
        sync2
        sync3

        //JS部分
        sync1{
            Async1
            Async2
            Async3
        }
        sync2{
            Async1
            Async2
            Async3
        }
        sync3
        {
            Async1
            Async2
            Async3
        }

        的时候会变成下面这个顺序↓　很神奇
        sync1=>sync2=>sync3
        =>Async1=>Async1=>Async1
        =>Async2=>Async2=>Async2
        =>Async3=>Async3=>Async3
        ```

## 文档
## 小实验
```
//1    <script src="./sync1.js"></script>
//2    <script src="./sync2.js"></script>
//3    <script src="./sync3.js"></script>
//4    script标签
```
```
//1    script标签
//2    <script src="./sync1.js"></script>
//3    <script src="./sync2.js"></script>
//4    <script src="./sync3.js"></script>
```
```
//2    <script src="./sync1.js" defer></script>
//3    <script src="./sync2.js" defer></script>
//4    <script src="./sync3.js" defer></script>
//1    script标签
```
```
//2    <script src="./sync1.js" async></script>
//4    <script src="./sync2.js" async></script>
//3    <script src="./sync3.js" async></script>
//1    script标签
```
```
//1    console.log(`静态1`)
//    const s1 = document.createElement("script");
//    s1.src = `./Async1 .js`
//2    document.body.appendChild(s1)
//    const s2 = document.createElement("script");
//    s2.src = `./Async2 .js`
//3    document.body.appendChild(s2)
//    const s3 = document.createElement("script");
//    s3.src = `./Async3 .js`
//4    document.body.appendChild(s3)
```
```
//    const s1 = document.createElement("script");
//    s1.src = `./Async1 .js`
//2    document.body.appendChild(s1)
//    const s2 = document.createElement("script");
//    s2.src = `./Async2 .js`
//3    document.body.appendChild(s2)
//    const s3 = document.createElement("script");
//    s3.src = `./Async3 .js`
//4    document.body.appendChild(s3)
//1    console.log(`静态1`)
```
```
//    var s1 = document.createElement("script");
//    s1.src = `./Async1 .js`
//4★    document.body.appendChild(s1)
//    var s2 = document.createElement("script");
//    s2.src = `./Async2 .js`
//5★    document.body.appendChild(s2)
//    var s3 = document.createElement("script");
//    s3.src = `./Async3 .js`
//6★    document.body.appendChild(s3)
//1    console.log(`静态1`)
//
//    var s1 = document.createElement("script");
//    s1.src = `./Async1 .js`
//4★    document.body.appendChild(s1)
//    var s2 = document.createElement("script");
//    s2.src = `./Async2 .js`
//5★    document.body.appendChild(s2)
//    var s3 = document.createElement("script");
//    s3.src = `./Async3 .js`
//6★    document.body.appendChild(s3)
//2    console.log(`静态2`)
//
//    var s1 = document.createElement("script");
//    s1.src = `./Async1 .js`;
//4★    document.body.appendChild(s1);
//    var s2 = document.createElement("script");
//    s2.src = `./Async2 .js`;
//5★    document.body.appendChild(s2);
//    var s3 = document.createElement("script");
//    s3.src = `./Async3 .js`;
//6★    document.body.appendChild(s3);
//3    console.log(`静态3`);
```
