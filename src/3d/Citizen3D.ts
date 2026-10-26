import * as THREE from 'three';
import { ModelFactory } from './Models';
import { CitizenData } from '../systems/CitizenManager';
import { Arrow3D } from './Arrow3D';
import { Zombie3D } from './Zombie3D';
import { Coin3D } from './Coin3D';
import { SoundEffects } from '../systems/SoundEffects';

export class Citizen3D {
  public mesh: THREE.Group;
  public data: CitizenData;
  public role: 'soldier' | 'collector';

  // Combat stats (Soldier)
  public attackRange: number = 42;
  public attackCooldown: number = 1.0;
  public lastAttackTime: number = 0;
  public damage: number = 8;
  public isMasterArcher: boolean = false;

  // Harvester stats (Collector)
  public moveSpeed: number = 6.2;
  public homePos: THREE.Vector3;
  public targetCoin?: Coin3D;
  public isRetreating: boolean = false;

  // Animation references
  private leftArm?: THREE.Object3D;
  private rightArm?: THREE.Object3D;
  private leftLeg?: THREE.Object3D;
  private rightLeg?: THREE.Object3D;
  private animTime: number = 0;

  constructor(scene: THREE.Scene, data: CitizenData, slotIndex: number) {
    this.data = data;
    this.role = data.role;

    if (this.role === 'soldier') {
      this.mesh = ModelFactory.createDefender(data.rank);

      // Predefined tactical stations across ramparts and watchtowers
      const DEFENDER_SLOTS = [
        { x: -4.5, y: 6.4, z: -5.8 },
        { x: 4.5, y: 6.4, z: -5.8 },
        { x: -8.5, y: 6.4, z: -5.8 },
        { x: 8.5, y: 6.4, z: -5.8 },
        { x: -13.5, y: 8.5, z: -5.8 }, // Left elevated tower
        { x: 13.5, y: 8.5, z: -5.8 },  // Right elevated tower
        { x: -2.2, y: 6.4, z: -5.8 },
        { x: 2.2, y: 6.4, z: -5.8 },
        { x: -10.5, y: 6.4, z: -5.8 },
        { x: 10.5, y: 6.4, z: -5.8 },
        { x: -6.5, y: 6.4, z: -5.8 },
        { x: 6.5, y: 6.4, z: -5.8 },
        { x: -12.5, y: 8.5, z: -5.8 },
        { x: 12.5, y: 8.5, z: -5.8 },
      ];

      const slot = DEFENDER_SLOTS[slotIndex % DEFENDER_SLOTS.length];
      this.mesh.position.set(slot.x, slot.y, slot.z);
      this.homePos = this.mesh.position.clone();

      // Configure rank stats
      switch (data.rank) {
        case 'rookie':
          this.damage = 8;
          this.attackCooldown = 1.1;
          this.attackRange = 40;
          break;
        case 'captain':
          this.damage = 16;
          this.attackCooldown = 0.85;
          this.attackRange = 48;
          break;
        case 'major':
          this.damage = 28;
          this.attackCooldown = 0.65;
          this.attackRange = 56;
          break;
        case 'archer':
          this.damage = 48;
          this.attackCooldown = 0.45;
          this.attackRange = 64;
          this.isMasterArcher = true;
          break;
      }
    } else {
      // Collector
      this.mesh = ModelFactory.createCollector();
      const COLLECTOR_SLOTS = [
        { x: -1.8, y: 0, z: -4.0 },
        { x: 1.8, y: 0, z: -4.0 },
        { x: -3.2, y: 0, z: -4.0 },
        { x: 3.2, y: 0, z: -4.0 },
        { x: -0.9, y: 0, z: -3.8 },
        { x: 0.9, y: 0, z: -3.8 },
        { x: -4.5, y: 0, z: -4.0 },
        { x: 4.5, y: 0, z: -4.0 },
      ];
      const slot = COLLECTOR_SLOTS[slotIndex % COLLECTOR_SLOTS.length];
      this.mesh.position.set(slot.x, slot.y, slot.z);
      this.homePos = this.mesh.position.clone();
    }

    this.leftArm = this.mesh.getObjectByName('LeftArm');
    this.rightArm = this.mesh.getObjectByName('RightArm');
    this.leftLeg = this.mesh.getObjectByName('LeftLeg');
    this.rightLeg = this.mesh.getObjectByName('RightLeg');

    scene.add(this.mesh);
  }

  public updateSoldier(
    now: number,
    zombies: Zombie3D[],
    arrows: Arrow3D[],
    scene: THREE.Scene,
    isRallyActive: boolean
  ): void {
    if (this.role !== 'soldier') return;

    // Cooldown check (buffed by War Horn)
    const effectiveCooldown = (isRallyActive ? this.attackCooldown * 0.5 : this.attackCooldown) * 1000;
    if (now - this.lastAttackTime < effectiveCooldown) return;

    // Select target: prioritized marked zombie, or closest zombie
    let target: Zombie3D | null = null;
    let closestDistSq = this.attackRange * this.attackRange;

    // Check marked targets first
    for (const z of zombies) {
      if (!z.isAlive || z.isDying) continue;
      const dSq = this.mesh.position.distanceToSquared(z.mesh.position);
      if (dSq <= this.attackRange * this.attackRange) {
        if (z.isMarked) {
          target = z;
          break;
        }
        if (dSq < closestDistSq) {
          closestDistSq = dSq;
          target = z;
        }
      }
    }

    if (!target) return;

    // Rotate toward target
    const targetPos = target.mesh.position.clone();
    const lookDir = targetPos.sub(this.mesh.position);
    this.mesh.rotation.y = Math.atan2(lookDir.x, lookDir.z);

    // Fire arrow
    this.lastAttackTime = now;
    SoundEffects.getInstance().playArrowShoot();

    // Spawn arrow from archer bow position
    const spawnPos = this.mesh.position.clone().add(new THREE.Vector3(0, 0.9, 0.5));
    const aimPoint = target.getBodyWorldPosition();

    // Calculate arc launch velocity
    const toTarget = aimPoint.clone().sub(spawnPos);
    const distHoriz = Math.hypot(toTarget.x, toTarget.z);
    const speed = 28;
    const timeFlight = distHoriz / speed;
    const gravity = 16;

    // Ballistic velocity
    const velY = (toTarget.y + 0.5 * gravity * timeFlight * timeFlight) / timeFlight;
    const launchDir = new THREE.Vector3(toTarget.x / timeFlight, velY, toTarget.z / timeFlight).normalize();

    arrows.push(new Arrow3D(scene, spawnPos, launchDir, speed, this.damage, false));

    // Master Archer dual volley perk!
    if (this.isMasterArcher) {
      const spreadDir = launchDir.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), 0.08);
      arrows.push(new Arrow3D(scene, spawnPos, spreadDir, speed, this.damage * 0.85, false));
    }
  }

  public updateCollector(
    dt: number,
    coins: Coin3D[],
    zombies: Zombie3D[],
    swiftPerk: boolean,
    greedyPerk: boolean
  ): void {
    if (this.role !== 'collector') return;

    this.animTime += dt * 10;
    const speed = swiftPerk ? this.moveSpeed * 1.5 : this.moveSpeed;
    const retreatDist = swiftPerk ? 6.5 : 4.5;

    // Check if any zombie is too close
    let inDanger = false;
    for (const z of zombies) {
      if (!z.isAlive || z.isDying) continue;
      if (this.mesh.position.distanceTo(z.mesh.position) < retreatDist) {
        inDanger = true;
        break;
      }
    }

    if (inDanger) {
      this.isRetreating = true;
    } else if (this.mesh.position.distanceTo(this.homePos) < 1.0) {
      this.isRetreating = false;
    }

    if (this.isRetreating) {
      // Run back to home gate
      const toHome = this.homePos.clone().sub(this.mesh.position);
      if (toHome.lengthSq() > 0.04) {
        toHome.normalize();
        this.mesh.position.addScaledVector(toHome, speed * dt);
        this.mesh.rotation.y = Math.atan2(toHome.x, toHome.z);
        this.animateRun();
      }
      return;
    }

    // Find closest available coin
    let bestCoin: Coin3D | null = null;
    let closestDist = 999;

    for (const c of coins) {
      if (!c.isAlive) continue;
      // Skip coins that are behind zombie front line
      const d = this.mesh.position.distanceTo(c.mesh.position);
      if (d < closestDist) {
        closestDist = d;
        bestCoin = c;
      }
    }

    if (bestCoin) {
      const toCoin = bestCoin.mesh.position.clone().sub(this.mesh.position);
      if (toCoin.length() < 0.8) {
        // Collect coin!
        bestCoin.collect(greedyPerk);
      } else {
        toCoin.normalize();
        this.mesh.position.addScaledVector(toCoin, speed * dt);
        this.mesh.rotation.y = Math.atan2(toCoin.x, toCoin.z);
        this.animateRun();
      }
    } else {
      // No coins, return home
      const toHome = this.homePos.clone().sub(this.mesh.position);
      if (toHome.length() > 0.4) {
        toHome.normalize();
        this.mesh.position.addScaledVector(toHome, speed * 0.7 * dt);
        this.mesh.rotation.y = Math.atan2(toHome.x, toHome.z);
        this.animateRun();
      } else {
        this.mesh.position.copy(this.homePos);
        this.mesh.rotation.y = 0;
        this.resetPose();
      }
    }
  }

  private animateRun(): void {
    const legAngle = Math.sin(this.animTime) * 0.7;
    if (this.leftLeg) this.leftLeg.rotation.x = legAngle;
    if (this.rightLeg) this.rightLeg.rotation.x = -legAngle;
    if (this.leftArm) this.leftArm.rotation.x = -legAngle * 0.6;
    if (this.rightArm) this.rightArm.rotation.x = legAngle * 0.6;
  }

  private resetPose(): void {
    if (this.leftLeg) this.leftLeg.rotation.x = 0;
    if (this.rightLeg) this.rightLeg.rotation.x = 0;
    if (this.leftArm) this.leftArm.rotation.x = 0;
    if (this.rightArm) this.rightArm.rotation.x = 0;
  }

  public destroy(scene: THREE.Scene): void {
    scene.remove(this.mesh);
  }
}
