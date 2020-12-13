window.$ = {
  ajax(obj) {
    if (obj) {
      const method = obj.method || "GET";
      const url = obj.url || "/";
      const async = !!obj.async || true;
      const contentType = obj.contentType || "text/html; charset=utf-8";
      const cache = obj.cache || "no-cache ";
      const data = obj.data;
      const success = obj.success || function () {};
      const fail = obj.fail || function () {};
      const httpRequest = new XMLHttpRequest();
      httpRequest.open(method, url, async);

      httpRequest.setRequestHeader("Content-type", contentType);
      httpRequest.setRequestHeader("Cache-control", cache);
      httpRequest.send(data);

      httpRequest.onreadystatechange = () => {
        if (httpRequest.readyState === 4) {
          if (httpRequest.status === 200) {
            success.call(null, httpRequest.response);
          } else {
            fail.call(null, httpRequest, httpRequest.status);
          }
        } else {
          //   console.log(httpRequest.readyState);
        }
      };
    } else {
      //default setting
    }
  },
};
