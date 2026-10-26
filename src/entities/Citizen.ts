import Phaser from 'phaser';
import { CitizenData, CitizenRole, SoldierRank } from '../systems/CitizenManager';
import { Zombie } from './Zombie';
import { Arrow } from './Arrow';
import { Coin } from './Coin';

export type CollectorState = 'IDLE_AT_GATE' | 'SEEKING_COIN' | 'RETREATING';

export class Citizen extends Phaser.Physics.Arcade.Sprite {
  public citizenData: CitizenData;
  public role: CitizenRole;
  public rank: SoldierRank;

  // Soldier stats
  public attackRange: number = 550;
  public attackRate: number = 1200; // ms
  public damage: number = 6;
  public arrowSpeed: number = 650;
  public lastAttackTime: number = 0;
  public isRallied: boolean = false;
  private rallyAura?: Phaser.GameObjects.Graphics;

  // Collector stats & state
  public collectorState: CollectorState = 'IDLE_AT_GATE';
  public moveSpeed: number = 140;
  public gateBaseX: number = 130;
  private targetCoin: Coin | null = null;

  private arrowGroup: Phaser.Physics.Arcade.Group;
  private zombieGroup: Phaser.Physics.Arcade.Group;
  private coinGroup?: Phaser.Physics.Arcade.Group;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    data: CitizenData,
    arrowGroup: Phaser.Physics.Arcade.Group,
    zombieGroup: Phaser.Physics.Arcade.Group,
    coinGroup?: Phaser.Physics.Arcade.Group
  ) {
    super(scene, x, y, 'tex_citizen');

    this.citizenData = data;
    this.role = data.role;
    this.rank = data.rank;
    this.arrowGroup = arrowGroup;
    this.zombieGroup = zombieGroup;
    this.coinGroup = coinGroup;
    this.gateBaseX = x;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setOrigin(0.5, 1);
    this.setupRankStats();
  }

  private setupRankStats(): void {
    if (this.role === 'collector') {
      this.setTint(0xffb74d); // Warm amber for collectors
      this.moveSpeed = 160;
      return;
    }

    switch (this.rank) {
      case 'rookie':
        this.damage = 6;
        this.attackRate = 1200;
        this.attackRange = 550;
        this.setTint(0xffffff);
        break;
      case 'captain':
        this.damage = 14;
        this.attackRate = 900;
        this.attackRange = 700;
        this.setTint(0x42a5f5); // Blue
        break;
      case 'major':
        this.damage = 25;
        this.attackRate = 650;
        this.attackRange = 850;
        this.setTint(0xab47bc); // Purple
        break;
      case 'archer':
        this.damage = 45;
        this.attackRate = 450;
        this.attackRange = 1100;
        this.setTint(0xffca28); // Gold
        break;
    }
  }

  public setRallied(rallied: boolean): void {
    this.isRallied = rallied;
    if (rallied) {
      if (!this.rallyAura) {
        this.rallyAura = this.scene.add.graphics();
        this.rallyAura.lineStyle(2, 0xffd54f, 0.9);
        this.rallyAura.strokeCircle(0, 0, 18);
      }
    } else {
      if (this.rallyAura) {
        this.rallyAura.destroy();
        this.rallyAura = undefined;
      }
    }
  }

  preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);

    if (this.rallyAura) {
      this.rallyAura.setPosition(this.x, this.y - 18);
    }

    if (this.role === 'soldier') {
      this.updateSoldierCombat(time);
    } else if (this.role === 'collector') {
      this.updateCollectorBehavior();
    }
  }

  private updateSoldierCombat(time: number): void {
    // 50% faster if rallied
    let effectiveRate = this.isRallied ? Math.round(this.attackRate * 0.5) : this.attackRate;

    const target = this.findBestTarget();
    if (!target) return;

    // +30% attack speed against marked targets
    if (target.isMarked) {
      effectiveRate = Math.round(effectiveRate * 0.7);
    }

    if (time - this.lastAttackTime < effectiveRate) return;

    this.lastAttackTime = time;
    this.fireAtTarget(target);
  }

  private findBestTarget(): Zombie | null {
    const zombies = this.zombieGroup.getChildren() as Zombie[];
    if (zombies.length === 0) return null;

    const markedTarget = zombies.find(
      (z) => z.active && !z.isDead && z.isMarked && Phaser.Math.Distance.Between(this.x, this.y, z.x, z.y) <= this.attackRange
    );
    if (markedTarget) return markedTarget;

    let closestZombie: Zombie | null = null;
    let shortestDistToGate = Infinity;

    for (const z of zombies) {
      if (!z.active || z.isDead) continue;
      const distFromCitizen = Phaser.Math.Distance.Between(this.x, this.y, z.x, z.y);
      if (distFromCitizen <= this.attackRange) {
        if (z.x < shortestDistToGate) {
          shortestDistToGate = z.x;
          closestZombie = z;
        }
      }
    }

    return closestZombie;
  }

  private fireAtTarget(target: Zombie): void {
    const variance = this.rank === 'rookie' ? Phaser.Math.Between(-15, 15) : 0;

    const arrow = new Arrow(
      this.scene,
      this.x + 8,
      this.y - 18,
      target.x,
      target.y - 20 + variance,
      this.damage,
      this.arrowSpeed,
      false,
      false
    );
    this.arrowGroup.add(arrow);

    this.scene.tweens.add({
      targets: this,
      x: this.x - 3,
      duration: 60,
      yoyo: true,
    });
  }

  private updateCollectorBehavior(): void {
    if (!this.coinGroup) return;

    // Safety check: is any living zombie dangerously close?
    const zombies = this.zombieGroup.getChildren() as Zombie[];
    const threatNearby = zombies.some((z) => z.active && !z.isDead && Math.abs(z.x - this.x) < 80);

    if (threatNearby) {
      this.collectorState = 'RETREATING';
    }

    if (this.collectorState === 'RETREATING') {
      if (this.x > this.gateBaseX) {
        this.setVelocityX(-this.moveSpeed);
        this.setFlipX(true);
      } else {
        this.setVelocityX(0);
        this.setFlipX(false);
        this.collectorState = 'IDLE_AT_GATE';
      }
      return;
    }

    // Search for uncollected coins
    const coins = (this.coinGroup.getChildren() as Coin[]).filter(
      (c) => c.active && !c.isCollected
    );

    if (coins.length === 0) {
      // Return to gate rest spot
      if (this.x > this.gateBaseX) {
        this.setVelocityX(-this.moveSpeed);
        this.setFlipX(true);
      } else {
        this.setVelocityX(0);
        this.setFlipX(false);
        this.collectorState = 'IDLE_AT_GATE';
      }
      this.targetCoin = null;
      return;
    }

    // Find nearest coin
    if (!this.targetCoin || !this.targetCoin.active || this.targetCoin.isCollected) {
      let minDist = Infinity;
      let nearest: Coin | null = null;
      for (const coin of coins) {
        const d = Math.abs(coin.x - this.x);
        if (d < minDist) {
          minDist = d;
          nearest = coin;
        }
      }
      this.targetCoin = nearest;
    }

    if (this.targetCoin) {
      this.collectorState = 'SEEKING_COIN';
      const dist = this.targetCoin.x - this.x;

      if (Math.abs(dist) < 18) {
        // Collect coin!
        this.targetCoin.collect();
        this.targetCoin = null;
        this.setVelocityX(0);
      } else if (dist > 0) {
        this.setVelocityX(this.moveSpeed);
        this.setFlipX(false);
      } else {
        this.setVelocityX(-this.moveSpeed);
        this.setFlipX(true);
      }
    }
  }
}
