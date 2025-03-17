// main.js

// Variables globales
let questionsData = {};
let currentLevel = "facil";
let currentQuestions = [];
let currentQuestionIndex = 0;
let score = 0;

// Elementos del DOM
const levelSelect = document.getElementById("level-select");
const startBtn = document.getElementById("start-btn");
const scoreEl = document.getElementById("score");
const comodinesContainer = document.getElementById("comodines-container");
const fiftyBtn = document.getElementById("fifty-btn");
const skipBtn = document.getElementById("skip-btn");

const questionContainer = document.getElementById("question-container");
const questionTextEl = document.getElementById("question-text");
const optionsContainer = document.getElementById("options-container");
const nextBtn = document.getElementById("next-btn");

// Modal
const modalResult = document.getElementById("modal-result");
const modalTitle = document.getElementById("modal-title");
const modalMessage = document.getElementById("modal-message");
const modalClose = document.getElementById("modal-close");
const modalOkBtn = document.getElementById("modal-ok-btn");

// Comodines disponibles
let usedFifty = false;
let usedSkip = false;

// Actualizar nivel según select
levelSelect.addEventListener("change", () => {
  currentLevel = levelSelect.value;
});

// Botón de inicio
startBtn.addEventListener("click", startGame);

// Botones de comodines
fiftyBtn.addEventListener("click", useFifty);
skipBtn.addEventListener("click", useSkip);

// Botón de siguiente pregunta
nextBtn.addEventListener("click", () => {
  currentQuestionIndex++;
  showQuestion();
});

// Cerrar modal
modalClose.addEventListener("click", closeModal);
modalOkBtn.addEventListener("click", closeModal);

// Función para iniciar el juego
async function startGame() {
  // Resetear variables
  score = 0;
  currentQuestionIndex = 0;
  usedFifty = false;
  usedSkip = false;
  scoreEl.textContent = `Puntaje: ${score}`;

  // Mostrar elementos del juego
  comodinesContainer.classList.remove("hidden");
  questionContainer.classList.remove("hidden");
  nextBtn.classList.add("hidden");

  // Cargar preguntas desde el endpoint
  try {
    const res = await fetch("/api/questions");
    questionsData = await res.json();
    currentQuestions = questionsData[currentLevel];
    if (!currentQuestions || currentQuestions.length === 0) {
      alert("No se encontraron preguntas para este nivel.");
      return;
    }
    showQuestion();
  } catch (error) {
    console.error("Error al cargar preguntas:", error);
    questionTextEl.textContent = "Error al cargar preguntas.";
  }
}

// Mostrar la pregunta actual
function showQuestion() {
  // Verificar si se terminaron las preguntas
  if (currentQuestionIndex >= currentQuestions.length) {
    endGame();
    return;
  }

  // Ocultar botón de siguiente hasta responder
  nextBtn.classList.add("hidden");

  // Limpiar opciones
  optionsContainer.innerHTML = "";

  const questionObj = currentQuestions[currentQuestionIndex];
  questionTextEl.textContent = questionObj.pregunta;

  // Crear botones de opciones
  for (const key in questionObj.opciones) {
    const btn = document.createElement("button");
    btn.className = "option-btn";
    btn.textContent = `${key}: ${questionObj.opciones[key]}`;
    btn.dataset.option = key;
    btn.addEventListener("click", () => checkAnswer(key, btn));
    optionsContainer.appendChild(btn);
  }
}

// Verificar respuesta
function checkAnswer(selectedOption, btnElement) {
  const questionObj = currentQuestions[currentQuestionIndex];
  const correctOption = questionObj.respuesta_correcta;

  // Deshabilitar todas las opciones
  const optionButtons = document.querySelectorAll(".option-btn");
  optionButtons.forEach(btn => btn.disabled = true);

  if (selectedOption === correctOption) {
    btnElement.style.backgroundColor = "green";
    score += 10;
    showModal("¡Correcto!", `Has ganado 10 puntos. Puntaje: ${score}`);
  } else {
    btnElement.style.backgroundColor = "red";
    optionButtons.forEach(btn => {
      if (btn.dataset.option === correctOption) {
        btn.style.backgroundColor = "green";
      }
    });
    showModal("Incorrecto", "¡Respuesta equivocada!");
  }

  scoreEl.textContent = `Puntaje: ${score}`;
  nextBtn.classList.remove("hidden");
}

// Comodín 50/50: elimina dos opciones incorrectas
function useFifty() {
  if (usedFifty) {
    alert("Ya usaste el comodín 50/50.");
    return;
  }
  usedFifty = true;

  const questionObj = currentQuestions[currentQuestionIndex];
  const correctOption = questionObj.respuesta_correcta;
  const optionButtons = Array.from(document.querySelectorAll(".option-btn"));

  const incorrectButtons = optionButtons.filter(btn => btn.dataset.option !== correctOption);
  // Mezclar el array de botones incorrectos
  shuffleArray(incorrectButtons);

  // Ocultar dos botones incorrectos
  incorrectButtons.slice(0, 2).forEach(btn => btn.style.display = "none");
}

// Comodín Saltear: pasa a la siguiente pregunta sin penalizar
function useSkip() {
  if (usedSkip) {
    alert("Ya usaste el comodín para saltear.");
    return;
  }
  usedSkip = true;
  currentQuestionIndex++;
  showQuestion();
}

// Finalizar el juego
function endGame() {
  showModal("Fin del juego", `Tu puntaje final es: ${score}`);
  comodinesContainer.classList.add("hidden");
  questionContainer.classList.add("hidden");
  nextBtn.classList.add("hidden");
}

// Mostrar modal con resultado
function showModal(title, message) {
  modalTitle.textContent = title;
  modalMessage.textContent = message;
  modalResult.classList.add("show");
  modalResult.classList.remove("hidden");
}

// Cerrar modal
function closeModal() {
  modalResult.classList.remove("show");
  modalResult.classList.add("hidden");
}

// Función para mezclar array
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}
