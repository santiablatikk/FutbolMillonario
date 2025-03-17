// online.js

let onlineQuestions = [];
let currentOnlineIndex = 0;
let onlineScore = 0;
let onlineTimerInterval;
let onlineTimeLeft = 60; // 1 minuto por pregunta

const playerDisplayOnline = document.getElementById("player-display-online");
const onlineTimerEl = document.getElementById("online-timer");
const onlineScoreEl = document.getElementById("online-score");
const onlineQuestionTextEl = document.getElementById("online-question-text");
const onlineOptionArea = document.getElementById("online-option-area");
const onlineAnswerInput = document.getElementById("online-answer-input");
const onlineSubmitBtn = document.getElementById("online-submit-btn");
const onlineShowOptionsBtn = document.getElementById("online-show-options-btn");

document.addEventListener("DOMContentLoaded", () => {
  const name = sessionStorage.getItem("playerName") || "Jugador";
  playerDisplayOnline.textContent = `Bienvenido, ${name}`;
  // Aquí se debería iniciar conexión con el servidor en tiempo real para el modo online
  // Por simplicidad, se carga un nivel (ej. "media") para este ejemplo
  loadOnlineQuestions();
  startOnlineTimer();
});

async function loadOnlineQuestions() {
  try {
    const res = await fetch("/api/questions");
    const data = await res.json();
    // En modo online se usan preguntas del nivel "media" (por ejemplo)
    onlineQuestions = data["media"];
    showOnlineQuestion();
  } catch (error) {
    onlineQuestionTextEl.textContent = "Error al cargar preguntas.";
    console.error(error);
  }
}

function showOnlineQuestion() {
  if (currentOnlineIndex >= onlineQuestions.length) {
    endOnlineGame();
    return;
  }
  resetOnlineTimer();
  const currentQ = onlineQuestions[currentOnlineIndex];
  onlineQuestionTextEl.textContent = currentQ.pregunta;
  onlineAnswerInput.value = "";
  onlineOptionArea.innerHTML = "";
  onlineOptionArea.classList.add("hidden");
  onlineShowOptionsBtn.classList.remove("hidden");
}

onlineSubmitBtn.addEventListener("click", () => {
  const currentQ = onlineQuestions[currentOnlineIndex];
  const answer = onlineAnswerInput.value.trim();
  if (answer === "") return;

  // Comparación básica (sin opciones)
  if (answer.toLowerCase() === currentQ.respuesta_correcta.toLowerCase()) {
    onlineScore += (currentOnlineIndex < 5 ? 1 : 2); // nivel 1: 1 punto; niveles 2-6: 2 puntos
  }
  onlineScoreEl.textContent = `Puntaje: ${onlineScore}`;
  currentOnlineIndex++;
  showOnlineQuestion();
});

onlineShowOptionsBtn.addEventListener("click", () => {
  const currentQ = onlineQuestions[currentOnlineIndex];
  let optionsHtml = "";
  for (const key in currentQ.opciones) {
    optionsHtml += `<button class="option-btn" onclick="selectOnlineOption('${key}')">${key}: ${currentQ.opciones[key]}</button>`;
  }
  onlineOptionArea.innerHTML = optionsHtml;
  onlineOptionArea.classList.remove("hidden");
  onlineShowOptionsBtn.classList.add("hidden");
});

function selectOnlineOption(selected) {
  const currentQ = onlineQuestions[currentOnlineIndex];
  // Si se usan opciones, la respuesta vale 1 punto en lugar de 2 (para niveles 2-6)
  if (selected === currentQ.respuesta_correcta) {
    onlineScore += (currentOnlineIndex < 5 ? 1 : 1);
  } else {
    // Aquí puedes agregar lógica para mostrar la respuesta correcta (cambiando colores, etc.)
  }
  onlineScoreEl.textContent = `Puntaje: ${onlineScore}`;
  currentOnlineIndex++;
  showOnlineQuestion();
}

function startOnlineTimer() {
  onlineTimerInterval = setInterval(() => {
    onlineTimeLeft--;
    onlineTimerEl.textContent = `Tiempo: ${formatTime(onlineTimeLeft)}`;
    if (onlineTimeLeft <= 0) {
      // Avanzar a la siguiente pregunta si se agota el tiempo
      currentOnlineIndex++;
      showOnlineQuestion();
    }
  }, 1000);
}

function resetOnlineTimer() {
  clearInterval(onlineTimerInterval);
  onlineTimeLeft = 60;
  onlineTimerEl.textContent = `Tiempo: ${formatTime(onlineTimeLeft)}`;
  startOnlineTimer();
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function endOnlineGame() {
  clearInterval(onlineTimerInterval);
  onlineQuestionTextEl.textContent = `Juego finalizado. Puntaje final: ${onlineScore}`;
  onlineSubmitBtn.disabled = true;
  onlineAnswerInput.disabled = true;
}
