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

  if (path === "/") {
    response.statusCode = 200;
    response.setHeader("Content-Type", "text/html;charset=utf-8");
    // response.write(`hello`);
    let HTMLString = fs.readFileSync("./public/index.html").toString();
    response.write(HTMLString);
    response.end();
  } else if (path === "/Async/AsyncHTML.HTML") {
    response.statusCode = 200;
    response.setHeader("Content-Type", "text/html;charset=utf-8");
    let HTMLString = fs
      .readFileSync("./public/Async/AsyncHTML.HTML")
      .toString();
    response.write(HTMLString);
    response.end();
  } else if (path === `/DB/data${pageIndex}.JSON`) {
    response.statusCode = 200;
    response.setHeader("Content-Type", "text/html;charset=utf-8");
    let HTMLString = fs
      .readFileSync(`./public/DB/data${pageIndex}.JSON`)
      .toString();
    response.write(HTMLString);
    response.end();
  } else if (path === "/Async/AsyncXML.XML") {
    response.statusCode = 200;
    response.setHeader("Content-Type", "text/xml;charset=utf-8");
    let HTMLString = fs.readFileSync("./public/Async/AsyncXML.XML").toString();
    response.write(HTMLString);
    response.end();
  } else if (path === "/Async/AsyncJSON.JSON") {
    response.statusCode = 200;
    response.setHeader("Content-Type", "text/JSON;charset=utf-8");
    let HTMLString = fs
      .readFileSync("./public/Async/AsyncJSON.JSON")
      .toString();
    response.write(HTMLString);
    response.end();
  } else if (path === "/style.css") {
    response.statusCode = 200;
    response.setHeader("Content-Type", "text/css;charset=utf-8");
    let CSSString = fs.readFileSync("./public/style.css").toString();
    response.write(CSSString);
    response.end();
  } else if (path === "/Async/AsyncCSS.CSS") {
    response.statusCode = 200;
    response.setHeader("Content-Type", "text/css;charset=utf-8");
    let CSSString = fs.readFileSync("./public/Async/AsyncCSS.CSS").toString();
    response.write(CSSString);
    response.end();
  } else if (path === "/main.js") {
    response.statusCode = 200;
    response.setHeader("Content-Type", "text/javascript;charset=utf-8");
    let JsString = fs.readFileSync("./public/main.js").toString();
    response.write(JsString);
    response.end();
  } else if (path === "/Async/AsyncJs.js") {
    response.statusCode = 200;
    response.setHeader("Content-Type", "text/javascript;charset=utf-8");
    let JsString = fs.readFileSync("./public/Async/AsyncJs.js").toString();
    response.write(JsString);
    response.end();
  } else {
    response.statusCode = 404;
    response.setHeader("Content-Type", "text/html;charset=utf-8");
    response.write(`大哥你走错房间了..`);
    response.end();
  }

  /******** 代码结束，下面不要看 ************/
});

server.listen(port);
console.log(" " + port + " 开房成功\n 客官轻点⇒ http://localhost:" + port + "");
