// main.js

// Guarda el nombre del jugador al salir de la landing page
document.addEventListener("DOMContentLoaded", () => {
    const playerNameInput = document.getElementById("player-name");
    const localBtn = document.getElementById("local-btn");
    const onlineBtn = document.getElementById("online-btn");
  
    function saveName() {
      const name = playerNameInput.value.trim();
      if (name) {
        sessionStorage.setItem("playerName", name);
      }
    }
  
    localBtn.addEventListener("click", saveName);
    onlineBtn.addEventListener("click", saveName);
  
    // Compartir en redes sociales
    const shareBtn = document.getElementById("share-btn");
    shareBtn.addEventListener("click", () => {
      const shareData = {
        title: "Futbol Game",
        text: "¡Descubre quién sabe más de fútbol!",
        url: window.location.href,
      };
      if (navigator.share) {
        navigator.share(shareData).catch(console.error);
      } else {
        alert("Tu navegador no soporta compartir. Copia el enlace.");
      }
    });
  });
  