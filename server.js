// server.js
const express = require("express");
const http = require("http");
const path = require("path");
const fs = require("fs/promises");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

// Endpoint para cargar preguntas
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

// Ejemplo básico de Socket.io para el modo online (puedes extenderlo)
io.on("connection", (socket) => {
  console.log(`Nuevo cliente conectado: ${socket.id}`);
  
  // Evento para recibir respuestas (aquí podrías validar y actualizar puntajes)
  socket.on("playerAnswer", (data) => {
    // Reenviamos la respuesta a la sala o a todos (ejemplo simple)
    io.emit("answerResult", data);
  });
  
  socket.on("disconnect", () => {
    console.log(`Cliente desconectado: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
