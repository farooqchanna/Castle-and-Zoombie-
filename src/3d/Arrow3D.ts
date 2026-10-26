import * as THREE from 'three';
import { ModelFactory } from './Models';

export class Arrow3D {
  public mesh: THREE.Group;
  public velocity: THREE.Vector3;
  public damage: number;
  public isPlayerShot: boolean;
  public isCritical: boolean = false;
  public bouncesRemaining: number = 0;
  public isAlive: boolean = true;
  public hasHitGround: boolean = false;
  public lifeTimer: number = 4.0;

  private static defaultForward = new THREE.Vector3(0, 0, 1);

  constructor(
    scene: THREE.Scene,
    origin: THREE.Vector3,
    direction: THREE.Vector3,
    speed: number,
    damage: number,
    isPlayerShot: boolean = false,
    bounces: number = 0
  ) {
    this.mesh = ModelFactory.createArrow();
    this.mesh.position.copy(origin);
    this.damage = damage;
    this.isPlayerShot = isPlayerShot;
    this.bouncesRemaining = bounces;

    const dir = direction.clone().normalize();
    this.velocity = dir.multiplyScalar(speed);

    // Initial orientation
    this.alignToVelocity();

    scene.add(this.mesh);
  }

  public alignToVelocity(): void {
    if (this.velocity.lengthSq() < 0.001) return;
    const dir = this.velocity.clone().normalize();
    this.mesh.quaternion.setFromUnitVectors(Arrow3D.defaultForward, dir);
  }

  public update(dt: number, gravity: number = 16): void {
    if (!this.isAlive) return;

    if (this.hasHitGround) {
      this.lifeTimer -= dt;
      if (this.lifeTimer <= 0) {
        this.isAlive = false;
      }
      return;
    }

    // Ballistic physics
    this.velocity.y -= gravity * dt;
    this.mesh.position.addScaledVector(this.velocity, dt);

    this.alignToVelocity();

    // Check terrain collision
    if (this.mesh.position.y <= 0.05) {
      this.mesh.position.y = 0.05;
      this.hasHitGround = true;
      this.lifeTimer = 1.0; // Stays stuck in ground for 1s then vanishes
    }

    // Timeout
    this.lifeTimer -= dt;
    if (this.lifeTimer <= 0) {
      this.isAlive = false;
    }
  }

  public destroy(scene: THREE.Scene): void {
    scene.remove(this.mesh);
  }
}
