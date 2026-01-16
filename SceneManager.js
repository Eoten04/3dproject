import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export class SceneManager {
    constructor(container) {
        this.clock = new THREE.Clock();
        this.loader = new GLTFLoader();
        this.door = null;
        this.doorOpen = false;
        this.doorAnimating = false;
        this.collidables = [];

        this.listener = new THREE.AudioListener();
        this.audioLoader = new THREE.AudioLoader();

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB);
        this.scene.fog = new THREE.Fog(0x87CEEB, 10, 50);

        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 1.6, 5);
        this.camera.add(this.listener);

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        container.appendChild(this.renderer.domElement);

        this.createLights();
        this.createPlaceholders();
    }

    createLights() {
        this.ambientLight = new THREE.AmbientLight(0x404040);
        this.scene.add(this.ambientLight);

        this.sunLight = new THREE.DirectionalLight(0xffffff, 1);
        this.sunLight.position.set(10, 20, 10);
        this.sunLight.castShadow = true;
        this.sunLight.shadow.mapSize.width = 2048;
        this.sunLight.shadow.mapSize.height = 2048;
        this.scene.add(this.sunLight);

        this.lanterns = [];
        const lanternLight = new THREE.PointLight(0xffaa00, 0, 10);
        lanternLight.position.set(2, 2, 2);
        this.scene.add(lanternLight);
        this.lanterns.push(lanternLight);
    }

    createPlaceholders() {
        const floorGeo = new THREE.PlaneGeometry(50, 50);
        const floorMat = new THREE.MeshStandardMaterial({
            color: 0x335533,
            roughness: 0.8,
            metalness: 0.1
        });
        const floor = new THREE.Mesh(floorGeo, floorMat);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        this.scene.add(floor);

        const houseGroup = new THREE.Group();
        houseGroup.position.set(0, 0, -10);
        houseGroup.name = "House";

        const wallMaterial = new THREE.MeshStandardMaterial({
            color: 0x8B4513,
            side: THREE.DoubleSide
        });

        const wallThickness = 0.2;
        const houseWidth = 7;
        const houseHeight = 5;
        const houseDepth = 7;

        const backWall = new THREE.Mesh(
            new THREE.PlaneGeometry(houseWidth, houseHeight),
            wallMaterial
        );
        backWall.position.set(0, houseHeight / 2, -houseDepth / 2);
        backWall.castShadow = true;
        backWall.receiveShadow = true;
        houseGroup.add(backWall);
        this.collidables.push(backWall);

        const leftWall = new THREE.Mesh(
            new THREE.PlaneGeometry(houseDepth, houseHeight),
            wallMaterial
        );
        leftWall.position.set(-houseWidth / 2, houseHeight / 2, 0);
        leftWall.rotation.y = Math.PI / 2;
        leftWall.castShadow = true;
        leftWall.receiveShadow = true;
        houseGroup.add(leftWall);
        this.collidables.push(leftWall);

        const rightWallGroup = new THREE.Group();
        rightWallGroup.position.set(houseWidth / 2, 0, 0);
        rightWallGroup.rotation.y = -Math.PI / 2;
        houseGroup.add(rightWallGroup);

        const windowWidth = 2;
        const windowHeight = 1.5;
        const windowBottom = 1.5;

        const rwBottom = new THREE.Mesh(
            new THREE.PlaneGeometry(houseDepth, windowBottom),
            wallMaterial
        );
        rwBottom.position.set(0, windowBottom / 2, 0);
        rwBottom.receiveShadow = true;
        rwBottom.castShadow = true;
        rightWallGroup.add(rwBottom);
        this.collidables.push(rwBottom);

        const topHeight = houseHeight - (windowBottom + windowHeight);
        const rwTop = new THREE.Mesh(
            new THREE.PlaneGeometry(houseDepth, topHeight),
            wallMaterial
        );
        rwTop.position.set(0, houseHeight - topHeight / 2, 0);
        rwTop.receiveShadow = true;
        rwTop.castShadow = true;
        rightWallGroup.add(rwTop);
        this.collidables.push(rwTop);

        const sideWidth = (houseDepth - windowWidth) / 2;
        const rwLeft = new THREE.Mesh(
            new THREE.PlaneGeometry(sideWidth, windowHeight),
            wallMaterial
        );
        rwLeft.position.set(-(windowWidth + sideWidth) / 2, windowBottom + windowHeight / 2, 0);
        rwLeft.receiveShadow = true;
        rwLeft.castShadow = true;
        rightWallGroup.add(rwLeft);
        this.collidables.push(rwLeft);

        const rwRight = new THREE.Mesh(
            new THREE.PlaneGeometry(sideWidth, windowHeight),
            wallMaterial
        );
        rwRight.position.set((windowWidth + sideWidth) / 2, windowBottom + windowHeight / 2, 0);
        rwRight.receiveShadow = true;
        rwRight.castShadow = true;
        rightWallGroup.add(rwRight);
        this.collidables.push(rwRight);

        const glassMaterial = new THREE.MeshStandardMaterial({
            color: 0x88ccff,
            transparent: true,
            opacity: 0.3,
            metalness: 0.9,
            roughness: 0.1,
            side: THREE.DoubleSide
        });
        const windowGlass = new THREE.Mesh(
            new THREE.PlaneGeometry(windowWidth, windowHeight),
            glassMaterial
        );
        windowGlass.position.set(0, windowBottom + windowHeight / 2, 0);
        rightWallGroup.add(windowGlass);

        const frameThickness = 0.1;
        const frameDepth = 0.2;
        const frameMaterial = new THREE.MeshStandardMaterial({ color: 0x4a3c31 });

        const frameTop = new THREE.Mesh(
            new THREE.BoxGeometry(windowWidth + frameThickness * 2, frameThickness, frameDepth),
            frameMaterial
        );
        frameTop.position.set(0, windowBottom + windowHeight + frameThickness / 2, 0);
        rightWallGroup.add(frameTop);

        const frameBot = new THREE.Mesh(
            new THREE.BoxGeometry(windowWidth + frameThickness * 2, frameThickness, frameDepth),
            frameMaterial
        );
        frameBot.position.set(0, windowBottom - frameThickness / 2, 0);
        rightWallGroup.add(frameBot);

        const frameLeft = new THREE.Mesh(
            new THREE.BoxGeometry(frameThickness, windowHeight, frameDepth),
            frameMaterial
        );
        frameLeft.position.set(-(windowWidth + frameThickness) / 2, windowBottom + windowHeight / 2, 0);
        rightWallGroup.add(frameLeft);

        const frameRight = new THREE.Mesh(
            new THREE.BoxGeometry(frameThickness, windowHeight, frameDepth),
            frameMaterial
        );
        frameRight.position.set((windowWidth + frameThickness) / 2, windowBottom + windowHeight / 2, 0);
        rightWallGroup.add(frameRight);

        const crossBarH = new THREE.Mesh(
            new THREE.BoxGeometry(windowWidth, frameThickness / 2, frameDepth / 2),
            frameMaterial
        );
        crossBarH.position.set(0, windowBottom + windowHeight / 2, 0);
        rightWallGroup.add(crossBarH);

        const crossBarV = new THREE.Mesh(
            new THREE.BoxGeometry(frameThickness / 2, windowHeight, frameDepth / 2),
            frameMaterial
        );
        crossBarV.position.set(0, windowBottom + windowHeight / 2, 0);
        rightWallGroup.add(crossBarV);

        const doorWidth = 1.5;
        const doorHeight = 2.8;

        const frontLeftWall = new THREE.Mesh(
            new THREE.PlaneGeometry((houseWidth - doorWidth) / 2, houseHeight),
            wallMaterial
        );
        frontLeftWall.position.set(-houseWidth / 2 + (houseWidth - doorWidth) / 4, houseHeight / 2, houseDepth / 2);
        frontLeftWall.rotation.y = Math.PI;
        frontLeftWall.castShadow = true;
        frontLeftWall.receiveShadow = true;
        houseGroup.add(frontLeftWall);
        this.collidables.push(frontLeftWall);

        const frontRightWall = new THREE.Mesh(
            new THREE.PlaneGeometry((houseWidth - doorWidth) / 2, houseHeight),
            wallMaterial
        );
        frontRightWall.position.set(houseWidth / 2 - (houseWidth - doorWidth) / 4, houseHeight / 2, houseDepth / 2);
        frontRightWall.rotation.y = Math.PI;
        frontRightWall.castShadow = true;
        frontRightWall.receiveShadow = true;
        houseGroup.add(frontRightWall);
        this.collidables.push(frontRightWall);

        const frontTopWall = new THREE.Mesh(
            new THREE.PlaneGeometry(doorWidth, houseHeight - doorHeight),
            wallMaterial
        );
        frontTopWall.position.set(0, houseHeight - (houseHeight - doorHeight) / 2, houseDepth / 2);
        frontTopWall.rotation.y = Math.PI;
        frontTopWall.castShadow = true;
        frontTopWall.receiveShadow = true;
        houseGroup.add(frontTopWall);
        this.collidables.push(frontTopWall);

        const roofGeometry = new THREE.ConeGeometry(houseWidth * 0.8, 2, 4);
        const roofMaterial = new THREE.MeshStandardMaterial({
            color: 0x654321,
            flatShading: true
        });
        const roof = new THREE.Mesh(roofGeometry, roofMaterial);
        roof.position.set(0, houseHeight + 1, 0);
        roof.rotation.y = Math.PI / 4;
        roof.castShadow = true;
        roof.receiveShadow = true;
        houseGroup.add(roof);

        this.scene.add(houseGroup);

        const parquetGeometry = new THREE.PlaneGeometry(7, 7);

        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        const plankWidth = 64;
        const plankHeight = 256;
        const colors = ['#8B4513', '#A0522D', '#CD853F', '#DEB887'];

        for (let y = 0; y < canvas.height; y += plankHeight) {
            for (let x = 0; x < canvas.width; x += plankWidth) {
                ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
                ctx.fillRect(x, y, plankWidth, plankHeight);
                ctx.strokeStyle = '#654321';
                ctx.lineWidth = 2;
                ctx.strokeRect(x, y, plankWidth, plankHeight);
            }
        }

        const parquetTexture = new THREE.CanvasTexture(canvas);
        parquetTexture.wrapS = THREE.RepeatWrapping;
        parquetTexture.wrapT = THREE.RepeatWrapping;
        parquetTexture.repeat.set(2, 2);

        const parquetMaterial = new THREE.MeshStandardMaterial({
            map: parquetTexture,
            roughness: 0.7,
            metalness: 0.1
        });

        const parquetFloor = new THREE.Mesh(parquetGeometry, parquetMaterial);
        parquetFloor.rotation.x = -Math.PI / 2;
        parquetFloor.position.set(0, 0.01, -10);
        parquetFloor.receiveShadow = true;
        this.scene.add(parquetFloor);

        this.createDoorBlocker(1.5, 2.8, 7);

        this.loader.load('includes/door.glb', (gltf) => {
            const doorModel = gltf.scene;
            doorModel.name = "DoorModel";

            doorModel.scale.set(0.015, 0.015, 0.015);
            doorModel.rotation.y = Math.PI / 2;

            doorModel.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });

            this.doorPivot = new THREE.Group();
            this.doorPivot.position.set(doorWidth / 2, doorHeight / 2, -10 + houseDepth / 2);
            this.doorPivot.name = "DoorPivot";

            doorModel.position.set(-doorWidth / 2, 0, 0);

            this.doorPivot.add(doorModel);
            this.scene.add(this.doorPivot);

            this.door = this.doorPivot;

            this.doorSound = new THREE.Audio(this.listener);
            this.audioLoader.load('includes/sounds/door.wav', (buffer) => {
                this.doorSound.setBuffer(buffer);
                this.doorSound.setVolume(0.5);
            });

            const doorHitboxGeometry = new THREE.BoxGeometry(doorWidth, doorHeight, 0.3);
            const doorHitboxMaterial = new THREE.MeshBasicMaterial({
                color: 0x00ff00,
                wireframe: true,
                transparent: true,
                opacity: 0.5
            });
            this.doorHitbox = new THREE.Mesh(doorHitboxGeometry, doorHitboxMaterial);
            this.doorHitbox.position.set(0, doorHeight / 2, -10 + houseDepth / 2);
            this.doorHitbox.name = "DoorHitbox";
            this.doorHitbox.visible = false;
            this.scene.add(this.doorHitbox);
        });

        this.loader.load('includes/door_bell.glb', (gltf) => {
            this.doorbell = gltf.scene;
            this.doorbell.name = "Doorbell";

            this.doorbell.scale.set(0.5, 0.5, 0.5);
            this.doorbell.position.set(1.2, 1.5, 3.5);
            this.doorbell.rotation.y = 0;

            this.doorbell.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });

            const houseGroup = this.scene.getObjectByName("House");
            if (houseGroup) {
                houseGroup.add(this.doorbell);
            } else {
                this.scene.add(this.doorbell);
            }

            const dbHitboxGeo = new THREE.BoxGeometry(0.5, 0.5, 0.2);
            const dbHitboxMat = new THREE.MeshBasicMaterial({
                color: 0x00ff00,
                wireframe: true,
                transparent: true,
                opacity: 0,
                visible: true
            });
            this.doorbellHitbox = new THREE.Mesh(dbHitboxGeo, dbHitboxMat);
            this.doorbellHitbox.position.copy(this.doorbell.position);
            this.doorbellHitbox.name = "DoorbellHitbox";

            if (houseGroup) {
                houseGroup.add(this.doorbellHitbox);
            } else {
                this.scene.add(this.doorbellHitbox);
            }

            this.doorbellSound = new THREE.Audio(this.listener);
            this.audioLoader.load('includes/sounds/doorbell.wav', (buffer) => {
                this.doorbellSound.setBuffer(buffer);
            });
        });

        this.loader.load('includes/table.glb', (gltf) => {
            this.table = gltf.scene;
            this.table.name = "Table";

            this.table.position.set(-2.5, 0, -12);
            this.table.scale.set(0.35, 0.35, 0.35);

            this.table.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });

            this.scene.add(this.table);

            this.table.traverse((child) => {
                if (child.isMesh) {
                    this.collidables.push(child);
                }
            });

            this.loader.load('includes/lamp.glb', (gltf) => {
                this.lamp = gltf.scene;
                this.lamp.name = "Lamp";

                this.lamp.position.set(-2.5, 1.15, -12);
                this.lamp.scale.set(2, 2, 2);

                this.lamp.traverse((child) => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });

                this.lampLight = new THREE.PointLight(0xffaa44, 0, 12, 2);
                this.lampLight.position.set(this.lamp.position.x, this.lamp.position.y + 1, this.lamp.position.z);
                this.lampLight.castShadow = true;
                this.lampLight.shadow.mapSize.width = 1024;
                this.lampLight.shadow.mapSize.height = 1024;
                this.lampLight.shadow.camera.near = 0.1;
                this.lampLight.shadow.camera.far = 4;
                this.lampLight.shadow.bias = -0.001;
                this.lampIsOn = false;
                this.scene.add(this.lampLight);

                const hitboxGeometry = new THREE.BoxGeometry(1, 1.5, 1);
                const hitboxMaterial = new THREE.MeshBasicMaterial({
                    color: 0x00ff00,
                    wireframe: true,
                    transparent: true,
                    opacity: 0.5
                });
                this.lampHitbox = new THREE.Mesh(hitboxGeometry, hitboxMaterial);
                this.lampHitbox.position.copy(this.lamp.position);
                this.lampHitbox.position.y += 0.5;
                this.lampHitbox.name = "LampHitbox";
                this.lampHitbox.visible = false;
                this.scene.add(this.lampHitbox);

                this.lampSound = new THREE.Audio(this.listener);
                this.audioLoader.load('includes/sounds/lamp.wav', (buffer) => {
                    this.lampSound.setBuffer(buffer);
                    this.lampSound.setVolume(0.5);
                });

                this.scene.add(this.lamp);
            });
        });

    }

    createDoorBlocker(width, height, houseDepth) {
        const blockerGeo = new THREE.BoxGeometry(width, height, 0.5);
        const blockerMat = new THREE.MeshBasicMaterial({ visible: false, wireframe: true });
        this.doorBlocker = new THREE.Mesh(blockerGeo, blockerMat);
        this.doorBlocker.position.set(0, height / 2, -10 + houseDepth / 2);
        this.doorBlocker.name = "DoorBlocker";
        this.scene.add(this.doorBlocker);
        this.collidables.push(this.doorBlocker);
    }

    getCollidables() {
        return this.collidables;
    }

    toggleDoor() {
        if (!this.door || this.doorAnimating) return;

        this.doorAnimating = true;
        this.doorOpen = !this.doorOpen;

        const targetRotation = this.doorOpen ? -Math.PI / 2 : 0;
        const startRotation = this.door.rotation.y;
        const duration = 0.25;
        let elapsed = 0;

        if (this.doorSound && this.doorSound.buffer) {
            if (this.doorSound.isPlaying) {
                this.doorSound.stop();
            }
            this.doorSound.play();
        }

        const animate = () => {
            elapsed += this.clock.getDelta();
            const progress = Math.min(elapsed / duration, 1);

            const eased = progress < 0.5
                ? 2 * progress * progress
                : 1 - Math.pow(-2 * progress + 2, 2) / 2;

            this.door.rotation.y = startRotation + (targetRotation - startRotation) * eased;

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.doorAnimating = false;

                if (this.doorOpen) {
                    const index = this.collidables.indexOf(this.doorBlocker);
                    if (index > -1) {
                        this.collidables.splice(index, 1);
                    }
                } else {
                    if (!this.collidables.includes(this.doorBlocker)) {
                        this.collidables.push(this.doorBlocker);
                    }
                }
            }
        };

        animate();
    }

    update(deltaTime) {
    }

    toggleLamp() {
        if (!this.lampLight) return;

        this.lampIsOn = !this.lampIsOn;
        this.lampLight.intensity = this.lampIsOn ? 4 : 0;

        if (this.lampSound && this.lampSound.buffer) {
            if (this.lampSound.isPlaying) {
                this.lampSound.stop();
            }
            this.lampSound.play();
        }

        return this.lampIsOn;
    }

    ringDoorbell() {
        if (this.doorbellSound && this.doorbellSound.buffer) {
            if (this.doorbellSound.isPlaying) {
                this.doorbellSound.stop();
            }
            this.doorbellSound.play();
        }
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    toggleDayNight(isNight) {
        if (isNight) {
            this.scene.background = new THREE.Color(0x111122);
            this.scene.fog.color.set(0x111122);
            this.sunLight.intensity = 0;
            this.lanterns.forEach(l => l.intensity = 1);
        } else {
            this.scene.background = new THREE.Color(0x87CEEB);
            this.scene.fog.color.set(0x87CEEB);
            this.sunLight.intensity = 1;
            this.lanterns.forEach(l => l.intensity = 0);
        }
    }
}
