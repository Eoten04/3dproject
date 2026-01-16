import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export class SceneManager {
    constructor(container) {
        this.clock = new THREE.Clock();
        this.loader = new GLTFLoader();
        this.door = null;
        this.doorOpen = false;
        this.doorAnimating = false;

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB);
        this.scene.fog = new THREE.Fog(0x87CEEB, 10, 50);

        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 1.6, 5);

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

        // Right wall (full)
        const rightWall = new THREE.Mesh(
            new THREE.PlaneGeometry(houseDepth, houseHeight),
            wallMaterial
        );
        rightWall.position.set(houseWidth / 2, houseHeight / 2, 0);
        rightWall.rotation.y = -Math.PI / 2;
        rightWall.castShadow = true;
        rightWall.receiveShadow = true;
        houseGroup.add(rightWall);

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

        // Load door GLB model
        this.loader.load('door.glb', (gltf) => {
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
        });

        const gongGeo = new THREE.CylinderGeometry(1, 1, 0.2, 32);
        const gongMat = new THREE.MeshStandardMaterial({ color: 0xD4AF37, metalness: 0.8, roughness: 0.2 });
        const gong = new THREE.Mesh(gongGeo, gongMat);
        gong.rotation.x = Math.PI / 2;
        gong.position.set(5, 1.5, -5);
        gong.name = "Gong";
        this.scene.add(gong);

        const statueGeo = new THREE.SphereGeometry(0.5, 32, 32);
        const statueMat = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.4 });
        const statue = new THREE.Mesh(statueGeo, statueMat);
        statue.position.set(-5, 0.5, -5);
        statue.name = "Statue";
        statue.userData = { info: "Ancient Buddha Statue: Symbol of peace." };
        this.scene.add(statue);

    }

    toggleDoor() {
        if (!this.door || this.doorAnimating) return;

        this.doorAnimating = true;
        this.doorOpen = !this.doorOpen;

        const targetRotation = this.doorOpen ? -Math.PI / 2 : 0;
        const startRotation = this.door.rotation.y;
        const duration = 0.5; // 0.5 seconds for faster animation
        let elapsed = 0;

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
            }
        };

        animate();
    }

    update(deltaTime) {
        // Update logic if needed
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
