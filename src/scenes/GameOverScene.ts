import Phaser from 'phaser';

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOverScene');
  }

  create(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    this.add.text(width / 2, height / 2 - 40, 'THE CASTLE HAS FALLEN', {
      fontSize: '48px',
      color: '#e53935',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 6,
    }).setOrigin(0.5);

    const restartBtn = this.add.text(width / 2, height / 2 + 50, 'TRY AGAIN', {
      fontSize: '26px',
      color: '#ffffff',
      backgroundColor: '#c62828',
      padding: { x: 28, y: 12 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    restartBtn.on('pointerdown', () => {
      this.scene.start('BattleScene');
    });
  }
}
