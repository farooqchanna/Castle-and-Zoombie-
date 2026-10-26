import Phaser from 'phaser';
import { gameConfig } from './config';
import { BootScene } from './scenes/BootScene';
import { MenuScene } from './scenes/MenuScene';
import { CastleScene } from './scenes/CastleScene';
import { BattleScene } from './scenes/BattleScene';
import { PerkScene } from './scenes/PerkScene';
import { GameOverScene } from './scenes/GameOverScene';

window.addEventListener('load', () => {
  const config: Phaser.Types.Core.GameConfig = {
    ...gameConfig,
    scene: [
      BootScene,
      MenuScene,
      CastleScene,
      BattleScene,
      PerkScene,
      GameOverScene,
    ],
  };

  new Phaser.Game(config);
});
