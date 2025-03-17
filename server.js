// online.js

// Conectar con el servidor Socket.io
const socket = io();

// Elementos de la interfaz de sala
const roomIdInput = document.getElementById("room-id");
const createRoomBtn = document.getElementById("create-room-btn");
const joinRoomBtn = document.getElementById("join-room-btn");
const onlinePlayerDisplay = document.getElementById("player-display-online");

// Elementos del juego online
const onlineQuestionTextEl = document.getElementById("online-question-text");
const onlineAnswerInput = document.getElementById("online-answer-input");
const onlineSubmitBtn = document.getElementById("online-submit-btn");
const onlineShowOptionsBtn = document.getElementById("online-show-options-btn");
const onlineOptionArea = document.getElementById("online-option-area");
const onlineTimerEl = document.getElementById("online-timer");
const onlineScoreEl = document.getElementById("online-score");

let roomId = null;
let onlineScore = 0;
let questionIndex = 0;
let onlineQuestions = []; // Aquí se cargarán las preguntas (puedes usar /api/questions)

document.addEventListener("DOMContentLoaded", () => {
  const name = sessionStorage.getItem("playerName") || "Jugador";
  onlinePlayerDisplay.textContent = `Bienvenido, ${name}`;
  
  // Cargar preguntas para modo online (puedes elegir la categoría deseada)
  loadOnlineQuestions();
});

// Función para cargar preguntas (ejemplo sencillo)
async function loadOnlineQuestions() {
  try {
    const res = await fetch("/api/questions");
    const data = await res.json();
    // Por ejemplo, usamos preguntas del nivel "media"
    onlineQuestions = data["media"];
    // Una vez que la partida inicie, se llamará a showOnlineQuestion()
  } catch (error) {
    onlineQuestionTextEl.textContent = "Error al cargar preguntas.";
    console.error(error);
  }
}

// Crear sala
createRoomBtn.addEventListener("click", () => {
  socket.emit("createRoom", { player: sessionStorage.getItem("playerName") }, (response) => {
    roomId = response.roomId;
    alert(`Sala creada. Código: ${roomId}. Compártelo con tu oponente.`);
    // Puedes cambiar la interfaz para indicar que se espera a otro jugador
  });
});

// Unirse a una sala
joinRoomBtn.addEventListener("click", () => {
  const enteredRoomId = roomIdInput.value.trim();
  if (!enteredRoomId) {
    alert("Ingresa el código de sala.");
    return;
  }
  socket.emit("joinRoom", enteredRoomId, (response) => {
    if (response.success) {
      roomId = enteredRoomId;
      alert("Te uniste a la sala. ¡La partida comenzará pronto!");
    } else {
      alert(response.message);
    }
  });
});

// Escuchar el inicio de la partida
socket.on("startGame", (data) => {
  // La partida ya puede comenzar para ambos jugadores
  questionIndex = 0;
  onlineScore = 0;
  showOnlineQuestion();
  startOnlineTimer();
});

// Mostrar la pregunta online
function showOnlineQuestion() {
  if (questionIndex >= onlineQuestions.length) {
    endOnlineGame();
    return;
  }
  const currentQ = onlineQuestions[questionIndex];
  onlineQuestionTextEl.textContent = currentQ.pregunta;
  onlineAnswerInput.value = "";
  onlineOptionArea.innerHTML = "";
  onlineOptionArea.classList.add("hidden");
  onlineShowOptionsBtn.classList.remove("hidden");
}

// Enviar respuesta online
onlineSubmitBtn.addEventListener("click", () => {
  const answer = onlineAnswerInput.value.trim();
  if (answer === "") return;
  
  // Enviar la respuesta al servidor para que se sincronice con la sala
  socket.emit("playerAnswer", { roomId, answer, questionIndex, playerId: socket.id });
  // Por ahora, de manera local actualizamos el puntaje (en una implementación real, el servidor validaría y devolvería el resultado)
  const currentQ = onlineQuestions[questionIndex];
  if (answer.toLowerCase() === currentQ.respuesta_correcta.toLowerCase()) {
    onlineScore += (questionIndex < 5 ? 1 : 2);
  }
  onlineScoreEl.textContent = `Puntaje: ${onlineScore}`;
  questionIndex++;
  showOnlineQuestion();
});

// Mostrar opciones si el jugador las solicita
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

// Seleccionar opción online
function selectOnlineOption(selected) {
  const currentQ = onlineQuestions[questionIndex];
  // Si se usan opciones, el valor es diferente (por ejemplo, 1 punto)
  if (selected === currentQ.respuesta_correcta) {
    onlineScore += (questionIndex < 5 ? 1 : 1);
  }
  onlineScoreEl.textContent = `Puntaje: ${onlineScore}`;
  questionIndex++;
  showOnlineQuestion();
}

// Temporizador online (1 minuto por pregunta)
let onlineTimerInterval;
let onlineTimeLeft = 60;
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
