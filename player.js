import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export function createPlayerModel(three, username) {
    const playerGroup = new THREE.Group();
    
    // Generate consistent color from username
    const hash = username.split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
    }, 0);
    const color = new THREE.Color(Math.abs(hash) % 0xffffff);
    
    // Store animations
    playerGroup.userData = {
        animations: {
            idle: null,
            walking: null,
            running: null
        },
        mixer: null,
        currentAnimation: null,
        color: color,
        model: null
    };
    
    // Load all the animations
    const loader = new GLTFLoader();
    
    // Load idle animation first and setup model
    loader.load('Animation_Idle_withSkin.glb', (gltf) => {
        const model = gltf.scene;
        model.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                // Apply user color to body parts
                if (child.material && (child.name.includes('Body') || child.name.includes('body'))) {
                    child.material = child.material.clone();
                    child.material.color.set(color);
                }
            }
        });
        
        playerGroup.userData.model = model;
        playerGroup.userData.mixer = new THREE.AnimationMixer(model);
        playerGroup.userData.animations.idle = gltf.animations[0];
        playerGroup.add(model);
        
        // Start with idle animation
        const idleAction = playerGroup.userData.mixer.clipAction(playerGroup.userData.animations.idle);
        idleAction.timeScale = 1.0;
        idleAction.play();
        playerGroup.userData.currentAnimation = 'idle';

        // Now load walking animation
        loader.load('Animation_Walking_Woman_withSkin.glb', (gltf) => {
            playerGroup.userData.animations.walking = gltf.animations[0];
        });

        // And finally load running animation
        loader.load('Animation_Running_withSkin.glb', (gltf) => {
            playerGroup.userData.animations.running = gltf.animations[0];
        });
    });
    
    return playerGroup;
}

// Helper function to change animations
export function changeAnimation(playerModel, animationName, fadeTime = 0.2) { // Reduced fade time
    if (!playerModel?.userData?.mixer || !playerModel?.userData?.animations) return;
    
    const animations = playerModel.userData.animations;
    const currentAnimation = playerModel.userData.currentAnimation;
    const mixer = playerModel.userData.mixer;
    
    // Don't change if it's already the current animation
    if (currentAnimation === animationName) return;
    
    // Make sure we have both the requested animation and a mixer
    if (animations[animationName] && mixer) {
        // Get or create the action for the new animation
        let newAction = mixer.existingAction(animations[animationName]);
        if (!newAction) {
            newAction = mixer.clipAction(animations[animationName]);
        }

        // Set appropriate timeScale based on animation type
        if (animationName === 'walking') {
            newAction.timeScale = 2.0; // Increased from 1.5
        } else if (animationName === 'running') {
            newAction.timeScale = 2.5; // Increased from 1.75
        } else {
            newAction.timeScale = 1.2; // Slightly increased idle animation
        }

        // Get current action if one exists
        let currentAction = null;
        if (currentAnimation && animations[currentAnimation]) {
            currentAction = mixer.existingAction(animations[currentAnimation]);
        }

        // Crossfade to new animation
        if (currentAction) {
            newAction.reset().setEffectiveTimeScale(1).setEffectiveWeight(1);
            newAction.crossFadeFrom(currentAction, fadeTime, true);
            newAction.play();
        } else {
            newAction.reset().play();
        }

        playerModel.userData.currentAnimation = animationName;
    }
}