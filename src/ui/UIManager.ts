import confetti from 'canvas-confetti';
import { Game3D } from '../3d/Game3D';
import { EconomyManager } from '../systems/EconomyManager';
import { CitizenManager } from '../systems/CitizenManager';
import { PerkManager } from '../systems/PerkManager';
import { Perk } from '../data/perks';
import { SoundEffects } from '../systems/SoundEffects';
import { SaveManager } from '../systems/SaveManager';

export class UIManager {
  private game: Game3D;
  private root: HTMLElement;

  // UI Layers
  private hudElement!: HTMLElement;
  private perkModalElement!: HTMLElement;
  private prepScreenElement!: HTMLElement;
  private gameOverElement!: HTMLElement;
  private crosshairElement!: HTMLElement;

  constructor(game: Game3D) {
    this.game = game;

    // Create main UI root container
    this.root = document.createElement('div');
    this.root.className = 'game-ui-root';
    document.body.appendChild(this.root);

    this.injectStyles();
    this.createHud();
    this.createCrosshair();
    this.createPerkModal();
    this.createPrepScreen();
    this.createGameOverScreen();

    // Hook game callbacks
    this.game.onWaveComplete = () => this.handleWaveVictory();
    this.game.onGameOver = () => this.handleGameOver();
    this.game.onStateChange = () => this.updateHud();

    // Hook Economy listener
    EconomyManager.getInstance().on('coins-changed', () => this.updateHud());

    // Start HUD loop for cooldown bars
    this.startHudLoop();
  }

  private injectStyles(): void {
    const style = document.createElement('style');
    style.textContent = `
      .game-ui-root {
        position: absolute;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        pointer-events: none;
        user-select: none;
        font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif;
        color: #ffffff;
        z-index: 10;
        overflow: hidden;
      }

      .game-ui-interactive {
        pointer-events: auto;
      }

      /* HUD Overlays */
      .hud-top-bar {
        position: absolute;
        top: 16px;
        left: 20px;
        right: 20px;
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
      }

      .hud-card {
        background: rgba(14, 20, 32, 0.75);
        backdrop-filter: blur(8px);
        border: 1px solid rgba(255, 215, 0, 0.35);
        border-radius: 12px;
        padding: 10px 18px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .gold-badge {
        font-size: 22px;
        font-weight: 800;
        color: #ffd700;
        text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
      }

      .health-container {
        display: flex;
        flex-direction: column;
        gap: 4px;
        min-width: 180px;
      }

      .health-label {
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 1px;
        color: #90caf9;
        text-transform: uppercase;
      }

      .health-bar-bg {
        width: 100%;
        height: 12px;
        background: rgba(0, 0, 0, 0.7);
        border-radius: 6px;
        overflow: hidden;
        border: 1px solid rgba(255, 255, 255, 0.2);
      }

      .health-bar-fill {
        height: 100%;
        width: 100%;
        background: linear-gradient(90deg, #4caf50, #81c784);
        transition: width 0.2s ease, background 0.3s;
      }

      .wave-banner {
        text-align: center;
      }

      .wave-title {
        font-size: 24px;
        font-weight: 900;
        color: #ffca28;
        letter-spacing: 2px;
        text-shadow: 0 0 12px rgba(255, 202, 40, 0.6), 0 2px 4px #000;
      }

      .wave-sub {
        font-size: 13px;
        color: #cfd8dc;
        font-weight: 600;
        margin-top: 2px;
      }

      /* Action Buttons */
      .hud-actions {
        display: flex;
        gap: 10px;
      }

      .skill-btn {
        background: linear-gradient(135deg, rgba(26, 35, 126, 0.8), rgba(13, 71, 161, 0.8));
        border: 1px solid rgba(255, 215, 0, 0.5);
        border-radius: 10px;
        padding: 8px 14px;
        color: #fff;
        font-weight: 700;
        font-size: 13px;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2px;
        transition: all 0.15s ease;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
      }

      .skill-btn:hover {
        transform: translateY(-2px);
        border-color: #ffd700;
        box-shadow: 0 6px 20px rgba(255, 215, 0, 0.4);
      }

      .skill-btn:active {
        transform: translateY(1px);
      }

      .skill-btn.disabled {
        opacity: 0.5;
        cursor: not-allowed;
        filter: grayscale(0.8);
      }

      .skill-key {
        font-size: 9px;
        color: #ffd54f;
        background: rgba(0, 0, 0, 0.5);
        padding: 1px 5px;
        border-radius: 4px;
      }

      .bottom-controls-hint {
        position: absolute;
        bottom: 16px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.6);
        padding: 6px 18px;
        border-radius: 20px;
        font-size: 12px;
        color: #eceff1;
        letter-spacing: 0.5px;
        border: 1px solid rgba(255, 255, 255, 0.15);
      }

      /* Crosshair Reticle for Marksman View */
      .marksman-crosshair {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 32px;
        height: 32px;
        pointer-events: none;
        display: none;
      }

      .crosshair-line {
        position: absolute;
        background: rgba(255, 235, 59, 0.85);
      }
      .crosshair-h { top: 15px; left: 0; width: 32px; height: 2px; }
      .crosshair-v { top: 0; left: 15px; width: 2px; height: 32px; }
      .crosshair-dot {
        position: absolute;
        top: 14px;
        left: 14px;
        width: 4px;
        height: 4px;
        background: #ff1744;
        border-radius: 50%;
      }

      /* Modal Overlay */
      .modal-backdrop {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(4, 8, 16, 0.85);
        backdrop-filter: blur(10px);
        display: flex;
        justify-content: center;
        align-items: center;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.3s ease;
      }

      .modal-backdrop.active {
        opacity: 1;
        pointer-events: auto;
      }

      .modal-box {
        background: linear-gradient(180deg, #162032 0%, #0c121e 100%);
        border: 2px solid #ffca28;
        border-radius: 20px;
        padding: 32px;
        max-width: 850px;
        width: 90%;
        box-shadow: 0 16px 64px rgba(0, 0, 0, 0.9), 0 0 32px rgba(255, 202, 40, 0.25);
        text-align: center;
      }

      /* Perk Cards Grid */
      .perk-cards-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 20px;
        margin: 28px 0;
      }

      .perk-card {
        background: rgba(26, 37, 58, 0.85);
        border: 2px solid #546e7a;
        border-radius: 14px;
        padding: 24px 16px;
        display: flex;
        flex-direction: column;
        align-items: center;
        cursor: pointer;
        transition: all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      }

      .perk-card:hover {
        transform: translateY(-8px) scale(1.03);
        border-color: #ffd54f;
        box-shadow: 0 12px 30px rgba(255, 213, 79, 0.35);
        background: rgba(38, 54, 84, 0.95);
      }

      .perk-card.epic {
        border-color: #ff5252;
        box-shadow: 0 0 15px rgba(255, 82, 82, 0.2);
      }
      .perk-card.epic:hover {
        border-color: #ff1744;
        box-shadow: 0 12px 32px rgba(255, 23, 68, 0.45);
      }

      .perk-icon {
        font-size: 48px;
        margin-bottom: 12px;
      }

      .perk-name {
        font-size: 18px;
        font-weight: 800;
        color: #ffea00;
        margin-bottom: 8px;
      }

      .perk-desc {
        font-size: 13px;
        color: #cfd8dc;
        line-height: 1.4;
      }

      .perk-rarity {
        font-size: 10px;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 1.5px;
        padding: 2px 8px;
        border-radius: 8px;
        margin-top: 14px;
      }
      .rarity-common { background: rgba(96, 125, 139, 0.4); color: #b0bec5; }
      .rarity-rare { background: rgba(33, 150, 243, 0.4); color: #90caf9; }
      .rarity-epic { background: rgba(233, 30, 99, 0.4); color: #ff80ab; }

      /* Preparation / Castle Upgrades Screen */
      .prep-container {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 24px;
        margin: 20px 0;
        text-align: left;
      }

      .prep-panel {
        background: rgba(22, 32, 50, 0.9);
        border: 1px solid rgba(255, 255, 255, 0.15);
        border-radius: 14px;
        padding: 20px;
      }

      .prep-panel-title {
        font-size: 17px;
        font-weight: 800;
        color: #ffca28;
        margin-bottom: 14px;
        display: flex;
        justify-content: space-between;
      }

      .upgrade-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: rgba(0, 0, 0, 0.35);
        padding: 10px 14px;
        border-radius: 8px;
        margin-bottom: 10px;
      }

      .upgrade-info-title {
        font-size: 14px;
        font-weight: 700;
        color: #fff;
      }

      .upgrade-info-sub {
        font-size: 11px;
        color: #90a4ae;
      }

      .btn-upgrade {
        background: linear-gradient(135deg, #f57f17, #fbc02d);
        border: none;
        border-radius: 6px;
        color: #000;
        font-weight: 800;
        padding: 6px 14px;
        cursor: pointer;
        transition: all 0.15s ease;
      }

      .btn-upgrade:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(251, 192, 45, 0.4);
      }

      .btn-upgrade:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }

      .btn-start-wave {
        background: linear-gradient(135deg, #e65100, #ff9800);
        border: 2px solid #ffd54f;
        border-radius: 12px;
        color: #fff;
        font-size: 20px;
        font-weight: 900;
        letter-spacing: 1.5px;
        padding: 14px 40px;
        cursor: pointer;
        box-shadow: 0 8px 30px rgba(230, 81, 0, 0.5);
        transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      }

      .btn-start-wave:hover {
        transform: scale(1.05);
        box-shadow: 0 12px 40px rgba(255, 152, 0, 0.7);
      }

      /* Citizen Roster List */
      .cit-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
        max-height: 200px;
        overflow-y: auto;
      }

      .cit-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: rgba(0, 0, 0, 0.3);
        padding: 8px 12px;
        border-radius: 6px;
      }

      .cit-role-tag {
        font-size: 10px;
        font-weight: 700;
        text-transform: uppercase;
        padding: 2px 6px;
        border-radius: 4px;
        background: #1976d2;
      }
      .cit-role-collector {
        background: #f57c00;
      }

      .btn-small {
        font-size: 11px;
        font-weight: 700;
        padding: 4px 8px;
        border-radius: 4px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        background: rgba(255, 255, 255, 0.1);
        color: #fff;
        cursor: pointer;
      }
      .btn-small:hover {
        background: rgba(255, 255, 255, 0.25);
      }
    `;
    document.head.appendChild(style);
  }

  private createCrosshair(): void {
    this.crosshairElement = document.createElement('div');
    this.crosshairElement.className = 'marksman-crosshair';
    this.crosshairElement.innerHTML = `
      <div class="crosshair-line crosshair-h"></div>
      <div class="crosshair-line crosshair-v"></div>
      <div class="crosshair-dot"></div>
    `;
    this.root.appendChild(this.crosshairElement);
  }

  private createHud(): void {
    this.hudElement = document.createElement('div');
    this.hudElement.className = 'hud-top-bar game-ui-interactive';
    this.hudElement.innerHTML = `
      <!-- Left: Coins & Gate Health -->
      <div class="hud-card">
        <div class="gold-badge" id="hud-gold-text">🪙 50</div>
        <div style="width: 1px; height: 32px; background: rgba(255,255,255,0.15)"></div>
        <div class="health-container">
          <div style="display:flex; justify-content:space-between">
            <span class="health-label">Gate Integrity</span>
            <span class="health-label" id="hud-gate-text">250 / 250</span>
          </div>
          <div class="health-bar-bg">
            <div class="health-bar-fill" id="hud-gate-bar"></div>
          </div>
        </div>
      </div>

      <!-- Center: Wave Banner -->
      <div class="wave-banner">
        <div class="wave-title" id="hud-wave-title">WAVE 1</div>
        <div class="wave-sub" id="hud-wave-status">Defend the Fortress</div>
      </div>

      <!-- Right: Action Skills & Camera Controls -->
      <div class="hud-actions">
        <button class="skill-btn" id="btn-war-horn">
          <span>📯 War Horn</span>
          <span class="skill-key" id="key-horn">[1] Ready</span>
        </button>

        <button class="skill-btn" id="btn-boiling-oil">
          <span>🫗 Boiling Oil</span>
          <span class="skill-key" id="key-oil">[2] Ready</span>
        </button>

        <button class="skill-btn" id="btn-auto-aim">
          <span>🎯 Auto-Aim</span>
          <span class="skill-key" id="key-auto-aim">[A] ON</span>
        </button>

        <button class="skill-btn" id="btn-camera-view">
          <span>🎥 View</span>
          <span class="skill-key" id="key-camera">[C] Tactical</span>
        </button>

        <button class="skill-btn" id="btn-audio-mute">
          <span id="audio-icon">🔊 Sound</span>
        </button>
      </div>

      <div class="bottom-controls-hint">
        Click to Shoot • Hit Heads for Critical Damage • Press [C] for Marksman View • Press [1] Horn • Press [2] Oil
      </div>
    `;
    this.root.appendChild(this.hudElement);

    // Bind HUD buttons
    this.hudElement.querySelector('#btn-war-horn')?.addEventListener('click', () => {
      this.game.triggerWarHorn();
    });

    this.hudElement.querySelector('#btn-boiling-oil')?.addEventListener('click', () => {
      this.game.triggerBoilingOil();
    });

    this.hudElement.querySelector('#btn-auto-aim')?.addEventListener('click', () => {
      const state = this.game.toggleAutoAim();
      const el = document.getElementById('key-auto-aim');
      if (el) el.textContent = `[A] ${state ? 'ON' : 'OFF'}`;
    });

    this.hudElement.querySelector('#btn-camera-view')?.addEventListener('click', () => {
      this.game.toggleCameraMode();
      this.updateCameraUi();
    });

    this.hudElement.querySelector('#btn-audio-mute')?.addEventListener('click', () => {
      const isMuted = SoundEffects.getInstance().toggleMute();
      const el = document.getElementById('audio-icon');
      if (el) el.textContent = isMuted ? '🔇 Muted' : '🔊 Sound';
    });
  }

  private updateCameraUi(): void {
    const el = document.getElementById('key-camera');
    if (el) {
      el.textContent = this.game.cameraMode === 'tactical' ? '[C] Tactical' : '[C] Marksman';
    }
    this.crosshairElement.style.display = this.game.cameraMode === 'marksman' ? 'block' : 'none';
  }

  private createPerkModal(): void {
    this.perkModalElement = document.createElement('div');
    this.perkModalElement.className = 'modal-backdrop';
    this.perkModalElement.innerHTML = `
      <div class="modal-box">
        <h1 style="color: #ffd54f; font-size: 32px; font-weight: 900; margin-bottom: 6px;">
          🎉 WAVE CLEARED!
        </h1>
        <p style="color: #cfd8dc; font-size: 15px;">
          Select 1 Roguelite Perk to empower your defenses for upcoming battles
        </p>

        <div class="perk-cards-grid" id="perk-cards-container">
          <!-- Dynamic Cards Injected Here -->
        </div>
      </div>
    `;
    this.root.appendChild(this.perkModalElement);
  }

  private createPrepScreen(): void {
    this.prepScreenElement = document.createElement('div');
    this.prepScreenElement.className = 'modal-backdrop';
    this.prepScreenElement.innerHTML = `
      <div class="modal-box" style="max-width: 900px;">
        <h1 style="color: #ffd54f; font-size: 28px; font-weight: 900; margin-bottom: 4px;">
          🏰 CASTLE FORTIFICATIONS
        </h1>
        <p style="color: #90caf9; font-size: 14px;">
          Reinforce your gate, upgrade your arrows, and deploy citizens before the next night
        </p>

        <div class="prep-container">
          <!-- Left: Wall & Weapon Upgrades -->
          <div class="prep-panel">
            <div class="prep-panel-title">
              <span>Fortress & Weaponry</span>
              <span id="prep-gold-badge" style="color:#ffd700;">🪙 50</span>
            </div>

            <div class="upgrade-row">
              <div>
                <div class="upgrade-info-title">Gate Masonry & Repair</div>
                <div class="upgrade-info-sub" id="prep-gate-status">Repair wall to max integrity</div>
              </div>
              <button class="btn-upgrade" id="btn-repair-gate">Repair (15g)</button>
            </div>

            <div class="upgrade-row">
              <div>
                <div class="upgrade-info-title">Reinforced Stonework</div>
                <div class="upgrade-info-sub" id="prep-wall-max-status">+50 Max Wall HP</div>
              </div>
              <button class="btn-upgrade" id="btn-upgrade-wall">Upgrade (35g)</button>
            </div>

            <div class="upgrade-row">
              <div>
                <div class="upgrade-info-title">Tempered Arrowheads</div>
                <div class="upgrade-info-sub" id="prep-arrow-dmg-status">+6 Arrow Damage</div>
              </div>
              <button class="btn-upgrade" id="btn-upgrade-arrow">Sharpen (25g)</button>
            </div>

            <div class="upgrade-row">
              <div>
                <div class="upgrade-info-title">Recurve Bow Draw</div>
                <div class="upgrade-info-sub" id="prep-firerate-status">+15% Rapid Fire Rate</div>
              </div>
              <button class="btn-upgrade" id="btn-upgrade-bow">Craft (30g)</button>
            </div>
          </div>

          <!-- Right: Citizen Defenders & Collectors -->
          <div class="prep-panel">
            <div class="prep-panel-title">
              <span>Citizen Guild</span>
              <span id="prep-cit-count" style="color:#90caf9;">1 / 4 Citizens</span>
            </div>

            <div class="cit-list" id="prep-cit-list">
              <!-- Dynamically populated -->
            </div>

            <div style="display:flex; gap:10px; margin-top:14px;">
              <button class="btn-upgrade" id="btn-hire-soldier" style="flex:1;">Recruit Defender (25g)</button>
              <button class="btn-upgrade" id="btn-hire-collector" style="flex:1; background:linear-gradient(135deg, #e65100, #ff9800);">Recruit Collector (20g)</button>
            </div>
          </div>
        </div>

        <button class="btn-start-wave" id="btn-prep-start-wave">
          ⚔️ SOUND THE HORN — COMMENCE WAVE
        </button>
      </div>
    `;
    this.root.appendChild(this.prepScreenElement);

    // Bind Prep Screen Actions
    this.prepScreenElement.querySelector('#btn-repair-gate')?.addEventListener('click', () => {
      if (EconomyManager.getInstance().spendCoins(15)) {
        this.game.castle.repair(100);
        this.updatePrepScreen();
        this.updateHud();
      }
    });

    this.prepScreenElement.querySelector('#btn-upgrade-wall')?.addEventListener('click', () => {
      const cost = 35 * this.game.wallUpgradeLevel;
      if (EconomyManager.getInstance().spendCoins(cost)) {
        this.game.wallUpgradeLevel++;
        this.game.castle.maxHp += 50;
        this.game.castle.currentHp += 50;
        this.updatePrepScreen();
        this.updateHud();
      }
    });

    this.prepScreenElement.querySelector('#btn-upgrade-arrow')?.addEventListener('click', () => {
      const cost = 25 * this.game.arrowUpgradeLevel;
      if (EconomyManager.getInstance().spendCoins(cost)) {
        this.game.arrowUpgradeLevel++;
        this.game.playerArrowDamage += 6;
        this.game.playerArrowSpeed += 3;
        this.updatePrepScreen();
        this.updateHud();
      }
    });

    this.prepScreenElement.querySelector('#btn-upgrade-bow')?.addEventListener('click', () => {
      const cost = 30 * this.game.fireRateUpgradeLevel;
      if (EconomyManager.getInstance().spendCoins(cost)) {
        this.game.fireRateUpgradeLevel++;
        this.game.playerFireRate = Math.max(130, this.game.playerFireRate - 25);
        this.updatePrepScreen();
        this.updateHud();
      }
    });

    this.prepScreenElement.querySelector('#btn-hire-soldier')?.addEventListener('click', () => {
      if (EconomyManager.getInstance().spendCoins(25)) {
        CitizenManager.getInstance().hireCitizen('soldier');
        this.game.respawnCitizens();
        this.updatePrepScreen();
      }
    });

    this.prepScreenElement.querySelector('#btn-hire-collector')?.addEventListener('click', () => {
      if (EconomyManager.getInstance().spendCoins(20)) {
        CitizenManager.getInstance().hireCitizen('collector');
        this.game.respawnCitizens();
        this.updatePrepScreen();
      }
    });

    this.prepScreenElement.querySelector('#btn-prep-start-wave')?.addEventListener('click', () => {
      this.prepScreenElement.classList.remove('active');
      this.game.startWave(this.game.currentWave + 1);
    });
  }

  private createGameOverScreen(): void {
    this.gameOverElement = document.createElement('div');
    this.gameOverElement.className = 'modal-backdrop';
    this.gameOverElement.innerHTML = `
      <div class="modal-box" style="border-color: #d50000;">
        <h1 style="color: #ff1744; font-size: 34px; font-weight: 900; margin-bottom: 6px;">
          💀 THE CASTLE HAS FALLEN
        </h1>
        <p style="color: #cfd8dc; font-size: 15px; margin-bottom: 24px;" id="game-over-summary">
          Your fortress stood strong through wave after wave...
        </p>

        <button class="btn-start-wave" id="btn-restart-run" style="background: linear-gradient(135deg, #d50000, #ff5252); border-color:#ff8a80;">
          🔄 REBUILD DEFENSES (RESTART)
        </button>
      </div>
    `;
    this.root.appendChild(this.gameOverElement);

    this.gameOverElement.querySelector('#btn-restart-run')?.addEventListener('click', () => {
      this.gameOverElement.classList.remove('active');
      SaveManager.getInstance().clearSave();
      window.location.reload();
    });
  }

  public updateHud(): void {
    const goldText = document.getElementById('hud-gold-text');
    if (goldText) goldText.textContent = `🪙 ${EconomyManager.getInstance().getCoins()}`;

    const gateText = document.getElementById('hud-gate-text');
    if (gateText) gateText.textContent = `${Math.round(this.game.castle.currentHp)} / ${this.game.castle.maxHp}`;

    const gateBar = document.getElementById('hud-gate-bar');
    if (gateBar) {
      const pct = Math.max(0, Math.min(100, (this.game.castle.currentHp / this.game.castle.maxHp) * 100));
      gateBar.style.width = `${pct}%`;
      gateBar.style.background = pct < 30 ? 'linear-gradient(90deg, #d50000, #ff5252)' : 'linear-gradient(90deg, #4caf50, #81c784)';
    }

    const waveTitle = document.getElementById('hud-wave-title');
    if (waveTitle) waveTitle.textContent = `WAVE ${this.game.currentWave}`;

    const waveStatus = document.getElementById('hud-wave-status');
    if (waveStatus) {
      const remaining = Math.max(0, this.game.totalWaveZombies - this.game.zombiesKilled);
      waveStatus.textContent = `${remaining} undead remaining`;
    }
  }

  private startHudLoop(): void {
    const loop = () => {
      requestAnimationFrame(loop);
      const now = performance.now() / 1000;

      // Update War Horn button
      const hornElapsed = now - this.game.lastHornUse;
      const hornBtn = document.getElementById('btn-war-horn');
      const hornKey = document.getElementById('key-horn');
      if (hornElapsed < this.game.hornCooldown) {
        const cd = Math.ceil(this.game.hornCooldown - hornElapsed);
        if (hornKey) hornKey.textContent = `${cd}s`;
        hornBtn?.classList.add('disabled');
      } else {
        if (hornKey) hornKey.textContent = '[1] Ready';
        hornBtn?.classList.remove('disabled');
      }

      // Update Boiling Oil button
      const oilElapsed = now - this.game.lastOilUse;
      const oilBtn = document.getElementById('btn-boiling-oil');
      const oilKey = document.getElementById('key-oil');
      if (oilElapsed < this.game.oilCooldown) {
        const cd = Math.ceil(this.game.oilCooldown - oilElapsed);
        if (oilKey) oilKey.textContent = `${cd}s`;
        oilBtn?.classList.add('disabled');
      } else {
        if (oilKey) oilKey.textContent = '[2] Ready';
        oilBtn?.classList.remove('disabled');
      }
    };
    requestAnimationFrame(loop);
  }

  public handleWaveVictory(): void {
    // Confetti Explosion
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });

    // Populate and show Perk Cards
    const perks = PerkManager.getInstance().getRandomSelection(3);
    const container = document.getElementById('perk-cards-container');
    if (!container) return;

    container.innerHTML = '';
    perks.forEach((perk: Perk) => {
      const card = document.createElement('div');
      card.className = `perk-card ${perk.rarity}`;
      card.innerHTML = `
        <div class="perk-icon">${perk.icon}</div>
        <div class="perk-name">${perk.name}</div>
        <div class="perk-desc">${perk.description}</div>
        <div class="perk-rarity rarity-${perk.rarity}">${perk.rarity}</div>
      `;
      card.addEventListener('click', () => {
        PerkManager.getInstance().addPerk(perk.id);
        SoundEffects.getInstance().playCoinPickup();
        this.perkModalElement.classList.remove('active');
        this.showPrepScreen();
      });
      container.appendChild(card);
    });

    this.perkModalElement.classList.add('active');
  }

  private showPrepScreen(): void {
    this.updatePrepScreen();
    this.prepScreenElement.classList.add('active');
  }

  private updatePrepScreen(): void {
    const goldBadge = document.getElementById('prep-gold-badge');
    if (goldBadge) goldBadge.textContent = `🪙 ${EconomyManager.getInstance().getCoins()}`;

    const gateStatus = document.getElementById('prep-gate-status');
    if (gateStatus) {
      gateStatus.textContent = `Current HP: ${Math.round(this.game.castle.currentHp)} / ${this.game.castle.maxHp}`;
    }

    const wallMaxStatus = document.getElementById('prep-wall-max-status');
    if (wallMaxStatus) {
      wallMaxStatus.textContent = `Level ${this.game.wallUpgradeLevel} • Max HP: ${this.game.castle.maxHp}`;
    }

    const arrowStatus = document.getElementById('prep-arrow-dmg-status');
    if (arrowStatus) {
      arrowStatus.textContent = `Level ${this.game.arrowUpgradeLevel} • Damage: ${this.game.playerArrowDamage}`;
    }

    const bowStatus = document.getElementById('prep-firerate-status');
    if (bowStatus) {
      bowStatus.textContent = `Level ${this.game.fireRateUpgradeLevel} • Delay: ${this.game.playerFireRate}ms`;
    }

    // Citizen List
    const citCount = document.getElementById('prep-cit-count');
    const roster = CitizenManager.getInstance().getCitizens();
    if (citCount) {
      citCount.textContent = `${roster.length} / ${CitizenManager.getInstance().maxCitizens} Citizens`;
    }

    const citList = document.getElementById('prep-cit-list');
    if (citList) {
      citList.innerHTML = '';
      roster.forEach((c) => {
        const row = document.createElement('div');
        row.className = 'cit-item';
        row.innerHTML = `
          <div>
            <strong>${c.name}</strong>
            <span class="cit-role-tag ${c.role === 'collector' ? 'cit-role-collector' : ''}">${c.role}</span>
            <span style="font-size:11px; color:#cfd8dc; margin-left:6px;">(${c.rank})</span>
          </div>
          <div style="display:flex; gap:6px;">
            <button class="btn-small" data-cit-role="${c.id}">
              Switch to ${c.role === 'soldier' ? 'Collector' : 'Soldier'}
            </button>
            <button class="btn-small" data-cit-upgrade="${c.id}" ${c.rank === 'archer' ? 'disabled' : ''}>
              Promote (30g)
            </button>
          </div>
        `;

        // Switch role
        row.querySelector(`[data-cit-role="${c.id}"]`)?.addEventListener('click', () => {
          CitizenManager.getInstance().setRole(c.id, c.role === 'soldier' ? 'collector' : 'soldier');
          this.game.respawnCitizens();
          this.updatePrepScreen();
        });

        // Upgrade rank
        row.querySelector(`[data-cit-upgrade="${c.id}"]`)?.addEventListener('click', () => {
          if (EconomyManager.getInstance().spendCoins(30)) {
            CitizenManager.getInstance().upgradeCitizen(c.id);
            this.game.respawnCitizens();
            this.updatePrepScreen();
          }
        });

        citList.appendChild(row);
      });
    }
  }

  public handleGameOver(): void {
    const summary = document.getElementById('game-over-summary');
    if (summary) {
      summary.textContent = `You defended the kingdom valiantly until Wave ${this.game.currentWave}, defeating ${this.game.zombiesKilled} undead beasts!`;
    }
    this.gameOverElement.classList.add('active');
  }
}
