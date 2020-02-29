window.$ = {
  ajax(obj) {
    if (obj) {
      return new Promise((resolve, reject) => {
        const method = obj.method || "GET";
        const url = obj.url || "/";
        const async = !!obj.async || true;
        const contentType = obj.contentType || "text/html; charset=utf-8";
        const cache = obj.cache;
        const data = obj.data;
        const httpRequest = new XMLHttpRequest();
        httpRequest.open(method, url, async);

        httpRequest.setRequestHeader("Content-type", contentType);
        if (cache) {
          httpRequest.setRequestHeader("Cache-control", cache);
        }
        httpRequest.send(data);
        httpRequest.onreadystatechange = () => {
          if (httpRequest.readyState === 4) {
            if (httpRequest.status === 200) {
              resolve.call(null, httpRequest.response);
            } else {
              reject.call(null, httpRequest, httpRequest.status);
            }
          } else {
            //   console.log(httpRequest.readyState);
          }
        };
        return {
          // success(fn) {
          //   httpRequest.onreadystatechange = () => {
          //     if (httpRequest.readyState === 4) {
          //       if (httpRequest.status === 200) {
          //         fn(httpRequest.response);
          //       } else {
          //         const m = httpRequest.response;
          //         window.alert(m);
          //       }
          //     } else {
          //     }
          //   };
          // }
        };
      });
    } else {
      //default setting
    }
  }
};
