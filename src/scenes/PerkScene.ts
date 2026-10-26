import Phaser from 'phaser';
import { PerkManager } from '../systems/PerkManager';
import { Perk } from '../data/perks';

export class PerkScene extends Phaser.Scene {
  private transitionData: Record<string, unknown> = {};

  constructor() {
    super('PerkScene');
  }

  init(data?: Record<string, unknown>): void {
    if (data) {
      this.transitionData = data;
    }
  }

  create(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Dim background
    const bg = this.add.graphics();
    bg.fillStyle(0x0a0e17, 0.92);
    bg.fillRect(0, 0, width, height);

    // Title banner
    this.add.text(width / 2, 80, 'VICTORY SPOILS — CHOOSE A PERK', {
      fontSize: '32px',
      color: '#ffca28',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 5,
    }).setOrigin(0.5);

    this.add.text(width / 2, 120, 'Select one blessing to empower your defenses for future waves', {
      fontSize: '16px',
      color: '#b0bec5',
      fontStyle: 'italic',
    }).setOrigin(0.5);

    // Pick 3 random perks
    const perks = PerkManager.getInstance().getRandomSelection(3);
    const cardW = 280;
    const cardH = 340;
    const startX = (width - (3 * cardW + 2 * 35)) / 2;
    const cardY = height * 0.52;

    perks.forEach((perk, index) => {
      const cardX = startX + index * (cardW + 35) + cardW / 2;
      this.renderPerkCard(cardX, cardY, cardW, cardH, perk);
    });
  }

  private renderPerkCard(x: number, y: number, w: number, h: number, perk: Perk): void {
    const card = this.add.container(x, y);

    let borderColor = 0x64b5f6;
    if (perk.rarity === 'epic') borderColor = 0xba68c8;
    else if (perk.rarity === 'rare') borderColor = 0xffd54f;

    const bg = this.add.graphics();
    bg.fillStyle(0x1e272e, 0.95);
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, 16);
    bg.lineStyle(3, borderColor, 1);
    bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 16);

    const iconText = this.add.text(0, -90, perk.icon, {
      fontSize: '54px',
    }).setOrigin(0.5);

    const rarityBadge = this.add.text(0, -35, perk.rarity.toUpperCase(), {
      fontSize: '12px',
      color: `#${borderColor.toString(16)}`,
      fontStyle: 'bold',
    }).setOrigin(0.5);

    const nameText = this.add.text(0, 0, perk.name, {
      fontSize: '20px',
      color: '#ffffff',
      fontStyle: 'bold',
      align: 'center',
      wordWrap: { width: w - 40 },
    }).setOrigin(0.5);

    const descText = this.add.text(0, 70, perk.description, {
      fontSize: '13px',
      color: '#cfd8dc',
      align: 'center',
      wordWrap: { width: w - 40 },
      lineSpacing: 4,
    }).setOrigin(0.5);

    // Choose Button
    const chooseBtnBg = this.add.graphics();
    chooseBtnBg.fillStyle(0x2e7d32, 1);
    chooseBtnBg.fillRoundedRect(-75, 120, 150, 36, 8);

    const chooseText = this.add.text(0, 138, 'SELECT PERK', {
      fontSize: '14px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    card.add([bg, iconText, rarityBadge, nameText, descText, chooseBtnBg, chooseText]);
    card.setSize(w, h);
    card.setInteractive({ useHandCursor: true });

    card.on('pointerover', () => {
      this.tweens.add({
        targets: card,
        scale: 1.05,
        duration: 150,
      });
    });

    card.on('pointerout', () => {
      this.tweens.add({
        targets: card,
        scale: 1,
        duration: 150,
      });
    });

    card.on('pointerdown', () => {
      PerkManager.getInstance().addPerk(perk.id);

      this.cameras.main.flash(350, 255, 255, 255);
      this.time.delayedCall(300, () => {
        this.scene.start('CastleScene', this.transitionData);
      });
    });
  }
}
