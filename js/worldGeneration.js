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

// Get terrain height quickly using the same noise generator that built the
// terrain mesh. This avoids per-frame raycasting which became a bottleneck when
// multiple animated foxes were added.
export function getGroundHeight(x, z) {
  // Using the terrainGenerator directly avoids expensive raycaster calls each
  // frame. The generator produced the terrain mesh, so its height values match
  // the rendered ground.
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


export function createBarriers(scene) {
  // No barriers will be created
}

export function createClouds(scene) {
  // Clouds have been removed as requested
}
