import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';

export class InputHandler {
    constructor(camera, domElement) {
        this.camera = camera;
        this.controls = new PointerLockControls(camera, domElement);
        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;
        this.velocity = new THREE.Vector3();
        this.direction = new THREE.Vector3();
        this.isLocked = false;
        this.speed = 250.0; // Configurable movement speed

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
            // Safety check for delta
            const safeDelta = Math.min(delta, 0.1); // Cap delta at 0.1s to prevent explosions

            // Deceleration (damping)
            this.velocity.x -= this.velocity.x * 10.0 * safeDelta;
            this.velocity.z -= this.velocity.z * 10.0 * safeDelta;

            // Input direction calculation
            this.direction.z = Number(this.moveForward) - Number(this.moveBackward);
            this.direction.x = Number(this.moveRight) - Number(this.moveLeft);
            this.direction.normalize();

            // Acceleration (using configurable speed)
            if (this.moveForward || this.moveBackward) this.velocity.z -= this.direction.z * this.speed * safeDelta;
            if (this.moveLeft || this.moveRight) this.velocity.x -= this.direction.x * this.speed * safeDelta;

            // Manual Movement Implementation
            const camera = this.camera;

            // Forward/Backward Movement (XZ plane only)
            const forward = new THREE.Vector3();
            camera.getWorldDirection(forward);

            // Robust Flattening
            forward.y = 0;
            if (forward.lengthSq() < 0.001) {
                // If looking straight up/down, forward projects to 0
                // Use default forward (0,0,-1) rotated by camera Y? 
                // Simplest fallback: just don't move forward/backward if strictly vertical looking, 
                // OR assume camera rotation y is valid.
                // Re-calculating forward from camera rotation directly might be safer:
                // But generally, just preventing normalize(0) is enough.
                forward.set(0, 0, -1);
                forward.applyAxisAngle(new THREE.Vector3(0, 1, 0), camera.rotation.y);
            }
            forward.normalize();

            // Right/Left Movement (XZ plane only)
            const right = new THREE.Vector3();
            right.crossVectors(forward, camera.up);
            if (right.lengthSq() < 0.001) {
                right.set(1, 0, 0); // Fallback
            }
            right.normalize();

            const moveVector = new THREE.Vector3();
            moveVector.addScaledVector(forward, -this.velocity.z * safeDelta);
            moveVector.addScaledVector(right, -this.velocity.x * safeDelta);

            // Check for NaN
            if (!isNaN(moveVector.x) && !isNaN(moveVector.y) && !isNaN(moveVector.z)) {
                camera.position.add(moveVector);
            } else {
                console.error("InputHandler: moveVector NaN", moveVector);
                // Reset velocity to recover
                this.velocity.set(0, 0, 0);
            }
        }
    }
}
