import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { getGroundHeight } from './worldGeneration.js';

function loadGLTF(loader, url) {
  return new Promise((resolve, reject) => {
    loader.load(url, resolve, undefined, reject);
  });
}

export async function spawnFoxes(scene, count) {
  const loader = new GLTFLoader();
  const foxGltf = await loadGLTF(
    loader,
    'assets/lt/models/undeadFox_walking_animation.glb'
  );

  const foxes = [];
  for (let i = 0; i < count; i++) {
    const fox = foxGltf.scene.clone(true);
    fox.traverse(child => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    const mixer = new THREE.AnimationMixer(fox);
    const action = mixer.clipAction(foxGltf.animations[0]);
    action.play();

    const x = (Math.random() * 40) - 20;
    const z = (Math.random() * 40) - 20;
    const y = getGroundHeight(x, z);
    fox.position.set(x, y, z);

    fox.userData.mixer = mixer;
    fox.userData.direction = new THREE.Vector3(Math.random() - 0.5, 0, Math.random() - 0.5).normalize();
    fox.userData.speed = 0.02 + Math.random() * 0.02;

    scene.add(fox);
    foxes.push(fox);
  }

  return foxes;
}

