import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export class SceneManager {
    constructor(container) {
        this.clock = new THREE.Clock();
        this.loader = new GLTFLoader();
        this.door = null;
        this.doorOpen = false;
        this.doorAnimating = false;
        this.collidables = []; // Array to store objects that block movement

        // Audio setup
        this.listener = new THREE.AudioListener();
        this.audioLoader = new THREE.AudioLoader();

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB);
        this.scene.fog = new THREE.Fog(0x87CEEB, 10, 50);

        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 1.6, 5);
        this.camera.add(this.listener); // Add audio listener to camera

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

        // Create a house with hollow walls and a roof
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

        // Back wall (full)
        const backWall = new THREE.Mesh(
            new THREE.PlaneGeometry(houseWidth, houseHeight),
            wallMaterial
        );
        backWall.position.set(0, houseHeight / 2, -houseDepth / 2);
        backWall.castShadow = true;
        backWall.receiveShadow = true;
        houseGroup.add(backWall);
        this.collidables.push(backWall);

        // Left wall (full)
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

        // Right wall with window
        const rightWallGroup = new THREE.Group();
        rightWallGroup.position.set(houseWidth / 2, 0, 0);
        rightWallGroup.rotation.y = -Math.PI / 2;
        houseGroup.add(rightWallGroup);

        const windowWidth = 2;
        const windowHeight = 1.5;
        const windowBottom = 1.5;

        // Bottom part
        const rwBottom = new THREE.Mesh(
            new THREE.PlaneGeometry(houseDepth, windowBottom),
            wallMaterial
        );
        rwBottom.position.set(0, windowBottom / 2, 0);
        rwBottom.receiveShadow = true;
        rwBottom.castShadow = true;
        rightWallGroup.add(rwBottom);
        this.collidables.push(rwBottom);

        // Top part
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

        // Left side part
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

        // Right side part
        const rwRight = new THREE.Mesh(
            new THREE.PlaneGeometry(sideWidth, windowHeight),
            wallMaterial
        );
        rwRight.position.set((windowWidth + sideWidth) / 2, windowBottom + windowHeight / 2, 0);
        rwRight.receiveShadow = true;
        rwRight.castShadow = true;
        rightWallGroup.add(rwRight);
        this.collidables.push(rwRight);

        // Window Glass
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

        // Window Frame (Horizontal Top)
        const frameThickness = 0.1;
        const frameDepth = 0.2;
        const frameMaterial = new THREE.MeshStandardMaterial({ color: 0x4a3c31 }); // Darker wood

        const frameTop = new THREE.Mesh(
            new THREE.BoxGeometry(windowWidth + frameThickness * 2, frameThickness, frameDepth),
            frameMaterial
        );
        frameTop.position.set(0, windowBottom + windowHeight + frameThickness / 2, 0);
        rightWallGroup.add(frameTop);

        // Window Frame (Horizontal Bottom)
        const frameBot = new THREE.Mesh(
            new THREE.BoxGeometry(windowWidth + frameThickness * 2, frameThickness, frameDepth),
            frameMaterial
        );
        frameBot.position.set(0, windowBottom - frameThickness / 2, 0);
        rightWallGroup.add(frameBot);

        // Window Frame (Vertical Left)
        const frameLeft = new THREE.Mesh(
            new THREE.BoxGeometry(frameThickness, windowHeight, frameDepth),
            frameMaterial
        );
        frameLeft.position.set(-(windowWidth + frameThickness) / 2, windowBottom + windowHeight / 2, 0);
        rightWallGroup.add(frameLeft);

        // Window Frame (Vertical Right)
        const frameRight = new THREE.Mesh(
            new THREE.BoxGeometry(frameThickness, windowHeight, frameDepth),
            frameMaterial
        );
        frameRight.position.set((windowWidth + frameThickness) / 2, windowBottom + windowHeight / 2, 0);
        rightWallGroup.add(frameRight);

        // Window Cross Bars (Optional - simple cross)
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

        // Front wall with door entrance (split into parts)
        const doorWidth = 1.5;
        const doorHeight = 2.8;

        // Left part of front wall
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

        // Right part of front wall
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

        // Top part of front wall (above door)
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

        // Create a pyramid roof
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

        // Create parquet floor inside the house (7x7m)
        const parquetGeometry = new THREE.PlaneGeometry(7, 7);

        // Create a canvas texture for the parquet
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        // Draw parquet pattern
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
        parquetFloor.position.set(0, 0.01, -10); // Slightly above ground, centered in house
        parquetFloor.receiveShadow = true;
        this.scene.add(parquetFloor);

        this.createDoorBlocker(1.5, 2.8, 7);

        // Load door GLB model
        this.loader.load('includes/door.glb', (gltf) => {
            const doorModel = gltf.scene;
            doorModel.name = "DoorModel";

            // Scale the door
            doorModel.scale.set(0.015, 0.015, 0.015);
            // Rotate to face outward
            doorModel.rotation.y = Math.PI / 2;

            // Enable shadows
            doorModel.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });

            // Create a pivot group for hinge rotation on the side
            this.doorPivot = new THREE.Group();
            this.doorPivot.position.set(doorWidth / 2, doorHeight / 2, -10 + houseDepth / 2);
            this.doorPivot.name = "DoorPivot";

            // Offset the door model so pivot is on the right edge (hinge side)
            doorModel.position.set(-doorWidth / 2, 0, 0);

            this.doorPivot.add(doorModel);
            this.scene.add(this.doorPivot);

            this.door = this.doorPivot; // Reference for animation

            // Load door opening sound
            this.doorSound = new THREE.Audio(this.listener);
            this.audioLoader.load('includes/sounds/door.wav', (buffer) => {
                this.doorSound.setBuffer(buffer);
                this.doorSound.setVolume(0.5);
            });

            // Add invisible hitbox for door
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
            this.doorHitbox.visible = false; // Make hitbox invisible
            this.scene.add(this.doorHitbox);
        });

        // Doorbell Setup
        this.loader.load('includes/door_bell.glb', (gltf) => {
            this.doorbell = gltf.scene;
            this.doorbell.name = "Doorbell";

            // Scale and Position
            this.doorbell.scale.set(0.5, 0.5, 0.5);
            // Position on the front wall (Local to HouseGroup)
            // Front wall is at z = houseDepth / 2 (3.5)
            // We put it slightly in front: 3.5 + 0.2 = 3.7
            this.doorbell.position.set(1.2, 1.5, 3.5);
            this.doorbell.rotation.y = 0; // Face outward

            // Enable shadows
            this.doorbell.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });

            // Add to houseGroup instead of scene to stick to the house
            const houseGroup = this.scene.getObjectByName("House");
            if (houseGroup) {
                houseGroup.add(this.doorbell);
            } else {
                this.scene.add(this.doorbell);
            }

            // Doorbell Hitbox (Consistent with Door/Lamp style)
            const dbHitboxGeo = new THREE.BoxGeometry(0.5, 0.5, 0.2);
            const dbHitboxMat = new THREE.MeshBasicMaterial({
                color: 0x00ff00,
                wireframe: true,
                transparent: true,
                opacity: 0, // Fully transparent but renderable
                visible: true // Ensure raycaster hits it
            });
            this.doorbellHitbox = new THREE.Mesh(dbHitboxGeo, dbHitboxMat);
            this.doorbellHitbox.position.copy(this.doorbell.position);
            this.doorbellHitbox.name = "DoorbellHitbox";

            if (houseGroup) {
                houseGroup.add(this.doorbellHitbox);
            } else {
                this.scene.add(this.doorbellHitbox);
            }

            // Doorbell Sound
            this.doorbellSound = new THREE.Audio(this.listener);
            this.audioLoader.load('includes/sounds/doorbell.wav', (buffer) => {
                this.doorbellSound.setBuffer(buffer);
            });
        });



        // Load table GLB model inside the house
        this.loader.load('includes/table.glb', (gltf) => {
            this.table = gltf.scene;
            this.table.name = "Table";

            // Position table inside the house (corner position)
            this.table.position.set(-2.5, 0, -12);
            this.table.scale.set(0.35, 0.35, 0.35);

            // Enable shadows
            this.table.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });

            this.scene.add(this.table);

            // Add table to collidables
            this.table.traverse((child) => {
                if (child.isMesh) {
                    this.collidables.push(child);
                }
            });

            // Load lamp GLB model on the table
            this.loader.load('includes/lamp.glb', (gltf) => {
                this.lamp = gltf.scene;
                this.lamp.name = "Lamp";

                // Position lamp on top of the table (same x,z as table, higher y)
                this.lamp.position.set(-2.5, 1.15, -12);
                this.lamp.scale.set(2, 2, 2);

                // Enable shadows
                this.lamp.traverse((child) => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });

                // Add a point light to the lamp (initially off) with optimized shadows
                this.lampLight = new THREE.PointLight(0xffaa44, 0, 12, 2);
                this.lampLight.position.set(this.lamp.position.x, this.lamp.position.y + 1, this.lamp.position.z);
                // Enable shadows with optimized settings for table area
                this.lampLight.castShadow = true;
                this.lampLight.shadow.mapSize.width = 1024;
                this.lampLight.shadow.mapSize.height = 1024;
                // Limit shadow range to focus on table area
                this.lampLight.shadow.camera.near = 0.1;
                this.lampLight.shadow.camera.far = 4; // Short range to avoid wall artifacts
                this.lampLight.shadow.bias = -0.001; // Reduce shadow acne
                this.lampIsOn = false;
                this.scene.add(this.lampLight);

                // Add an invisible hitbox for click detection
                const hitboxGeometry = new THREE.BoxGeometry(1, 1.5, 1);
                const hitboxMaterial = new THREE.MeshBasicMaterial({
                    color: 0x00ff00,
                    wireframe: true,
                    transparent: true,
                    opacity: 0.5
                });
                this.lampHitbox = new THREE.Mesh(hitboxGeometry, hitboxMaterial);
                this.lampHitbox.position.copy(this.lamp.position);
                this.lampHitbox.position.y += 0.5; // Center the hitbox vertically
                this.lampHitbox.name = "LampHitbox";
                this.lampHitbox.visible = false; // Make hitbox invisible
                this.scene.add(this.lampHitbox);

                // Load lamp click sound
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
        // Create invisible blocker for the door
        const blockerGeo = new THREE.BoxGeometry(width, height, 0.5);
        const blockerMat = new THREE.MeshBasicMaterial({ visible: false, wireframe: true });
        this.doorBlocker = new THREE.Mesh(blockerGeo, blockerMat);
        // Position in the doorway
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
        const duration = 0.5; // 1 second animation
        let elapsed = 0;

        // Play door sound
        if (this.doorSound && this.doorSound.buffer) {
            if (this.doorSound.isPlaying) {
                this.doorSound.stop();
            }
            this.doorSound.play();
        }

        const animate = () => {
            elapsed += this.clock.getDelta();
            const progress = Math.min(elapsed / duration, 1);

            // Ease in-out interpolation
            const eased = progress < 0.5
                ? 2 * progress * progress
                : 1 - Math.pow(-2 * progress + 2, 2) / 2;

            this.door.rotation.y = startRotation + (targetRotation - startRotation) * eased;

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.doorAnimating = false;

                // Update collision state after animation
                if (this.doorOpen) {
                    // Remove blocker
                    const index = this.collidables.indexOf(this.doorBlocker);
                    if (index > -1) {
                        this.collidables.splice(index, 1);
                    }
                } else {
                    // Add blocker if not present
                    if (!this.collidables.includes(this.doorBlocker)) {
                        this.collidables.push(this.doorBlocker);
                    }
                }
            }
        };

        animate();
    }

    update(deltaTime) {
        // Update logic if needed
    }

    toggleLamp() {
        if (!this.lampLight) return;

        this.lampIsOn = !this.lampIsOn;
        this.lampLight.intensity = this.lampIsOn ? 4 : 0; // Stronger light intensity

        // Play lamp click sound
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
