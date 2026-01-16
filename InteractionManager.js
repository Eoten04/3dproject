import * as THREE from 'three';

export class InteractionManager {
    constructor(camera, scene, uiContainer) {
        this.camera = camera;
        this.scene = scene;
        this.uiContainer = uiContainer;
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        this.center = new THREE.Vector2(0, 0);

        this.onToggleLamp = () => { }; // Callback for lamp toggle
        this.onToggleDoor = () => { }; // Callback for door toggle
        this.onRingDoorbell = () => { }; // Callback for doorbell

        this.init();
    }

    init() {
        document.addEventListener('click', () => this.onClick());
    }

    onClick() {
        this.raycaster.setFromCamera(this.center, this.camera);

        const intersects = this.raycaster.intersectObjects(this.scene.children, true);

        if (intersects.length > 0) {
            const object = intersects[0].object;
            this.handleInteraction(object);
        }
    }

    handleInteraction(object) {
        let target = object;
        let found = false;

        // Traverse up checking for known interactables
        while (target && target !== this.scene) {
            console.log("Checking target:", target.name, target.type);

            if (target.name === 'DoorbellHitbox' || target.name === 'Doorbell') {
                this.ringDoorbell();
                found = true;
                break;
            } else if (target.name === 'Shoji') {
                this.animateDoor(target);
                found = true;
                break;
            } else if (target.name === 'LampHitbox' || target.name === 'Lamp') {
                this.toggleLamp();
                found = true;
                break;
            } else if (target.name === 'DoorPivot' || target.name === 'DoorModel' || target.name === 'DoorHitbox' || target.name === 'DoorBlocker') {
                this.toggleDoor();
                found = true;
                break;
            }

            target = target.parent;
        }

        if (!found) {
            console.log("No interactive object found in hierarchy.");
        }
    }

    ringDoorbell() {
        this.onRingDoorbell();
        this.uiContainer.innerText = "*Ding Dong*";
        setTimeout(() => this.uiContainer.innerText = "", 1000);
    }

    animateDoor(door) {
        console.log("Door opening...");
        if (door.position.x === 0) {
            door.position.x = 1.5;
        } else {
            door.position.x = 0;
        }
    }

    showInfo(text) {
        this.uiContainer.innerText = text;
        if (this.infoTimeout) clearTimeout(this.infoTimeout);
        this.infoTimeout = setTimeout(() => {
            this.uiContainer.innerText = "";
        }, 3000);
    }

    toggleLamp() {
        const isOn = this.onToggleLamp();
        this.uiContainer.innerText = isOn ? "Lamp ON" : "Lamp OFF";
        setTimeout(() => this.uiContainer.innerText = "", 1000);
    }

    toggleDoor() {
        this.onToggleDoor();
        this.uiContainer.innerText = "Door";
        setTimeout(() => this.uiContainer.innerText = "", 1000);
    }
}
