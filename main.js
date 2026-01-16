import { SceneManager } from './SceneManager.js';
import { InputHandler } from './InputHandler.js';
import { InteractionManager } from './InteractionManager.js';

const uiContainer = document.getElementById('ui-container');
const instructions = document.getElementById('instructions');

const sceneManager = new SceneManager(document.body);
const inputHandler = new InputHandler(sceneManager.camera, document.body);
const interactionManager = new InteractionManager(sceneManager.camera, sceneManager.scene, uiContainer);

let isNight = false;
inputHandler.onToggleDayNight = () => {
    isNight = !isNight;
    sceneManager.toggleDayNight(isNight);
    uiContainer.innerText = isNight ? "Night Mode" : "Day Mode";
    setTimeout(() => uiContainer.innerText = "", 2000);
};

interactionManager.onToggleLamp = () => {
    return sceneManager.toggleLamp();
};

interactionManager.onToggleDoor = () => {
    sceneManager.toggleDoor();
};

interactionManager.onRingDoorbell = () => {
    sceneManager.ringDoorbell();
};

instructions.addEventListener('click', () => {
    inputHandler.lock();
});

inputHandler.onLock = () => {
    instructions.style.display = 'none';
};

inputHandler.onUnlock = () => {
    instructions.style.display = 'block';
};

// Speed slider control
const speedSlider = document.getElementById('speed-slider');
const speedValue = document.getElementById('speed-value');

speedSlider.addEventListener('input', (e) => {
    const speed = parseFloat(e.target.value);
    inputHandler.speed = speed;
    speedValue.textContent = speed;
});

function animate() {
    requestAnimationFrame(animate);

    const deltaTime = sceneManager.clock.getDelta();
    inputHandler.update(deltaTime);
    sceneManager.update(deltaTime);

    sceneManager.render();
}

animate();
window.addEventListener('resize', () => {
    sceneManager.onWindowResize();
});
