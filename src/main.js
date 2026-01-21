import Phaser from 'phaser';
import Preloader from './scenes/Preloader';
import GameScene from './scenes/GameScene';
import './style.css'; // Importing standard vite style to reset it or we can overwrite

const config = {
    type: Phaser.AUTO,
    width: 320,
    height: 180,
    zoom: 4, // 320x180 * 4 = 1280x720
    pixelArt: true,
    parent: 'app', // Vite default template uses <div id="app"></div>
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 }, // Top down / Isometric
            debug: false // Set true to see hitboxes
        }
    },
    scene: [Preloader, GameScene]
};

const game = new Phaser.Game(config);

export default game;