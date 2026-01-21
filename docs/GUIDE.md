# The Prince of Denmark (Hamlet Action-RPG) - Project Guide

## 1. Overview
**Genre:** Narrative Action-RPG / Psychological Thriller
**Visual Style:** 16-bit Isometric Pixel Art (reminiscent of *Chrono Trigger*)
**Perspective:** Top-down / Isometric (2.5D)
**Core Loop:** Social Investigation (90%) + Lethal Action Combat (10%)
**Engine:** Phaser 3 (Arcade Physics) + Vite

## 2. Tech Stack
*   **Engine:** [Phaser 3](https://phaser.io/)
*   **Build Tool:** [Vite](https://vitejs.dev/)
*   **Language:** Modern JavaScript (ES6+ Modules)
*   **Resolution:** 320x180 (Native) -> Scaled x4 via `zoom` property in `main.js`.
*   **Rendering:** `pixelArt: true` (Nearest-neighbor scaling).

## 3. Project Structure
```text
src/
├── entities/       # Game objects (Player, NPCs, Enemies)
│   └── Hamlet.js   # Player controller (State Machine: EXPLORE, COMBAT, DIALOGUE)
├── scenes/         # Phaser Scenes
│   ├── Preloader.js # Generates placeholder assets
│   └── GameScene.js # Main gameplay loop and world setup
├── systems/        # Logic managers (Dialogue, Input)
├── main.js         # Game entry point & Configuration
└── style.css       # Canvas centering and background

public/
└── assets/
    ├── sprites/
    │   ├── characters/
    │   │   ├── hamlet/
    │   │   ├── laertes/
    │   │   ├── claudius/
    │   │   ├── gertrude/
    │   │   ├── polonius/
    │   │   ├── ophelia/
    │   │   ├── horatio/
    │   │   ├── ghost/
    │   │   └── mobs/ (guards, pirates)
    │   ├── objects/ (tapestries, curtains, skull)
    │   └── fx/ (blood, sparks, fog, glitch)
    ├── maps/ (tilemaps like .json)
    ├── tilesets/ (tilesheet images)
    ├── items/ (inventory icons)
    └── ui/ (dialogue boxes, meters)
```

## 4. Characters
### Playable Character: Prince Hamlet
*   **Role:** Solo Protagonist.
*   **Attributes:**
    *   **Vengeance (STR):** Aggression, Fencing Dmg.
    *   **Wits (INT):** Logic, Dialogue Puzzles.
    *   **Resolve (HP/SANITY):** Mental health. Drained by damage or "Glitch Mode".

### Significant NPCs
*   **Claudius:** Antagonist. High Deception.
*   **Gertrude:** The Mother. High Bond, Low Resolve.
*   **Polonius:** The Gatekeeper. Vulnerable to "Madness".
*   **Ophelia:** The Victim. Fate depends on dialogue.
*   **Laertes:** Rival. Physical threat.
*   **Horatio:** Save Point/Healer.
*   **The Ghost:** Guide/Haunt.

## 5. Setting: Elsinore Castle
A "Clockwork Open World" hub.
*   **Great Hall:** Central hub.
*   **Royal Quarters:** Restricted. Requires stealth.
*   **Ramparts:** The Ghost's location.
*   **Library:** Wits training.
*   **Chapel:** Key decision point.
*   **Dungeons/Sewers:** Shortcuts.
*   **Graveyard & Harbor:** Exterior zones.

## 6. Mechanics

### A. Combat: "Lethal Action"
*   **Style:** Real-time, top-down.
*   **Controls:** Stick (Move), A (Thrust), B (Dodge), L-Trigger (Glitch Mode).
*   **Glitch Mode:** Bullet time, slows enemies, drains Resolve.
*   **Posture:** Parry/Lunge to break enemy posture.
*   **Lethality:** High damage (2-3 hits to die).

### B. Dialogue: "Verbal Fencing"
*   **Interface:** Combat-like UI.
*   **Stats:** Player Credibility (HP) vs Enemy Composure (Enemy HP).
*   **Moves:**
    *   **Direct:** Attack.
    *   **Logic:** Heavy Attack (High Wits).
    *   **Feint:** Defense/Flattery.
    *   **Glitch/Madness:** Stun/Confuse (Drains Resolve).
    *   **Equip Item:** Critical Hit (e.g., using Evidence).

### C. Inventory
*   **Physical Gear:** Weapons (Foil, Rusty Blade), Trinkets (Yorick's Skull, Ophelia's Rue).
*   **Rumors (Plot Items):** Tangible items used as "Ammo" in dialogue (e.g., "The Ghost's Secret").

## 7. Plot Outline
*   **Prologue:** Play as King Hamlet (Tutorial).
*   **Act 1:** The Ghost (Vengeance vs Wits choice).
*   **Act 2:** The Mousetrap (Confirm Guilt).
*   **Act 3:** The Turning Point (Closet Scene, Prayer Scene - Kill/Spare).
*   **Act 4:** Exile & Pirates.
*   **Act 5:** The Finale (Duel with Laertes, Poison Timer).

## 8. Development Conventions
*   **State Management:** Local state machines in entities.
*   **Isometric Handling:** Normalized 8-way vector movement. Sorting anchors at feet (`setOrigin(0.5, 1)`).
*   **Assets:** Use programmatic placeholders in `Preloader.js` until final assets are ready. Do not clutter `public/` with temps.

## 9. Internal Tools
### Sprite Refiner (`/builder`)
A standalone web-based tool for processing raw AI-generated sprite sheets into game-ready assets.

*   **Layout & Scaling:** 
    *   3-column optimized layout.
    *   **Visual View Scale:** Non-destructive zoom (50% - 300%) for visual precision.
    *   Full-screen responsive container.
*   **Editing Tools:**
    *   **Box Eraser:** Instant mass-clearing of whitespace/transparent areas.
    *   **Standard Tools:** Pixel brush, eraser, paint bucket, and eyedropper.
    *   **Non-Destructive Move:** Shift layers without losing pixel data.
*   **Palette System:** 
    *   **K-Means Clustering:** Generates a 16-color palette from the source image without modifying original pixels.
    *   Luminance-sorted swatches for aesthetic organization.
*   **State & Metadata:**
    *   **Per-Sprite Labels:** Separate Name/Pose tracking for every chunk.
    *   **Persistence:** State (offset, metadata, pixel data) is tracked across selections.
    *   **Manual Save (Ctrl+S):** Force-commit current state to memory for checkpointing.
*   **Workflow:**
    *   **Project Checkpoints (.zip):** Export your entire working session (Original sources + Edits + Metadata) as a ZIP.
    *   **Resuming:** Drop a project ZIP into the homepage to resume work exactly where you left off.
    *   **Export:** Name-conforming individual PNG chunks (Name_Pose_Index.png).
*   **Access:** Run `npm run dev` and navigate to `/builder/` (e.g., `http://localhost:5173/builder/`).
