import "./section3.css";
const square = document.querySelector(`.square`);

square.onclick = e => {
  square.classList.toggle(`active`);
};
