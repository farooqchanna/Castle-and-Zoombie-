import Phaser from 'phaser';

export class Castle extends Phaser.GameObjects.Container {
  public maxHealth: number;
  public currentHealth: number;
  public isDestroyed: boolean = false;

  private healthBarBg: Phaser.GameObjects.Graphics;
  private healthBarFill: Phaser.GameObjects.Graphics;
  private healthText: Phaser.GameObjects.Text;
  private castleSprite: Phaser.GameObjects.Sprite;

  constructor(scene: Phaser.Scene, x: number, y: number, initialHp: number = 200) {
    super(scene, x, y);

    this.maxHealth = initialHp;
    this.currentHealth = initialHp;

    // Castle sprite using pre-generated texture
    this.castleSprite = scene.add.sprite(0, 0, 'tex_castle').setOrigin(0.5, 1);
    this.add(this.castleSprite);

    // Health bar background
    this.healthBarBg = scene.add.graphics();
    this.healthBarBg.fillStyle(0x212121, 0.85);
    this.healthBarBg.fillRect(-60, -385, 120, 14);
    this.healthBarBg.lineStyle(2, 0x424242, 1);
    this.healthBarBg.strokeRect(-60, -385, 120, 14);
    this.add(this.healthBarBg);

    // Health bar fill
    this.healthBarFill = scene.add.graphics();
    this.add(this.healthBarFill);

    // Health text
    this.healthText = scene.add.text(0, -378, `${this.currentHealth} / ${this.maxHealth}`, {
      fontSize: '11px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    this.add(this.healthText);

    this.updateHealthBar();

    scene.add.existing(this);
  }

  public takeDamage(amount: number): void {
    if (this.isDestroyed) return;

    this.currentHealth = Math.max(0, this.currentHealth - amount);
    this.updateHealthBar();

    // Damage flash effect
    this.scene.tweens.add({
      targets: this.castleSprite,
      tint: 0xff5252,
      duration: 80,
      yoyo: true,
      onComplete: () => {
        this.castleSprite.clearTint();
      },
    });

    if (this.currentHealth <= 0) {
      this.isDestroyed = true;
      this.emit('destroyed');
    }
  }

  public repair(amount: number): void {
    if (this.isDestroyed) return;
    this.currentHealth = Math.min(this.maxHealth, this.currentHealth + amount);
    this.updateHealthBar();
  }

  public setMaxHealth(newMax: number): void {
    const diff = newMax - this.maxHealth;
    this.maxHealth = newMax;
    this.currentHealth += Math.max(0, diff);
    this.updateHealthBar();
  }

  private updateHealthBar(): void {
    this.healthBarFill.clear();
    const pct = Math.max(0, this.currentHealth / this.maxHealth);

    // Change color depending on health percentage
    let fillColor = 0x4caf50; // Green
    if (pct < 0.3) {
      fillColor = 0xe53935; // Red
    } else if (pct < 0.6) {
      fillColor = 0xfbc02d; // Yellow
    }

    this.healthBarFill.fillStyle(fillColor, 1);
    this.healthBarFill.fillRect(-58, -383, 116 * pct, 10);

    this.healthText.setText(`${Math.ceil(this.currentHealth)} / ${this.maxHealth}`);
  }
}
