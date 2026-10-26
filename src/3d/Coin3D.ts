import * as THREE from 'three';
import { ModelFactory } from './Models';
import { EconomyManager } from '../systems/EconomyManager';
import { SoundEffects } from '../systems/SoundEffects';

export class Coin3D {
  public mesh: THREE.Group;
  public velocity: THREE.Vector3;
  public isAlive: boolean = true;
  public baseValue: number = 3;
  public isCollected: boolean = false;
  private lifeTimer: number = 24.0; // Despawns after 24s if unattended

  constructor(scene: THREE.Scene, spawnPos: THREE.Vector3, bonusValue: number = 0) {
    this.mesh = ModelFactory.createCoin();
    this.mesh.position.copy(spawnPos);
    this.mesh.position.y = Math.max(0.2, spawnPos.y);
    this.baseValue += bonusValue;

    // Upward and outward bounce impulse
    this.velocity = new THREE.Vector3(
      (Math.random() - 0.5) * 3.5,
      Math.random() * 3.5 + 3.0,
      (Math.random() - 0.5) * 3.5
    );

    scene.add(this.mesh);
  }

  public update(dt: number): void {
    if (!this.isAlive) return;

    // Spin
    this.mesh.rotation.y += dt * 4.5;

    // Physics bounce
    if (this.mesh.position.y > 0.15 || this.velocity.y > 0) {
      this.velocity.y -= 16 * dt;
      this.mesh.position.addScaledVector(this.velocity, dt);

      if (this.mesh.position.y <= 0.15) {
        this.mesh.position.y = 0.15;
        this.velocity.y = -this.velocity.y * 0.45;
        this.velocity.x *= 0.6;
        this.velocity.z *= 0.6;
      }
    }

    this.lifeTimer -= dt;
    if (this.lifeTimer <= 0) {
      this.isAlive = false;
    }
  }

  public collect(greedyPerk: boolean = false): void {
    if (this.isCollected || !this.isAlive) return;
    this.isCollected = true;
    this.isAlive = false;

    const reward = this.baseValue + (greedyPerk ? 3 : 0);
    EconomyManager.getInstance().addCoins(reward);
    SoundEffects.getInstance().playCoinPickup();
  }

  public destroy(scene: THREE.Scene): void {
    scene.remove(this.mesh);
  }
}
