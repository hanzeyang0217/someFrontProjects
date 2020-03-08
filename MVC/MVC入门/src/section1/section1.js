import "./section1.css";

const inputButtons = document.querySelector(`.input`);
const test = document.querySelector(`.text`);
let number = parseInt(localStorage.getItem(`n`)) || 100;
test.innerText = number;

inputButtons.onclick = e => {
  if (e.target.classList.contains(`add`)) {
    number++;
  } else if (e.target.classList.contains(`minus`)) {
    number--;
  } else if (e.target.classList.contains(`cheng`)) {
    number *= 2;
  } else if (e.target.classList.contains(`chu`)) {
    number /= 2;
  } else {
    console.log(`空白区`);
  }
  localStorage.setItem("n", number);
  test.innerText = number;
};
