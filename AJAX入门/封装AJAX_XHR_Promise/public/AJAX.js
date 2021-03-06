window.$ = {
  ajax(obj) {
    if (obj) {
      return new Promise((resolve, reject) => {
        const method = obj.method || "GET";
        const url = obj.url || "/";
        const async = !!obj.async || true;
        const contentType = obj.contentType || "text/html; charset=utf-8";
        const cache = obj.cache || "no-cache ";
        const data = obj.data;
        const httpRequest = new XMLHttpRequest();
        httpRequest.open(method, url, async);

        httpRequest.setRequestHeader("Content-type", contentType);
        httpRequest.setRequestHeader("Cache-control", cache);
        httpRequest.send(data);
        httpRequest.onreadystatechange = () => {
          if (httpRequest.readyState === 4) {
            if (httpRequest.status === 200) {
              resolve.call(null, httpRequest.response);
            } else {
              reject.call(null, httpRequest, httpRequest.status);
            }
          } else {
          }
        };
      });
    } else {
    }
  }
};
