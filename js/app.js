import * as THREE from "three";
import { PlayerControls } from "./controls.js";
import { createPlayerModel, changeAnimation } from "./player.js";
import { createBarriers, createTrees, createTerrain } from "./worldGeneration.js";
import { createSkybox } from "./skybox.js";

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

async function main() {
  // Handle intro screen and loading sequence
  const introScreen = document.getElementById('intro-screen');
  const loadingScreen = document.getElementById('loading-screen');
  const gameContainer = document.getElementById('game-container');
  const enterButton = document.getElementById('enter-button');
  
  // Create audio element for menu sound
  const menuSound = new Audio('assets/audio/z1_menu_sfx.mp3');
  menuSound.volume = 0.5; // Set volume to 50%
  
  const loadingMessages = [
    "Feeding Zombies...",
    "Hiding Supplies...",
    "Growing Trees...",
    "Darkening Skies...",
    "Setting Traps...",
    "Scattering Resources...",
    "Preparing Spawn Points...",
    "Charging Batteries...",
    "Loading Ammunition...",
    "Checking Perimeter..."
  ];
  
  enterButton.addEventListener('click', async () => {
    // Play menu sound effect
    menuSound.play();
    
    introScreen.style.display = 'none';
    loadingScreen.style.display = 'flex';
    
    const loadingMessage = document.getElementById('loading-message');
    const progressBar = document.querySelector('.loading-progress');
    
    // Simulate loading with messages
    let progress = 0;
    const messageDuration = 1500; // 1.5 seconds per message
    const totalDuration = 15000; // 15 seconds total
    const messageCount = loadingMessages.length;

    // Use a real progress simulation for better user experience
    let gameInitialized = false;
    const initializePromise = initializeGame().then(() => {
        gameInitialized = true;
    });
    
    const updateProgress = setInterval(() => {
      // Slow down progress if game hasn't finished initializing
      const increment = gameInitialized ? 100 : (100 / (totalDuration / 100));
      progress += increment;
      progressBar.style.width = `${Math.min(progress, 100)}%`;
      
      if (progress >= 100 && gameInitialized) {
        clearInterval(updateProgress);
        loadingScreen.style.display = 'none';
        gameContainer.style.display = 'block';
      }
    }, 100);
    
    // Cycle through messages
    let messageIndex = 0;
    const cycleMessages = setInterval(() => {
      loadingMessage.textContent = loadingMessages[messageIndex];
      messageIndex = (messageIndex + 1) % messageCount;
      
      if (progress >= 100) {
        clearInterval(cycleMessages);
      }
    }, messageDuration);
  });
  
  async function initializeGame() {
    // Initialize WebsimSocket for multiplayer functionality
    const room = new WebsimSocket();
    await room.initialize();
    
    // Generate a random player name if not available
    const playerInfo = room.peers[room.clientId] || {};
    const playerName = playerInfo.username || `Player${Math.floor(Math.random() * 1000)}`;
    
    // Safe initial position values
    const playerX = (Math.random() * 10) - 5;
    const playerZ = (Math.random() * 10) - 5;

    // Setup Three.js scene
    const scene = new THREE.Scene();
    
    // Set a simple background color instead of complex skybox geometry
    scene.background = new THREE.Color(0x87CEEB); // Light sky blue
    
    // Add fog for depth and atmosphere
    scene.fog = new THREE.Fog(0x87CEEB, 50, 400);
    
    // Create terrain and natural features
    createBarriers(scene);
    createTerrain(scene);
    createTrees(scene);
    
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.getElementById('game-container').appendChild(renderer.domElement);
    
    // Object to store other players
    const otherPlayers = {};
    const playerLabels = {};
    
    // Create player model
    const playerModel = await createPlayerModel(THREE, playerName);
    scene.add(playerModel);
    
    // Initialize player controls
    const playerControls = new PlayerControls(scene, room, {
      renderer: renderer,
      initialPosition: {
        x: playerX,
        y: 0.5,
        z: playerZ
      },
      playerModel: playerModel
    });
    const camera = playerControls.getCamera();
    
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    // Directional light (sun)
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(5, 10, 5);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 50;
    dirLight.shadow.camera.left = -25;
    dirLight.shadow.camera.right = 25;
    dirLight.shadow.camera.top = 25;
    dirLight.shadow.camera.bottom = -25;
    scene.add(dirLight);
    
    // Grid helper - Increased size to match ground
    const gridHelper = new THREE.GridHelper(600, 600);
    gridHelper.visible = false; // Grid off by default
    scene.add(gridHelper);
    
    // Remove old chat elements
    const oldChatElements = document.querySelectorAll('.chat-message, #chat-input-container, #chat-button');
    oldChatElements.forEach(el => el.remove());

    // Create console chat UI
    const chatConsole = document.createElement('div');
    chatConsole.id = 'chat-console';
    
    const chatMessages = document.createElement('div');
    chatMessages.id = 'chat-messages';
    
    const consoleInput = document.createElement('input');
    consoleInput.id = 'console-input';
    consoleInput.type = 'text';
    consoleInput.maxLength = 100;
    consoleInput.placeholder = 'Press Enter to chat...';
    
    chatConsole.appendChild(chatMessages);
    chatConsole.appendChild(consoleInput);
    document.getElementById('game-container').appendChild(chatConsole);

    // Format timestamp
    function formatTime(date) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    // Add chat message to console
    function addChatMessage(username, message, timestamp = new Date()) {
      const chatEntry = document.createElement('div');
      chatEntry.className = 'chat-entry';
      
      chatEntry.innerHTML = `
        <span class="chat-timestamp">[${formatTime(timestamp)}]</span>
        <span class="chat-username">${username}:</span>
        <span class="chat-message-text">${message}</span>
      `;
      
      // Add to messages
      chatMessages.appendChild(chatEntry);
      
      // Keep only last 4 messages
      while (chatMessages.children.length > 4) {
        chatMessages.removeChild(chatMessages.firstChild);
      }
      
      // Remove message after 30 seconds
      setTimeout(() => {
        if (chatEntry.parentNode === chatMessages) {
          chatMessages.removeChild(chatEntry);
        }
      }, 30000);
    }

    // Handle chat input
    consoleInput.addEventListener('keydown', (e) => {
      e.stopPropagation(); // Prevent movement while typing
      
      if (e.key === 'Enter') {
        const message = consoleInput.value.trim();
        if (message) {
          // Get player info
          const playerInfo = room.peers[room.clientId];
          const username = playerInfo.username || `Player${room.clientId.substring(0, 4)}`;
          
          // Add message locally
          addChatMessage(username, message);
          
          // Send to other players
          room.send({
            type: 'chat',
            message: message,
            username: username,
            timestamp: new Date().toISOString()
          });
          
          consoleInput.value = '';
        }
      }
    });

    // Handle incoming chat messages
    room.onmessage = (event) => {
      const data = event.data;
      if (data.type === 'chat' && data.clientId !== room.clientId) {
        addChatMessage(data.username, data.message, new Date(data.timestamp));
      }
    };

    // Subscribe to presence updates - handle player joining/leaving and position updates
    room.subscribePresence((presence) => {
      for (const clientId in presence) {
        if (clientId === room.clientId) continue; // Skip self
        
        const playerData = presence[clientId];
        if (!playerData) continue;
        
        // Create new player if needed
        if (!otherPlayers[clientId] && playerData.x !== undefined && playerData.z !== undefined) {
          const peerInfo = room.peers[clientId] || {};
          const peerName = peerInfo.username || `Player${clientId.substring(0, 4)}`;
          
          createPlayerModel(THREE, peerName).then(newPlayerModel => {
            newPlayerModel.position.set(playerData.x, playerData.y || 0.5, playerData.z);
            if (playerData.rotation !== undefined) {
              newPlayerModel.rotation.y = playerData.rotation;
            }
            scene.add(newPlayerModel);
            otherPlayers[clientId] = newPlayerModel;
            
            // Create name label
            playerLabels[clientId] = createPlayerLabel(clientId, peerName);
          });
        }
        
        // Update existing player
        else if (otherPlayers[clientId] && playerData.x !== undefined && playerData.z !== undefined) {
          otherPlayers[clientId].position.set(playerData.x, playerData.y || 0, playerData.z);
          if (playerData.rotation !== undefined) {
            otherPlayers[clientId].rotation.y = playerData.rotation;
          }
          
          // Update animations based on player movement state
          // Only use idle when not moving, regardless of key press state
          if (playerData.moving) {
            if (playerData.running) {
              changeAnimation(otherPlayers[clientId], 'running');
            } else {
              changeAnimation(otherPlayers[clientId], 'walking');
            }
          } else {
            changeAnimation(otherPlayers[clientId], 'idle');
          }
        }
      }
      
      // Remove disconnected players
      for (const clientId in otherPlayers) {
        if (!presence[clientId]) {
          scene.remove(otherPlayers[clientId]);
          delete otherPlayers[clientId];
          
          if (playerLabels[clientId]) {
            document.getElementById('game-container').removeChild(playerLabels[clientId]);
            delete playerLabels[clientId];
          }
        }
      }
    });

    // Create DOM element for player name label
    function createPlayerLabel(playerId, username) {
      const label = document.createElement('div');
      label.className = 'player-name';
      label.textContent = username;
      document.getElementById('game-container').appendChild(label);
      return label;
    }
    
    // Create chat message element for local player
    const localChatMessage = document.createElement('div');
    localChatMessage.id = 'chat-message-local';
    localChatMessage.className = 'chat-message';
    document.getElementById('game-container').appendChild(localChatMessage);

    // Add settings menu functionality
    const settingsMenu = document.getElementById('settings-menu');
    const sfxVolumeSlider = document.getElementById('sfx-volume');
    const sfxVolumeValue = document.getElementById('sfx-volume-value');
    const showNamesCheckbox = document.getElementById('show-names');
    const showChatCheckbox = document.getElementById('show-chat');
    const resumeButton = document.getElementById('resume-game');
    const closeButton = document.querySelector('.settings-close');

    let isSettingsOpen = false;

    // Function to toggle settings menu
    function toggleSettings(show) {
      isSettingsOpen = show;
      settingsMenu.style.display = show ? 'block' : 'none';
      
      // Enable/disable controls based on settings state
      if (playerControls) {
        playerControls.enabled = !show;
      }
    }

    // Handle ESC key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        toggleSettings(!isSettingsOpen);
      }
    });

    // Handle volume changes
    sfxVolumeSlider.addEventListener('input', (e) => {
      const volume = e.target.value;
      sfxVolumeValue.textContent = `${volume}%`;
      
      // Update sound effects volume
      const volumeDecimal = volume / 100;
      playerControls.jumpSound.volume = volumeDecimal * 0.3; // Maintain relative volume
      menuSound.volume = volumeDecimal * 0.5;
    });

    // Handle show names toggle
    showNamesCheckbox.addEventListener('change', (e) => {
      const show = e.target.checked;
      for (const label of Object.values(playerLabels)) {
        label.style.display = show ? 'block' : 'none';
      }
    });

    // Handle show chat toggle
    showChatCheckbox.addEventListener('change', (e) => {
      chatConsole.style.display = e.target.checked ? 'flex' : 'none';
    });

    // Handle show grid toggle
    const showGridCheckbox = document.getElementById('show-grid');
    showGridCheckbox.addEventListener('change', (e) => {
      gridHelper.visible = e.target.checked;
    });

    // Handle resume game button
    resumeButton.addEventListener('click', () => {
      toggleSettings(false);
    });

    // Handle close button
    closeButton.addEventListener('click', () => {
      toggleSettings(false);
    });

    // Animation loop
    function animate() {
      requestAnimationFrame(animate);
      playerControls.update();
      
      // Update animation mixers for other players
      for (const clientId in otherPlayers) {
        if (otherPlayers[clientId].userData && otherPlayers[clientId].userData.mixer) {
          otherPlayers[clientId].userData.mixer.update(0.016 * 1.5); // Increase update rate for smoother animations
        }
      }
      
      // Update name labels for all players
      for (const clientId in otherPlayers) {
        if (playerLabels[clientId] && otherPlayers[clientId]) {
          const screenPosition = getScreenPosition(otherPlayers[clientId].position, camera, renderer);
          if (screenPosition) {
            playerLabels[clientId].style.left = `${screenPosition.x}px`;
            playerLabels[clientId].style.top = `${screenPosition.y - 20}px`;
            playerLabels[clientId].style.display = screenPosition.visible ? 'block' : 'none';
          } else {
            playerLabels[clientId].style.display = 'none';
          }
        }
      }
      
      // Update local player's chat message position
      if (localChatMessage && playerModel) {
        const screenPosition = getScreenPosition(playerModel.position, camera, renderer);
        if (screenPosition && localChatMessage.textContent) {
          localChatMessage.style.left = `${screenPosition.x}px`;
          localChatMessage.style.top = `${screenPosition.y - 45}px`;
          localChatMessage.style.display = screenPosition.visible ? 'block' : 'none';
        } else {
          localChatMessage.style.display = 'none';
        }
      }
      
      renderer.render(scene, camera);
    }
    
    // Helper function to convert 3D position to screen coordinates
    function getScreenPosition(position, camera, renderer) {
      const vector = new THREE.Vector3();
      const widthHalf = renderer.domElement.width / 2;
      const heightHalf = renderer.domElement.height / 2;
      
      // Get the position adjusted to account for player height
      vector.copy(position);
      vector.y += 1.5; // Position above the player's head
      
      // Project to screen space
      vector.project(camera);
      
      // Calculate whether object is in front of the camera
      const isInFront = vector.z < 1;
      
      // Convert to screen coordinates
      return {
        x: (vector.x * widthHalf) + widthHalf,
        y: -(vector.y * heightHalf) + heightHalf,
        visible: isInFront
      };
    }

    animate();
  }
}

main();