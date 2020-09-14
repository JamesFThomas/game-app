import Phaser from 'phaser';
import 'react-toastify/dist/ReactToastify.css';
import background from '../assets/img/Space.jpg';
import logo from '../assets/img/GTL G.png';

class GameOverScene extends Phaser.Scene {
  constructor() {
    super('gameOver');
  }

  init(data) {
    this.score = data.score;
  }

  preload() {
    this.load.image('background', background);
    this.load.image('logo', logo);
  }

  create() {
    window.idGame = 1;
    window.score = this.score;
    window.submitted = false;
    this.cursors = this.input.keyboard.createCursorKeys();
    this.add.image(0, 0, 'background').setOrigin(0, 0).setScale(0.6);
    this.add.image(400, 200, 'logo').setScale(2);
    this.add.text(250, 300, ` \n Your Score: ${this.score} \n \n Play Again??? \n`, {
      fontSize: '32px',
      fill: '#FF0000',
      fontStyle: 'bold',
      align: 'center',
    }).setInteractive({ useHandCursor: true }).on('pointerdown', () => {
      this.gameOver = false;
      this.score = 0;
      this.scene.start('PlayScene');
    });
  }
}

export default GameOverScene;
