# Z1 Survive

This project is a lightweight browser game built with [Three.js](https://threejs.org/) and vanilla JavaScript. The `index.html` file loads the main application which renders a small survival world that can be explored in either desktop or mobile browsers.

## Running the Demo

Because the project uses ES module imports, you need to run it from a local web server. Any static server will work. A simple option that requires no additional dependencies is the built‑in Python HTTP server.

```bash
# From the project root
python3 -m http.server
```

Open `http://localhost:8000` in your browser and the intro screen should appear. Click **ENTER WORLD** to load the game.

## Extra Assets

Additional models, including the roaming fox NPC, can be downloaded with the provided Node script. These assets are listed in `extra-assets.json` and will be placed inside the `assets/models/` directory.

```bash
node model_downloader.js
```

The script uses only Node's built‑in modules and will create folders as needed.

## Changelog Modal and Roaming Foxes

When the page loads, a modal window displays recent entries from `CHANGELOG.md`. The game also features roaming fox NPCs that wander the terrain. Make sure you run the asset download script above so the fox models appear.

## Project Structure

```
assets/    Game models, textures and audio files
css/       Stylesheet for the web page
js/        JavaScript modules for rendering and controls
index.html Main entry page
```

Feel free to modify the assets or expand the world generation logic in `js/worldGeneration.js`.
