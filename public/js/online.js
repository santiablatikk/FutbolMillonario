// online.js

// Conectar con Socket.io
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
const onlineAnswerInput = document.getElementById("online-answer-input");
const onlineSubmitBtn = document.getElementById("online-submit-btn");
const onlineShowOptionsBtn = document.getElementById("online-show-options-btn");
const floatingMsg = document.getElementById("floating-msg");

const roomIdInput = document.getElementById("room-id");
const createRoomBtn = document.getElementById("create-room-btn");
const joinRoomBtn = document.getElementById("join-room-btn");

document.addEventListener("DOMContentLoaded", () => {
  const name = sessionStorage.getItem("playerName") || "Jugador";
  playerDisplayOnline.textContent = `Bienvenido, ${name}`;
  loadOnlineQuestions();
});

async function loadOnlineQuestions() {
  try {
    const res = await fetch("/api/questions");
    const data = await res.json();
    // Usamos preguntas del nivel "media" para el modo online (puedes cambiar según tus necesidades)
    onlineQuestions = data["media"];
  } catch (error) {
    onlineQuestionTextEl.textContent = "Error al cargar preguntas.";
    console.error(error);
  }
}

// Crear sala
createRoomBtn.addEventListener("click", () => {
  socket.emit("createRoom", { player: sessionStorage.getItem("playerName") }, (response) => {
    alert(`Sala creada. Código: ${response.roomId}`);
  });
});

// Unirse a sala
joinRoomBtn.addEventListener("click", () => {
  const code = roomIdInput.value.trim();
  if (!code) {
    alert("Ingresa el código de sala");
    return;
  }
  socket.emit("joinRoom", code, (response) => {
    if (response.success) {
      alert("Te uniste a la sala. ¡La partida comenzará!");
      startOnlineGame();
    } else {
      alert(response.message);
    }
  });
});

// Cuando el servidor notifique el inicio de la partida
socket.on("startGame", (data) => {
  startOnlineGame();
});

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
  onlineAnswerInput.value = "";
  onlineOptionArea.innerHTML = "";
  onlineOptionArea.classList.add("hidden");
  onlineShowOptionsBtn.classList.remove("hidden");
}

onlineSubmitBtn.addEventListener("click", () => {
  const currentQ = onlineQuestions[questionIndex];
  const answer = onlineAnswerInput.value.trim();
  if (answer === "") return;

  const normAnswer = normalizeString(answer);
  const normCorrect = normalizeString(currentQ.respuesta_correcta);
  const distance = levenshteinDistance(normAnswer, normCorrect);

  if (normAnswer === normCorrect || distance <= 1) {
    onlineScore += (questionIndex < 5 ? 1 : 2);
  } else {
    if (normCorrect.startsWith(normAnswer) && normAnswer.length < normCorrect.length) {
      showFloatingMsg("Respuesta Incompleta. Intente nuevamente");
      return;
    }
  }
  onlineScoreEl.textContent = `Puntaje: ${onlineScore}`;
  // Enviar respuesta al servidor (ejemplo básico)
  socket.emit("playerAnswer", { roomId: roomIdInput.value.trim(), answer, questionIndex, playerId: socket.id });
  questionIndex++;
  showOnlineQuestion();
});

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

function selectOnlineOption(selected) {
  const currentQ = onlineQuestions[questionIndex];
  if (selected === currentQ.respuesta_correcta) {
    onlineScore += (questionIndex < 5 ? 1 : 1);
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
  onlineSubmitBtn.disabled = true;
  onlineAnswerInput.disabled = true;
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
