var http = require("http");
var fs = require("fs");
var url = require("url");
var port = process.argv[2];

if (!port) {
  console.log("大侠 留下端口号~\nnode server.js 6666 ");
  process.exit(1);
}

var server = http.createServer(function (request, response) {
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

  path = path === "/" ? "index.html" : path;
  const index = path.lastIndexOf(".");
  const typeStr = path.substring(index);
  const ContentType = typeStr.toLowerCase() || `.html`;
  const ContentTypes = {
    ".html": "text/html", //文本4兄弟 一个已经换爸爸了
    ".css": "text/css",
    ".plain": "text/plain", //？ 文本文件默认值。即使它意味着未知的文本文件，但浏览器认为是可以直接展示的。 于是啥应该转成他？？？？
    //".javascript": "text/javascript", 所有的 text JavaScript 类型已经被 RFC 4329 废弃。
    ".octet-stream": "application/octet-stream", //这是应用程序文件的默认值。意思是 未知的应用程序文件 ，浏览器一般不会自动执行或询问执行 ??于是？？
    ".js": "application/javascript",
    ".ecmascript": "application/ecmascript",//话说这个跟上面不是重复嘛 用哪个？
    ".json": "application/json",
    ".xml": "application/xml",
    ".pdf": "application/pdf",
    ".jpeg": "image/jpeg", //图片5兄弟 后面几个不认识
    ".gif": "image/gif",//(无损耗压缩方面被PNG所替代)
    ".png": "image/png",
    ".svg": "image/svg+xml",//？SVG图片 (矢量图) 什么鬼
    ".ico": "image/x-icon", //>vnd.microsoft.icon
    ".wav": "audio/wav",
    ".webm": "audio/webm",
    ".ogg": "audio/ogg",
    ".webm": "video/webm", //あれ　上面也有。。。
    ".ogg": "video/ogg",//あれ　上面也有。。。
    ".mp4": "video/mp4" //视频2兄弟 mp4去哪儿了。。。
    // ".xhtml+xml": "application/xhtml+xml", //现在基本不再使用（HTML5统一了这些格式）
  };
  response.setHeader(
    "Content-Type",
    `${ContentTypes[ContentType]};charset=utf-8`
  );
  let string;
  try {
    string = fs.readFileSync(`./public/${path}`).toString();
    response.statusCode = 200;
  } catch (error) {
    string = `大哥你走错房间了..`;
    response.statusCode = 404;
  }
  response.write(string);
  response.end();
  /******** 代码结束，下面不要看 ************/
});

server.listen(port);
console.log(" " + port + " 开房成功\n 客官轻点⇒ http://localhost:" + port + "");
