import * as THREE from 'three';
import { ModelFactory } from './Models';
import { SoundEffects } from '../systems/SoundEffects';

export class Castle3D {
  public group: THREE.Group;
  public maxHp: number;
  public currentHp: number;
  public cauldronGroup: THREE.Group;
  public isOilPouring: boolean = false;
  public oilPuddleMesh?: THREE.Mesh;
  public oilPuddleTimeRemaining: number = 0;

  private gateDoor?: THREE.Mesh;
  private torches: THREE.Group[] = [];

  constructor(scene: THREE.Scene, maxHp: number = 250, wallLevel: number = 1) {
    this.maxHp = maxHp;
    this.currentHp = maxHp;

    this.group = ModelFactory.createCastle(wallLevel);
    scene.add(this.group);

    // Find gate door
    const door = this.group.getObjectByName('GateDoor');
    if (door instanceof THREE.Mesh) {
      this.gateDoor = door;
    }

    // Find all torches for flickering animation
    this.group.traverse((obj) => {
      if (obj.name === 'Torch' && obj instanceof THREE.Group) {
        this.torches.push(obj);
      }
    });

    // Mount Cauldron above gate arch
    this.cauldronGroup = ModelFactory.createCauldron();
    this.cauldronGroup.position.set(0, 6.2, -4.5);
    scene.add(this.cauldronGroup);
  }

  public takeDamage(amount: number): boolean {
    this.currentHp = Math.max(0, this.currentHp - amount);

    // Gate shudder animation
    if (this.gateDoor) {
      this.gateDoor.position.z = -4.3 + (Math.random() - 0.5) * 0.15;
      setTimeout(() => {
        if (this.gateDoor) this.gateDoor.position.z = -4.3;
      }, 100);
    }

    SoundEffects.getInstance().playGateHit();
    return this.currentHp <= 0;
  }

  public repair(amount: number): void {
    this.currentHp = Math.min(this.maxHp, this.currentHp + amount);
  }

  public pourOil(scene: THREE.Scene): void {
    if (this.isOilPouring) return;
    this.isOilPouring = true;
    SoundEffects.getInstance().playOilSizzle();

    // Tilt cauldron down
    const startRot = this.cauldronGroup.rotation.x;
    let elapsed = 0;

    const tiltInterval = setInterval(() => {
      elapsed += 0.05;
      if (elapsed < 0.6) {
        this.cauldronGroup.rotation.x = THREE.MathUtils.lerp(startRot, Math.PI / 2.2, elapsed / 0.6);
      } else if (elapsed < 1.4) {
        // Holding pour
      } else if (elapsed < 2.0) {
        this.cauldronGroup.rotation.x = THREE.MathUtils.lerp(Math.PI / 2.2, startRot, (elapsed - 1.4) / 0.6);
      } else {
        clearInterval(tiltInterval);
        this.cauldronGroup.rotation.x = startRot;
        this.isOilPouring = false;
      }
    }, 50);

    // Spawn 3D Boiling Oil Puddle at gate
    if (this.oilPuddleMesh) {
      scene.remove(this.oilPuddleMesh);
      this.oilPuddleMesh.geometry.dispose();
    }

    const puddleGeo = new THREE.CylinderGeometry(3.2, 3.2, 0.08, 16);
    const puddleMat = new THREE.MeshStandardMaterial({
      color: 0xff3d00,
      emissive: 0xff5722,
      emissiveIntensity: 2.0,
      roughness: 0.2,
      metalness: 0.1,
    });
    this.oilPuddleMesh = new THREE.Mesh(puddleGeo, puddleMat);
    this.oilPuddleMesh.position.set(0, 0.05, -1.5);
    scene.add(this.oilPuddleMesh);

    this.oilPuddleTimeRemaining = 7.0; // 7 seconds burning pool
  }

  public update(dt: number, scene: THREE.Scene): void {
    // Torch flickering
    for (const torch of this.torches) {
      const light = torch.getObjectByName('TorchLight') as THREE.PointLight;
      const flame = torch.getObjectByName('Flame') as THREE.Mesh;
      if (light) {
        light.intensity = 1.8 + Math.sin(Date.now() * 0.01 + torch.id) * 0.4 + (Math.random() - 0.5) * 0.3;
      }
      if (flame) {
        const s = 1.0 + Math.sin(Date.now() * 0.015 + torch.id) * 0.15;
        flame.scale.set(s, s, s);
      }
    }

    // Oil Puddle timer
    if (this.oilPuddleTimeRemaining > 0 && this.oilPuddleMesh) {
      this.oilPuddleTimeRemaining -= dt;
      // Pulsate emissive glow
      const mat = this.oilPuddleMesh.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 1.5 + Math.sin(Date.now() * 0.008) * 0.6;

      if (this.oilPuddleTimeRemaining <= 0) {
        scene.remove(this.oilPuddleMesh);
        this.oilPuddleMesh.geometry.dispose();
        mat.dispose();
        this.oilPuddleMesh = undefined;
      }
    }
  }

  public destroy(scene: THREE.Scene): void {
    scene.remove(this.group);
    scene.remove(this.cauldronGroup);
    if (this.oilPuddleMesh) {
      scene.remove(this.oilPuddleMesh);
    }
  }
}
