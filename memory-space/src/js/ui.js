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

  const floatingMessages = document.createElement("div");
  floatingMessages.className = "floating-messages";
  overlay.appendChild(floatingMessages);

  const phrases = ["mi amor", "mi cielo", "mi universo", "mi hogar", "mi eternidad"];
  const orbitStarts = [0.15, 0.4, 0.62, 0.84, 0.98];
  const phraseElements = [];

  phrases.forEach((phrase, index) => {
    const item = document.createElement("span");
    item.className = "floating-phrase";
    item.textContent = phrase;
    const angle = Math.PI * 2 * orbitStarts[index];
    item.dataset.angle = String(angle);
    item.dataset.radiusX = String(34 + index * 4);
    item.dataset.radiusY = String(24 + (index % 2) * 8);
    item.dataset.speed = String(0.22 + index * 0.025);
    item.dataset.phase = String(index * 0.8);
    floatingMessages.appendChild(item);
    phraseElements.push(item);
  });

  function updateFloatingPhrases(time) {
    const seconds = time / 1000;
    phraseElements.forEach((element) => {
      const radiusX = Number(element.dataset.radiusX);
      const radiusY = Number(element.dataset.radiusY);
      const speed = Number(element.dataset.speed);
      const phase = Number(element.dataset.phase);
      const angle = seconds * speed + phase;
      const wobble = Math.sin(seconds * 0.7 + phase) * 6;
      const x = 50 + Math.cos(angle) * radiusX + wobble * 0.25;
      const y = 50 + Math.sin(angle) * radiusY + Math.sin(seconds * 0.6 + phase * 0.9) * 4;
      const tilt = Math.sin(seconds * 0.8 + phase) * 4;
      element.style.left = `${x}%`;
      element.style.top = `${y}%`;
      element.style.transform = `translate(-50%, -50%) rotate(${tilt}deg)`;
    });
    requestAnimationFrame(updateFloatingPhrases);
  }

  requestAnimationFrame(updateFloatingPhrases);

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
