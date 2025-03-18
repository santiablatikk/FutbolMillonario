// online.js

// Conectar con el servidor Socket.io
const socket = io();

let onlineQuestions = [];
let questionIndex = 0;
let onlineScore = 0;
let onlineTimerInterval;
let onlineTimeLeft = 60; // 1 minuto por pregunta

const playerDisplayOnline = document.getElementById("player-display-online");
const onlineTimerEl = document.getElementById("online-timer");
const onlineScoreEl = document.getElementById("online-score");
const onlineQuestionTextEl = document.getElementById("online-question-text");
const onlineOptionArea = document.getElementById("online-option-area");
const onlineShowOptionsBtn = document.getElementById("online-show-options-btn");
const floatingMsg = document.getElementById("floating-msg");

// Para salas (en las páginas de creación y unión)
const roomIdInput = document.getElementById("room-id");
const createRoomBtn = document.getElementById("create-room-btn");
const joinRoomBtn = document.getElementById("joinRoomBtn"); // Si está definido

document.addEventListener("DOMContentLoaded", () => {
  const name = sessionStorage.getItem("playerName") || "Jugador";
  if (playerDisplayOnline) {
    playerDisplayOnline.textContent = `Bienvenido, ${name}`;
  }
  loadOnlineQuestions();
});

async function loadOnlineQuestions() {
  try {
    const res = await fetch("/api/questions");
    const data = await res.json();
    // Usamos preguntas del nivel "media" (puedes ajustar según necesites)
    onlineQuestions = data["media"];
  } catch (error) {
    onlineQuestionTextEl.textContent = "Error al cargar preguntas.";
    console.error(error);
  }
}

function startOnlineGame() {
  questionIndex = 0;
  onlineScore = 0;
  showOnlineQuestion();
  startOnlineTimer();
}

function showOnlineQuestion() {
  if (questionIndex >= onlineQuestions.length) {
    endOnlineGame();
    return;
  }
  resetOnlineTimer();
  const currentQ = onlineQuestions[questionIndex];
  onlineQuestionTextEl.textContent = currentQ.pregunta;
  onlineOptionArea.innerHTML = "";
  onlineOptionArea.classList.add("hidden");
  onlineShowOptionsBtn.classList.remove("hidden");
}

if (onlineShowOptionsBtn) {
  onlineShowOptionsBtn.addEventListener("click", () => {
    const currentQ = onlineQuestions[questionIndex];
    let optionsHtml = "";
    for (const key in currentQ.opciones) {
      optionsHtml += `<button class="option-btn" onclick="selectOnlineOption('${key}')">${key}: ${currentQ.opciones[key]}</button>`;
    }
    onlineOptionArea.innerHTML = optionsHtml;
    onlineOptionArea.classList.remove("hidden");
    onlineShowOptionsBtn.classList.add("hidden");
  });
}

function selectOnlineOption(selected) {
  const currentQ = onlineQuestions[questionIndex];
  if (selected === currentQ.respuesta_correcta) {
    onlineScore += (questionIndex < 5 ? 1 : 2);
  }
  onlineScoreEl.textContent = `Puntaje: ${onlineScore}`;
  questionIndex++;
  showOnlineQuestion();
}

function startOnlineTimer() {
  onlineTimerInterval = setInterval(() => {
    onlineTimeLeft--;
    onlineTimerEl.textContent = `Tiempo: ${formatTime(onlineTimeLeft)}`;
    if (onlineTimeLeft <= 0) {
      questionIndex++;
      showOnlineQuestion();
      resetOnlineTimer();
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
  // Aquí podrías deshabilitar botones o inputs
}

function showFloatingMsg(message) {
  floatingMsg.textContent = message;
  floatingMsg.classList.remove("hidden");
  setTimeout(() => { floatingMsg.classList.add("hidden"); }, 2000);
}

function normalizeString(str) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function levenshteinDistance(a, b) {
  const matrix = [];
  for (let i = 0; i <= b.length; i++) { matrix[i] = [i]; }
  for (let j = 0; j <= a.length; j++) { matrix[0][j] = j; }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}
