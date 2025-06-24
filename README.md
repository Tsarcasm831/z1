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

Additional models can be downloaded with the provided Node script. These assets are listed in `extra-assets.json` and will be placed inside the `assets/models/` directory.

```bash
node model_downloader.js
```

The script uses only Node's built‑in modules and will create folders as needed.

## Project Structure

```
assets/    Game models, textures and audio files
css/       Stylesheet for the web page
js/        JavaScript modules for rendering and controls
index.html Main entry page
```

Feel free to modify the assets or expand the world generation logic in `js/worldGeneration.js`.
