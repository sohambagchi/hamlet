export class InteractionSystem {
    constructor(scene) {
        this.scene = scene;
        this.interactionRadius = 32; // Pixels
    }

    getClosestInteractive(player, interactives) {
        let closest = null;
        let closestDist = Infinity;

        interactives.children.iterate((child) => {
            if (!child.active) return;

            const dist = Phaser.Math.Distance.Between(player.x, player.y, child.x, child.y);
            if (dist < this.interactionRadius && dist < closestDist) {
                closest = child;
                closestDist = dist;
            }
        });

        return closest;
    }
}
