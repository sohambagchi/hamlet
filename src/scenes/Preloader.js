import Phaser from 'phaser';

export default class Preloader extends Phaser.Scene {
    constructor() {
        super('Preloader');
    }

    preload() {
        // Since we are generating textures, we don't have much to load yet.
        // We could load a font here if we had one.
        // this.load.bitmapFont('retro', 'assets/fonts/retro.png', 'assets/fonts/retro.xml');
    }

    create() {
        // Generate Placeholder Textures
        this.createPlaceholderTexture('hamlet', '#000000'); // Black rect
        this.createPlaceholderTexture('enemy', '#ff0000'); // Red rect
        this.createPlaceholderTexture('npc_static', '#00ff00'); // Green rect
        this.createPlaceholderTexture('sword_swing', '#ffffff'); // White flash

        // Transition to Main Menu or Game Scene
        this.scene.start('GameScene');
    }

    createPlaceholderTexture(key, colorStr) {
        const graphics = this.make.graphics();
        graphics.fillStyle(Phaser.Display.Color.HexStringToColor(colorStr).color, 1);
        graphics.fillRect(0, 0, 16, 16);
        graphics.generateTexture(key, 16, 16);
        graphics.destroy();
    }
}
