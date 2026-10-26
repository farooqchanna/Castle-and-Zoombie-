import Phaser from 'phaser';
import { EconomyManager } from '../systems/EconomyManager';
import { CitizenManager } from '../systems/CitizenManager';
import { SaveManager } from '../systems/SaveManager';
import { PerkManager } from '../systems/PerkManager';

interface UpgradeItem {
  id: string;
  name: string;
  description: string;
  cost: number;
  level: number;
  action: () => void;
}

export class CastleScene extends Phaser.Scene {
  public nextWave: number = 2;
  public playerArrowDamage: number = 15;
  public playerFireRate: number = 280;
  public wallHp: number = 200;
  public wallMaxHp: number = 200;

  // Upgrade levels
  private arrowUpgradeLevel: number = 1;
  private wallUpgradeLevel: number = 1;
  private bowUpgradeLevel: number = 1;

  private coinText!: Phaser.GameObjects.Text;
  private statsText!: Phaser.GameObjects.Text;

  constructor() {
    super('CastleScene');
  }

  init(data?: {
    completedWave?: number;
    arrowDamage?: number;
    wallHp?: number;
    wallMaxHp?: number;
  }): void {
    if (data?.completedWave) this.nextWave = data.completedWave + 1;
    if (data?.arrowDamage) this.playerArrowDamage = data.arrowDamage;
    if (data?.wallHp !== undefined) this.wallHp = data.wallHp;
    if (data?.wallMaxHp !== undefined) this.wallMaxHp = data.wallMaxHp;
  }

  create(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Background gradient
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1a237e, 0x1a237e, 0x121824, 0x0a0e17, 1);
    bg.fillRect(0, 0, width, height);

    // Title & Header
    this.add.text(width / 2, 45, 'CASTLE FORTIFICATIONS — PREPARATION PHASE', {
      fontSize: '28px',
      color: '#ffca28',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 5,
    }).setOrigin(0.5);

    this.add.text(width / 2, 80, `Prepare your defenses for Wave ${this.nextWave}`, {
      fontSize: '18px',
      color: '#90caf9',
      fontStyle: 'italic',
    }).setOrigin(0.5);

    // HUD: Coin Counter in Top Left
    const coinBg = this.add.graphics();
    coinBg.fillStyle(0x000000, 0.7);
    coinBg.fillRoundedRect(30, 25, 140, 44, 10);
    coinBg.lineStyle(2, 0xffd54f, 0.9);
    coinBg.strokeRoundedRect(30, 25, 140, 44, 10);

    this.add.sprite(55, 47, 'tex_coin').setScale(1.5);
    this.coinText = this.add.text(80, 47, `${EconomyManager.getInstance().getCoins()}`, {
      fontSize: '22px',
      color: '#ffd54f',
      fontStyle: 'bold',
    }).setOrigin(0, 0.5);

    EconomyManager.getInstance().on('coins-changed', (coins: number) => {
      if (this.coinText && this.coinText.active) {
        this.coinText.setText(`${coins}`);
      }
    });

    // Castle Visual Preview on Left
    this.createCastlePreview(width * 0.22, height * 0.52);

    // Citizen Roster Role Management Panel (Bottom Left)
    this.createRosterPanel(width * 0.22, height * 0.77);

    // Upgrade Cards Grid on Right
    this.createUpgradeCards(width * 0.44, height * 0.22);

    // Start Next Wave Button at Bottom
    this.createStartWaveButton(width / 2, height - 60);

    // Auto-save on entering Build Phase
    this.persistCurrentProgress();
  }

  private createCastlePreview(x: number, y: number): void {
    const previewContainer = this.add.container(x, y);

    const baseBox = this.add.graphics();
    baseBox.fillStyle(0x1e272e, 0.8);
    baseBox.fillRoundedRect(-140, -180, 280, 360, 16);
    baseBox.lineStyle(2, 0x37474f, 1);
    baseBox.strokeRoundedRect(-140, -180, 280, 360, 16);

    const castleSpr = this.add.sprite(0, 110, 'tex_castle').setScale(0.85).setOrigin(0.5, 1);

    const label = this.add.text(0, -150, 'CASTLE STATUS', {
      fontSize: '18px',
      color: '#eceff1',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.statsText = this.add.text(0, -90, this.getStatsDisplay(), {
      fontSize: '14px',
      color: '#b0bec5',
      align: 'center',
      lineSpacing: 8,
    }).setOrigin(0.5);

    previewContainer.add([baseBox, castleSpr, label, this.statsText]);
  }

  private getStatsDisplay(): string {
    const citMgr = CitizenManager.getInstance();
    const soldiers = citMgr.getCitizens().filter((c) => c.role === 'soldier').length;
    const collectors = citMgr.getCitizens().filter((c) => c.role === 'collector').length;

    return [
      `Wall Integrity: ${Math.ceil(this.wallHp)} / ${this.wallMaxHp}`,
      `Player Arrow Damage: ${this.playerArrowDamage}`,
      `Bow Fire Rate: ${(1000 / this.playerFireRate).toFixed(1)} shots/s`,
      `Defenders: ${soldiers} Soldiers • ${collectors} Collectors`,
      `Population: ${citMgr.getCitizens().length} / ${citMgr.maxCitizens}`,
      `Incoming Wave: ${this.nextWave}`,
    ].join('\n');
  }

  private updateStatsDisplay(): void {
    if (this.statsText && this.statsText.active) {
      this.statsText.setText(this.getStatsDisplay());
    }
  }

  private createRosterPanel(x: number, y: number): void {
    const container = this.add.container(x, y);
    const citMgr = CitizenManager.getInstance();
    const citizens = citMgr.getCitizens();

    const bg = this.add.graphics();
    bg.fillStyle(0x1a2332, 0.95);
    bg.fillRoundedRect(-140, -55, 280, 110, 12);
    bg.lineStyle(2, 0x37474f, 1);
    bg.strokeRoundedRect(-140, -55, 280, 110, 12);

    const title = this.add.text(0, -42, 'CITIZEN ASSIGNMENTS (Click to Toggle)', {
      fontSize: '11px',
      color: '#90caf9',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    container.add([bg, title]);

    citizens.forEach((cit, idx) => {
      if (idx > 2) return; // Show up to 3 quick toggles
      const rowY = -18 + idx * 26;

      const roleColor = cit.role === 'soldier' ? '#81c784' : '#ffb74d';
      const rowText = this.add.text(0, rowY, `${cit.name} [${cit.role.toUpperCase()}] (${cit.rank})`, {
        fontSize: '12px',
        color: roleColor,
        backgroundColor: '#263238',
        padding: { x: 8, y: 3 },
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });

      rowText.on('pointerdown', () => {
        const nextRole = cit.role === 'soldier' ? 'collector' : 'soldier';
        citMgr.setRole(cit.id, nextRole);
        this.updateStatsDisplay();
        this.scene.restart({
          completedWave: this.nextWave - 1,
          arrowDamage: this.playerArrowDamage,
          wallHp: this.wallHp,
          wallMaxHp: this.wallMaxHp,
        });
      });

      container.add(rowText);
    });
  }

  private createUpgradeCards(startX: number, startY: number): void {
    const upgrades: UpgradeItem[] = [
      {
        id: 'arrow_dmg',
        name: 'Sharpen Arrows',
        description: '+5 Arrow Damage',
        cost: 20 * this.arrowUpgradeLevel,
        level: this.arrowUpgradeLevel,
        action: () => {
          this.playerArrowDamage += 5;
          this.arrowUpgradeLevel++;
          this.updateStatsDisplay();
        },
      },
      {
        id: 'wall_hp',
        name: 'Reinforce Walls',
        description: '+50 Max Wall Integrity',
        cost: 25 * this.wallUpgradeLevel,
        level: this.wallUpgradeLevel,
        action: () => {
          this.wallMaxHp += 50;
          this.wallHp += 50;
          this.wallUpgradeLevel++;
          this.updateStatsDisplay();
        },
      },
      {
        id: 'repair_wall',
        name: 'Repair Gate',
        description: 'Restore missing wall health',
        cost: Math.max(10, Math.ceil((this.wallMaxHp - this.wallHp) * 0.3)),
        level: 1,
        action: () => {
          this.wallHp = this.wallMaxHp;
          this.updateStatsDisplay();
        },
      },
      {
        id: 'bow_rate',
        name: 'Recurve Bow',
        description: '+12% Faster Fire Rate',
        cost: 30 * this.bowUpgradeLevel,
        level: this.bowUpgradeLevel,
        action: () => {
          this.playerFireRate = Math.max(120, Math.round(this.playerFireRate * 0.88));
          this.bowUpgradeLevel++;
          this.updateStatsDisplay();
        },
      },
      {
        id: 'hire_citizen',
        name: 'Recruit Citizen',
        description: '+1 Soldier Defender',
        cost: 45,
        level: CitizenManager.getInstance().getCitizens().length,
        action: () => {
          const success = CitizenManager.getInstance().hireCitizen('soldier');
          if (!success) {
            this.showToast('Housing limit reached! Upgrade Quarters.');
          } else {
            this.updateStatsDisplay();
          }
        },
      },
      {
        id: 'expand_house',
        name: 'Expand Quarters',
        description: '+2 Citizen Population Cap',
        cost: 60,
        level: 1,
        action: () => {
          CitizenManager.getInstance().upgradeMaxCapacity(2);
          this.updateStatsDisplay();
        },
      },
    ];

    const cardW = 300;
    const cardH = 95;
    const gapX = 320;
    const gapY = 110;

    upgrades.forEach((upg, index) => {
      const col = index % 2;
      const row = Math.floor(index / 2);
      const cardX = startX + col * gapX;
      const cardY = startY + row * gapY;

      this.renderUpgradeCard(cardX, cardY, cardW, cardH, upg);
    });
  }

  private renderUpgradeCard(
    x: number,
    y: number,
    w: number,
    h: number,
    upgrade: UpgradeItem
  ): void {
    const card = this.add.container(x, y);

    const bg = this.add.graphics();
    bg.fillStyle(0x263238, 0.9);
    bg.fillRoundedRect(0, 0, w, h, 12);
    bg.lineStyle(2, 0x455a64, 1);
    bg.strokeRoundedRect(0, 0, w, h, 12);

    const title = this.add.text(16, 14, upgrade.name, {
      fontSize: '17px',
      color: '#ffffff',
      fontStyle: 'bold',
    });

    const desc = this.add.text(16, 38, upgrade.description, {
      fontSize: '13px',
      color: '#90a4ae',
    });

    const buyBtn = this.add.container(w - 95, h / 2);
    const btnBg = this.add.graphics();
    const canAfford = EconomyManager.getInstance().getCoins() >= upgrade.cost;

    btnBg.fillStyle(canAfford ? 0x2e7d32 : 0x424242, 1);
    btnBg.fillRoundedRect(-10, -20, 95, 40, 8);

    const btnText = this.add.text(37, 0, `🪙 ${upgrade.cost}`, {
      fontSize: '14px',
      color: canAfford ? '#ffd54f' : '#9e9e9e',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    buyBtn.add([btnBg, btnText]);
    buyBtn.setSize(95, 40);
    buyBtn.setInteractive({ useHandCursor: canAfford });

    buyBtn.on('pointerdown', () => {
      if (upgrade.id === 'repair_wall' && this.wallHp >= this.wallMaxHp) {
        this.showToast('Gate already at full health!');
        return;
      }

      if (EconomyManager.getInstance().spendCoins(upgrade.cost)) {
        upgrade.action();
        this.showToast(`Upgraded: ${upgrade.name}!`);

        // Refresh CastleScene to update prices
        this.scene.restart({
          completedWave: this.nextWave - 1,
          arrowDamage: this.playerArrowDamage,
          wallHp: this.wallHp,
          wallMaxHp: this.wallMaxHp,
        });
      } else {
        this.showToast('Not enough coins!');
      }
    });

    card.add([bg, title, desc, buyBtn]);
  }

  private persistCurrentProgress(): void {
    SaveManager.getInstance().saveGame({
      wave: this.nextWave,
      coins: EconomyManager.getInstance().getCoins(),
      wallHp: this.wallHp,
      wallMaxHp: this.wallMaxHp,
      arrowDamage: this.playerArrowDamage,
      citizens: CitizenManager.getInstance().getCitizens(),
      maxCitizens: CitizenManager.getInstance().maxCitizens,
      perks: PerkManager.getInstance().getActivePerkIds(),
    });
  }

  private showToast(msg: string): void {
    const width = this.cameras.main.width;
    const toast = this.add.text(width / 2, 125, msg, {
      fontSize: '15px',
      color: '#ffffff',
      backgroundColor: '#212121',
      padding: { x: 16, y: 8 },
    }).setOrigin(0.5);

    this.tweens.add({
      targets: toast,
      y: 110,
      alpha: 0,
      duration: 1000,
      ease: 'Power1',
      onComplete: () => toast.destroy(),
    });
  }

  private createStartWaveButton(x: number, y: number): void {
    const btn = this.add.container(x, y);

    const btnBg = this.add.graphics();
    btnBg.fillStyle(0x2e7d32, 1);
    btnBg.fillRoundedRect(-150, -26, 300, 52, 14);
    btnBg.lineStyle(3, 0x66bb6a, 1);
    btnBg.strokeRoundedRect(-150, -26, 300, 52, 14);

    const btnText = this.add.text(0, 0, `START WAVE ${this.nextWave}`, {
      fontSize: '22px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5);

    btn.add([btnBg, btnText]);
    btn.setSize(300, 52);
    btn.setInteractive({ useHandCursor: true });

    btn.on('pointerover', () => {
      btn.setScale(1.04);
    });

    btn.on('pointerout', () => {
      btn.setScale(1);
    });

    btn.on('pointerdown', () => {
      this.cameras.main.fade(300, 0, 0, 0);
      this.time.delayedCall(300, () => {
        this.scene.start('BattleScene', {
          wave: this.nextWave,
          arrowDamage: this.playerArrowDamage,
          wallHp: this.wallHp,
          wallMaxHp: this.wallMaxHp,
        });
      });
    });
  }
}
