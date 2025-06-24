# Changelog

## collision.js
### 🛠 Changed
- 062425-1958 Exclude tree objects from collision checks and remove special-case handling.

## app.js
### 🔥 Removed
- 062425-2001 Omit createTrees import and usage; drop related loading message.
- 062425-2021 Remove unused createSkybox import and MathRandom class.

### ✨ Added
- 062425-2017 Spawn fox NPCs and update animation loop for movement.

## assets
### 🔥 Removed
- 062425-2005 Drop unused pine_tree.glb model.

## changelogModal.js
### ✨ Added
- 062425-2013 Display CHANGELOG in a modal on page load.
### 🛠 Changed
- 062425-2050 Open changelog via button instead of automatically.

## index.html
### ✨ Added
- 062425-2013 Include changelog modal markup and script.
- 062425-2038 ui/intro-screen: Pulsing LT logo next to title.
- 062425-2050 ui/intro-screen: Changelog button below Enter World.

## styles.css
### ✨ Added
- 062425-2013 Style rules for changelog modal overlay.
- 062425-2038 ui/intro-screen: Animations for LT logo and layout tweaks.
### 🛠 Changed
- 062425-2043 ui/intro-screen: Enlarged LT logo to 3x size.
- 062425-2050 ui/intro-screen: Styling for changelog button.

## fox.js
### ✨ Added
- 062425-2017 Add roaming fox NPCs with walking animation.
### 🐛 Fixed
- 062425-2123 Fix incorrect GLB path for roaming fox model.
### 🛠 Changed
- 062425-2155 Use noise-based ground height lookup to reduce raycasting.

## worldGeneration.js
### 🔥 Removed
- 062425-2021 Delete unused MathRandom class.
### 🛠 Changed
- 062425-2155 Replace raycaster height queries with direct noise lookup.

## README.md
### ✨ Added
- 062425-2025 Document changelog modal and roaming fox models with download instructions.

