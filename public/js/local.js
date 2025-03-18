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
const floatingMsg = document.getElementById("floating-msg"); // Si existe en el HTML (puedes definirlo en local.html o usar alert)

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
    // Usamos preguntas del nivel "facil" para el modo local
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
  
  // Normalización para eliminar tildes y dieresis
  const normPlayerAnswer = normalizeString(playerAnswer);
  const normCorrectAnswer = normalizeString(currentQ.respuesta_correcta);
  
  // Calcular distancia de Levenshtein para errores leves
  const distance = levenshteinDistance(normPlayerAnswer, normCorrectAnswer);
  
  if (normPlayerAnswer === normCorrectAnswer || distance <= 1) {
    score += 1;
  } else {
    // Si es incompleta (prefijo) se muestra mensaje flotante
    if (normCorrectAnswer.startsWith(normPlayerAnswer) && normPlayerAnswer.length < normCorrectAnswer.length) {
      showFloatingMsg("Respuesta Incompleta. Intente nuevamente");
      return;
    } else {
      mistakes++;
      if (mistakes > 1) {
        endGame();
        return;
      }
    }
  }
  scoreEl.textContent = `Puntaje: ${score}`;
  currentIndex++;
  showQuestion();
});

showOptionsBtn.addEventListener("click", () => {
  const currentQ = questions[currentIndex];
  let optionsHtml = "";
  for (const key in currentQ.opciones) {
    optionsHtml += `<button class="option-btn" onclick="selectOption('${key}')">${key}: ${currentQ.opciones[key]}</button>`;
  }
  optionArea.innerHTML = optionsHtml;
  showOptionsBtn.classList.add("hidden");
});

function selectOption(selected) {
  const currentQ = questions[currentIndex];
  if (selected === currentQ.respuesta_correcta) {
    score += 1;
    highlightSelectedOption(selected, true);
  } else {
    mistakes++;
    highlightSelectedOption(selected, false);
    highlightCorrectOption(currentQ.respuesta_correcta);
    if (mistakes > 1) {
      endGame();
      return;
    }
  }
  scoreEl.textContent = `Puntaje: ${score}`;
  currentIndex++;
  showQuestion();
}

function highlightSelectedOption(option, isCorrect) {
  const buttons = document.querySelectorAll("#option-area .option-btn");
  buttons.forEach(btn => {
    if (btn.textContent.startsWith(option)) {
      btn.style.backgroundColor = isCorrect ? "green" : "red";
    }
  });
}

function highlightCorrectOption(correctOption) {
  const buttons = document.querySelectorAll("#option-area .option-btn");
  buttons.forEach(btn => {
    if (btn.textContent.startsWith(correctOption)) {
      btn.style.backgroundColor = "green";
    }
  });
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

function showFloatingMsg(message) {
  if (floatingMsg) {
    floatingMsg.textContent = message;
    floatingMsg.classList.remove("hidden");
    setTimeout(() => floatingMsg.classList.add("hidden"), 2000);
  } else {
    alert(message);
  }
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
