import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

// Simple seeded random number generator
class MathRandom {
  constructor(seed) {
    this.seed = seed;
  }
  
  random() {
    const x = Math.sin(this.seed++) * 10000;
    return x - Math.floor(x);
  }
}

export function createBarriers(scene) {
  // No barriers will be created
}

export function createTrees(scene) {
  // Use a deterministic random number generator for consistent tree placement
  const treeSeed = 54321; // Different seed than barriers
  let rng = new MathRandom(treeSeed);
  
  // Load the pine tree model
  const loader = new GLTFLoader();
  loader.load('assets/models/pine_tree.glb', (gltf) => {
    const treeModel = gltf.scene;
    
    // Make sure the model casts and receives shadows
    treeModel.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    
    // Create trees at different positions - Increased number of trees and spread
    for (let i = 0; i < 400; i++) { // Increased from 100 to 400 trees
      // Clone the loaded model for each tree
      const tree = treeModel.clone();
      
      // Position the tree - use different distribution patterns based on the index
      let angle, distance;
      
      if (i < 120) { // Increased from 30
        // Inner forest ring
        angle = rng.random() * Math.PI * 2;
        distance = 60 + rng.random() * 160; // Increased range from 15-55 to 60-220
      } else if (i < 280) { // Increased from 70
        // Outer forest ring
        angle = rng.random() * Math.PI * 2;
        distance = 180 + rng.random() * 160; // Increased range from 45-85 to 180-340
      } else {
        // Random clusters
        angle = (rng.random() * Math.PI / 4) + ((Math.floor(rng.random() * 8)) * Math.PI / 4);
        distance = 80 + rng.random() * 260; // Increased range from 20-85 to 80-340
      }
      
      tree.position.x = Math.cos(angle) * distance;
      tree.position.z = Math.sin(angle) * distance;
      
      // Add some random rotation and scale variation
      tree.rotation.y = rng.random() * Math.PI * 2;
      const treeScale = 0.0144 + rng.random() * 0.009;
      tree.scale.set(treeScale, treeScale, treeScale);
      
      // Add custom property for collision detection
      tree.userData.isTree = true;
      tree.userData.isBarrier = true;
      
      scene.add(tree);
    }
  });
}

export function createClouds(scene) {
  // Clouds have been removed as requested
}