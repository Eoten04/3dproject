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

inputHandler.onToggleDoor = () => {
    sceneManager.toggleDoor();
    uiContainer.innerText = "Door";
    setTimeout(() => uiContainer.innerText = "", 1000);
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
