import Phaser from 'phaser';

export default class Hamlet extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'hamlet');

        // Add to scene and enable physics
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Core Configuration
        this.setOrigin(0.5, 1); // Anchor at feet for isometric sorting
        this.setCollideWorldBounds(true);
        this.body.setSize(12, 8); // Small hitbox at feet
        this.body.setOffset(2, 8);

        // Properties
        this.speed = 80; // Pixels per second
        this.currentState = 'EXPLORE'; // 'EXPLORE', 'COMBAT', 'DIALOGUE'
        
        // Input keys
        this.cursors = scene.input.keyboard.createCursorKeys();
        
        // "Verbal Fencing" Hook
        // this.dialogueTarget = null;
    }

    update() {
        if (this.currentState === 'EXPLORE') {
            this.handleMovement();
        } else if (this.currentState === 'COMBAT') {
            // TODO: Handle combat logic
        } else if (this.currentState === 'DIALOGUE') {
            // TODO: Handle dialogue input (Verbal Fencing)
            this.setVelocity(0, 0);
        }
    }

    handleMovement() {
        const { left, right, up, down } = this.cursors;
        let velX = 0;
        let velY = 0;

        // Basic 8-way input
        if (left.isDown) velX -= 1;
        if (right.isDown) velX += 1;
        if (up.isDown) velY -= 1;
        if (down.isDown) velY += 1;

        // Normalize vector
        const length = Math.sqrt(velX * velX + velY * velY);
        if (length > 0) {
            velX /= length;
            velY /= length;
            
            // Isometric Transformation roughly applied to velocity
            // In pure iso: Y movement is half X. But here we usually just move 
            // naturally and let the art sell the perspective.
            // However, to mimic 2:1 isometric movement feel:
            // Moving 'up' in keypress corresponds to Up-Right or Up-Left visually?
            // Standard top-down movement is usually fine for 2.5D if the speed is adjusted.
            // Let's stick to standard normalized movement for now, as it feels best to play.
            
            this.setVelocity(velX * this.speed, velY * this.speed);
        } else {
            this.setVelocity(0, 0);
        }
    }
    
    // Hook for state transitions
    enterDialogueState(target) {
        this.currentState = 'DIALOGUE';
        this.dialogueTarget = target;
        // Trigger UI opening here
    }

    exitDialogueState() {
        this.currentState = 'EXPLORE';
        this.dialogueTarget = null;
    }
}
