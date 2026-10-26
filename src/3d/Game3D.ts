import * as THREE from 'three';
import { GameMaterials } from './Materials';
import { Castle3D } from './Castle3D';
import { Arrow3D } from './Arrow3D';
import { Zombie3D, ZombieType } from './Zombie3D';
import { Citizen3D } from './Citizen3D';
import { Coin3D } from './Coin3D';
import { ParticleSystem } from './ParticleSystem';
import { FloatingTextManager } from './FloatingText';
import { CitizenManager } from '../systems/CitizenManager';
import { EconomyManager } from '../systems/EconomyManager';
import { PerkManager } from '../systems/PerkManager';
import { SoundEffects } from '../systems/SoundEffects';
import { SaveManager } from '../systems/SaveManager';

export type CameraMode = 'tactical' | 'marksman';

export class Game3D {
  public container: HTMLElement;
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;

  // Camera Management
  public cameraMode: CameraMode = 'tactical';
  private targetCameraPos = new THREE.Vector3(0, 17, -17);
  private targetCameraLook = new THREE.Vector3(0, 2, 13);
  private currentCameraLook = new THREE.Vector3(0, 2, 13);

  // Entities & Subsystems
  public castle!: Castle3D;
  public particles!: ParticleSystem;
  public floatingText!: FloatingTextManager;

  public arrows: Arrow3D[] = [];
  public zombies: Zombie3D[] = [];
  public citizens: Citizen3D[] = [];
  public coins: Coin3D[] = [];

  // Wave Management
  public currentWave: number = 1;
  public totalWaveZombies: number = 6;
  public zombiesSpawned: number = 0;
  public zombiesKilled: number = 0;
  public isWaveActive: boolean = false;
  public isWaveVictory: boolean = false;
  public isGameOver: boolean = false;
  private spawnInterval: number = 2.4;
  private lastSpawnTime: number = 0;

  // Player Bow & Arrow Stats
  public playerArrowDamage: number = 20;
  public playerFireRate: number = 260; // ms
  public playerArrowSpeed: number = 42;
  public lastPlayerShotTime: number = 0;
  public isAutoAimEnabled: boolean = true;

  // Upgrades
  public arrowUpgradeLevel: number = 1;
  public fireRateUpgradeLevel: number = 1;
  public wallUpgradeLevel: number = 1;

  // Abilities
  public hornCooldown: number = 28; // seconds
  public lastHornUse: number = -999;
  public isRallyActive: boolean = false;
  public rallyDuration: number = 6.0;

  public oilCooldown: number = 22; // seconds
  public lastOilUse: number = -999;

  // Input & Raycasting
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();
  private groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  private aimGroundPoint = new THREE.Vector3(0, 0, 10);
  private hoveredTarget: Zombie3D | null = null;
  private aimReticle!: THREE.Mesh;

  // Screen Shake
  private screenShakeIntensity: number = 0;

  // Callbacks for UI
  public onWaveComplete?: () => void;
  public onGameOver?: () => void;
  public onStateChange?: () => void;

  private isRunning: boolean = true;
  private lastFrameTime: number = performance.now();

  constructor(container: HTMLElement) {
    this.container = container;

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      stencil: false,
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.container.appendChild(this.renderer.domElement);

    // Scene & Fog
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a101f);
    this.scene.fog = new THREE.FogExp2(0x0a101f, 0.016);

    // Camera
    this.camera = new THREE.PerspectiveCamera(
      52,
      window.innerWidth / window.innerHeight,
      0.5,
      250
    );
    this.camera.position.copy(this.targetCameraPos);
    this.camera.lookAt(this.targetCameraLook);

    // Subsystems
    this.particles = new ParticleSystem(this.scene);
    this.floatingText = new FloatingTextManager(this.scene);

    // Environment Setup
    this.setupEnvironment();

    // Aim Reticle
    const reticleGeo = new THREE.RingGeometry(0.5, 0.65, 16);
    reticleGeo.rotateX(-Math.PI / 2);
    const reticleMat = new THREE.MeshBasicMaterial({
      color: 0xffea00,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.7,
    });
    this.aimReticle = new THREE.Mesh(reticleGeo, reticleMat);
    this.aimReticle.position.set(0, 0.08, 10);
    this.scene.add(this.aimReticle);

    // Load Save or Defaults
    this.loadInitialState();

    // Event Listeners
    this.setupInputs();

    // Start Animation Loop
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  private setupEnvironment(): void {
    // Atmospheric Hemispheric Light
    const hemiLight = new THREE.HemisphereLight(0x283593, 0x1b281e, 0.85);
    this.scene.add(hemiLight);

    // Directional Moonlight with Soft Shadows
    const moonLight = new THREE.DirectionalLight(0xb0bec5, 1.3);
    moonLight.position.set(22, 36, 18);
    moonLight.castShadow = true;
    moonLight.shadow.mapSize.width = 2048;
    moonLight.shadow.mapSize.height = 2048;
    moonLight.shadow.camera.near = 0.5;
    moonLight.shadow.camera.far = 120;
    const shadowD = 35;
    moonLight.shadow.camera.left = -shadowD;
    moonLight.shadow.camera.right = shadowD;
    moonLight.shadow.camera.top = shadowD;
    moonLight.shadow.camera.bottom = -shadowD;
    moonLight.shadow.bias = -0.0005;
    this.scene.add(moonLight);

    // 3D Battleground Terrain
    const groundGeo = new THREE.PlaneGeometry(60, 95, 32, 32);
    groundGeo.rotateX(-Math.PI / 2);
    const groundMesh = new THREE.Mesh(groundGeo, GameMaterials.ground);
    groundMesh.position.set(0, 0, 24);
    groundMesh.receiveShadow = true;
    this.scene.add(groundMesh);

    // Glowing 3D Moon in Sky
    const moonGeo = new THREE.SphereGeometry(4.5, 16, 16);
    const moonMat = new THREE.MeshBasicMaterial({ color: 0xfffde7 });
    const moon = new THREE.Mesh(moonGeo, moonMat);
    moon.position.set(45, 65, 80);
    this.scene.add(moon);

    // Starfield
    const starCount = 800;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 220;
      starPositions[i + 1] = Math.random() * 80 + 20;
      starPositions[i + 2] = (Math.random() - 0.5) * 220;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.9,
      transparent: true,
      opacity: 0.8,
    });
    const starField = new THREE.Points(starGeo, starMat);
    this.scene.add(starField);

    // Wooden Spike Barricades on Battlefield
    for (let i = -10; i <= 10; i += 4.5) {
      if (Math.abs(i) < 2.5) continue; // Keep central pathway open
      this.createBarricade(i, 8 + (Math.random() - 0.5) * 2);
      this.createBarricade(i * 0.8, 18 + (Math.random() - 0.5) * 3);
    }
  }

  private createBarricade(x: number, z: number): void {
    const group = new THREE.Group();
    for (let i = 0; i < 3; i++) {
      const stakeGeo = new THREE.CylinderGeometry(0.08, 0.12, 1.8, 6);
      const stake = new THREE.Mesh(stakeGeo, GameMaterials.castleWood);
      stake.rotation.x = Math.PI / 4 + (Math.random() - 0.5) * 0.2;
      stake.rotation.y = (Math.random() - 0.5) * 0.5;
      stake.position.set((i - 1) * 0.45, 0.6, 0);
      stake.castShadow = true;
      group.add(stake);
    }
    group.position.set(x, 0, z);
    this.scene.add(group);
  }

  public loadInitialState(): void {
    const save = SaveManager.getInstance().loadGame() || SaveManager.getInstance().getDefaultSave();
    this.currentWave = save.wave;
    this.arrowUpgradeLevel = Math.max(1, Math.round((save.arrowDamage - 18) / 6) + 1);
    this.fireRateUpgradeLevel = save.fireRateLevel || 1;
    this.playerArrowDamage = 18 + (this.arrowUpgradeLevel - 1) * 6;
    this.playerFireRate = Math.max(140, 260 - (this.fireRateUpgradeLevel - 1) * 25);
    this.playerArrowSpeed = 42 + (this.arrowUpgradeLevel - 1) * 3;

    // Build Castle
    this.castle = new Castle3D(this.scene, save.wallMaxHp, this.wallUpgradeLevel);
    this.castle.currentHp = save.wallHp;

    // Load Citizens
    CitizenManager.getInstance().setCitizens(save.citizens);
    CitizenManager.getInstance().maxCitizens = save.maxCitizens;
    this.respawnCitizens();

    // Load Perks
    PerkManager.getInstance().setPerks(save.perks);

    // Load Coins
    EconomyManager.getInstance().setCoins(save.coins);
  }

  public respawnCitizens(): void {
    // Clear old citizens
    for (const c of this.citizens) {
      c.destroy(this.scene);
    }
    this.citizens = [];

    const roster = CitizenManager.getInstance().getCitizens();
    let soldierIdx = 0;
    let collectorIdx = 0;

    for (const citData of roster) {
      if (citData.role === 'soldier') {
        const cit = new Citizen3D(this.scene, citData, soldierIdx++);
        this.citizens.push(cit);
      } else {
        const cit = new Citizen3D(this.scene, citData, collectorIdx++);
        this.citizens.push(cit);
      }
    }
  }

  public setCameraMode(mode: CameraMode): void {
    this.cameraMode = mode;
    if (mode === 'tactical') {
      this.targetCameraPos.set(0, 17, -17);
      this.targetCameraLook.set(0, 2, 13);
    } else {
      // Rampart Marksman View
      this.targetCameraPos.set(0, 8.4, -6.2);
      this.targetCameraLook.set(0, 2.5, 22);
    }
  }

  public toggleCameraMode(): void {
    this.setCameraMode(this.cameraMode === 'tactical' ? 'marksman' : 'tactical');
  }

  public toggleAutoAim(): boolean {
    this.isAutoAimEnabled = !this.isAutoAimEnabled;
    return this.isAutoAimEnabled;
  }

  public triggerWarHorn(): boolean {
    const now = performance.now() / 1000;
    if (now - this.lastHornUse < this.hornCooldown) return false;

    this.lastHornUse = now;
    this.isRallyActive = true;
    SoundEffects.getInstance().playWarHorn();

    // Golden aura shockwave
    this.particles.emitCriticalHeadshot(new THREE.Vector3(0, 7.5, -5.5));
    this.floatingText.spawn('RALLY WAR HORN! +75% SPEED', new THREE.Vector3(0, 8.5, -4.5), '#ffd54f', true);

    setTimeout(() => {
      this.isRallyActive = false;
    }, this.rallyDuration * 1000);

    return true;
  }

  public triggerBoilingOil(): boolean {
    const now = performance.now() / 1000;
    if (now - this.lastOilUse < this.oilCooldown) return false;

    this.lastOilUse = now;
    this.castle.pourOil(this.scene);
    this.floatingText.spawn('BOILING OIL RELEASED!', new THREE.Vector3(0, 4.0, -2.5), '#ff3d00', true);
    return true;
  }

  public startWave(waveNumber?: number): void {
    if (waveNumber) this.currentWave = waveNumber;
    this.isWaveActive = true;
    this.isWaveVictory = false;
    this.isGameOver = false;

    this.totalWaveZombies = 6 + (this.currentWave - 1) * 3;
    this.zombiesSpawned = 0;
    this.zombiesKilled = 0;
    this.lastSpawnTime = performance.now() / 1000;

    // Clear old arrows and coins
    for (const a of this.arrows) a.destroy(this.scene);
    this.arrows = [];

    // Respawn citizens to ensure up-to-date roles
    this.respawnCitizens();

    SoundEffects.getInstance().playGateHit();
    this.floatingText.spawn(`WAVE ${this.currentWave} BEGINS!`, new THREE.Vector3(0, 6, 12), '#ffca28', true);

    if (this.onStateChange) this.onStateChange();
  }

  private spawnZombie(): void {
    if (this.zombiesSpawned >= this.totalWaveZombies) return;

    this.zombiesSpawned++;
    const spawnZ = 52 + Math.random() * 8;
    const spawnX = (Math.random() - 0.5) * 22;

    // Composition logic based on wave
    let type: ZombieType = 'walker';
    const rand = Math.random();

    // Boss Wave check
    if (this.currentWave % 5 === 0 && this.zombiesSpawned === 1) {
      type = 'boss';
      this.floatingText.spawn('BOSS WARNING: ABOMINATION APPROACHES!', new THREE.Vector3(0, 8, 20), '#d50000', true);
    } else if (this.currentWave >= 4 && rand < 0.16) {
      type = 'siege';
    } else if (this.currentWave >= 3 && rand < 0.35) {
      type = 'exploder';
    } else if (this.currentWave >= 3 && rand < 0.6) {
      type = 'tank';
    } else if (this.currentWave >= 2 && rand < 0.85) {
      type = 'runner';
    } else {
      type = 'walker';
    }

    const z = new Zombie3D(this.scene, type, this.currentWave, spawnX, spawnZ);
    this.zombies.push(z);

    if (Math.random() < 0.4) {
      SoundEffects.getInstance().playZombieGroan();
    }
  }

  private setupInputs(): void {
    // Window Resize
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Pointer Move
    window.addEventListener('pointermove', (e: MouseEvent) => {
      this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
      this.updateAim();
    });

    // Pointer Down (Shoot)
    window.addEventListener('pointerdown', (e: MouseEvent) => {
      // Ignore clicks on UI elements
      const target = e.target as HTMLElement;
      if (target.closest('.game-ui') || target.tagName === 'BUTTON') return;

      this.handlePlayerShoot();
    });

    // Keyboard Shortcuts
    window.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.code === 'KeyC') {
        this.toggleCameraMode();
      } else if (e.code === 'KeyH' || e.code === 'Digit1') {
        this.triggerWarHorn();
      } else if (e.code === 'KeyO' || e.code === 'Space' || e.code === 'Digit2') {
        this.triggerBoilingOil();
      } else if (e.code === 'KeyA') {
        this.toggleAutoAim();
      }
    });
  }

  private updateAim(): void {
    this.raycaster.setFromCamera(this.mouse, this.camera);

    // Raycast on ground
    const intersection = new THREE.Vector3();
    if (this.raycaster.ray.intersectPlane(this.groundPlane, intersection)) {
      this.aimGroundPoint.copy(intersection);
    }

    // Auto-Aim Assist: Check nearest zombie to ray
    this.hoveredTarget = null;
    let closestRayDist = 3.5; // Snap threshold

    for (const z of this.zombies) {
      if (!z.isAlive || z.isDying) continue;
      const zPos = z.getBodyWorldPosition();
      const distToRay = this.raycaster.ray.distanceToPoint(zPos);
      if (distToRay < closestRayDist) {
        closestRayDist = distToRay;
        this.hoveredTarget = z;
      }
    }

    // Update aim reticle position
    if (this.hoveredTarget && this.isAutoAimEnabled) {
      this.aimReticle.position.set(
        this.hoveredTarget.mesh.position.x,
        0.08,
        this.hoveredTarget.mesh.position.z
      );
      (this.aimReticle.material as THREE.MeshBasicMaterial).color.setHex(0xff1744);
      this.aimReticle.scale.set(1.4, 1.4, 1.4);
    } else {
      this.aimReticle.position.set(this.aimGroundPoint.x, 0.08, this.aimGroundPoint.z);
      (this.aimReticle.material as THREE.MeshBasicMaterial).color.setHex(0xffea00);
      this.aimReticle.scale.set(1.0, 1.0, 1.0);
    }
  }

  public handlePlayerShoot(): void {
    if (!this.isWaveActive || this.isGameOver || this.isWaveVictory) return;

    const now = performance.now();
    if (now - this.lastPlayerShotTime < this.playerFireRate) return;
    this.lastPlayerShotTime = now;

    // Launch position from player bow on center battlements
    const bowPos = new THREE.Vector3(0, 7.4, -5.0);

    // Target point
    let targetPoint = this.aimGroundPoint.clone();
    if (this.hoveredTarget && this.isAutoAimEnabled) {
      targetPoint = this.hoveredTarget.getHeadWorldPosition();
    } else {
      targetPoint.y = 1.4; // Average torso height
    }

    // Trajectory calculation
    const toTarget = targetPoint.clone().sub(bowPos);
    const distHoriz = Math.hypot(toTarget.x, toTarget.z);
    const speed = this.playerArrowSpeed;
    const timeFlight = Math.max(0.2, distHoriz / speed);
    const gravity = 16;

    const velY = (toTarget.y + 0.5 * gravity * timeFlight * timeFlight) / timeFlight;
    const launchDir = new THREE.Vector3(toTarget.x / timeFlight, velY, toTarget.z / timeFlight).normalize();

    // Perks: Bouncing & Volley
    const hasBounce = PerkManager.getInstance().hasPerk('bounce_arrows');
    const hasVolley = PerkManager.getInstance().hasPerk('volley_shot');
    const bounces = hasBounce ? 1 : 0;

    SoundEffects.getInstance().playArrowShoot();

    // Spawn Arrow
    this.arrows.push(
      new Arrow3D(
        this.scene,
        bowPos,
        launchDir,
        speed,
        this.playerArrowDamage,
        true,
        bounces
      )
    );

    // Triple Volley perk trigger
    if (hasVolley && Math.random() < 0.28) {
      const leftDir = launchDir.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), 0.08);
      const rightDir = launchDir.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), -0.08);
      this.arrows.push(new Arrow3D(this.scene, bowPos, leftDir, speed, this.playerArrowDamage * 0.75, true, bounces));
      this.arrows.push(new Arrow3D(this.scene, bowPos, rightDir, speed, this.playerArrowDamage * 0.75, true, bounces));
    }
  }

  public triggerScreenShake(intensity: number = 0.35): void {
    this.screenShakeIntensity = intensity;
  }

  private animate(): void {
    if (!this.isRunning) return;
    requestAnimationFrame(this.animate);

    const now = performance.now();
    const dt = Math.min(0.1, (now - this.lastFrameTime) / 1000);
    this.lastFrameTime = now;

    this.update(dt, now);
    this.render();
  }

  private update(dt: number, now: number): void {
    const timeSec = now / 1000;

    // Camera Smooth Lerp
    this.camera.position.lerp(this.targetCameraPos, dt * 4.5);
    this.currentCameraLook.lerp(this.targetCameraLook, dt * 4.5);
    this.camera.lookAt(this.currentCameraLook);

    // Apply Screen Shake
    if (this.screenShakeIntensity > 0) {
      this.camera.position.x += (Math.random() - 0.5) * this.screenShakeIntensity;
      this.camera.position.y += (Math.random() - 0.5) * this.screenShakeIntensity;
      this.screenShakeIntensity = Math.max(0, this.screenShakeIntensity - dt * 1.5);
    }

    // Reticle animation
    this.aimReticle.rotation.z += dt * 2.0;

    // Update Castle
    this.castle.update(dt, this.scene);

    // Update Spawner
    if (this.isWaveActive && !this.isWaveVictory && !this.isGameOver) {
      if (this.zombiesSpawned < this.totalWaveZombies) {
        if (timeSec - this.lastSpawnTime >= this.spawnInterval) {
          this.lastSpawnTime = timeSec;
          this.spawnZombie();
          this.spawnInterval = Math.max(1.1, 2.4 - this.currentWave * 0.08);
        }
      }
    }

    // Update Particles & Floating Text
    this.particles.update(dt);
    this.floatingText.update(dt);

    // Update Citizens
    const swiftPerk = PerkManager.getInstance().hasPerk('swift_collectors');
    const greedyPerk = PerkManager.getInstance().hasPerk('greedy_scavenger');

    for (const citizen of this.citizens) {
      if (citizen.role === 'soldier') {
        citizen.updateSoldier(now, this.zombies, this.arrows, this.scene, this.isRallyActive);
      } else {
        citizen.updateCollector(dt, this.coins, this.zombies, swiftPerk, greedyPerk);
      }
    }

    // Update Coins
    for (let i = this.coins.length - 1; i >= 0; i--) {
      const coin = this.coins[i];
      coin.update(dt);
      if (!coin.isAlive) {
        coin.destroy(this.scene);
        this.coins.splice(i, 1);
      }
    }

    // Update Boiling Oil Puddle Hazards
    if (this.castle.oilPuddleTimeRemaining > 0 && this.castle.oilPuddleMesh) {
      this.particles.emitOilFire(this.castle.oilPuddleMesh.position);

      for (const z of this.zombies) {
        if (!z.isAlive || z.isDying) continue;
        if (z.mesh.position.z <= 1.8 && Math.abs(z.mesh.position.x) <= 3.4) {
          // Burn damage
          const died = z.takeDamage(dt * 45);
          this.floatingText.spawn('-8', z.getBodyWorldPosition(), '#ff5722');
          if (died) {
            this.handleZombieDeath(z);
          }
        }
      }
    }

    // Update Zombies
    for (let i = this.zombies.length - 1; i >= 0; i--) {
      const z = this.zombies[i];
      z.update(dt, now);

      if (!z.isAlive) {
        z.destroy(this.scene);
        this.zombies.splice(i, 1);
        continue;
      }

      // Zombie attacks castle gate
      if (z.isAtGate && !z.isDying) {
        if (timeSec - z.lastAttackTime >= z.attackCooldown) {
          z.lastAttackTime = timeSec;

          // Exploder auto-detonates on gate!
          if (z.type === 'exploder') {
            this.handleExploderDetonation(z);
            z.isAlive = false;
            z.destroy(this.scene);
            this.zombies.splice(i, 1);
            continue;
          }

          const destroyed = this.castle.takeDamage(z.gateDamage);
          this.triggerScreenShake(0.25);
          this.floatingText.spawn(`-${z.gateDamage}`, new THREE.Vector3(0, 3.5, -4.0), '#f44336');

          if (destroyed) {
            this.handleCastleDestroyed();
          }
        }
      }

      // Siege Fiend ranged rock throw
      if (z.type === 'siege' && z.siegeTimer >= 4.0 && !z.isDying) {
        z.siegeTimer = 0;
        this.handleSiegeBoulderThrow(z);
      }
    }

    // Update Arrows & Hit Detection
    for (let i = this.arrows.length - 1; i >= 0; i--) {
      const arrow = this.arrows[i];
      arrow.update(dt);

      if (!arrow.isAlive) {
        arrow.destroy(this.scene);
        this.arrows.splice(i, 1);
        continue;
      }

      if (arrow.hasHitGround) continue;

      // Check collision with zombies
      const arrowTipPos = arrow.mesh.position.clone();

      for (const z of this.zombies) {
        if (!z.isAlive || z.isDying) continue;

        // Check Headshot first
        const headPos = z.getHeadWorldPosition();
        const headDist = arrowTipPos.distanceTo(headPos);
        const headRadius = z.type === 'boss' ? 1.0 : 0.48;

        if (headDist <= headRadius) {
          // CRITICAL HEADSHOT!
          arrow.isAlive = false;
          this.handleHeadshotHit(arrow, z, headPos);
          break;
        }

        // Check Body hit
        const bodyPos = z.getBodyWorldPosition();
        const bodyDist = arrowTipPos.distanceTo(bodyPos);
        const bodyRadius = z.type === 'boss' ? 1.8 : (z.type === 'tank' ? 1.1 : 0.75);

        if (bodyDist <= bodyRadius) {
          arrow.isAlive = false;
          this.handleBodyHit(arrow, z, bodyPos);
          break;
        }
      }
    }

    // Check Wave Victory
    if (
      this.isWaveActive &&
      !this.isWaveVictory &&
      !this.isGameOver &&
      this.zombiesSpawned >= this.totalWaveZombies &&
      this.zombies.length === 0
    ) {
      this.handleWaveVictory();
    }
  }

  private handleHeadshotHit(arrow: Arrow3D, zombie: Zombie3D, pos: THREE.Vector3): void {
    const critDamage = Math.round(arrow.damage * 2.5);
    const died = zombie.takeDamage(critDamage);

    SoundEffects.getInstance().playHeadshot();
    this.particles.emitCriticalHeadshot(pos);
    this.triggerScreenShake(0.18);

    // Floating text
    this.floatingText.spawn(`HEADSHOT! -${critDamage}`, pos, '#ffd54f', true);

    // Marked Target focus synergy: All archers immediately target this enemy!
    zombie.markTarget(6.0);

    // Explosive Headshots perk
    if (PerkManager.getInstance().hasPerk('explosive_blast')) {
      this.particles.emitExplosion(pos);
      SoundEffects.getInstance().playExplosion();
      // AOE splash
      for (const other of this.zombies) {
        if (other !== zombie && other.isAlive && !other.isDying) {
          const d = pos.distanceTo(other.mesh.position);
          if (d <= 4.5) {
            const aoeDmg = Math.round(critDamage * 0.5);
            if (other.takeDamage(aoeDmg)) {
              this.handleZombieDeath(other);
            }
            this.floatingText.spawn(`-${aoeDmg}`, other.getBodyWorldPosition(), '#ff9800');
          }
        }
      }
    }

    if (died) {
      this.handleZombieDeath(zombie);
    } else if (arrow.bouncesRemaining > 0) {
      this.ricochetArrow(arrow, zombie);
    }
  }

  private handleBodyHit(arrow: Arrow3D, zombie: Zombie3D, pos: THREE.Vector3): void {
    const died = zombie.takeDamage(arrow.damage);
    SoundEffects.getInstance().playArrowHit();
    this.particles.emitHitSparks(pos);

    this.floatingText.spawn(`-${arrow.damage}`, pos, '#ffffff');

    if (died) {
      this.handleZombieDeath(zombie);
    } else if (arrow.bouncesRemaining > 0) {
      this.ricochetArrow(arrow, zombie);
    }
  }

  private ricochetArrow(arrow: Arrow3D, currentZombie: Zombie3D): void {
    // Find nearby secondary zombie
    let nearest: Zombie3D | null = null;
    let minDist = 8.0;

    for (const other of this.zombies) {
      if (other !== currentZombie && other.isAlive && !other.isDying) {
        const d = currentZombie.mesh.position.distanceTo(other.mesh.position);
        if (d < minDist) {
          minDist = d;
          nearest = other;
        }
      }
    }

    if (nearest) {
      const fromPos = currentZombie.getBodyWorldPosition();
      const toPos = nearest.getBodyWorldPosition();
      const dir = toPos.sub(fromPos).normalize();
      this.arrows.push(
        new Arrow3D(
          this.scene,
          fromPos,
          dir,
          this.playerArrowSpeed * 1.2,
          Math.round(arrow.damage * 0.6),
          true,
          0 // No more bounces
        )
      );
    }
  }

  private handleZombieDeath(zombie: Zombie3D): void {
    this.zombiesKilled++;

    // Exploder explodes on death!
    if (zombie.type === 'exploder') {
      this.handleExploderDetonation(zombie);
      return;
    }

    // Drop gold coins
    const coinCount = zombie.type === 'boss' ? 8 : (zombie.type === 'tank' ? 3 : 1);
    for (let c = 0; c < coinCount; c++) {
      this.coins.push(new Coin3D(this.scene, zombie.mesh.position));
    }
  }

  private handleExploderDetonation(zombie: Zombie3D): void {
    const pos = zombie.getBodyWorldPosition();
    this.particles.emitExplosion(pos);
    SoundEffects.getInstance().playExplosion();
    this.triggerScreenShake(0.5);

    // Blast damage to gate if close
    if (zombie.mesh.position.z <= -2.5) {
      const destroyed = this.castle.takeDamage(zombie.gateDamage);
      this.floatingText.spawn(`-${zombie.gateDamage}`, new THREE.Vector3(0, 3.5, -4.0), '#d50000', true);
      if (destroyed) this.handleCastleDestroyed();
    }

    // Blast damage to nearby zombies
    for (const other of this.zombies) {
      if (other !== zombie && other.isAlive && !other.isDying) {
        const d = pos.distanceTo(other.mesh.position);
        if (d <= 5.5) {
          const blastDmg = Math.round(55 * (1 - d / 6.0));
          if (other.takeDamage(blastDmg)) {
            this.handleZombieDeath(other);
          }
          this.floatingText.spawn(`BLAST -${blastDmg}`, other.getBodyWorldPosition(), '#ff3d00');
        }
      }
    }
  }

  private handleSiegeBoulderThrow(siegeZombie: Zombie3D): void {
    const spawnPos = siegeZombie.mesh.position.clone().add(new THREE.Vector3(0.35, 2.2, -0.9));
    const targetPos = new THREE.Vector3(0, 2.5, -4.2);

    SoundEffects.getInstance().playArrowShoot();

    // Spawn a flaming boulder projectile that flies toward gate
    const boulderGeo = new THREE.DodecahedronGeometry(0.45, 0);
    const boulderMesh = new THREE.Mesh(boulderGeo, GameMaterials.moltenOil);
    boulderMesh.position.copy(spawnPos);
    this.scene.add(boulderMesh);

    const toTarget = targetPos.clone().sub(spawnPos);
    const speed = 20;
    const timeFlight = toTarget.length() / speed;
    const gravity = 16;
    const velY = (toTarget.y + 0.5 * gravity * timeFlight * timeFlight) / timeFlight;
    const vel = new THREE.Vector3(toTarget.x / timeFlight, velY, toTarget.z / timeFlight);

    let elapsed = 0;
    const boulderInterval = setInterval(() => {
      const dt = 0.03;
      elapsed += dt;
      vel.y -= gravity * dt;
      boulderMesh.position.addScaledVector(vel, dt);
      boulderMesh.rotation.x += 0.2;
      boulderMesh.rotation.y += 0.2;

      this.particles.emitOilFire(boulderMesh.position);

      if (boulderMesh.position.z <= -4.0 || boulderMesh.position.y <= 0.2) {
        clearInterval(boulderInterval);
        this.scene.remove(boulderMesh);
        boulderGeo.dispose();

        this.particles.emitExplosion(boulderMesh.position);
        SoundEffects.getInstance().playExplosion();
        this.triggerScreenShake(0.35);

        const destroyed = this.castle.takeDamage(siegeZombie.gateDamage);
        this.floatingText.spawn(`-${siegeZombie.gateDamage}`, new THREE.Vector3(0, 3, -4), '#ff3d00', true);
        if (destroyed) this.handleCastleDestroyed();
      }
    }, 30);
  }

  private handleCastleDestroyed(): void {
    if (this.isGameOver) return;
    this.isGameOver = true;
    this.isWaveActive = false;

    this.triggerScreenShake(0.8);
    this.floatingText.spawn('FORTRESS HAS FALLEN!', new THREE.Vector3(0, 6, -3), '#d50000', true);

    setTimeout(() => {
      if (this.onGameOver) this.onGameOver();
    }, 1200);
  }

  private handleWaveVictory(): void {
    this.isWaveActive = false;
    this.isWaveVictory = true;

    SoundEffects.getInstance().playVictoryFanfare();
    this.floatingText.spawn('WAVE CLEARED! VICTORY!', new THREE.Vector3(0, 7, 6), '#ffd54f', true);

    // Save Game State
    SaveManager.getInstance().saveGame({
      wave: this.currentWave,
      coins: EconomyManager.getInstance().getCoins(),
      wallHp: this.castle.currentHp,
      wallMaxHp: this.castle.maxHp,
      arrowDamage: this.playerArrowDamage,
      fireRateLevel: this.fireRateUpgradeLevel,
      citizens: CitizenManager.getInstance().getCitizens(),
      maxCitizens: CitizenManager.getInstance().maxCitizens,
      perks: PerkManager.getInstance().getActivePerkIds(),
    });

    setTimeout(() => {
      if (this.onWaveComplete) this.onWaveComplete();
    }, 1400);
  }

  private render(): void {
    this.renderer.render(this.scene, this.camera);
  }

  public destroy(): void {
    this.isRunning = false;
    this.renderer.dispose();
  }
}
