import Phaser from 'phaser';
import { Castle } from '../entities/Castle';
import { Arrow } from '../entities/Arrow';
import { Zombie } from '../entities/Zombie';
import { Coin } from '../entities/Coin';
import { Citizen } from '../entities/Citizen';
import { CitizenManager } from '../systems/CitizenManager';
import { EconomyManager } from '../systems/EconomyManager';
import { PerkManager } from '../systems/PerkManager';
import { SoundEffects } from '../systems/SoundEffects';

export class BattleScene extends Phaser.Scene {
  public castle!: Castle;
  public arrows!: Phaser.Physics.Arcade.Group;
  public zombies!: Phaser.Physics.Arcade.Group;
  public coins!: Phaser.Physics.Arcade.Group;
  public citizens: Citizen[] = [];

  private lastPlayerShotTime: number = 0;
  public playerFireRate: number = 280;
  public playerArrowDamage: number = 15;
  public playerArrowSpeed: number = 750;

  public wallHp: number = 200;
  public wallMaxHp: number = 200;

  // Wave tracking
  public currentWave: number = 1;
  public totalZombiesToSpawn: number = 6;
  public zombiesSpawnedCount: number = 0;
  public zombiesKilledCount: number = 0;
  public isWaveEnding: boolean = false;
  public spawnTimer?: Phaser.Time.TimerEvent;

  // Abilities & Cooldowns
  public hornCooldownTime: number = 30000; // 30s
  public lastHornUseTime: number = -30000;
  public isRallyActive: boolean = false;
  private hornBtnText!: Phaser.GameObjects.Text;
  private hornBtnBg!: Phaser.GameObjects.Graphics;

  // Mobile Auto-Aim Assist
  public isAutoAimEnabled: boolean = true;
  private autoAimBtnText!: Phaser.GameObjects.Text;
  private autoAimBtnBg!: Phaser.GameObjects.Graphics;

  // Boiling Oil Cauldron
  public oilCooldownTime: number = 20000; // 20s
  public lastOilUseTime: number = -20000;
  private cauldronSprite!: Phaser.GameObjects.Sprite;
  private cauldronStatusText!: Phaser.GameObjects.Text;
  private activeOilPool?: Phaser.GameObjects.Sprite;

  private coinText!: Phaser.GameObjects.Text;

  constructor() {
    super('BattleScene');
  }

  init(data?: { wave?: number; arrowDamage?: number; wallHp?: number; wallMaxHp?: number }): void {
    if (data?.wave) this.currentWave = data.wave;
    if (data?.arrowDamage) this.playerArrowDamage = data.arrowDamage;
    if (data?.wallHp !== undefined) this.wallHp = data.wallHp;
    if (data?.wallMaxHp !== undefined) this.wallMaxHp = data.wallMaxHp;
    this.zombiesSpawnedCount = 0;
    this.zombiesKilledCount = 0;
    this.isWaveEnding = false;
    this.totalZombiesToSpawn = 6 + (this.currentWave - 1) * 3;
  }

  create(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Background Sky
    const sky = this.add.graphics();
    sky.fillGradientStyle(0x0a192f, 0x0a192f, 0x172a45, 0x203a43, 1);
    sky.fillRect(0, 0, width, height);

    // Stars
    const stars = this.add.graphics();
    stars.fillStyle(0xffffff, 0.7);
    for (let i = 0; i < 45; i++) {
      const sx = Phaser.Math.Between(0, width);
      const sy = Phaser.Math.Between(0, height - 200);
      const sr = Phaser.Math.FloatBetween(0.8, 2.0);
      stars.fillCircle(sx, sy, sr);
    }

    // Ground Plane
    const ground = this.add.graphics();
    const groundY = height - 90;
    ground.fillStyle(0x3e2723, 1);
    ground.fillRect(0, groundY, width, 90);
    ground.fillStyle(0x2e7d32, 1);
    ground.fillRect(0, groundY, width, 12);

    // Physics Groups
    this.arrows = this.physics.add.group({
      classType: Arrow,
      runChildUpdate: true,
    });

    this.zombies = this.physics.add.group({
      classType: Zombie,
      runChildUpdate: true,
    });

    this.coins = this.physics.add.group({
      classType: Coin,
      runChildUpdate: true,
    });

    // Castle Entity on Left Wall
    this.castle = new Castle(this, 100, groundY, this.wallMaxHp);
    if (this.wallHp < this.wallMaxHp) {
      this.castle.currentHealth = this.wallHp;
      this.castle.takeDamage(0); // Trigger healthbar update
    }

    // Mount Boiling Oil Cauldron above Gate
    this.createBoilingOilCauldron(this.castle.x + 35, groundY - 115);

    // Spawn Stationed Soldier and Collector Citizens
    this.citizens = [];
    const roster = CitizenManager.getInstance().getCitizens();
    let soldierSlotIndex = 0;
    let collectorSlotIndex = 0;

    roster.forEach((cData) => {
      if (cData.role === 'soldier') {
        const citX = this.castle.x - 30 + soldierSlotIndex * 26;
        const citY = groundY - 260;
        const cit = new Citizen(this, citX, citY, cData, this.arrows, this.zombies, this.coins);
        this.citizens.push(cit);
        soldierSlotIndex++;
      } else if (cData.role === 'collector') {
        const citX = this.castle.x + 35 + collectorSlotIndex * 20;
        const citY = groundY;
        const cit = new Citizen(this, citX, citY, cData, this.arrows, this.zombies, this.coins);
        this.citizens.push(cit);
        collectorSlotIndex++;
      }
    });

    this.castle.on('destroyed', () => {
      this.cameras.main.shake(500, 0.02);
      this.cameras.main.fade(800, 180, 0, 0);
      this.time.delayedCall(800, () => {
        this.scene.start('GameOverScene');
      });
    });

    // Arrow vs Zombie Overlap
    this.physics.add.overlap(
      this.arrows,
      this.zombies,
      (arrowObj, zombieObj) => {
        this.handleArrowZombieOverlap(
          arrowObj as unknown as Arrow,
          zombieObj as unknown as Zombie
        );
      },
      undefined,
      this
    );

    // Player Shooting Input
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      const now = this.time.now;
      if (now - this.lastPlayerShotTime < this.playerFireRate) return;
      if (this.castle.isDestroyed || this.isWaveEnding) return;

      this.lastPlayerShotTime = now;
      this.shootPlayerArrow(pointer.x, pointer.y);
    });

    // Start Spawning Waves
    this.startWaveSpawner();

    // Wave indicator banner
    this.add.text(width / 2, 40, `WAVE ${this.currentWave} — DEFEND THE CASTLE`, {
      fontSize: '26px',
      color: '#ffca28',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 5,
    }).setOrigin(0.5);

    // HUD: Coin Counter in Top Left
    const coinBg = this.add.graphics();
    coinBg.fillStyle(0x000000, 0.65);
    coinBg.fillRoundedRect(20, 20, 130, 42, 10);
    coinBg.lineStyle(2, 0xffd54f, 0.8);
    coinBg.strokeRoundedRect(20, 20, 130, 42, 10);

    this.add.sprite(44, 41, 'tex_coin').setScale(1.4);
    this.coinText = this.add.text(68, 41, `${EconomyManager.getInstance().getCoins()}`, {
      fontSize: '20px',
      color: '#ffd54f',
      fontStyle: 'bold',
    }).setOrigin(0, 0.5);

    EconomyManager.getInstance().on('coins-changed', (coins: number) => {
      if (this.coinText && this.coinText.active) {
        this.coinText.setText(`${coins}`);
      }
    });

    // HUD: War Horn Button (Top Right)
    this.createWarHornButton(width - 110, 41);

    // HUD: Mobile Auto-Aim Toggle (Next to Horn)
    this.createAutoAimButton(width - 270, 41);

    // Controls hint
    this.add.text(width / 2, height - 30, 'Click anywhere to shoot • Click / hover coins to collect', {
      fontSize: '15px',
      color: '#cfd8dc',
    }).setOrigin(0.5);

    this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
      if (this.spawnTimer) {
        this.spawnTimer.destroy();
      }
    });
  }

  private createBoilingOilCauldron(x: number, y: number): void {
    this.cauldronSprite = this.add.sprite(x, y, 'tex_cauldron').setInteractive({ useHandCursor: true });

    this.cauldronStatusText = this.add.text(x, y - 24, 'OIL READY', {
      fontSize: '10px',
      color: '#ffd54f',
      fontStyle: 'bold',
      backgroundColor: '#000000',
      padding: { x: 4, y: 2 },
    }).setOrigin(0.5);

    // Floating bob animation when ready
    this.tweens.add({
      targets: this.cauldronSprite,
      y: y - 3,
      duration: 600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    this.cauldronSprite.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      pointer.event.stopPropagation();
      this.triggerBoilingOil();
    });

    // Couldron cooldown checker timer
    this.time.addEvent({
      delay: 500,
      loop: true,
      callback: () => {
        if (!this.cauldronStatusText || !this.cauldronStatusText.active) return;
        const elapsed = this.time.now - this.lastOilUseTime;
        if (elapsed < this.oilCooldownTime) {
          const remainingSec = Math.ceil((this.oilCooldownTime - elapsed) / 1000);
          this.cauldronStatusText.setText(`OIL (${remainingSec}s)`);
          this.cauldronStatusText.setColor('#9e9e9e');
          this.cauldronSprite.setTint(0x757575);
        } else {
          this.cauldronStatusText.setText('OIL READY');
          this.cauldronStatusText.setColor('#ffd54f');
          this.cauldronSprite.clearTint();
        }
      },
    });
  }

  private triggerBoilingOil(): void {
    const now = this.time.now;
    if (now - this.lastOilUseTime < this.oilCooldownTime) return;

    this.lastOilUseTime = now;
    SoundEffects.getInstance().playOilSizzle();

    // Tip cauldron forward animation
    this.tweens.add({
      targets: this.cauldronSprite,
      angle: 65,
      duration: 250,
      yoyo: true,
      onYoyo: () => {
        this.spawnOilFireZone();
      },
    });
  }

  private spawnOilFireZone(): void {
    const groundY = this.cameras.main.height - 90;
    const poolX = this.castle.x + 115;

    if (this.activeOilPool) {
      this.activeOilPool.destroy();
    }

    this.activeOilPool = this.add.sprite(poolX, groundY - 6, 'tex_fire_pool');
    this.cameras.main.shake(250, 0.01);

    // Fire damage ticks every 300ms for 4 seconds (13 ticks)
    let ticksRemaining = 13;
    const fireInterval = this.time.addEvent({
      delay: 300,
      repeat: ticksRemaining - 1,
      callback: () => {
        ticksRemaining--;

        const zombies = this.zombies.getChildren() as Zombie[];
        zombies.forEach((z) => {
          if (z.active && !z.isDead && Math.abs(z.x - poolX) < 70) {
            const wasKilled = z.takeDamage(18);
            this.showFloatingDamage(z.x, z.y - 30, 18, false);

            if (wasKilled) {
              this.zombiesKilledCount++;
              const coin = new Coin(this, z.x, z.y - 15, 5);
              this.coins.add(coin);
              this.checkWaveProgress();
            }
          }
        });

        if (ticksRemaining <= 0 && this.activeOilPool) {
          this.tweens.add({
            targets: this.activeOilPool,
            alpha: 0,
            duration: 400,
            onComplete: () => {
              if (this.activeOilPool) {
                this.activeOilPool.destroy();
                this.activeOilPool = undefined;
              }
            },
          });
        }
      },
    });

    this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
      fireInterval.destroy();
    });
  }

  private createAutoAimButton(x: number, y: number): void {
    const btn = this.add.container(x, y);

    this.autoAimBtnBg = this.add.graphics();
    this.updateAutoAimBtnVisual();

    this.autoAimBtnText = this.add.text(0, 0, '🎯 AUTO-AIM: ON', {
      fontSize: '13px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    btn.add([this.autoAimBtnBg, this.autoAimBtnText]);
    btn.setSize(140, 42);
    btn.setInteractive({ useHandCursor: true });

    btn.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      pointer.event.stopPropagation();
      this.isAutoAimEnabled = !this.isAutoAimEnabled;
      this.autoAimBtnText.setText(this.isAutoAimEnabled ? '🎯 AUTO-AIM: ON' : '🎯 AUTO-AIM: OFF');
      this.updateAutoAimBtnVisual();
    });
  }

  private updateAutoAimBtnVisual(): void {
    this.autoAimBtnBg.clear();
    const bgColor = this.isAutoAimEnabled ? 0x1565c0 : 0x424242;
    const strokeColor = this.isAutoAimEnabled ? 0x42a5f5 : 0x757575;
    this.autoAimBtnBg.fillStyle(bgColor, 1);
    this.autoAimBtnBg.fillRoundedRect(-70, -21, 140, 42, 10);
    this.autoAimBtnBg.lineStyle(2, strokeColor, 1);
    this.autoAimBtnBg.strokeRoundedRect(-70, -21, 140, 42, 10);
  }

  private createWarHornButton(x: number, y: number): void {
    const btn = this.add.container(x, y);

    this.hornBtnBg = this.add.graphics();
    this.hornBtnBg.fillStyle(0xd84315, 1);
    this.hornBtnBg.fillRoundedRect(-80, -21, 160, 42, 10);
    this.hornBtnBg.lineStyle(2, 0xff8a65, 1);
    this.hornBtnBg.strokeRoundedRect(-80, -21, 160, 42, 10);

    this.hornBtnText = this.add.text(0, 0, '📯 RALLY HORN', {
      fontSize: '14px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    btn.add([this.hornBtnBg, this.hornBtnText]);
    btn.setSize(160, 42);
    btn.setInteractive({ useHandCursor: true });

    btn.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      pointer.event.stopPropagation();
      this.activateRallyHorn();
    });

    // Update horn cooldown display every second
    this.time.addEvent({
      delay: 500,
      loop: true,
      callback: () => {
        if (!this.hornBtnText || !this.hornBtnText.active) return;
        const elapsed = this.time.now - this.lastHornUseTime;
        if (elapsed < this.hornCooldownTime) {
          const remainingSec = Math.ceil((this.hornCooldownTime - elapsed) / 1000);
          this.hornBtnText.setText(`📯 HORN (${remainingSec}s)`);
          this.hornBtnBg.clear();
          this.hornBtnBg.fillStyle(0x424242, 0.8);
          this.hornBtnBg.fillRoundedRect(-80, -21, 160, 42, 10);
        } else {
          this.hornBtnText.setText('📯 RALLY HORN');
          this.hornBtnBg.clear();
          this.hornBtnBg.fillStyle(0xd84315, 1);
          this.hornBtnBg.fillRoundedRect(-80, -21, 160, 42, 10);
          this.hornBtnBg.lineStyle(2, 0xff8a65, 1);
          this.hornBtnBg.strokeRoundedRect(-80, -21, 160, 42, 10);
        }
      },
    });
  }

  private activateRallyHorn(): void {
    const now = this.time.now;
    if (now - this.lastHornUseTime < this.hornCooldownTime) return;

    this.lastHornUseTime = now;
    this.isRallyActive = true;

    // Play Horn Sound
    SoundEffects.getInstance().playWarHorn();

    // Golden camera flash & shake
    this.cameras.main.flash(400, 255, 215, 0, false);

    // Apply rally to all citizens
    this.citizens.forEach((cit) => cit.setRallied(true));

    // 5-second rally duration
    this.time.delayedCall(5000, () => {
      this.isRallyActive = false;
      this.citizens.forEach((cit) => cit.setRallied(false));
    });
  }

  private handleArrowZombieOverlap(arrow: Arrow, zombie: Zombie): void {
    if (!arrow.active || !zombie.active || zombie.isDead) return;

    const dmg = arrow.damage;
    const isCrit = arrow.isCritical;

    arrow.destroy();

    // Hit sound
    SoundEffects.getInstance().playArrowHit();

    // Hit spark particle burst
    this.spawnHitSparks(zombie.x, zombie.y - 20, isCrit);

    const wasKilled = zombie.takeDamage(dmg);
    this.showFloatingDamage(zombie.x, zombie.y - 30, dmg, isCrit);

    if (isCrit && !wasKilled) {
      zombie.setMarked(true);
    }

    if (wasKilled) {
      this.zombiesKilledCount++;

      // Drop coins: bosses drop 8-10 coins, normal zombies drop 1-2
      const coinCount = zombie.zombieType === 'boss' ? Phaser.Math.Between(8, 12) : Phaser.Math.Between(1, 2);
      for (let i = 0; i < coinCount; i++) {
        const coin = new Coin(this, zombie.x + Phaser.Math.Between(-20, 20), zombie.y - 15, 5);
        this.coins.add(coin);
      }

      this.checkWaveProgress();
    }
  }

  private spawnHitSparks(x: number, y: number, isCrit: boolean): void {
    const sparks = this.add.graphics();
    const count = isCrit ? 8 : 4;
    const color = isCrit ? 0xffeb3b : 0xffffff;

    sparks.fillStyle(color, 1);
    for (let i = 0; i < count; i++) {
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const dist = Phaser.Math.Between(6, 18);
      sparks.fillCircle(x + Math.cos(angle) * dist, y + Math.sin(angle) * dist, isCrit ? 2.5 : 1.5);
    }

    this.tweens.add({
      targets: sparks,
      alpha: 0,
      duration: 180,
      onComplete: () => sparks.destroy(),
    });
  }

  private showFloatingDamage(x: number, y: number, damage: number, isCrit: boolean): void {
    const text = this.add.text(x, y, isCrit ? `${damage}!` : `${damage}`, {
      fontSize: isCrit ? '18px' : '14px',
      color: isCrit ? '#ffd54f' : '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5);

    this.tweens.add({
      targets: text,
      y: y - 28,
      alpha: 0,
      duration: 600,
      ease: 'Power1',
      onComplete: () => {
        text.destroy();
      },
    });
  }

  private checkWaveProgress(): void {
    if (
      this.zombiesSpawnedCount >= this.totalZombiesToSpawn &&
      this.zombiesKilledCount >= this.totalZombiesToSpawn &&
      !this.isWaveEnding
    ) {
      this.isWaveEnding = true;
      this.handleWaveVictory();
    }
  }

  private handleWaveVictory(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    SoundEffects.getInstance().playVictoryFanfare();

    const victoryBanner = this.add.text(width / 2, height / 2 - 40, 'WAVE CLEARED!', {
      fontSize: '44px',
      color: '#4caf50',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 6,
    }).setOrigin(0.5).setScale(0);

    this.tweens.add({
      targets: victoryBanner,
      scale: 1,
      duration: 500,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.time.delayedCall(1200, () => {
          this.scene.start('PerkScene', {
            completedWave: this.currentWave,
            arrowDamage: this.playerArrowDamage,
            wallHp: this.castle.currentHealth,
            wallMaxHp: this.castle.maxHealth,
          });
        });
      },
    });
  }

  private startWaveSpawner(): void {
    const groundY = this.cameras.main.height - 90;

    // Check if this is a Boss wave (Wave 5, 10, etc.)
    const isBossWave = this.currentWave % 5 === 0;

    if (isBossWave) {
      // Spawn Boss with accompaniment
      this.time.delayedCall(2000, () => {
        if (this.castle.isDestroyed || this.isWaveEnding) return;
        const boss = new Zombie(
          this,
          this.cameras.main.width + 60,
          groundY,
          this.castle,
          'boss',
          this.currentWave
        );
        this.zombies.add(boss);
        this.zombiesSpawnedCount++;
      });
    }

    this.spawnTimer = this.time.addEvent({
      delay: Math.max(900, 1900 - this.currentWave * 90),
      repeat: this.totalZombiesToSpawn - (isBossWave ? 2 : 1),
      callback: () => {
        if (this.castle.isDestroyed || this.isWaveEnding) return;

        const spawnX = this.cameras.main.width + Phaser.Math.Between(10, 60);

        let type: 'walker' | 'runner' | 'tank' | 'exploder' | 'siege' = 'walker';
        const roll = Math.random();

        if (this.currentWave >= 4 && roll < 0.18) {
          type = 'siege';
        } else if (this.currentWave >= 3 && roll < 0.38) {
          type = 'exploder';
        } else if (this.currentWave >= 2 && roll < 0.62) {
          type = 'runner';
        } else if (this.currentWave >= 3 && roll < 0.8) {
          type = 'tank';
        }

        const zombie = new Zombie(
          this,
          spawnX,
          groundY,
          this.castle,
          type,
          this.currentWave
        );
        this.zombies.add(zombie);
        this.zombiesSpawnedCount++;
      },
    });
  }

  public shootPlayerArrow(targetX: number, targetY: number): void {
    const shootOriginX = this.castle.x + 35;
    const shootOriginY = this.cameras.main.height - 90 - 240;

    let finalTargetX = targetX;
    let finalTargetY = targetY;

    // Mobile Auto-Aim: Snap to nearest high priority zombie if enabled
    if (this.isAutoAimEnabled) {
      const zombies = (this.zombies.getChildren() as Zombie[]).filter(
        (z) => z.active && !z.isDead
      );
      if (zombies.length > 0) {
        // Find marked target or closest zombie to gate
        const marked = zombies.find((z) => z.isMarked);
        const targetZombie = marked || zombies.reduce((prev, curr) => (curr.x < prev.x ? curr : prev));
        finalTargetX = targetZombie.x;
        finalTargetY = targetZombie.y - 20;
      }
    }

    SoundEffects.getInstance().playArrowShoot();

    const isCrit = Math.random() < 0.15;
    const dmg = isCrit ? Math.round(this.playerArrowDamage * 1.8) : this.playerArrowDamage;

    const arrow = new Arrow(
      this,
      shootOriginX,
      shootOriginY,
      finalTargetX,
      finalTargetY,
      dmg,
      this.playerArrowSpeed,
      true,
      isCrit
    );
    this.arrows.add(arrow);

    // Perk: Triple Volley
    if (PerkManager.getInstance().hasPerk('volley_shot') && Math.random() < 0.28) {
      const topArrow = new Arrow(
        this,
        shootOriginX,
        shootOriginY,
        finalTargetX,
        finalTargetY - 35,
        Math.round(dmg * 0.75),
        this.playerArrowSpeed,
        true,
        false
      );
      const btmArrow = new Arrow(
        this,
        shootOriginX,
        shootOriginY,
        finalTargetX,
        finalTargetY + 35,
        Math.round(dmg * 0.75),
        this.playerArrowSpeed,
        true,
        false
      );
      this.arrows.add(topArrow);
      this.arrows.add(btmArrow);
    }
  }
}
