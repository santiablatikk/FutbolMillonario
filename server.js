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

// Socket.io (Ejemplo base; extiende para salas y sincronización real)
io.on("connection", (socket) => {
  console.log(`Cliente conectado: ${socket.id}`);
  socket.on("playerAnswer", (data) => {
    io.emit("answerResult", data);
  });
  socket.on("disconnect", () => {
    console.log(`Cliente desconectado: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
