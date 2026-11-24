const noButton = document.querySelector("#no-button");
const yesButton = document.querySelector("#yes-button");
const buttonRow = document.querySelector("#button-row");
const celebration = document.querySelector("#celebration");

let ignoreNextClick = false;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function placeNoButtonNearQuestion() {
  const rowRect = buttonRow.getBoundingClientRect();
  const buttonRect = noButton.getBoundingClientRect();
  const yesRect = yesButton.getBoundingClientRect();
  const centerX = rowRect.left + rowRect.width / 2;
  const margin = 14;
  const maxLeft = Math.max(margin, window.innerWidth - buttonRect.width - margin);
  const maxTop = Math.max(margin, window.innerHeight - buttonRect.height - margin);
  const hasRoomBesideYes = yesRect.right + 16 <= maxLeft;
  const left = hasRoomBesideYes
    ? yesRect.right + 16
    : centerX - buttonRect.width / 2;
  const top = hasRoomBesideYes
    ? rowRect.top + rowRect.height / 2 - buttonRect.height / 2
    : yesRect.bottom + 14;

  noButton.style.left = `${clamp(left, margin, maxLeft)}px`;
  noButton.style.top = `${clamp(top, margin, maxTop)}px`;
}

function distanceBetween(x1, y1, x2, y2) {
  return Math.hypot(x1 - x2, y1 - y2);
}

function randomPositionAwayFrom(pointerX, pointerY) {
  const margin = 14;
  const rect = noButton.getBoundingClientRect();
  const maxLeft = Math.max(margin, window.innerWidth - rect.width - margin);
  const maxTop = Math.max(margin, window.innerHeight - rect.height - margin);
  const minDistance = Math.min(260, Math.max(window.innerWidth, window.innerHeight) * 0.32);

  let bestPosition = {
    left: clamp(Math.random() * maxLeft, margin, maxLeft),
    top: clamp(Math.random() * maxTop, margin, maxTop),
    distance: 0,
  };

  for (let attempt = 0; attempt < 30; attempt += 1) {
    const left = clamp(Math.random() * maxLeft, margin, maxLeft);
    const top = clamp(Math.random() * maxTop, margin, maxTop);
    const centerX = left + rect.width / 2;
    const centerY = top + rect.height / 2;
    const distance = distanceBetween(centerX, centerY, pointerX, pointerY);

    if (distance > bestPosition.distance) {
      bestPosition = { left, top, distance };
    }

    if (distance >= minDistance) {
      break;
    }
  }

  return bestPosition;
}

function runAway(event) {
  const pointerX = event?.clientX ?? window.innerWidth / 2;
  const pointerY = event?.clientY ?? window.innerHeight / 2;
  const nextPosition = randomPositionAwayFrom(pointerX, pointerY);

  noButton.classList.add("is-running");
  noButton.style.left = `${nextPosition.left}px`;
  noButton.style.top = `${nextPosition.top}px`;
  noButton.style.transform = `rotate(${Math.random() * 14 - 7}deg)`;
}

function celebrate() {
  celebration.hidden = false;
  yesButton.setAttribute("aria-expanded", "true");
}

window.addEventListener("load", placeNoButtonNearQuestion);
window.addEventListener("resize", placeNoButtonNearQuestion);

yesButton.addEventListener("click", celebrate);

noButton.addEventListener("pointerenter", (event) => {
  if (event.pointerType === "mouse") {
    runAway(event);
  }
});

noButton.addEventListener("pointerdown", (event) => {
  if (event.pointerType !== "mouse") {
    event.preventDefault();
    ignoreNextClick = true;
    runAway(event);
  }
});

noButton.addEventListener("click", (event) => {
  event.preventDefault();

  if (ignoreNextClick) {
    ignoreNextClick = false;
    return;
  }

  runAway(event);
});
