import "./section4.css";
const circle = document.querySelector(`.circle`);

circle.onmouseenter = e => {
  circle.classList.toggle(`active`);
};
circle.onmouseout = e => {
  circle.classList.toggle(`active`);
};
