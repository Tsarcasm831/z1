import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

// Terrain generator using deterministic value noise
export class TerrainGenerator {
  constructor(seed = 1337) {
    this.seed = seed;
  }

  // Pseudo random based on coordinates
  rand(x, z) {
    return this.fract(Math.sin(x * 127.1 + z * 311.7 + this.seed) * 43758.5453123);
  }

  fract(x) {
    return x - Math.floor(x);
  }

  lerp(a, b, t) {
    return a + (b - a) * t;
  }

  smooth(t) {
    return t * t * (3 - 2 * t);
  }

  valueNoise(x, z) {
    const xi = Math.floor(x);
    const zi = Math.floor(z);
    const xf = x - xi;
    const zf = z - zi;

    const r00 = this.rand(xi, zi);
    const r10 = this.rand(xi + 1, zi);
    const r01 = this.rand(xi, zi + 1);
    const r11 = this.rand(xi + 1, zi + 1);

    const u = this.smooth(xf);
    const v = this.smooth(zf);

    const x1 = this.lerp(r00, r10, u);
    const x2 = this.lerp(r01, r11, u);
    return this.lerp(x1, x2, v);
  }

  fractalNoise(x, z, octaves = 4) {
    let total = 0;
    let frequency = 1;
    let amplitude = 1;
    let maxAmp = 0;

    for (let i = 0; i < octaves; i++) {
      total += this.valueNoise(x * frequency, z * frequency) * amplitude;
      maxAmp += amplitude;
      amplitude *= 0.5;
      frequency *= 2;
    }

    return total / maxAmp;
  }

  getHeight(x, z) {
    // Scale coordinates down to get larger features
    const n = this.fractalNoise(x * 0.02, z * 0.02);
    // Map to roughly [-10, 15]
    let h = (n - 0.5) * 25;

    // Emphasize mountains and valleys
    if (h > 6) h += (h - 6) * 1.5;
    if (h < -6) h += (h + 6) * 1.5;

    return h;
  }
}

export let terrainGenerator;

// Get terrain height using a raycaster for better accuracy.
// Moved from collision.js to be reused here.
export function getGroundHeight(x, z, scene) {
  const terrain = scene.children.find(c => c.userData.isTerrain);

  if (terrain) {
    const raycaster = new THREE.Raycaster();
    // Start ray from high above. The terrain height is between -25 and 25 approx, so 100 is safe.
    const rayOrigin = new THREE.Vector3(x, 100, z);
    const rayDirection = new THREE.Vector3(0, -1, 0);
    raycaster.set(rayOrigin, rayDirection);

    const intersects = raycaster.intersectObject(terrain);

    if (intersects.length > 0) {
      return intersects[0].point.y;
    }
  }

  // Fallback to procedural generation if terrain mesh not found or no intersection
  return terrainGenerator ? terrainGenerator.getHeight(x, z) : 0;
}

export function createTerrain(scene) {
  terrainGenerator = new TerrainGenerator(12345);

  const size = 600;
  const segments = 200;
  const geometry = new THREE.PlaneGeometry(size, size, segments, segments);

  const pos = geometry.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getY(i); // PlaneGeometry uses Y for second axis
    pos.setZ(i, terrainGenerator.getHeight(x, z));
  }

  geometry.computeVertexNormals();

  const textureLoader = new THREE.TextureLoader();
  const groundTexture = textureLoader.load('/assets/textures/d75c1v3-b844c293-57db-4eac-8504-7c4c06a4e329.png');
  groundTexture.wrapS = THREE.RepeatWrapping;
  groundTexture.wrapT = THREE.RepeatWrapping;
  groundTexture.repeat.set(20, 20);

  const material = new THREE.MeshStandardMaterial({
    map: groundTexture,
    roughness: 0.8,
    metalness: 0.2,
  });

  const ground = new THREE.Mesh(geometry, material);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  ground.userData.isTerrain = true;
  scene.add(ground);

  return ground;
}

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

    // Ensure the model casts and receives shadows
    treeModel.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    // Helper to properly place a tree on the terrain after scaling
    function placeTreeOnGround(tree) {
      // Ensure world matrix is up to date before calculating bounds
      tree.updateMatrixWorld(true);
      const box = new THREE.Box3().setFromObject(tree);
      const groundY = getGroundHeight(tree.position.x, tree.position.z, scene);
      tree.position.y = groundY - box.min.y;
    }
    
    // Create trees at different positions - Increased number of trees and spread
    for (let i = 0; i < 400; i++) { // Increased from 100 to 400 trees
      // Clone the loaded model for each tree
      const tree = treeModel.clone(true);
      
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

      // Random rotation and scale
      tree.rotation.y = rng.random() * Math.PI * 2;
      const treeScale = 0.0144 + rng.random() * 0.009;
      tree.scale.set(treeScale, treeScale, treeScale);

      // Position tree precisely on the ground after scaling
      placeTreeOnGround(tree);
      
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