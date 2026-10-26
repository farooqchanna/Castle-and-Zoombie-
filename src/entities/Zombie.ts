import Phaser from 'phaser';
import { Castle } from './Castle';
import { SoundEffects } from '../systems/SoundEffects';

export type ZombieCategory = 'walker' | 'runner' | 'tank' | 'exploder' | 'siege' | 'boss';

export class Zombie extends Phaser.Physics.Arcade.Sprite {
  public maxHp: number;
  public currentHp: number;
  public speed: number;
  public damage: number;
  public attackRate: number = 1000;
  public lastAttackTime: number = 0;
  public isDead: boolean = false;
  public isAttackingWall: boolean = false;
  public isMarked: boolean = false;
  public zombieType: ZombieCategory;

  // Boss specific
  public isEnraged: boolean = false;
  private bossHealthBarContainer?: Phaser.GameObjects.Container;
  private bossHealthFill?: Phaser.GameObjects.Graphics;

  // Siege specific
  public siegeStopX: number = 0;
  public lastBoulderShotTime: number = 0;

  private targetCastle: Castle;
  private healthBar: Phaser.GameObjects.Graphics;
  private markIcon?: Phaser.GameObjects.Graphics;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    targetCastle: Castle,
    type: ZombieCategory = 'walker',
    waveNumber: number = 1
  ) {
    let texKey = 'tex_zombie';
    if (type === 'runner') texKey = 'tex_zombie_runner';
    else if (type === 'tank') texKey = 'tex_zombie_tank';
    else if (type === 'exploder') texKey = 'tex_zombie_exploder';
    else if (type === 'siege') texKey = 'tex_zombie_siege';
    else if (type === 'boss') texKey = 'tex_boss';

    super(scene, x, y, texKey);

    this.targetCastle = targetCastle;
    this.zombieType = type;

    const waveHpMult = 1 + (waveNumber - 1) * 0.15;
    const waveDmgMult = 1 + (waveNumber - 1) * 0.12;

    switch (type) {
      case 'runner':
        this.maxHp = Math.round(14 * waveHpMult);
        this.speed = 135;
        this.damage = Math.round(4 * waveDmgMult);
        this.attackRate = 750;
        break;
      case 'tank':
        this.maxHp = Math.round(95 * waveHpMult);
        this.speed = 28;
        this.damage = Math.round(18 * waveDmgMult);
        this.attackRate = 1400;
        break;
      case 'exploder':
        this.maxHp = Math.round(32 * waveHpMult);
        this.speed = 65;
        this.damage = 65;
        this.attackRate = 200;
        break;
      case 'siege':
        this.maxHp = Math.round(55 * waveHpMult);
        this.speed = 40;
        this.damage = 18;
        this.attackRate = 3500;
        this.siegeStopX = scene.cameras.main.width - Phaser.Math.Between(130, 220);
        break;
      case 'boss':
        this.maxHp = Math.round(480 * waveHpMult);
        this.speed = 22;
        this.damage = Math.round(40 * waveDmgMult);
        this.attackRate = 1200;
        break;
      default: // 'walker'
        this.maxHp = Math.round(25 * waveHpMult);
        this.speed = 55;
        this.damage = Math.round(6 * waveDmgMult);
        this.attackRate = 1000;
        break;
    }

    this.currentHp = this.maxHp;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setOrigin(0.5, 1);
    this.setVelocityX(-this.speed);

    // Interactive targeting: right click/shift click to mark
    this.setInteractive({ useHandCursor: true });
    this.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.rightButtonDown() || pointer.event.shiftKey) {
        pointer.event.stopPropagation();
        this.setMarked(!this.isMarked);
      }
    });

    // Health bar above head (or boss banner)
    this.healthBar = scene.add.graphics();
    if (type === 'boss') {
      this.createBossHealthOverlay();
    } else {
      this.updateHealthBar();
    }

    // Animation
    if (type === 'exploder') {
      scene.tweens.add({
        targets: this,
        scale: { from: 1, to: 1.15 },
        duration: 300,
        yoyo: true,
        repeat: -1,
      });
    } else {
      scene.tweens.add({
        targets: this,
        angle: { from: -4, to: 4 },
        duration: type === 'runner' ? 180 : type === 'boss' ? 450 : 350,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }
  }

  private createBossHealthOverlay(): void {
    const width = this.scene.cameras.main.width;
    this.bossHealthBarContainer = this.scene.add.container(width / 2, 75);

    const bg = this.scene.add.graphics();
    bg.fillStyle(0x000000, 0.8);
    bg.fillRoundedRect(-220, -14, 440, 28, 6);
    bg.lineStyle(2, 0xd50000, 1);
    bg.strokeRoundedRect(-220, -14, 440, 28, 6);

    this.bossHealthFill = this.scene.add.graphics();

    const title = this.scene.add.text(0, -26, '☠ ANCIENT ZOMBIE OVERLORD ☠', {
      fontSize: '15px',
      color: '#ff5252',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5);

    this.bossHealthBarContainer.add([bg, this.bossHealthFill, title]);
    this.updateBossHealthBar();
  }

  private updateBossHealthBar(): void {
    if (!this.bossHealthFill) return;
    this.bossHealthFill.clear();
    const pct = Math.max(0, this.currentHp / this.maxHp);
    this.bossHealthFill.fillStyle(this.isEnraged ? 0xff1744 : 0x4caf50, 1);
    this.bossHealthFill.fillRoundedRect(-216, -10, 432 * pct, 20, 4);
  }

  public takeDamage(amount: number): boolean {
    if (this.isDead) return false;

    this.currentHp -= amount;

    if (this.zombieType === 'boss') {
      this.updateBossHealthBar();
      // Enrage Phase Check at 50% HP
      if (this.currentHp <= this.maxHp * 0.5 && !this.isEnraged) {
        this.triggerBossEnrage();
      }
    } else {
      this.updateHealthBar();
    }

    this.setTint(0xffffff);
    this.scene.time.delayedCall(70, () => {
      if (!this.isDead) {
        if (this.isEnraged || this.isMarked) {
          this.setTint(0xff1744);
        } else {
          this.clearTint();
        }
      }
    });

    if (this.currentHp <= 0) {
      this.die();
      return true;
    }
    return false;
  }

  private triggerBossEnrage(): void {
    this.isEnraged = true;
    this.setTint(0xff1744);
    this.speed = 46;
    this.setVelocityX(-this.speed);
    this.scene.cameras.main.shake(400, 0.025);

    // Roar text
    const roar = this.scene.add.text(this.x, this.y - 80, 'ROOOAAAARRRR!', {
      fontSize: '22px',
      color: '#ff1744',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5);

    this.scene.tweens.add({
      targets: roar,
      y: roar.y - 30,
      alpha: 0,
      duration: 1000,
      onComplete: () => roar.destroy(),
    });

    // Summon 3 runner minions
    const sceneBattle = this.scene as unknown as {
      zombies?: Phaser.Physics.Arcade.Group;
      totalZombiesToSpawn: number;
    };
    if (sceneBattle.zombies) {
      sceneBattle.totalZombiesToSpawn += 3;
      const groundY = this.scene.cameras.main.height - 90;
      for (let i = 0; i < 3; i++) {
        const minion = new Zombie(
          this.scene,
          this.x + 40 + i * 35,
          groundY,
          this.targetCastle,
          'runner',
          1
        );
        sceneBattle.zombies.add(minion);
      }
    }
  }

  public setMarked(marked: boolean): void {
    this.isMarked = marked;
    if (marked) {
      this.setTint(0xff5252);
      if (!this.markIcon) {
        this.markIcon = this.scene.add.graphics();
        this.markIcon.fillStyle(0xff1744, 1);
        this.markIcon.fillTriangle(0, 0, -6, -10, 6, -10);
      }
    } else {
      this.clearTint();
      if (this.markIcon) {
        this.markIcon.destroy();
        this.markIcon = undefined;
      }
    }
  }

  private updateHealthBar(): void {
    this.healthBar.clear();
    if (this.isDead || this.currentHp >= this.maxHp) return;

    const barW = this.zombieType === 'tank' ? 44 : 28;
    const barH = 4;
    const barX = this.x - barW / 2;
    const barY = this.y - (this.zombieType === 'tank' ? 58 : 46);

    this.healthBar.fillStyle(0x000000, 0.7);
    this.healthBar.fillRect(barX - 1, barY - 1, barW + 2, barH + 2);

    const pct = Math.max(0, this.currentHp / this.maxHp);
    this.healthBar.fillStyle(pct > 0.4 ? 0x4caf50 : 0xe53935, 1);
    this.healthBar.fillRect(barX, barY, barW * pct, barH);
  }

  preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);

    if (this.isDead) return;

    // Siege Zombie long-range catapult behavior
    if (this.zombieType === 'siege') {
      if (this.x <= this.siegeStopX) {
        this.setVelocityX(0);
        this.x = this.siegeStopX;

        if (time - this.lastBoulderShotTime >= this.attackRate) {
          this.lastBoulderShotTime = time;
          this.fireSiegeBoulder();
        }
      }
      return;
    }

    const gateStopX = this.targetCastle.x + 75;
    if (this.x <= gateStopX) {
      if (!this.isAttackingWall) {
        this.isAttackingWall = true;
        this.setVelocityX(0);
        this.x = gateStopX;
      }

      if (this.zombieType === 'exploder') {
        this.die();
        return;
      }

      if (time - this.lastAttackTime >= this.attackRate) {
        this.lastAttackTime = time;
        this.targetCastle.takeDamage(this.damage);

        this.scene.tweens.add({
          targets: this,
          x: gateStopX - 8,
          duration: 90,
          yoyo: true,
        });
      }
    }

    if (this.healthBar && this.currentHp < this.maxHp && this.zombieType !== 'boss') {
      this.updateHealthBar();
    }

    if (this.markIcon) {
      this.markIcon.setPosition(this.x, this.y - 52);
    }
  }

  private fireSiegeBoulder(): void {
    const boulder = this.scene.physics.add.sprite(this.x - 10, this.y - 25, 'tex_boulder');
    const targetX = this.targetCastle.x + 60;
    const targetY = this.scene.cameras.main.height - 90 - 40;

    const angle = Phaser.Math.Angle.Between(boulder.x, boulder.y, targetX, targetY);
    this.scene.physics.velocityFromRotation(angle, 380, boulder.body.velocity);

    this.scene.tweens.add({
      targets: boulder,
      angle: 360,
      duration: 500,
      repeat: -1,
    });

    // Check collision with gate
    this.scene.time.addEvent({
      delay: 50,
      repeat: 60,
      callback: () => {
        if (!boulder.active) return;
        if (boulder.x <= targetX + 15) {
          this.targetCastle.takeDamage(this.damage);
          boulder.destroy();
        }
      },
    });
  }

  public die(): void {
    if (this.isDead) return;
    this.isDead = true;
    this.setVelocity(0, 0);

    if (this.healthBar) {
      this.healthBar.destroy();
    }
    if (this.markIcon) {
      this.markIcon.destroy();
    }
    if (this.bossHealthBarContainer) {
      this.bossHealthBarContainer.destroy();
    }

    if (this.zombieType === 'exploder') {
      this.triggerExplosion();
    }

    this.emit('killed', this);

    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      scaleY: 0.2,
      duration: 350,
      onComplete: () => {
        this.destroy();
      },
    });
  }

  private triggerExplosion(): void {
    SoundEffects.getInstance().playExplosion();
    this.scene.cameras.main.shake(250, 0.02);

    const blast = this.scene.add.graphics();
    blast.fillStyle(0xff3d00, 0.7);
    blast.fillCircle(this.x, this.y - 18, 90);
    blast.fillStyle(0xffff00, 0.9);
    blast.fillCircle(this.x, this.y - 18, 45);

    this.scene.tweens.add({
      targets: blast,
      alpha: 0,
      scale: 1.4,
      duration: 350,
      onComplete: () => blast.destroy(),
    });

    const gateStopX = this.targetCastle.x + 95;
    if (this.x <= gateStopX + 50) {
      this.targetCastle.takeDamage(65);
    }

    const sceneZombies = (this.scene as unknown as { zombies?: Phaser.Physics.Arcade.Group })
      .zombies;
    if (sceneZombies) {
      const others = sceneZombies.getChildren() as Zombie[];
      others.forEach((other) => {
        if (other !== this && other.active && !other.isDead) {
          const dist = Phaser.Math.Distance.Between(this.x, this.y, other.x, other.y);
          if (dist <= 95) {
            other.takeDamage(55);
          }
        }
      });
    }
  }
}
