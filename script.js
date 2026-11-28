const noButton = document.querySelector("#no-button");
const yesButton = document.querySelector("#yes-button");
const buttonRow = document.querySelector("#button-row");
const celebration = document.querySelector("#celebration");
const dateInput = document.querySelector("#date-input");
const mailButton = document.querySelector("#mail-button");
const dateStatus = document.querySelector("#date-status");
// Destino do FormSubmit. Depois de ativar o formulário, troque pelo código
// aleatório que o FormSubmit fornece para o endereço não ficar no código.
const notifyTarget = "joseedua13sam@gmail.com";
const notifyEndpoint = `https://formsubmit.co/ajax/${notifyTarget}`;

let ignoreNextClick = false;
let isSending = false;
let sentDateValue = "";

document.body.appendChild(noButton);

function getViewport() {
  const viewport = window.visualViewport;

  return {
    width: viewport?.width ?? window.innerWidth,
    height: viewport?.height ?? window.innerHeight,
    offsetLeft: viewport?.offsetLeft ?? 0,
    offsetTop: viewport?.offsetTop ?? 0,
  };
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function placeNoButtonNearQuestion() {
  const rowRect = buttonRow.getBoundingClientRect();
  const buttonRect = noButton.getBoundingClientRect();
  const yesRect = yesButton.getBoundingClientRect();
  const viewport = getViewport();
  const centerX = rowRect.left + rowRect.width / 2;
  const margin = 14;
  const minLeft = viewport.offsetLeft + margin;
  const minTop = viewport.offsetTop + margin;
  const maxLeft = Math.max(minLeft, viewport.offsetLeft + viewport.width - buttonRect.width - margin);
  const maxTop = Math.max(minTop, viewport.offsetTop + viewport.height - buttonRect.height - margin);
  const hasRoomBesideYes = yesRect.right + 16 <= maxLeft;
  const left = hasRoomBesideYes
    ? yesRect.right + 16
    : centerX - buttonRect.width / 2;
  const top = hasRoomBesideYes
    ? rowRect.top + rowRect.height / 2 - buttonRect.height / 2
    : yesRect.bottom + 14;

  noButton.style.left = `${clamp(left, minLeft, maxLeft)}px`;
  noButton.style.top = `${clamp(top, minTop, maxTop)}px`;
}

function distanceBetween(x1, y1, x2, y2) {
  return Math.hypot(x1 - x2, y1 - y2);
}

function randomPositionAwayFrom(pointerX, pointerY) {
  const margin = 14;
  const rect = noButton.getBoundingClientRect();
  const viewport = getViewport();
  const minLeft = viewport.offsetLeft + margin;
  const minTop = viewport.offsetTop + margin;
  const maxLeft = Math.max(minLeft, viewport.offsetLeft + viewport.width - rect.width - margin);
  const maxTop = Math.max(minTop, viewport.offsetTop + viewport.height - rect.height - margin);
  const minDistance = Math.min(260, Math.max(viewport.width, viewport.height) * 0.32);

  let bestPosition = {
    left: clamp(minLeft + Math.random() * (maxLeft - minLeft), minLeft, maxLeft),
    top: clamp(minTop + Math.random() * (maxTop - minTop), minTop, maxTop),
    distance: 0,
  };

  for (let attempt = 0; attempt < 30; attempt += 1) {
    const left = clamp(minLeft + Math.random() * (maxLeft - minLeft), minLeft, maxLeft);
    const top = clamp(minTop + Math.random() * (maxTop - minTop), minTop, maxTop);
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

function rainHearts() {
  const rain = document.querySelector("#heart-rain");
  if (rain.childElementCount > 0) {
    return;
  }

  const symbols = ["♥", "♡"];

  for (let index = 0; index < 42; index += 1) {
    const heart = document.createElement("span");
    const duration = 5.5 + Math.random() * 4.5;
    const sway = Math.round((Math.random() * 70 + 16) * (Math.random() < 0.5 ? -1 : 1));

    heart.textContent = symbols[index % symbols.length];
    heart.style.left = `${Math.random() * 100}%`;
    heart.style.fontSize = `${0.9 + Math.random() * 2.1}rem`;
    heart.style.setProperty("--sway", `${sway}px`);
    heart.style.animationDuration = `${duration}s`;
    heart.style.animationDelay = `${Math.random() * duration}s`;
    rain.appendChild(heart);
  }
}

function getDecemberRange() {
  const year = new Date().getFullYear();

  return {
    min: `${year}-12-01`,
    max: `${year}-12-31`,
  };
}

function formatDate(dateValue) {
  const selectedDate = new Date(`${dateValue}T12:00:00`);

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "full",
  }).format(selectedDate);
}

async function sendDateNotification(dateValue) {
  const formattedDate = formatDate(dateValue);
  const response = await fetch(notifyEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      _subject: "Anna escolheu a data do encontro",
      _template: "table",
      _captcha: "false",
      Data: formattedDate,
      Mensagem: `Anna aceitou sair com você e escolheu ${formattedDate} para o encontro.`,
    }),
  });
  const result = await response.json().catch(() => null);

  if (!response.ok || String(result?.success) !== "true") {
    throw new Error(result?.message ?? `Falha no envio (${response.status})`);
  }
}

function updateMailButton() {
  const dateValue = dateInput.value;
  const { min, max } = getDecemberRange();

  if (isSending) {
    return;
  }

  if (!dateValue) {
    mailButton.disabled = true;
    dateStatus.textContent = "Selecione uma data de dezembro.";
    return;
  }

  if (dateValue === sentDateValue) {
    mailButton.disabled = true;
    dateStatus.textContent = `Combinado: ${formatDate(dateValue)}. O José já foi avisado! ♥`;
    return;
  }

  if (dateValue < min || dateValue > max) {
    mailButton.disabled = true;
    dateStatus.textContent = "Só vale escolher uma data de dezembro.";
    return;
  }

  const formattedDate = formatDate(dateValue);
  mailButton.disabled = false;
  dateStatus.textContent = `Data escolhida: ${formattedDate}.`;
}

function prepareDatePicker() {
  const { min, max } = getDecemberRange();

  dateInput.min = min;
  dateInput.max = max;

  if (dateInput.value && (dateInput.value < min || dateInput.value > max)) {
    dateInput.value = "";
  }

  updateMailButton();
}

function celebrate() {
  celebration.hidden = false;
  yesButton.setAttribute("aria-expanded", "true");
  requestAnimationFrame(() => celebration.classList.add("is-open"));
  rainHearts();
  prepareDatePicker();
  dateInput.focus({ preventScroll: true });
}

window.addEventListener("load", placeNoButtonNearQuestion);
window.addEventListener("resize", placeNoButtonNearQuestion);

yesButton.addEventListener("click", celebrate);

dateInput.addEventListener("change", updateMailButton);

mailButton.addEventListener("click", async () => {
  const dateValue = dateInput.value;
  const { min, max } = getDecemberRange();

  if (isSending || !dateValue || dateValue < min || dateValue > max) {
    updateMailButton();
    return;
  }

  isSending = true;
  mailButton.disabled = true;
  dateInput.disabled = true;
  dateStatus.textContent = "Avisando o José...";

  try {
    await sendDateNotification(dateValue);
    sentDateValue = dateValue;
    isSending = false;
    dateInput.disabled = false;
    updateMailButton();
  } catch (error) {
    console.error("Não foi possível enviar a data:", error);
    isSending = false;
    dateInput.disabled = false;
    mailButton.disabled = false;
    dateStatus.textContent = "Não consegui avisar o José agora. Tenta de novo ou manda uma mensagem pra ele.";
  }
});

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
