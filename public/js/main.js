// main.js

// Variables globales
let questionsData = {};
let currentLevel = "facil";
let currentQuestions = [];
let currentQuestionIndex = 0;
let score = 0;

// Controles del DOM
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

// Escuchar cambios en el select de nivel
levelSelect.addEventListener("change", () => {
  currentLevel = levelSelect.value;
});

// Botón de inicio
startBtn.addEventListener("click", startGame);

// Botones de comodines
fiftyBtn.addEventListener("click", useFifty);
skipBtn.addEventListener("click", skipQuestion);

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
  // Reset de variables
  score = 0;
  currentQuestionIndex = 0;
  usedFifty = false;
  usedSkip = false;
  scoreEl.textContent = `Puntaje: ${score}`;

  // Mostrar/ocultar elementos
  comodinesContainer.classList.remove("hidden");
  questionContainer.classList.remove("hidden");
  nextBtn.classList.add("hidden");

  // Cargar preguntas del endpoint
  try {
    const res = await fetch("/api/questions");
    questionsData = await res.json();
    currentQuestions = questionsData[currentLevel];
    if (!currentQuestions || !currentQuestions.length) {
      alert("No se encontraron preguntas para este nivel.");
      return;
    }
    showQuestion();
  } catch (error) {
    console.error("Error al cargar preguntas:", error);
    questionTextEl.textContent = "Error al cargar preguntas.";
  }
}

// Muestra la pregunta actual
function showQuestion() {
  // Verificar fin de juego
  if (currentQuestionIndex >= currentQuestions.length) {
    endGame();
    return;
  }

  // Ocultar el botón de siguiente hasta que el usuario responda
  nextBtn.classList.add("hidden");

  // Limpiar opciones
  optionsContainer.innerHTML = "";

  // Tomar la pregunta
  const questionObj = currentQuestions[currentQuestionIndex];
  questionTextEl.textContent = questionObj.pregunta;

  // Crear botones de opción
  for (const key in questionObj.opciones) {
    const btn = document.createElement("button");
    btn.className = "option-btn";
    btn.textContent = `${key}: ${questionObj.opciones[key]}`;
    btn.dataset.option = key;
    btn.addEventListener("click", () => checkAnswer(key, btn));
    optionsContainer.appendChild(btn);
  }
}

// Verificar la respuesta seleccionada
function checkAnswer(selectedOption, btnElement) {
  const questionObj = currentQuestions[currentQuestionIndex];
  const correctOption = questionObj.respuesta_correcta;

  // Deshabilitar todas las opciones
  const optionButtons = document.querySelectorAll(".option-btn");
  optionButtons.forEach((btn) => (btn.disabled = true));

  if (selectedOption === correctOption) {
    btnElement.style.backgroundColor = "green";
    score += 10; // Sumar puntaje
    showModal("¡Correcto!", `Has ganado 10 puntos. Tu puntaje actual es: ${score}`);
  } else {
    btnElement.style.backgroundColor = "red";
    // Mostrar cuál era la opción correcta
    optionButtons.forEach((btn) => {
      if (btn.dataset.option === correctOption) {
        btn.style.backgroundColor = "green";
      }
    });
    showModal("Incorrecto", "¡Respuesta equivocada!");
  }

  // Actualizar puntaje
  scoreEl.textContent = `Puntaje: ${score}`;

  // Mostrar botón de siguiente
  nextBtn.classList.remove("hidden");
}

// Función para comodín 50/50
function useFifty() {
  if (usedFifty) {
    alert("Ya has usado el comodín 50/50.");
    return;
  }
  usedFifty = true;

  const questionObj = currentQuestions[currentQuestionIndex];
  const correctOption = questionObj.respuesta_correcta;
  const allButtons = document.querySelectorAll(".option-btn");
  let hiddenCount = 0;

  // Ocultamos 2 opciones incorrectas aleatoriamente
  const incorrectButtons = [];
  allButtons.forEach((btn) => {
    if (btn.dataset.option !== correctOption) {
      incorrectButtons.push(btn);
    }
  });
  // Mezclar las opciones incorrectas
  shuffleArray(incorrectButtons);

  // Ocultar 2 de ellas
  for (let i = 0; i < 2 && i < incorrectButtons.length; i++) {
    incorrectButtons[i].style.display = "none";
    hiddenCount++;
  }
}

// Función para comodín Saltear pregunta
function skipQuestion() {
  if (usedSkip) {
    alert("Ya has usado el comodín para saltear.");
    return;
  }
  usedSkip = true;
  // Simplemente avanzamos a la siguiente pregunta sin penalización
  currentQuestionIndex++;
  showQuestion();
}

// Finalizar juego
function endGame() {
  showModal("Fin del juego", `Tu puntaje final es: ${score}`);
  // Ocultar elementos
  comodinesContainer.classList.add("hidden");
  questionContainer.classList.add("hidden");
  nextBtn.classList.add("hidden");
}

// Mostrar modal
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

// Función utilitaria para mezclar arrays
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
