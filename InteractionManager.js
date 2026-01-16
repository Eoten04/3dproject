import * as THREE from 'three';

export class InteractionManager {
    constructor(camera, scene, uiContainer) {
        this.camera = camera;
        this.scene = scene;
        this.uiContainer = uiContainer;
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        this.center = new THREE.Vector2(0, 0);

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
        while (target.parent && target.parent !== this.scene) {
            if (target.name) break;
            target = target.parent;
        }

        console.log("Clicked:", target.name);

        if (target.name === 'Gong') {
            this.playGongSound();
        } else if (target.name === 'Shoji') {
            this.animateDoor(target);
        } else if (target.name === 'Statue') {
            this.showInfo(target.userData.info);
        }
    }

    playGongSound() {
        console.log("BONG! (Gong sound played)");
        this.uiContainer.innerText = "BONG!";
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
}
