import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const loadingText = this.add.text(width / 2, height / 2 - 20, 'Loading Defense Assets...', {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 2 - 160, height / 2 + 10, 320, 24);

    this.load.on('progress', (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(0x4caf50, 1);
      progressBar.fillRect(width / 2 - 156, height / 2 + 14, 312 * value, 16);
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
      this.scene.start('MenuScene');
    });

    // Generate programmatic placeholder textures if needed
    this.createPlaceholderTextures();
  }

  private createPlaceholderTextures(): void {
    // Castle texture
    const castleGfx = this.make.graphics({ x: 0, y: 0 });
    castleGfx.fillStyle(0x546e7a, 1);
    castleGfx.fillRect(0, 0, 120, 360);
    // Battlements
    castleGfx.fillStyle(0x37474f, 1);
    castleGfx.fillRect(0, 0, 40, 30);
    castleGfx.fillRect(80, 0, 40, 30);
    // Gate
    castleGfx.fillStyle(0x3e2723, 1);
    castleGfx.fillRect(40, 260, 80, 100);
    castleGfx.generateTexture('tex_castle', 120, 360);

    // Arrow texture
    const arrowGfx = this.make.graphics({ x: 0, y: 0 });
    arrowGfx.fillStyle(0xffffff, 1);
    arrowGfx.fillRect(0, 3, 24, 2);
    // Arrowhead
    arrowGfx.fillStyle(0xffb300, 1);
    arrowGfx.fillTriangle(24, 0, 30, 4, 24, 8);
    // Fletching
    arrowGfx.fillStyle(0xe53935, 1);
    arrowGfx.fillRect(0, 1, 6, 6);
    arrowGfx.generateTexture('tex_arrow', 30, 8);

    // Zombie texture
    const zombieGfx = this.make.graphics({ x: 0, y: 0 });
    zombieGfx.fillStyle(0x43a047, 1); // Green body
    zombieGfx.fillRect(6, 12, 20, 28);
    zombieGfx.fillStyle(0x66bb6a, 1); // Head
    zombieGfx.fillCircle(16, 8, 8);
    zombieGfx.fillStyle(0xe53935, 1); // Red glowing eyes
    zombieGfx.fillRect(10, 6, 3, 3);
    zombieGfx.fillRect(16, 6, 3, 3);
    zombieGfx.generateTexture('tex_zombie', 32, 40);

    // Runner texture (leaner, faster)
    const runnerGfx = this.make.graphics({ x: 0, y: 0 });
    runnerGfx.fillStyle(0x8bc34a, 1);
    runnerGfx.fillRect(8, 14, 14, 24);
    runnerGfx.fillStyle(0x9ccc65, 1);
    runnerGfx.fillCircle(15, 8, 7);
    runnerGfx.fillStyle(0xffeb3b, 1);
    runnerGfx.fillRect(11, 7, 3, 3);
    runnerGfx.fillRect(16, 7, 3, 3);
    runnerGfx.generateTexture('tex_zombie_runner', 30, 38);

    // Tank texture (wider, armored)
    const tankGfx = this.make.graphics({ x: 0, y: 0 });
    tankGfx.fillStyle(0x37474f, 1);
    tankGfx.fillRect(2, 10, 44, 40);
    tankGfx.fillStyle(0x546e7a, 1);
    tankGfx.fillCircle(24, 8, 12);
    tankGfx.fillStyle(0xff1744, 1);
    tankGfx.fillRect(18, 6, 4, 4);
    tankGfx.fillRect(26, 6, 4, 4);
    tankGfx.generateTexture('tex_zombie_tank', 48, 50);

    // Exploder texture (bloated, pulsating red)
    const exploderGfx = this.make.graphics({ x: 0, y: 0 });
    exploderGfx.fillStyle(0xd50000, 1);
    exploderGfx.fillCircle(20, 24, 18);
    exploderGfx.fillStyle(0xff5252, 1);
    exploderGfx.fillCircle(20, 10, 8);
    exploderGfx.fillStyle(0xffff00, 1);
    exploderGfx.fillRect(15, 8, 4, 4);
    exploderGfx.fillRect(22, 8, 4, 4);
    exploderGfx.generateTexture('tex_zombie_exploder', 40, 44);

    // Siege Zombie texture
    const siegeGfx = this.make.graphics({ x: 0, y: 0 });
    siegeGfx.fillStyle(0x455a64, 1);
    siegeGfx.fillRect(4, 16, 36, 26);
    siegeGfx.fillStyle(0x78909c, 1);
    siegeGfx.fillCircle(22, 10, 10);
    // Slingshot / catapult arm
    siegeGfx.fillStyle(0x8d6e63, 1);
    siegeGfx.fillRect(28, 4, 8, 28);
    siegeGfx.generateTexture('tex_zombie_siege', 44, 44);

    // Boulder projectile texture
    const boulderGfx = this.make.graphics({ x: 0, y: 0 });
    boulderGfx.fillStyle(0x424242, 1);
    boulderGfx.fillCircle(9, 9, 8);
    boulderGfx.fillStyle(0x616161, 1);
    boulderGfx.fillCircle(7, 7, 5);
    boulderGfx.generateTexture('tex_boulder', 18, 18);

    // Wave Boss texture (Giant 64x76)
    const bossGfx = this.make.graphics({ x: 0, y: 0 });
    bossGfx.fillStyle(0x1b5e20, 1); // Dark monster green
    bossGfx.fillRect(8, 20, 48, 54);
    bossGfx.fillStyle(0x2e7d32, 1); // Large skull
    bossGfx.fillCircle(32, 14, 14);
    // Horns
    bossGfx.fillStyle(0xd50000, 1);
    bossGfx.fillTriangle(20, 12, 12, -4, 24, 6);
    bossGfx.fillTriangle(44, 12, 52, -4, 40, 6);
    // Glowing eyes
    bossGfx.fillStyle(0xffeb3b, 1);
    bossGfx.fillRect(24, 10, 6, 6);
    bossGfx.fillRect(34, 10, 6, 6);
    bossGfx.generateTexture('tex_boss', 64, 76);

    // Coin texture
    const coinGfx = this.make.graphics({ x: 0, y: 0 });
    coinGfx.fillStyle(0xffd54f, 1);
    coinGfx.fillCircle(8, 8, 8);
    coinGfx.fillStyle(0xffb300, 1);
    coinGfx.fillCircle(8, 8, 5);
    coinGfx.generateTexture('tex_coin', 16, 16);

    // Citizen texture
    const citizenGfx = this.make.graphics({ x: 0, y: 0 });
    citizenGfx.fillStyle(0x1e88e5, 1); // Blue tunic
    citizenGfx.fillRect(6, 12, 18, 26);
    citizenGfx.fillStyle(0xffcc80, 1); // Head
    citizenGfx.fillCircle(15, 8, 7);
    citizenGfx.generateTexture('tex_citizen', 30, 38);

    // Cauldron texture
    const cauldronGfx = this.make.graphics({ x: 0, y: 0 });
    cauldronGfx.fillStyle(0x212121, 1);
    cauldronGfx.fillRoundedRect(4, 8, 32, 24, 6);
    cauldronGfx.fillStyle(0xff6f00, 1); // Boiling lava/oil
    cauldronGfx.fillCircle(20, 10, 10);
    cauldronGfx.generateTexture('tex_cauldron', 40, 36);

    // Fire/Oil pool texture
    const firePoolGfx = this.make.graphics({ x: 0, y: 0 });
    firePoolGfx.fillStyle(0xd84315, 0.85);
    firePoolGfx.fillRoundedRect(0, 0, 120, 16, 8);
    firePoolGfx.fillStyle(0xffab00, 0.9);
    firePoolGfx.fillRoundedRect(8, 2, 104, 12, 6);
    firePoolGfx.generateTexture('tex_fire_pool', 120, 16);
  }
}
