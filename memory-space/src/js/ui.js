export function createUI() {
  const overlay = document.createElement("div");
  overlay.className = "ui-overlay";
  document.body.appendChild(overlay);

  const title = document.createElement("div");
  title.className = "top-title";
  overlay.appendChild(title);

  const timer = document.createElement("div");
  timer.className = "timer-pill";
  overlay.appendChild(timer);

  const modal = document.createElement("div");
  modal.className = "memory-modal";
  modal.innerHTML = `<div class="memory-card"><div class="memory-photo"></div><div class="memory-copy"><h2></h2><p></p></div></div>`;
  document.body.appendChild(modal);

  let timerInterval = null;

  function setTitle(text) {
    title.textContent = text;
  }

  function setTimer(startDate) {
    const update = () => {
      const diff = Date.now() - new Date(startDate).getTime();
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      timer.textContent = `Tiempo contigo: ${days}d ${hours}h`;
    };
    update();
    clearInterval(timerInterval);
    timerInterval = setInterval(update, 1000 * 60);
  }

  function showMemory({ title, text, image }) {
    const card = modal.querySelector(".memory-card");
    const photo = card.querySelector(".memory-photo");
    const titleEl = card.querySelector("h2");
    const textEl = card.querySelector("p");
    titleEl.textContent = title;
    textEl.textContent = text;
    modal.classList.add("visible");
    if (image) {
      const imageUrl = image.image?.src || image.src;
      photo.style.backgroundImage = `linear-gradient(180deg, rgba(0,0,0,0.12), rgba(0,0,0,0.48)), url(${imageUrl})`;
      photo.style.backgroundSize = "cover";
      photo.style.backgroundPosition = "center";
    } else {
      photo.style.backgroundImage = "linear-gradient(135deg, rgba(255,132,58,.95), rgba(72,22,92,.95))";
      photo.style.backgroundSize = "cover";
      photo.style.backgroundPosition = "center";
    }
  }

  modal.addEventListener("click", () => {
    modal.classList.remove("visible");
  });

  setTitle("Feliz día de la novia mi Yossi 🧡");

  return { setTimer, showMemory };
}
