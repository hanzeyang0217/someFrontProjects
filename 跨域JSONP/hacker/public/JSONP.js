window.JSONP = option => {
  return new Promise((resolve, reject) => {
    const { callback, src } = option;
    const script = document.createElement(`script`);
    script.src = `${src}?callback=${callback}`;
    document.body.appendChild(script);
    window[callback] = data => {
      resolve(data);
    };
    script.onerror = () => {
      reject();
    };
    script.onload = () => {
      script.remove();
    };
  });
};
