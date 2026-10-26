import Phaser from 'phaser';
import { EconomyManager } from '../systems/EconomyManager';
import { PerkManager } from '../systems/PerkManager';
import { SoundEffects } from '../systems/SoundEffects';

export class Coin extends Phaser.Physics.Arcade.Sprite {
  public value: number = 5;
  public isCollected: boolean = false;
  private groundY: number;

  constructor(scene: Phaser.Scene, x: number, y: number, value: number = 5) {
    super(scene, x, y, 'tex_coin');

    this.value = value;
    this.groundY = scene.cameras.main.height - 90;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setInteractive({ useHandCursor: true });

    // Initial pop physics
    const vx = Phaser.Math.Between(-70, 70);
    const vy = Phaser.Math.Between(-140, -90);
    this.setVelocity(vx, vy);

    // Coin shine/spin tween
    scene.tweens.add({
      targets: this,
      scaleX: 0.2,
      duration: 250,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Pointer click pickup
    this.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      pointer.event.stopPropagation();
      this.collect();
    });

    // Hover pickup convenience
    this.on('pointerover', () => {
      this.collect();
    });
  }

  preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);

    if (this.isCollected) return;

    // Simulate resting on the ground
    if (this.y >= this.groundY - 8) {
      this.y = this.groundY - 8;
      this.setVelocity(0, 0);
    } else {
      // Light gravity pull
      this.setVelocityY((this.body?.velocity.y || 0) + 9.8);
    }
  }

  public collect(): void {
    if (this.isCollected) return;
    this.isCollected = true;
    this.disableInteractive();

    if (this.body) {
      this.body.stop();
    }

    // Apply greedy_scavenger perk bonus
    const finalVal = PerkManager.getInstance().hasPerk('greedy_scavenger') ? this.value + 3 : this.value;

    // Add gold to shared manager
    EconomyManager.getInstance().addCoins(finalVal);
    SoundEffects.getInstance().playCoinPickup();

    // Floating text + flying animation
    const text = this.scene.add.text(this.x, this.y - 10, `+${finalVal}`, {
      fontSize: '13px',
      color: '#ffd54f',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5);

    this.scene.tweens.add({
      targets: text,
      y: text.y - 25,
      alpha: 0,
      duration: 500,
      onComplete: () => text.destroy(),
    });

    // Fly toward HUD top-left
    this.scene.tweens.add({
      targets: this,
      x: 60,
      y: 40,
      scale: 0.3,
      alpha: 0.4,
      duration: 350,
      ease: 'Quad.easeIn',
      onComplete: () => {
        this.destroy();
      },
    });
  }
}
