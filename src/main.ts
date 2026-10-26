import { Game3D } from './3d/Game3D';
import { UIManager } from './ui/UIManager';

window.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('game-container');
  if (!container) return;

  const game = new Game3D(container);
  new UIManager(game);

  // Start initial defense wave
  game.startWave(game.currentWave);
});
