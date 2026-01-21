# Project: The Prince of Denmark (Hamlet Action-RPG)

## Overview
A Narrative Action-RPG adaptation of Shakespeare's *Hamlet*, built with **Phaser 3** and **Vite**. The game features an isometric (2.5D) perspective, pixel art aesthetics, and a "Verbal Fencing" combat system.

## Tech Stack
*   **Engine:** [Phaser 3](https://phaser.io/) (Arcade Physics)
*   **Build Tool:** [Vite](https://vitejs.dev/)
*   **Language:** Modern JavaScript (ES6+ Modules)
*   **Styling:** CSS (Minimal reset for canvas centering)

## Project Structure
```text
src/
├── entities/       # Game objects (Player, NPCs, Enemies)
│   └── Hamlet.js   # Player controller (State Machine: EXPLORE, COMBAT, DIALOGUE)
├── scenes/         # Phaser Scenes
│   ├── Preloader.js # Generates placeholder assets
│   └── GameScene.js # Main gameplay loop and world setup
├── systems/        # Logic managers (Dialogue, Input - currently empty)
├── main.js         # Game entry point & Configuration (320x180 resolution)
└── style.css       # Canvas centering and background
public/
└── assets/         # Static assets (currently empty, using generated placeholders)
```

## Key Configuration
*   **Resolution:** 320x180 (Native) -> Scaled x4 via `zoom` property in `main.js`.
*   **Rendering:** `pixelArt: true` (Nearest-neighbor scaling).
*   **Physics:** Arcade Physics with `gravity: { y: 0 }` (Top-down/Iso).
*   **Assets:** Currently using programmatic placeholder textures (generated in `Preloader.js`).

## Building and Running

### Prerequisites
*   Node.js & npm

### Commands
*   **Start Development Server:**
    ```bash
    npm run dev
    ```
    Access at `http://localhost:5173` (default).

*   **Build for Production:**
    ```bash
    npm run build
    ```
    Output located in `dist/`.

*   **Preview Build:**
    ```bash
    npm run preview
    ```

## Development Conventions
*   **State Management:** Entities use a local state machine (e.g., `Hamlet.js` uses `currentState` property).
*   **Isometric Handling:**
    *   Visuals are isometric.
    *   Movement is normalized 8-way vector.
    *   Sorting anchors should be set to feet (`setOrigin(0.5, 1)`).
*   **Placeholder Assets:** Do not add temporary images to `public/`. Use `Preloader.createPlaceholderTexture` to generate them programmatically until final assets are ready.
*   **Context7 MCP:** Use the Context7 MCP to get up-to-date documentation for the modules used in the project. Make sure to query Context7 with the correct version information. 

## Future Hooks
*   **Verbal Fencing:** The `Hamlet` class has `enterDialogueState` and `exitDialogueState` methods ready to be hooked into a UI/Dialogue system.

## Documentation Guidelines
*   **Overview:** Frequently document progress made, tasks completed, to-do items, and detailed description of the entire project in `docs/`. Do a round of documentation at the end of every task. 
*   **Single Source of Truth:** Prepare `docs/GUIDE.md` with all information about the project. Any entity should be able to gain a complete understanding of the current state of the project by reading the entirety of this GUIDE.md
*   **Changelogs:** At the end of every task, prepare a changelog document in the form of a commit message in `docs/changelogs/HHMMSS-DDMMYYYY.commit.md. The first line should have a commit message, followed by a concise list of tasks accomplished, then a concise list of future work. If you have access to a Github MCP and if a git repo is initialized for this project, use this file to make a commit. 
*   **Caching MCP Responses:** Anytime an MCP is used, cache the response in a file in `docs/mcp/` with a filename describing the query. 