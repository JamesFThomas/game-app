import Phaser from 'phaser';

export default class MainMenu extends Phaser.Scene {
  constructor() {
    super('MainMenu');
  }

  create() {
    this.music = this.sound.play('music', { loop: true });

    this.sound.play('laugh');

    this.add.image(400, 300, 'background').setScale(2);

    const area = new Phaser.Geom.Rectangle(64, 64, 672, 472);

    this.addGerm(area, 'germ1');
    this.addGerm(area, 'germ2');
    this.addGerm(area, 'germ3');
    this.addGerm(area, 'germ4');

    this.add.shader('goo', 400, 300, 800, 600);

    this.add.image(400, 260, 'assets', 'logo');

    this.add.text(400, 500, 'slime', 'Click to Play', 40).setOrigin(0.5);

    this.input.once('pointerdown', () => {
      this.scene.start('MainGame');
    });
  }

  addGerm(area, animation) {
    const start = area.getRandomPoint();

    const germ = this.add.sprite(start.x, start.y).play(animation).setScale(2);

    const durationX = Phaser.Math.Between(4000, 6000);
    const durationY = durationX + 3000;

    this.tweens.add({
      targets: germ,
      x: {
        getStart: () => germ.x,
        getEnd: () => area.getRandomPoint().x,
        duration: durationX,
        ease: 'Linear',
      },
      y: {
        getStart: () => germ.y,
        getEnd: () => area.getRandomPoint().y,
        duration: durationY,
        ease: 'Linear',
      },
      repeat: -1,
    });
  }
}
