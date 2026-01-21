import Phaser from 'phaser';
import Hamlet from '../entities/Hamlet';
import { InteractionSystem } from '../systems/InteractionSystem';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    create() {
        // 1. Setup World Bounds (640x360 = 2 screens width)
        this.physics.world.setBounds(0, 0, 640, 360);
        this.cameras.main.setBounds(0, 0, 640, 360);
        this.cameras.main.setBackgroundColor('#34495e');

        // 2. Interaction System
        this.interactionSystem = new InteractionSystem(this);
        this.interactives = this.add.group(); // Group for interactive objects

        // 3. Create Player (Center of screen 1)
        this.player = new Hamlet(this, 160, 90);
        this.cameras.main.startFollow(this.player);

        // 4. Floor (Visual only, behind everything)
        // Expanding floor to cover the new world bounds
        const gridSize = 32;
        for (let x = 0; x < 20; x++) {
            for (let y = 0; y < 12; y++) {
                this.add.image(x * gridSize, y * gridSize, 'floor').setOrigin(0, 0).setDepth(-1000); // Way back
            }
        }

        // 5. Walls (Interactive & Sorting)
        // Note: Origin (0.5, 1) to match Player's feet sorting
        // Need to offset position slightly because Image origin changed from (0,0) to top-left
        // to (0.5, 1) bottom-center. 
        // 64, 64 (top-left) -> Center-Bottom equivalent: 64 + 16(half-width), 64 + 32(height) = 80, 96

        const wall1 = this.add.image(80, 96, 'wall').setOrigin(0.5, 1);
        const wall2 = this.add.image(112, 96, 'wall').setOrigin(0.5, 1);

        this.interactives.add(wall1);
        this.interactives.add(wall2);

        // Important: Static objects need depth set once? Or should we auto-sort everything?
        // For static objects that don't move, setting depth = y once is fine.
        wall1.setDepth(wall1.y);
        wall2.setDepth(wall2.y);

        // 6. Input
        this.interactKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }

    update(time, delta) {
        if (this.player) {
            this.player.update();
        }

        // Handle Interaction
        if (Phaser.Input.Keyboard.JustDown(this.interactKey)) {
            const target = this.interactionSystem.getClosestInteractive(this.player, this.interactives);
            if (target) {
                console.log("Interacted with object at:", target.x, target.y);
                // Visual feedback (flash)
                this.tweens.add({
                    targets: target,
                    alpha: 0.5,
                    duration: 100,
                    yoyo: true
                });
            }
        }
    }
}
