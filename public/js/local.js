// local.js

let questions = [];
let currentIndex = 0;
let score = 0;
let mistakes = 0;
let timerInterval;
let timeLeft = 300; // 5 minutos en segundos

const playerDisplay = document.getElementById("player-display");
const timerEl = document.getElementById("timer");
const scoreEl = document.getElementById("score");
const questionTextEl = document.getElementById("question-text");
const optionArea = document.getElementById("option-area");
const answerInput = document.getElementById("answer-input");
const submitBtn = document.getElementById("submit-btn");
const showOptionsBtn = document.getElementById("show-options-btn");

document.addEventListener("DOMContentLoaded", () => {
  const name = sessionStorage.getItem("playerName") || "Jugador";
  playerDisplay.textContent = `Bienvenido, ${name}`;
  loadQuestions();
  startTimer();
});

async function loadQuestions() {
  try {
    const res = await fetch("/api/questions");
    const data = await res.json();
    // Asumimos que para el modo local se usan las preguntas del nivel "facil"
    questions = data["facil"];
    showQuestion();
  } catch (error) {
    questionTextEl.textContent = "Error al cargar preguntas.";
    console.error(error);
  }
}

function showQuestion() {
  if (currentIndex >= questions.length) {
    endGame();
    return;
  }
  const currentQ = questions[currentIndex];
  questionTextEl.textContent = currentQ.pregunta;
  answerInput.value = "";
  optionArea.innerHTML = "";
  showOptionsBtn.classList.remove("hidden");
}

submitBtn.addEventListener("click", () => {
  const currentQ = questions[currentIndex];
  const playerAnswer = answerInput.value.trim();
  if (playerAnswer === "") return;

  // Comparar sin opciones
  if (playerAnswer.toLowerCase() === currentQ.respuesta_correcta.toLowerCase()) {
    score += 1; // cada respuesta correcta suma 1 punto
  } else {
    mistakes++;
    if (mistakes > 1) {
      endGame();
      return;
    }
  }
  scoreEl.textContent = `Puntaje: ${score}`;
  currentIndex++;
  showQuestion();
});

// Si el jugador desea ver opciones, se muestran y la pregunta vale 0.5 (o 1 punto)
showOptionsBtn.addEventListener("click", () => {
  const currentQ = questions[currentIndex];
  // Mostrar botones con las opciones
  let optionsHtml = "";
  for (const key in currentQ.opciones) {
    optionsHtml += `<button class="option-btn" onclick="selectOption('${key}')">${key}: ${currentQ.opciones[key]}</button>`;
  }
  optionArea.innerHTML = optionsHtml;
  // Cambiar valor de la pregunta (por ejemplo, solo suma 1 punto si es correcta)
  showOptionsBtn.classList.add("hidden");
});

function selectOption(selected) {
  const currentQ = questions[currentIndex];
  if (selected === currentQ.respuesta_correcta) {
    score += 1; // en este caso vale 1 punto
  } else {
    mistakes++;
    if (mistakes > 1) {
      endGame();
      return;
    }
  }
  scoreEl.textContent = `Puntaje: ${score}`;
  currentIndex++;
  showQuestion();
}

function startTimer() {
  timerInterval = setInterval(() => {
    timeLeft--;
    timerEl.textContent = `Tiempo: ${formatTime(timeLeft)}`;
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      endGame();
    }
  }, 1000);
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function endGame() {
  clearInterval(timerInterval);
  questionTextEl.textContent = `Juego finalizado. Tu puntaje final es: ${score}`;
  submitBtn.disabled = true;
  answerInput.disabled = true;
}
