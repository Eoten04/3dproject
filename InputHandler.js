import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';

export class InputHandler {
    constructor(camera, domElement, sceneManager) {
        this.camera = camera;
        this.sceneManager = sceneManager;
        this.controls = new PointerLockControls(camera, domElement);
        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;
        this.velocity = new THREE.Vector3();
        this.direction = new THREE.Vector3();
        this.isLocked = false;
        this.speed = 250.0;

        this.onLock = () => { };
        this.onUnlock = () => { };
        this.onToggleDayNight = () => { };

        this.init();
    }

    init() {
        const onKeyDown = (event) => {
            switch (event.code) {
                case 'ArrowUp':
                case 'KeyW':
                case 'KeyZ':
                    this.moveForward = true;
                    break;
                case 'ArrowLeft':
                case 'KeyA':
                case 'KeyQ':
                    this.moveLeft = true;
                    break;
                case 'ArrowDown':
                case 'KeyS':
                    this.moveBackward = true;
                    break;
                case 'ArrowRight':
                case 'KeyD':
                    this.moveRight = true;
                    break;
                case 'KeyN':
                    this.onToggleDayNight();
                    break;
            }
        };

        const onKeyUp = (event) => {
            switch (event.code) {
                case 'ArrowUp':
                case 'KeyW':
                case 'KeyZ':
                    this.moveForward = false;
                    break;
                case 'ArrowLeft':
                case 'KeyA':
                case 'KeyQ':
                    this.moveLeft = false;
                    break;
                case 'ArrowDown':
                case 'KeyS':
                    this.moveBackward = false;
                    break;
                case 'ArrowRight':
                case 'KeyD':
                    this.moveRight = false;
                    break;
            }
        };

        document.addEventListener('keydown', onKeyDown);
        document.addEventListener('keyup', onKeyUp);

        this.controls.addEventListener('lock', () => {
            this.isLocked = true;
            this.onLock();
        });

        this.controls.addEventListener('unlock', () => {
            this.isLocked = false;
            this.onUnlock();
        });
    }

    lock() {
        this.controls.lock();
    }

    update(delta) {
        if (this.controls.isLocked === true) {
            const safeDelta = Math.min(delta, 0.1);

            this.velocity.x -= this.velocity.x * 10.0 * safeDelta;
            this.velocity.z -= this.velocity.z * 10.0 * safeDelta;

            this.direction.z = Number(this.moveForward) - Number(this.moveBackward);
            this.direction.x = Number(this.moveRight) - Number(this.moveLeft);
            this.direction.normalize();

            if (this.moveForward || this.moveBackward) this.velocity.z -= this.direction.z * this.speed * safeDelta;
            if (this.moveLeft || this.moveRight) this.velocity.x -= this.direction.x * this.speed * safeDelta;

            const camera = this.camera;

            const forward = new THREE.Vector3();
            camera.getWorldDirection(forward);

            forward.y = 0;
            if (forward.lengthSq() < 0.001) {
                forward.set(0, 0, -1);
                forward.applyAxisAngle(new THREE.Vector3(0, 1, 0), camera.rotation.y);
            }
            forward.normalize();

            const right = new THREE.Vector3();
            right.crossVectors(forward, camera.up);
            if (right.lengthSq() < 0.001) {
                right.set(1, 0, 0);
            }
            right.normalize();

            const moveVector = new THREE.Vector3();
            moveVector.addScaledVector(forward, -this.velocity.z * safeDelta);
            moveVector.addScaledVector(right, -this.velocity.x * safeDelta);

            if (!isNaN(moveVector.x) && !isNaN(moveVector.y) && !isNaN(moveVector.z)) {

                const nextPosition = this.camera.position.clone().add(moveVector);
                const playerBox = new THREE.Box3();
                const playerSize = 0.5;
                playerBox.setFromCenterAndSize(nextPosition, new THREE.Vector3(playerSize, playerSize, playerSize));

                let collision = false;
                if (this.sceneManager && this.sceneManager.getCollidables) {
                    const collidables = this.sceneManager.getCollidables();

                    const objectBox = new THREE.Box3();

                    for (const object of collidables) {
                        objectBox.setFromObject(object);
                        if (playerBox.intersectsBox(objectBox)) {
                            collision = true;
                            break;
                        }
                    }
                }

                if (!collision) {
                    this.camera.position.add(moveVector);
                }

            } else {
                console.error("InputHandler: moveVector NaN", moveVector);
                this.velocity.set(0, 0, 0);
            }
        }
    }
}
