import Phaser from 'phaser';
import { SaveManager } from '../systems/SaveManager';
import { EconomyManager } from '../systems/EconomyManager';
import { CitizenManager } from '../systems/CitizenManager';
import { PerkManager } from '../systems/PerkManager';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Background gradient
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1a237e, 0x1a237e, 0x0d47a1, 0x000000, 1);
    bg.fillRect(0, 0, width, height);

    // Title
    this.add.text(width / 2, height * 0.24, 'ZOMBIE CASTLE DEFENSE', {
      fontSize: '52px',
      color: '#ffca28',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 8,
    }).setOrigin(0.5);

    this.add.text(width / 2, height * 0.33, 'Defend • Train Citizens • Upgrade Fortress', {
      fontSize: '20px',
      color: '#e0e0e0',
      fontStyle: 'italic',
    }).setOrigin(0.5);

    const hasSavedGame = SaveManager.getInstance().hasSave();
    const saveData = SaveManager.getInstance().loadGame();

    if (hasSavedGame && saveData) {
      // Continue Button
      const continueBtn = this.createButton(
        width / 2,
        height * 0.52,
        `CONTINUE (Wave ${saveData.wave})`,
        0x2e7d32,
        0x66bb6a,
        () => {
          // Restore game state
          EconomyManager.getInstance().setCoins(saveData.coins);
          CitizenManager.getInstance().citizens = saveData.citizens;
          CitizenManager.getInstance().maxCitizens = saveData.maxCitizens;
          PerkManager.getInstance().reset();
          saveData.perks.forEach((p) => PerkManager.getInstance().addPerk(p));

          this.cameras.main.fade(300, 0, 0, 0);
          this.time.delayedCall(300, () => {
            this.scene.start('BattleScene', {
              wave: saveData.wave,
              arrowDamage: saveData.arrowDamage,
              wallHp: saveData.wallHp,
              wallMaxHp: saveData.wallMaxHp,
            });
          });
        }
      );

      // New Game Button
      this.createButton(
        width / 2,
        height * 0.66,
        'NEW GAME',
        0x37474f,
        0x546e7a,
        () => {
          SaveManager.getInstance().clearSave();
          EconomyManager.getInstance().reset();
          CitizenManager.getInstance().citizens = [
            { id: 'cit_1', name: 'Alden', role: 'soldier', rank: 'rookie' },
          ];
          CitizenManager.getInstance().maxCitizens = 3;
          PerkManager.getInstance().reset();

          this.cameras.main.fade(300, 0, 0, 0);
          this.time.delayedCall(300, () => {
            this.scene.start('BattleScene', { wave: 1 });
          });
        }
      );

      continueBtn.setScale(1.03);
    } else {
      // Start Game Button
      this.createButton(
        width / 2,
        height * 0.58,
        'START DEFENSE',
        0x2e7d32,
        0x66bb6a,
        () => {
          SaveManager.getInstance().clearSave();
          EconomyManager.getInstance().reset();
          PerkManager.getInstance().reset();

          this.cameras.main.fade(300, 0, 0, 0);
          this.time.delayedCall(300, () => {
            this.scene.start('BattleScene', { wave: 1 });
          });
        }
      );
    }

    // Version label
    this.add.text(width / 2, height - 25, 'v1.0.0 — Phaser 3 • LocalStorage Save System Active', {
      fontSize: '13px',
      color: '#757575',
    }).setOrigin(0.5);
  }

  private createButton(
    x: number,
    y: number,
    text: string,
    bgColor: number,
    strokeColor: number,
    onClick: () => void
  ): Phaser.GameObjects.Container {
    const btn = this.add.container(x, y);

    const bg = this.add.graphics();
    bg.fillStyle(bgColor, 1);
    bg.fillRoundedRect(-140, -30, 280, 60, 14);
    bg.lineStyle(3, strokeColor, 1);
    bg.strokeRoundedRect(-140, -30, 280, 60, 14);

    const label = this.add.text(0, 0, text, {
      fontSize: '22px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    btn.add([bg, label]);
    btn.setSize(280, 60);
    btn.setInteractive({ useHandCursor: true });

    btn.on('pointerover', () => btn.setScale(1.05));
    btn.on('pointerout', () => btn.setScale(1));
    btn.on('pointerdown', onClick);

    return btn;
  }
}
