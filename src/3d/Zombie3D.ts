import * as THREE from 'three';
import { ModelFactory } from './Models';

export type ZombieType = 'walker' | 'runner' | 'tank' | 'exploder' | 'siege' | 'boss';

export class Zombie3D {
  public mesh: THREE.Group;
  public type: ZombieType;
  public maxHp: number;
  public currentHp: number;
  public speed: number;
  public gateDamage: number;
  public attackCooldown: number = 1.2;
  public lastAttackTime: number = 0;

  public isAlive: boolean = true;
  public isDying: boolean = false;
  public deathTimer: number = 0.8;
  public isMarked: boolean = false;
  public markedDuration: number = 0;

  // Animation references
  private leftLeg?: THREE.Mesh;
  private rightLeg?: THREE.Mesh;
  private leftArm?: THREE.Mesh;
  private rightArm?: THREE.Mesh;
  private head?: THREE.Mesh;
  private belly?: THREE.Mesh;
  private markedRing?: THREE.Mesh;

  private animTime: number = Math.random() * 10;
  public isAtGate: boolean = false;

  // Siege ranged attack
  public siegeTimer: number = 0;

  constructor(scene: THREE.Scene, type: ZombieType, wave: number, spawnX: number, spawnZ: number) {
    this.type = type;
    this.mesh = ModelFactory.createZombie(type);
    this.mesh.position.set(spawnX, 0, spawnZ);

    // Cache limb references
    this.leftLeg = this.mesh.getObjectByName('LeftLeg') as THREE.Mesh;
    this.rightLeg = this.mesh.getObjectByName('RightLeg') as THREE.Mesh;
    this.leftArm = this.mesh.getObjectByName('LeftArm') as THREE.Mesh;
    this.rightArm = this.mesh.getObjectByName('RightArm') as THREE.Mesh;
    this.head = this.mesh.getObjectByName('Head') as THREE.Mesh;
    this.belly = this.mesh.getObjectByName('Belly') as THREE.Mesh;

    // Stat balancing & scaling
    const hpScale = 1 + (wave - 1) * 0.22;
    const dmgScale = 1 + (wave - 1) * 0.16;

    switch (type) {
      case 'walker':
        this.maxHp = Math.round(22 * hpScale);
        this.speed = 2.4;
        this.gateDamage = Math.round(6 * dmgScale);
        break;
      case 'runner':
        this.maxHp = Math.round(14 * hpScale);
        this.speed = 4.8;
        this.gateDamage = Math.round(4 * dmgScale);
        break;
      case 'tank':
        this.maxHp = Math.round(135 * hpScale);
        this.speed = 1.3;
        this.gateDamage = Math.round(26 * dmgScale);
        this.attackCooldown = 1.8;
        break;
      case 'exploder':
        this.maxHp = Math.round(38 * hpScale);
        this.speed = 2.7;
        this.gateDamage = Math.round(85 * dmgScale); // Huge explosion damage to gate
        break;
      case 'siege':
        this.maxHp = Math.round(85 * hpScale);
        this.speed = 1.6;
        this.gateDamage = Math.round(18 * dmgScale);
        break;
      case 'boss':
        this.maxHp = Math.round(450 * hpScale);
        this.speed = 1.4;
        this.gateDamage = Math.round(55 * dmgScale);
        this.attackCooldown = 2.0;
        break;
    }

    this.currentHp = this.maxHp;

    // Create Marked Target Ring (hidden initially)
    const ringGeo = new THREE.RingGeometry(0.7, 0.9, 16);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xff1744,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
    });
    this.markedRing = new THREE.Mesh(ringGeo, ringMat);
    this.markedRing.position.y = 0.1;
    this.markedRing.visible = false;
    this.mesh.add(this.markedRing);

    scene.add(this.mesh);
  }

  public markTarget(duration: number = 6.0): void {
    this.isMarked = true;
    this.markedDuration = duration;
    if (this.markedRing) {
      this.markedRing.visible = true;
    }
  }

  public takeDamage(amount: number): boolean {
    this.currentHp -= amount;

    // Flinch flash or hit recoil
    if (this.mesh) {
      this.mesh.position.z += 0.08;
    }

    if (this.currentHp <= 0 && !this.isDying) {
      this.isDying = true;
      this.currentHp = 0;
      return true; // Just died
    }
    return false;
  }

  public getHeadWorldPosition(): THREE.Vector3 {
    if (this.head) {
      const pos = new THREE.Vector3();
      this.head.getWorldPosition(pos);
      return pos;
    }
    return this.mesh.position.clone().add(new THREE.Vector3(0, 1.8, 0));
  }

  public getBodyWorldPosition(): THREE.Vector3 {
    return this.mesh.position.clone().add(new THREE.Vector3(0, 1.0, 0));
  }

  public update(dt: number, now: number): void {
    if (this.isDying) {
      this.deathTimer -= dt;
      // Collapse backward & sink
      this.mesh.rotation.x = THREE.MathUtils.lerp(this.mesh.rotation.x, -Math.PI / 2.2, dt * 6);
      this.mesh.position.y -= dt * 0.4;
      if (this.deathTimer <= 0) {
        this.isAlive = false;
      }
      return;
    }

    this.animTime += dt * this.speed * 2.5;

    // Marked timer
    if (this.isMarked) {
      this.markedDuration -= dt;
      if (this.markedRing) {
        this.markedRing.rotation.y += dt * 3;
      }
      if (this.markedDuration <= 0) {
        this.isMarked = false;
        if (this.markedRing) this.markedRing.visible = false;
      }
    }

    // Exploder belly pulsation
    if (this.type === 'exploder' && this.belly) {
      const pulse = 1.0 + Math.sin(now * 0.01) * 0.12;
      this.belly.scale.set(pulse, pulse, pulse);
    }

    // Siege fiend stops at Z = 26 to throw rocks
    if (this.type === 'siege' && this.mesh.position.z <= 26) {
      this.siegeTimer += dt;
      return;
    }

    // Movement towards castle gate at Z = -4.0, X = 0
    const gateTargetZ = -4.0;
    if (this.mesh.position.z > gateTargetZ) {
      this.isAtGate = false;
      this.mesh.position.z -= this.speed * dt;

      // Slight homing towards center gate X = 0
      const dx = 0 - this.mesh.position.x;
      this.mesh.position.x += Math.sign(dx) * Math.min(Math.abs(dx), dt * 0.8);

      // Walk cycle animation
      const legAngle = Math.sin(this.animTime) * 0.65;
      if (this.leftLeg) this.leftLeg.rotation.x = legAngle;
      if (this.rightLeg) this.rightLeg.rotation.x = -legAngle;

      const armAngle = Math.sin(this.animTime) * 0.4;
      if (this.leftArm) this.leftArm.rotation.x = armAngle;
      if (this.rightArm) this.rightArm.rotation.x = -armAngle;
    } else {
      // Reached gate!
      this.isAtGate = true;
      this.mesh.position.z = gateTargetZ;

      // Attack bash animation
      const attackAnim = Math.sin(now * 0.008) * 0.4;
      if (this.leftArm) this.leftArm.rotation.x = Math.PI / 3 + attackAnim;
      if (this.rightArm) this.rightArm.rotation.x = Math.PI / 3 - attackAnim;
    }
  }

  public destroy(scene: THREE.Scene): void {
    scene.remove(this.mesh);
  }
}
