import Phaser from 'phaser';

export default class Preloader extends Phaser.Scene {
    constructor() {
        super('Preloader');
    }

    preload() {
        // Create simple graphics for placeholders
        const graphics = this.make.graphics();

        // 1. Hamlet (Player) - 16x16 Black Square (or Dark Blue)
        graphics.fillStyle(0x000000, 1); // Black
        graphics.fillRect(0, 0, 16, 16);
        graphics.generateTexture('hamlet', 16, 16);
        graphics.clear();

        // 2. Floor Tile - 32x32 Grey Isometric Tile (or just a square for now, we'll project later)
        // For now, let's just make a 32x32 grey square
        graphics.fillStyle(0x7f8c8d, 1); // Grey
        graphics.fillRect(0, 0, 32, 32);
        // Add a border
        graphics.lineStyle(2, 0x2c3e50, 1);
        graphics.strokeRect(0, 0, 32, 32);
        graphics.generateTexture('floor', 32, 32);
        graphics.clear();

        // 3. Wall/Obstacle - 32x32 Reddish
        graphics.fillStyle(0xc0392b, 1);
        graphics.fillRect(0, 0, 32, 32);
        graphics.generateTexture('wall', 32, 32);
        graphics.clear();

        // 4. Hamlet Unified Spritesheet
        this.load.spritesheet('hamlet_unified', 'assets/sprites/characters/hamlet/hamlet_unified.png', {
            frameWidth: 64,
            frameHeight: 64
        });
    }

    create() {
        // Define Animations
        // Grid: 6 cols x 4 rows
        // Row 0: Idle N[0], Idle S[1], Idle Si[2], Walk N1[3], Walk S1[4], Walk Si1[5]
        // Row 1: Walk N2[6], Walk S2[7], Walk Si2[8], Run N1[9], Run S1[10], Run Si1[11]
        // Row 2: Run N2[12], Run S2[13], Run Si2[14]...

        const anims = this.anims;

        // Idle
        anims.create({ key: 'hamlet-idle-north', frames: this.anims.generateFrameNumbers('hamlet_unified', { frames: [0] }), frameRate: 1, repeat: -1 });
        anims.create({ key: 'hamlet-idle-south', frames: this.anims.generateFrameNumbers('hamlet_unified', { frames: [1] }), frameRate: 1, repeat: -1 });
        anims.create({ key: 'hamlet-idle-side', frames: this.anims.generateFrameNumbers('hamlet_unified', { frames: [2] }), frameRate: 1, repeat: -1 });

        // Walk (Looping 2 frames)
        anims.create({ key: 'hamlet-walk-north', frames: this.anims.generateFrameNumbers('hamlet_unified', { frames: [3, 6] }), frameRate: 6, repeat: -1 });
        anims.create({ key: 'hamlet-walk-south', frames: this.anims.generateFrameNumbers('hamlet_unified', { frames: [4, 7] }), frameRate: 6, repeat: -1 });
        anims.create({ key: 'hamlet-walk-side', frames: this.anims.generateFrameNumbers('hamlet_unified', { frames: [5, 8] }), frameRate: 6, repeat: -1 });

        // Run (Looping 2 frames)
        anims.create({ key: 'hamlet-run-north', frames: this.anims.generateFrameNumbers('hamlet_unified', { frames: [9, 12] }), frameRate: 8, repeat: -1 });
        anims.create({ key: 'hamlet-run-south', frames: this.anims.generateFrameNumbers('hamlet_unified', { frames: [10, 13] }), frameRate: 8, repeat: -1 });
        anims.create({ key: 'hamlet-run-side', frames: this.anims.generateFrameNumbers('hamlet_unified', { frames: [11, 14] }), frameRate: 8, repeat: -1 });

        // Once textures are generated, start the GameScene
        this.scene.start('GameScene');
    }
}
