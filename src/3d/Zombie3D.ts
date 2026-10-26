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
  public deathTimer: number = 0.85;
  public isMarked: boolean = false;
  public markedDuration: number = 0;

  // Animation references
  private leftLeg?: THREE.Object3D;
  private rightLeg?: THREE.Object3D;
  private leftArm?: THREE.Object3D;
  private rightArm?: THREE.Object3D;
  private headGroup?: THREE.Group;
  private belly?: THREE.Object3D;
  private markedRing?: THREE.Mesh;

  private animTime: number = Math.random() * 10;
  public isAtGate: boolean = false;

  // Siege ranged attack
  public siegeTimer: number = 0;

  constructor(scene: THREE.Scene, type: ZombieType, wave: number, spawnX: number, spawnZ: number) {
    this.type = type;
    this.mesh = ModelFactory.createZombie(type);
    this.mesh.position.set(spawnX, 0, spawnZ);

    // Orient zombie to face forward directly toward the castle gate!
    const toGate = new THREE.Vector3(0, 0, -4.0).sub(this.mesh.position);
    this.mesh.rotation.y = Math.atan2(toGate.x, toGate.z);

    // Cache limb references
    this.leftLeg = this.mesh.getObjectByName('LeftLeg');
    this.rightLeg = this.mesh.getObjectByName('RightLeg');
    this.leftArm = this.mesh.getObjectByName('LeftArm');
    this.rightArm = this.mesh.getObjectByName('RightArm');
    this.headGroup = this.mesh.getObjectByName('HeadGroup') as THREE.Group;
    this.belly = this.mesh.getObjectByName('Belly');

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
        this.gateDamage = Math.round(85 * dmgScale);
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
    const ringGeo = new THREE.RingGeometry(0.75, 0.95, 16);
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

    // Head flinch on hit
    if (this.headGroup) {
      this.headGroup.rotation.x = -0.3;
    }

    if (this.currentHp <= 0 && !this.isDying) {
      this.isDying = true;
      this.currentHp = 0;
      return true; // Just died
    }
    return false;
  }

  public getHeadWorldPosition(): THREE.Vector3 {
    if (this.headGroup) {
      const pos = new THREE.Vector3();
      this.headGroup.getWorldPosition(pos);
      return pos;
    }
    return this.mesh.position.clone().add(new THREE.Vector3(0, 1.6, 0));
  }

  public getBodyWorldPosition(): THREE.Vector3 {
    return this.mesh.position.clone().add(new THREE.Vector3(0, 0.9, 0));
  }

  public update(dt: number, now: number): void {
    if (this.isDying) {
      this.deathTimer -= dt;
      // Dramatic cartoon collapse: fall backward, head rolls back & sink
      this.mesh.rotation.x = THREE.MathUtils.lerp(this.mesh.rotation.x, -Math.PI / 2.1, dt * 7);
      if (this.headGroup) {
        this.headGroup.rotation.x = THREE.MathUtils.lerp(this.headGroup.rotation.x, -0.6, dt * 5);
      }
      this.mesh.position.y -= dt * 0.45;
      if (this.deathTimer <= 0) {
        this.isAlive = false;
      }
      return;
    }

    this.animTime += dt * this.speed * 2.6;

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
      const pulse = 1.0 + Math.sin(now * 0.01) * 0.14;
      this.belly.scale.set(1.4 * pulse, 1.1 * pulse, 1.35 * pulse);
    }

    // Animated Bobblehead Wobble & Bounce! (Iconic cartoon zombie characteristic)
    if (this.headGroup) {
      this.headGroup.rotation.z = Math.sin(this.animTime * 0.8) * 0.12;
      this.headGroup.rotation.y = Math.cos(this.animTime * 0.5) * 0.08;
      this.headGroup.rotation.x = THREE.MathUtils.lerp(this.headGroup.rotation.x, 0.05, dt * 5);
      this.headGroup.position.y = 1.5 + Math.abs(Math.sin(this.animTime * 1.5)) * 0.06;
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

      // Keep facing directly towards the castle gate as they walk!
      const toGate = new THREE.Vector3(0, 0, -4.0).sub(this.mesh.position);
      this.mesh.rotation.y = Math.atan2(toGate.x, toGate.z);

      // Cartoon Waddle Walk cycle animation
      const legAngle = Math.sin(this.animTime) * 0.7;
      if (this.leftLeg) this.leftLeg.rotation.x = legAngle;
      if (this.rightLeg) this.rightLeg.rotation.x = -legAngle;

      // Splayed arms swaying
      const armAngle = Math.sin(this.animTime) * 0.35;
      if (this.leftArm) this.leftArm.rotation.x = armAngle;
      if (this.rightArm) this.rightArm.rotation.x = -armAngle;
    } else {
      // Reached gate!
      this.isAtGate = true;
      this.mesh.position.z = gateTargetZ;
      this.mesh.rotation.y = Math.PI; // Face directly flush against the gate door!

      // Attack bash animation
      const attackAnim = Math.sin(now * 0.009) * 0.45;
      if (this.leftArm) this.leftArm.rotation.x = attackAnim;
      if (this.rightArm) this.rightArm.rotation.x = -attackAnim;

      // Head banging on gate
      if (this.headGroup) {
        this.headGroup.rotation.x = Math.max(0, attackAnim * 0.5);
      }
    }
  }

  public destroy(scene: THREE.Scene): void {
    scene.remove(this.mesh);
  }
}
