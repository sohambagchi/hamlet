import Phaser from 'phaser';
import { StateMachine, State } from '../systems/StateMachine';

class IdleState extends State {
    enter(scene, hamlet) {
        hamlet.setVelocity(0);

        // Play Idle Animation based on last direction
        // Default to south if unknown
        const anim = hamlet.lastAnim || 'hamlet-idle-south';

        // Convert walk/run anim name to idle
        if (anim.includes('north')) hamlet.play('hamlet-idle-north');
        else if (anim.includes('side')) hamlet.play('hamlet-idle-side');
        else hamlet.play('hamlet-idle-south');
    }

    execute(scene, hamlet) {
        const { left, right, up, down } = hamlet.cursors;
        if (left.isDown || right.isDown || up.isDown || down.isDown) {
            hamlet.stateMachine.changeState(new WalkState());
        }
    }
}

class WalkState extends State {
    execute(scene, hamlet) {
        const { left, right, up, down } = hamlet.cursors;

        if (!(left.isDown || right.isDown || up.isDown || down.isDown)) {
            hamlet.stateMachine.changeState(new IdleState());
            return;
        }

        hamlet.setVelocity(0);

        if (left.isDown) {
            hamlet.setVelocityX(-hamlet.speed);
            hamlet.setFlipX(true); // Flip for LEFT
            hamlet.play('hamlet-walk-side', true);
            hamlet.lastAnim = 'hamlet-walk-side';
        } else if (right.isDown) {
            hamlet.setVelocityX(hamlet.speed);
            hamlet.setFlipX(false); // No flip for RIGHT
            hamlet.play('hamlet-walk-side', true);
            hamlet.lastAnim = 'hamlet-walk-side';
        } else if (up.isDown) {
            hamlet.setVelocityY(-hamlet.speed);
            hamlet.play('hamlet-walk-north', true);
            hamlet.lastAnim = 'hamlet-walk-north';
        } else if (down.isDown) {
            hamlet.setVelocityY(hamlet.speed);
            hamlet.play('hamlet-walk-south', true);
            hamlet.lastAnim = 'hamlet-walk-south';
        }

        hamlet.body.velocity.normalize().scale(hamlet.speed);
    }
}

export default class Hamlet extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        // Use unified sprite sheet
        super(scene, x, y, 'hamlet_unified');

        // Add to scene and physics
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Resize body? 64x64 is big. Let's make the hitbox smaller (feet)
        // Assuming sprite is centeredish, maybe 16x16 feet box
        this.body.setSize(16, 16);
        this.body.setOffset(24, 48); // Near bottom center of 64x64

        // Key Config
        this.cursors = scene.input.keyboard.createCursorKeys();

        // Physics Config
        this.setCollideWorldBounds(true);
        this.speed = 100;
        this.lastAnim = 'hamlet-idle-south'; // Track direction

        // State Machine
        this.stateMachine = new StateMachine(new IdleState(), scene, this);

        // Sorting Origin (Feet) - adjust for 64x64 sprite
        // We want the feet anchor to be at the bottom center
        this.setOrigin(0.5, 1);
    }

    update() {
        this.stateMachine.update();

        // Isometric Sorting: Depth = Y
        this.setDepth(this.y);
    }
}
