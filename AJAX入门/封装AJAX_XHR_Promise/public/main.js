addHTML.onclick = () => {
  $.ajax({
    url: "./Async/AsyncHTML.HTML",
    cache: "no-cache"
  }).then(
    html => {
      const mainHTML = document.querySelector(`#mainHTML`);
      if (!mainHTML) {
        const tempHtml = document.createElement(`template`);
        tempHtml.innerHTML = html;
        document.body.appendChild(tempHtml.content.firstChild);
      }
    },
    (request, status) => {}
  );

  // async/await ver
  // const url = "./Async/AsyncHTML.HTML";
  // const cache = "no-cache";
  // function appendHtml(html) {
  //   const mainHTML = document.querySelector(`#mainHTML`);
  //   if (!mainHTML) {
  //     const tempHtml = document.createElement(`template`);
  //     tempHtml.innerHTML = html;
  //     document.body.appendChild(tempHtml.content.firstChild);
  //   }
  // }
  // async function asyncMgr() {
  //   const html = await $.ajax({
  //     url: url,
  //     cache: cache
  //   });
  //   appendHtml(html);
  // }
  // asyncMgr();
};
