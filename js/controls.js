import * as THREE from "three";
import { PointerLockControls } from "three/addons/controls/PointerLockControls.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { changeAnimation } from "./player.js";

// Movement constants
const SPEED = 0.08;
const GRAVITY = 0.02; // Doubled gravity
const JUMP_FORCE = 0.35; // Increased jump force to match new gravity
const MOBILE_SPEED_MULTIPLIER = 1.2; // Slightly increased mobile speed

export class PlayerControls {
  constructor(scene, room, options = {}) {
    // Add jump sound initialization
    this.jumpSound = new Audio('assets/audio/jumpsfx.wav');
    this.jumpSound.volume = 0.3; // Set to 30% volume
    
    this.scene = scene;
    this.room = room;
    this.camera = options.camera || new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = options.renderer;
    this.domElement = this.renderer ? this.renderer.domElement : document.body;
    this.playerModel = options.playerModel;
    this.lastPosition = new THREE.Vector3();
    this.isMoving = false;
    this.isRunning = false;
    this.moveSpeed = 0;
    
    // Player state
    this.velocity = new THREE.Vector3();
    this.canJump = true;
    this.keysPressed = new Set();
    this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Mobile control variables
    this.joystick = null;
    this.touchStartX = 0;
    this.touchStartY = 0;
    this.touchSensitivity = 0.005;
    this.moveVector = { x: 0, z: 0 };
    this.jumpButtonPressed = false;
    this.moveForward = 0;
    this.moveRight = 0;
    
    // Initial player position
    const initialPos = options.initialPosition || {};
    this.playerX = initialPos.x || (Math.random() * 10) - 5;
    this.playerY = initialPos.y || 0.5;
    this.playerZ = initialPos.z || (Math.random() * 10) - 5;
    
    // Set initial player model position if it exists
    if (this.playerModel) {
      this.playerModel.position.set(this.playerX, this.playerY, this.playerZ);
      this.lastPosition.set(this.playerX, this.playerY, this.playerZ);
    }
    
    // Set camera to third-person perspective
    this.camera.position.set(this.playerX, this.playerY + 2, this.playerZ + 5);
    this.camera.lookAt(this.playerX, this.playerY + 1, this.playerZ);
    // Store the initial camera offset (relative to player's target position)
    this.cameraOffset = new THREE.Vector3();
    this.cameraOffset.copy(this.camera.position).sub(new THREE.Vector3(this.playerX, this.playerY + 1, this.playerZ));
    
    // Initialize controls based on device
    this.initializeControls();
    
    // Setup event listeners
    this.setupEventListeners();
    
    // If room is provided, initialize multiplayer presence
    if (this.room) {
      // Initialize player presence in the room
      this.room.updatePresence({
        x: this.playerX,
        y: this.playerY,
        z: this.playerZ,
        rotation: 0,
        moving: false
      });
    }
    
    this.enabled = true; // Add enabled flag for chat input
  }
  
  initializeControls() {
    if (this.isMobile) {
      this.initializeMobileControls();
    } else {
      this.initializeDesktopControls();
    }
  }
  
  initializeDesktopControls() {
    // Use OrbitControls for third-person view
    this.controls = new OrbitControls(this.camera, this.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.1;
    this.controls.maxPolarAngle = Math.PI * 0.9; // Prevent going below ground
    this.controls.minDistance = 3; // Minimum zoom distance
    this.controls.maxDistance = 10; // Maximum zoom distance
    
    // Increase sensitivity for Safari
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    if (isSafari) {
      this.controls.rotateSpeed = 2.0; // Double sensitivity for Safari
    }
    
    // Add instructions for desktop
    const instructionsDiv = document.createElement("div");
    instructionsDiv.className = "instructions";
    instructionsDiv.innerHTML = "Click to begin. <br>Use WASD to move, Space to jump.";
    document.getElementById('game-container').appendChild(instructionsDiv);
    
    // Hide instructions on first click
    document.addEventListener('click', () => {
      if (document.querySelector(".instructions")) {
        document.querySelector(".instructions").style.display = 'none';
      }
    }, { once: true });
    
    // Update camera offset when controls change
    this.controls.addEventListener('change', () => {
      this.cameraOffset.copy(this.camera.position).sub(this.controls.target);
    });
  }
  
  initializeMobileControls() {
    // Setup camera position first with safe values
    this.camera.position.set(this.playerX, this.playerY + 2, this.playerZ + 5);
    this.camera.lookAt(this.playerX, this.playerY + 1, this.playerZ);
    
    // Initialize OrbitControls for camera rotation (similar to desktop)
    this.controls = new OrbitControls(this.camera, this.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.1;
    this.controls.maxPolarAngle = Math.PI * 0.9; // Prevent going below ground
    this.controls.minDistance = 3; // Minimum zoom distance
    this.controls.maxDistance = 10; // Maximum zoom distance
    
    // Store the initial camera offset for mobile too
    this.cameraOffset = new THREE.Vector3();
    this.cameraOffset.copy(this.camera.position).sub(new THREE.Vector3(this.playerX, this.playerY + 1, this.playerZ));
    
    // Update camera offset when controls change
    this.controls.addEventListener('change', () => {
      this.cameraOffset.copy(this.camera.position).sub(this.controls.target);
    });
    
    // Add joystick container for mobile
    const joystickContainer = document.getElementById('joystick-container');
    if (!joystickContainer) {
      const newJoystickContainer = document.createElement('div');
      newJoystickContainer.id = 'joystick-container';
      document.body.appendChild(newJoystickContainer);
    }
    
    // Add jump button for mobile
    const jumpButton = document.getElementById('jump-button');
    if (!jumpButton) {
      const newJumpButton = document.createElement('div');
      newJumpButton.id = 'jump-button';
      newJumpButton.innerText = 'JUMP';
      document.body.appendChild(newJumpButton);
    }
    
    // Jump button event listeners with sound
    document.getElementById('jump-button').addEventListener('touchstart', (event) => {
      this.jumpButtonPressed = true;
      if (this.canJump) {
        this.velocity.y = JUMP_FORCE;
        this.canJump = false;
        this.jumpSound.currentTime = 0; // Reset sound to start
        this.jumpSound.play();
      }
      event.preventDefault();
    });
    
    document.getElementById('jump-button').addEventListener('touchend', (event) => {
      this.jumpButtonPressed = false;
      event.preventDefault();
    });
    
    // Initialize joystick with improved behavior
    this.joystick = nipplejs.create({
      zone: document.getElementById('joystick-container'),
      mode: 'static',
      position: { left: '50%', top: '50%' },
      color: 'rgba(255, 255, 255, 0.5)',
      size: 120
    });
    
    // Joystick move event with better movement handling
    this.joystick.on('move', (evt, data) => {
      const force = Math.min(data.force, 1.0); // Normalize force between 0 and 1
      const angle = data.angle.radian;
      
      // Calculate movement values using the joystick - fixed direction mapping
      this.moveForward = Math.sin(angle) * force; 
      this.moveRight = Math.cos(angle) * force;
      
      this.moveForce = force;
    });
    
    // Joystick end event
    this.joystick.on('end', () => {
      console.log('Joystick released');
      this.moveForward = 0;
      this.moveRight = 0;
    });
  }
  
  setupEventListeners() {
    // Listen for key events (for desktop controls)
    document.addEventListener("keydown", (e) => {
      this.keysPressed.add(e.key.toLowerCase());
      
      // Handle jump with spacebar and play sound
      if (e.key === " " && this.canJump) {
        this.velocity.y = JUMP_FORCE;
        this.canJump = false;
        this.jumpSound.currentTime = 0; // Reset sound to start
        this.jumpSound.play();
      }
    });

    document.addEventListener("keyup", (e) => {
      this.keysPressed.delete(e.key.toLowerCase());
    });
    
    // Handle window resize
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      if (this.renderer) {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
      }
    });
  }
  
  processMovement() {
    // Skip movement processing if controls are disabled (e.g. when chat is open)
    if (!this.enabled) return;
    
    // Get current position
    let x = this.playerModel ? this.playerModel.position.x : this.camera.position.x;
    let y = this.playerModel ? this.playerModel.position.y : (this.camera.position.y - 1.2);
    let z = this.playerModel ? this.playerModel.position.z : this.camera.position.z;
    
    // Create movement vector
    const moveDirection = new THREE.Vector3(0, 0, 0);
    
    // Check for shift key (running)
    this.isRunning = this.keysPressed.has("shift");
    
    if (this.isMobile) {
      if (this.moveForward !== 0 || this.moveRight !== 0) {
        moveDirection.z = -this.moveForward;
        moveDirection.x = this.moveRight;
        this.moveSpeed = this.moveForce;
        this.isRunning = this.moveForce > 0.7; 
      } else {
        this.moveSpeed = 0;
        this.isRunning = false;
      }
    } else {
      if (this.keysPressed.has("w") || this.keysPressed.has("arrowup")) {
        moveDirection.z = 1; 
      } else if (this.keysPressed.has("s") || this.keysPressed.has("arrowdown")) {
        moveDirection.z = -1; 
      }
      
      if (this.keysPressed.has("a") || this.keysPressed.has("arrowleft")) {
        moveDirection.x = 1; 
      } else if (this.keysPressed.has("d") || this.keysPressed.has("arrowright")) {
        moveDirection.x = -1; 
      }
      
      this.moveSpeed = moveDirection.length();
    }
    
    if (!this.isMobile && moveDirection.length() > 0) {
      moveDirection.normalize();
    }
    
    const cameraDirection = new THREE.Vector3();
    this.camera.getWorldDirection(cameraDirection);
    cameraDirection.y = 0; 
    cameraDirection.normalize();
    
    const rightVector = new THREE.Vector3();
    rightVector.crossVectors(this.camera.up, cameraDirection).normalize();
    
    const movement = new THREE.Vector3();
    const speedMultiplier = this.isRunning ? 2.5 : 1.2;

    if (moveDirection.z !== 0) {
        movement.add(cameraDirection.clone().multiplyScalar(moveDirection.z));
    }
    if (moveDirection.x !== 0) {
        movement.add(rightVector.clone().multiplyScalar(moveDirection.x));
    }

    if (this.isMobile && movement.length() > 0) {
        movement.normalize().multiplyScalar(SPEED * this.moveSpeed * speedMultiplier);
    } else if (movement.length() > 0) {
        movement.normalize().multiplyScalar(SPEED * speedMultiplier);
    }
    
    this.velocity.y -= GRAVITY;
    
    let newX = x + movement.x;
    let newY = y + this.velocity.y;
    let newZ = z + movement.z;
    
    const blockMeshes = this.scene.children.filter(child => 
      child.userData.isBlock || child.userData.isBarrier || 
      (child.type === "Group" && child.userData.isTree));
    
    const playerRadius = 0.3;
    const playerHeight = 1.8;
    
    let standingOnBlock = false;
    blockMeshes.forEach(block => {
      if (block.type === "Group" && block.userData.isTree) {
        checkCollision.call(this, block, 1.0, 2.0, 1.0); 
      } else {
        checkCollision.call(this, block);
      }
    });
    
    function checkCollision(block, overrideWidth, overrideHeight, overrideDepth) {
      const blockSize = new THREE.Vector3();
      if (block.geometry) {
        const boundingBox = new THREE.Box3().setFromObject(block);
        boundingBox.getSize(blockSize);
      } else {
        blockSize.set(1, 1, 1);
      }
      
      const blockWidth = overrideWidth || blockSize.x;
      const blockHeight = overrideHeight || blockSize.y;
      const blockDepth = overrideDepth || blockSize.z;
      
      if (
        this.velocity.y <= 0 &&
        Math.abs(newX - block.position.x) < (blockWidth / 2 + playerRadius) &&
        Math.abs(newZ - block.position.z) < (blockDepth / 2 + playerRadius) &&
        Math.abs(y - (block.position.y + blockHeight / 2)) < 0.2 &&
        y >= block.position.y
      ) {
        standingOnBlock = true;
        newY = block.position.y + blockHeight / 2 + 0.01;
        this.velocity.y = 0;
        this.canJump = true;
      } else if (
        Math.abs(newX - block.position.x) < (blockWidth / 2 + playerRadius) &&
        Math.abs(newZ - block.position.z) < (blockDepth / 2 + playerRadius) &&
        newY < block.position.y + blockHeight / 2 &&
        newY + playerHeight > block.position.y - blockHeight / 2
      ) {
        if (Math.abs(movement.x) > 0) {
          newX = x;
        }
        if (Math.abs(movement.z) > 0) {
          newZ = z;
        }
      }
    }
    
    if (newY <= 0 && !standingOnBlock) {
      newY = 0;
      this.velocity.y = 0;
      this.canJump = true;
    }
    
    const isMovingNow = movement.length() > 0;
    this.isMoving = isMovingNow;
    
    if (this.playerModel) {
      this.playerModel.position.set(newX, newY, newZ);
      
      // Only set rotation if actually moving (not just when movement keys are pressed)
      if (movement.length() > 0) {
        const angle = Math.atan2(movement.x, movement.z);
        this.playerModel.rotation.y = angle;
        
        // Handle animations based on movement state
        if (this.isRunning) {
          changeAnimation(this.playerModel, 'running');
        } else {
          changeAnimation(this.playerModel, 'walking');
        }
      } else {
        // Only use idle animation when not actually moving
        changeAnimation(this.playerModel, 'idle');
      }
      
      const newTarget = new THREE.Vector3(this.playerModel.position.x, this.playerModel.position.y + 1, this.playerModel.position.z);
      if (this.controls) {
        this.controls.target.copy(newTarget);
      }
      this.camera.position.copy(newTarget).add(this.cameraOffset);
      
      if (this.room && (
          Math.abs(this.lastPosition.x - newX) > 0.01 ||
          Math.abs(this.lastPosition.y - newY) > 0.01 ||
          Math.abs(this.lastPosition.z - newZ) > 0.01 ||
          this.isMoving !== this.wasMoving ||
          this.isRunning !== this.wasRunning
        )) {
        this.room.updatePresence({
          x: newX,
          y: newY,
          z: newZ,
          rotation: this.playerModel.rotation.y,
          moving: this.isMoving,
          running: this.isRunning
        });
        
        this.lastPosition.set(newX, newY, newZ);
        this.wasMoving = this.isMoving;
        this.wasRunning = this.isRunning;
      }
    } else {
      this.camera.position.set(newX, newY + 1.2, newZ);
    }
    
    if (this.isMobile && this.controls) {
      this.controls.target.set(newX, newY + 1, newZ);
      this.controls.update();
    } else if (!this.isMobile && this.controls) {
      this.controls.update();
    }
  }
  
  update() {
    const now = performance.now();
    this.time = (now * 0.01) % 1000; // Use performance.now() for consistent timing
    
    if (this.enabled) {
      this.processMovement();
    }
    
    // Update animation mixer if exists
    if (this.playerModel && this.playerModel.userData && this.playerModel.userData.mixer) {
      this.playerModel.userData.mixer.update(0.016 * 1.5); // Update at faster rate for smoother animations
    }
    
    // Always update controls even when movement is disabled
    if (this.controls) {
      this.controls.update();
    }
  }
  
  getCamera() {
    return this.camera;
  }
  
  getPlayerModel() {
    return this.playerModel;
  }
}