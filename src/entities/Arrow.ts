import Phaser from 'phaser';

export class Arrow extends Phaser.Physics.Arcade.Sprite {
  public damage: number = 15;
  public isPlayerShot: boolean = true;
  public isCritical: boolean = false;
  private groundY: number = 630;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    targetX: number,
    targetY: number,
    damage: number = 15,
    speed: number = 700,
    isPlayerShot: boolean = true,
    isCritical: boolean = false
  ) {
    super(scene, x, y, 'tex_arrow');

    this.damage = damage;
    this.isPlayerShot = isPlayerShot;
    this.isCritical = isCritical;
    this.groundY = scene.cameras.main.height - 90;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Compute firing trajectory angle
    const angle = Phaser.Math.Angle.Between(x, y, targetX, targetY);
    this.setRotation(angle);

    if (this.body) {
      scene.physics.velocityFromRotation(angle, speed, this.body.velocity);
      this.body.setSize(24, 6);
    }

    if (isCritical) {
      this.setTint(0xffd54f);
      this.setScale(1.2);
    }
  }

  preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);

    // If arrow falls below ground level or offscreen, destroy it
    if (this.y >= this.groundY || this.x > this.scene.cameras.main.width + 50 || this.x < -50 || this.y < -50) {
      this.destroy();
    }
  }
}
