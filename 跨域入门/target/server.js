var http = require("http");
var fs = require("fs");
var url = require("url");
var port = process.argv[2];

if (!port) {
  console.log("大侠 留下端口号~\nnode server.js 6666 ");
  process.exit(1);
}

var server = http.createServer(function(request, response) {
  var parsedUrl = url.parse(request.url, true);
  var pathWithQuery = request.url;
  var queryString = "";
  if (pathWithQuery.indexOf("?") >= 0) {
    queryString = pathWithQuery.substring(pathWithQuery.indexOf("?"));
  }
  var path = parsedUrl.pathname;
  var query = parsedUrl.query;
  var method = request.method;
  let pageIndexStr = path.indexOf(`data`) + 4;
  let pageIndex = path[pageIndexStr];
  /******** 从这里开始看，上面不要看 ************/
  console.log("官人来啦 需要啥服务？" + parsedUrl.pathname);
  path = path === "/" ? "index.HTML" : path;
  const index = path.lastIndexOf(".");
  const typeStr = path.substr(index);
  const ContentType = typeStr.toLowerCase() || `.html`;
  const ContentTypes = {
    ".html": "text/html", //文本4兄弟 一个已经换爸爸了
    ".css": "text/css",
    ".plain": "text/plain", //？ 文本文件默认值。即使它意味着未知的文本文件，但浏览器认为是可以直接展示的。 于是啥应该转成他？？？？
    //".javascript": "text/javascript", 所有的 text JavaScript 类型已经被 RFC 4329 废弃。
    ".octet-stream": "application/octet-stream", //这是应用程序文件的默认值。意思是 未知的应用程序文件 ，浏览器一般不会自动执行或询问执行 ??于是？？
    ".js": "application/javascript",
    ".ecmascript": "application/ecmascript", //话说这个跟上面不是重复嘛 用哪个？
    ".json": "application/json",
    ".xml": "application/xml",
    ".pdf": "application/pdf",
    ".jpeg": "image/jpeg", //图片5兄弟 后面几个不认识
    ".gif": "image/gif", //(无损耗压缩方面被PNG所替代)
    ".png": "image/png",
    ".svg": "image/svg+xml", //？SVG图片 (矢量图) 什么鬼
    ".ico": "image/x-icon", //>vnd.microsoft.icon
    ".wav": "audio/wav",
    ".webm": "audio/webm",
    ".ogg": "audio/ogg",
    ".webm": "video/webm", //あれ　上面也有。。。
    ".ogg": "video/ogg", //あれ　上面也有。。。
    ".mp4": "video/mp4" //视频2兄弟 mp4去哪儿了。。。
    // ".xhtml+xml": "application/xhtml+xml", //现在基本不再使用（HTML5统一了这些格式）
  };
  const registerUserStr =
    fs.readFileSync(`./public/DB/registerUser.JSON`).toString() || "[]";
  response.setHeader(
    "Content-Type",
    `${ContentTypes[ContentType]};charset=utf-8`
  );
  // response.setHeader("Cache-Control", "no-store");
  if (path === `/logout` && method === `POST`) {
    //删session
    fs.writeFileSync(`./session.json`, JSON.stringify({}));
    //删cookie
    response.setHeader(`Set-Cookie`, `loginUser= ; HttpOnly`);
    //跳转页面？
    response.statusCode = 200;
    response.write(`index.HTML`);
    response.end();
  } else if (path === `/registerUser` && method === `POST`) {
    const requestArray = [];
    const registerUserJSON = JSON.parse(registerUserStr);

    request.on("data", function(chunk) {
      requestArray.push(chunk);
    });

    request.on("end", () => {
      const requestStr = Buffer.concat(requestArray).toString();
      const requestObj = JSON.parse(requestStr);
      //看一下有没有重复的用户名
      //usedUserName 就是重复了 然后你懂的 笑
      const usedUserName = registerUserJSON.find(item => {
        return item.userName === requestObj.userName;
      });
      const canLogin = registerUserJSON.find(item => {
        return (
          item.userName === requestObj.userName &&
          item.passWord === requestObj.passWord
        );
      });

      //看一下是不是空
      const haveEmptyData =
        requestObj.userName === `` || requestObj.passWord === ``;
      //分配用户id
      //啥都没有的话 1
      //如果最后一个item的ID为length长度 那就+1
      //不然就遍历找最大的ID 因为不考虑删除所以不加填充的逻辑
      let newID;
      if (registerUserJSON.length === 0) {
        newID = 1;
      } else if (
        registerUserJSON[registerUserJSON.length - 1].userId ===
        registerUserJSON.length
      ) {
        newID = registerUserJSON.length + 1;
      } else {
        let maxUserId = 0;
        registerUserJSON.forEach(item => {
          if (item && item.userId > maxUserId) {
            maxUserId = item.userId;
          }
        });
        newID = maxUserId + 1;
      }
      //拼一下新的data
      let requestNewObj = {
        userId: newID,
        userName: requestObj.userName,
        passWord: requestObj.passWord
      };
      if (canLogin || (!haveEmptyData && !usedUserName)) {
        const session = fs.readFileSync(`./session.json`).toString();
        const newSessionID = Math.random();
        let newSession;
        console.log(session);

        if (!canLogin) {
          registerUserJSON.push(requestNewObj);
          newSession = {
            s: newSessionID,
            userId: requestNewObj.userId,
            userName: requestNewObj.userName
          };
          fs.writeFileSync(
            `./public/DB/registerUser.JSON`,
            JSON.stringify(registerUserJSON)
          );
          response.setHeader(
            `Set-Cookie`,
            `loginUser=${newSession.s}; HttpOnly`
          );
          // response.setHeader(
          //   `Set-Cookie`,
          //   `loginUser=${requestNewObj.userId}; HttpOnly`
          // );
        } else {
          newSession = {
            s: newSessionID,
            userId: canLogin.userId,
            userName: canLogin.userName
          };
          response.setHeader(
            `Set-Cookie`,
            `loginUser=${newSession.s}; HttpOnly`
          );
          // response.setHeader(
          //   `Set-Cookie`,
          //   `loginUser=${canLogin.userId}; HttpOnly`
          // );
        }
        console.log(newSession);
        fs.writeFileSync(`./session.json`, JSON.stringify(newSession));
        response.statusCode = 200;
        //好吧这样会刷新整个页面 以后做局部更新
        response.write(`/home.html`);
        response.end();
      } else {
        // console.log(usedUserName);
        response.statusCode = 500;
        response.setHeader("Content-Type", "text/html;charset=utf-8");
        let warningText;
        if (usedUserName && !canLogin) {
          warningText = `错误密码`;
        } else if (usedUserName) {
          warningText = `用户名已存在`;
        } else {
          warningText = `可能入力为空？`;
        }
        response.write(warningText);
        response.end();
      }
    });
  } else if (path === `/home.html`) {
    try {
      const cookie = request.headers.cookie;
      console.log(cookie);
      // const loginUserName = cookie.replace(`loginUser=`, ``);
      // console.log(cookie.trim().split(`;`));
      const loginUserID = cookie
        .trim()
        .split(`;`)
        .filter(e => {
          return e.split(`=`)[0].trim() === `loginUser`;
        })
        .toString()
        .split(`=`)[1];
      // console.log(loginUserID);
      // registerUserStr
      const session = fs.readFileSync(`./session.json`).toString();
      const sessionObj = JSON.parse(session);
      let userInfo;
      if (sessionObj.s.toString() === loginUserID) {
        userInfo = sessionObj;
      } else {
        userInfo = `G`;
      }
      let string = fs.readFileSync(`./public/${path}`).toString();
      response.statusCode = 200;
      const newStr = string
        .replace(`{{userID}}`, userInfo.userId)
        .replace(`{{userName}}`, userInfo.userName);
      response.write(newStr);
      // console.log(setCookie);
      response.end();
    } catch (error) {
      response.statusCode = 404;
      response.setHeader("Content-Type", "text/html;charset=utf-8");
      response.write(`大哥你走错房间了..`);
      response.end();
    }
  } else if (path === `/DB/data.js`) {
    response.statusCode = 200;
    const callBack = parsedUrl.query.callback.toString();
    //也可以用过referer检查来减少JSONP的安全风险
    console.log(JSON.stringify(request.headers[`referer`]));
    const string1 = "window[`{{callBack}}`]({{data}});";
    const data = fs.readFileSync(`./public/DB/registerUser.JSON`).toString();
    const string2 = string1.replace(`{{data}}`, data);
    const string3 = string2.replace(`{{callBack}}`, callBack);
    //啊哈哈哈 垃圾代码 俺偷懒了w
    response.write(string3);
    response.end();
  } else {
    try {
      //允许跨域
      // response.setHeader(
      //   "Access-Control-Allow-Origin",
      //   "http://localhost:8888"
      // );
      response.setHeader("Access-Control-Allow-Origin", "*");
      let string = fs.readFileSync(`./public/${path}`).toString();
      response.statusCode = 200;
      response.write(string);
      response.end();
    } catch (error) {
      response.statusCode = 404;
      response.setHeader("Content-Type", "text/html;charset=utf-8");
      response.write(`大哥你走错房间了..`);
      response.end();
    }
  }

  /******** 代码结束，下面不要看 ************/
});

server.listen(port);
console.log(" " + port + " 开房成功\n 客官轻点⇒ http://localhost:" + port + "");
