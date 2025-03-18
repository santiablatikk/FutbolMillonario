// main.js
document.addEventListener("DOMContentLoaded", () => {
    const playerNameInput = document.getElementById("player-name");
    const localBtn = document.getElementById("local-btn");
    const onlineBtn = document.getElementById("online-btn");
    const shareBtn = document.getElementById("share-btn");
    
    function saveName() {
      const name = playerNameInput.value.trim();
      if (name) {
        sessionStorage.setItem("playerName", name);
      } else {
        sessionStorage.setItem("playerName", "Jugador");
      }
    }
    
    localBtn.addEventListener("click", saveName);
    onlineBtn.addEventListener("click", saveName);
    
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
  