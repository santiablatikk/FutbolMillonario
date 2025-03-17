// server.js
const express = require("express");
const path = require("path");
const fs = require("fs/promises");

const app = express();
const PORT = process.env.PORT || 3000;

// Servir archivos estáticos de la carpeta public
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

// Endpoint para cargar preguntas desde el archivo JSON
app.get("/api/questions", async (req, res) => {
  try {
    const questionsPath = path.join(__dirname, "public", "data", "questions.json");
    const data = await fs.readFile(questionsPath, "utf8");
    const questions = JSON.parse(data);
    res.json(questions);
  } catch (error) {
    console.error("Error al cargar preguntas:", error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
