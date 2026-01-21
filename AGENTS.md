# Repository Guidelines

## Project Structure & Module Organization
- `src/` contains the Phaser 3 game runtime (entities, scenes, systems, and `main.js`).
- `builder/` contains the React-based Sprite Refiner tool, served at `/builder/` via Vite.
- `public/assets/` is for finalized sprites, maps, tilesets, and UI art.
- `docs/` holds the project guide and prompt references; `docs/changelogs/` stores task logs.
- `scripts/` contains small helper scripts for asset inspection and transforms.

## Build, Test, and Development Commands
- `npm install` to install dependencies.
- `npm run dev` starts the Vite dev server (game at `/`, builder at `/builder/`).
- `npm run build` outputs production assets to `dist/` for both entry points.
- `npm run preview` serves the production build locally.
- `node test_config.js` / `node test_vite.js` are quick module-load sanity checks.

## Coding Style & Naming Conventions
- Use modern ES modules, 4-space indentation, semicolons, and single quotes (match existing files).
- Name Phaser scenes and entity classes with PascalCase (e.g., `src/scenes/Preloader.js`).
- Use camelCase for functions/variables; keep files aligned with their class/component name.
- Avoid adding temporary art to `public/`; use placeholder generation in `src/scenes/Preloader.js`.

## Testing Guidelines
- There is no formal test runner yet; rely on manual smoke testing.
- For gameplay changes, run `npm run dev` and validate movement, interactions, and scene loads.
- For builder changes, test upload, edit tools, and export flow in `/builder/`.
- If adding automated tests, prefer `*.test.js` naming near the code they cover.

## Commit & Pull Request Guidelines
- Recent history uses Conventional Commits (e.g., `feat(builder): ...`); follow `type(scope): summary`.
- Keep subjects imperative and concise; reference issues when relevant.
- PRs should include a clear description, test steps, and screenshots/GIFs for UI changes.
- Update `docs/GUIDE.md` and add a changelog entry in `docs/changelogs/HHMMSS-DDMMYYYY.commit.md` when work completes. The first line of the changelog entry should be a descriptive one-liner describing the major change (don't add any titles here), and the rest of the changelog entry should have a list of tasks accomplished and future work. 
