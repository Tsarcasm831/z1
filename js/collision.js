import * as THREE from 'three';
import { terrainGenerator, getGroundHeight } from './worldGeneration.js';

// Return array of meshes that should be used for collision checks
// Trees were previously included but no longer participate in collisions
export function getCollidableMeshes(scene) {
  return scene.children.filter(
    child => (child.userData.isBlock || child.userData.isBarrier) && !child.userData.isTree
  );
}

// Resolve collisions and return updated position and velocity
export function resolvePlayerMovement(pos, movement, velocity, scene, options = {}) {
  const playerRadius = options.playerRadius || 0.3;
  const playerHeight = options.playerHeight || 1.8;

  let newX = pos.x + movement.x;
  let newY = pos.y + velocity.y;
  let newZ = pos.z + movement.z;

  let standingOnBlock = false;
  const blocks = getCollidableMeshes(scene);

  function checkBlock(block, overrideWidth, overrideHeight, overrideDepth) {
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
      velocity.y <= 0 &&
      Math.abs(newX - block.position.x) < (blockWidth / 2 + playerRadius) &&
      Math.abs(newZ - block.position.z) < (blockDepth / 2 + playerRadius) &&
      Math.abs(pos.y - (block.position.y + blockHeight / 2)) < 0.2 &&
      pos.y >= block.position.y
    ) {
      standingOnBlock = true;
      newY = block.position.y + blockHeight / 2 + 0.01;
      velocity.y = 0;
    } else if (
      Math.abs(newX - block.position.x) < (blockWidth / 2 + playerRadius) &&
      Math.abs(newZ - block.position.z) < (blockDepth / 2 + playerRadius) &&
      newY < block.position.y + blockHeight / 2 &&
      newY + playerHeight > block.position.y - blockHeight / 2
    ) {
      // Simple horizontal collision response
      if (Math.abs(movement.x) > 0) {
        newX = pos.x;
      }
      if (Math.abs(movement.z) > 0) {
        newZ = pos.z;
      }
    }
  }

  blocks.forEach(block => {
    checkBlock(block);
  });

  const groundHeight = getGroundHeight(newX, newZ, scene);
  if (newY <= groundHeight && !standingOnBlock) {
    newY = groundHeight;
    velocity.y = 0;
    standingOnBlock = true;
  }

  return { position: new THREE.Vector3(newX, newY, newZ), velocity, onGround: standingOnBlock };
}