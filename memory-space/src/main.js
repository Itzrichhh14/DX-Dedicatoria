import "./styles/main.css";
import { createScene } from "./js/scene";

const button = document.getElementById("startButton");

button.addEventListener("click", () => {
    const intro = document.getElementById("intro");
    intro.classList.add("is-starting");
    button.disabled = true;

    window.setTimeout(() => {
        createScene({ autoplayAudio: true });
    }, 1400);
});