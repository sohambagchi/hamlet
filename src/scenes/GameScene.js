import Phaser from 'phaser';
import Hamlet from '../entities/Hamlet';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    create() {
        // Simple background for context
        this.add.grid(0, 0, 1000, 1000, 32, 32, 0xaaaaaa).setAltFillStyle(0xcccccc).setOutlineStyle();

        // Create Player
        // Center of the screen-ish
        this.player = new Hamlet(this, 160, 90);

        // Camera Follow
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setBounds(0, 0, 1000, 1000); // Match grid size
        this.physics.world.setBounds(0, 0, 1000, 1000);

        // Create some dummy NPCs/Enemies to verify textures
        this.add.sprite(200, 100, 'enemy');
        this.add.sprite(120, 150, 'npc_static');
        
        // Debug instructions
        this.add.text(10, 10, 'Arrows to Move', { 
            fontSize: '10px', 
            fill: '#000000',
            fontFamily: 'monospace' 
        }).setScrollFactor(0);
    }

    update() {
        if (this.player) {
            this.player.update();
        }
    }
}
