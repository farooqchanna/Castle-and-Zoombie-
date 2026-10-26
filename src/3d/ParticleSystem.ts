import * as THREE from 'three';

interface Particle {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  life: number;
  maxLife: number;
  decayRate: number;
  gravity: number;
  startScale: number;
  endScale: number;
}

export class ParticleSystem {
  private scene: THREE.Scene;
  private particles: Particle[] = [];
  private pool: THREE.Mesh[] = [];

  private bloodMat = new THREE.MeshBasicMaterial({ color: 0x990000 });
  private critMat = new THREE.MeshBasicMaterial({ color: 0xffea00 });
  private smokeMat = new THREE.MeshBasicMaterial({ color: 0x555555, transparent: true, opacity: 0.6 });
  private fireMat = new THREE.MeshBasicMaterial({ color: 0xff3d00 });
  private coinSparkleMat = new THREE.MeshBasicMaterial({ color: 0xffd700 });

  private boxGeo = new THREE.BoxGeometry(0.12, 0.12, 0.12);
  private sparkGeo = new THREE.TetrahedronGeometry(0.08);

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  private getMesh(mat: THREE.Material, geo: THREE.BufferGeometry = this.boxGeo): THREE.Mesh {
    if (this.pool.length > 0) {
      const m = this.pool.pop()!;
      m.material = mat;
      m.geometry = geo;
      m.visible = true;
      return m;
    }
    const mesh = new THREE.Mesh(geo, mat);
    this.scene.add(mesh);
    return mesh;
  }

  public emitHitSparks(pos: THREE.Vector3, count: number = 8): void {
    for (let i = 0; i < count; i++) {
      const mesh = this.getMesh(this.bloodMat);
      mesh.position.copy(pos);
      const vel = new THREE.Vector3(
        (Math.random() - 0.5) * 6,
        Math.random() * 4 + 2,
        (Math.random() - 0.5) * 6
      );
      this.particles.push({
        mesh,
        velocity: vel,
        life: 1.0,
        maxLife: 1.0,
        decayRate: 2.5 + Math.random() * 1.5,
        gravity: 12,
        startScale: 0.2 + Math.random() * 0.15,
        endScale: 0.02,
      });
    }
  }

  public emitCriticalHeadshot(pos: THREE.Vector3): void {
    // Golden sparks and shock ring
    for (let i = 0; i < 20; i++) {
      const mesh = this.getMesh(this.critMat, this.sparkGeo);
      mesh.position.copy(pos);
      const vel = new THREE.Vector3(
        (Math.random() - 0.5) * 10,
        Math.random() * 7 + 3,
        (Math.random() - 0.5) * 10
      );
      this.particles.push({
        mesh,
        velocity: vel,
        life: 1.0,
        maxLife: 1.0,
        decayRate: 2.0,
        gravity: 10,
        startScale: 0.35,
        endScale: 0.05,
      });
    }
  }

  public emitExplosion(pos: THREE.Vector3): void {
    // Fiery blast + smoke
    for (let i = 0; i < 35; i++) {
      const isFire = Math.random() > 0.4;
      const mesh = this.getMesh(isFire ? this.fireMat : this.smokeMat, this.boxGeo);
      mesh.position.copy(pos);
      const speed = 4 + Math.random() * 9;
      const angle = Math.random() * Math.PI * 2;
      const elevation = Math.random() * Math.PI * 0.5;

      const vel = new THREE.Vector3(
        Math.cos(angle) * Math.cos(elevation) * speed,
        Math.sin(elevation) * speed,
        Math.sin(angle) * Math.cos(elevation) * speed
      );

      this.particles.push({
        mesh,
        velocity: vel,
        life: 1.0,
        maxLife: 1.0,
        decayRate: 1.5 + Math.random(),
        gravity: isFire ? 8 : -1.5, // Smoke drifts up
        startScale: 0.5 + Math.random() * 0.4,
        endScale: 0.05,
      });
    }
  }

  public emitCoinSparkle(pos: THREE.Vector3): void {
    for (let i = 0; i < 10; i++) {
      const mesh = this.getMesh(this.coinSparkleMat, this.sparkGeo);
      mesh.position.copy(pos);
      const vel = new THREE.Vector3(
        (Math.random() - 0.5) * 4,
        Math.random() * 5 + 2,
        (Math.random() - 0.5) * 4
      );
      this.particles.push({
        mesh,
        velocity: vel,
        life: 1.0,
        maxLife: 1.0,
        decayRate: 2.2,
        gravity: 7,
        startScale: 0.25,
        endScale: 0.02,
      });
    }
  }

  public emitOilFire(pos: THREE.Vector3): void {
    for (let i = 0; i < 3; i++) {
      const mesh = this.getMesh(this.fireMat, this.sparkGeo);
      mesh.position.set(
        pos.x + (Math.random() - 0.5) * 3,
        pos.y + 0.2,
        pos.z + (Math.random() - 0.5) * 3
      );
      const vel = new THREE.Vector3(
        (Math.random() - 0.5) * 1.5,
        Math.random() * 3 + 2,
        (Math.random() - 0.5) * 1.5
      );
      this.particles.push({
        mesh,
        velocity: vel,
        life: 1.0,
        maxLife: 1.0,
        decayRate: 3.5,
        gravity: -2, // Flames rise
        startScale: 0.35,
        endScale: 0.05,
      });
    }
  }

  public update(dt: number): void {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= p.decayRate * dt;

      if (p.life <= 0) {
        p.mesh.visible = false;
        this.pool.push(p.mesh);
        this.particles.splice(i, 1);
        continue;
      }

      // Physics
      p.velocity.y -= p.gravity * dt;
      p.mesh.position.addScaledVector(p.velocity, dt);

      // Bounce on ground
      if (p.mesh.position.y < 0.05 && p.velocity.y < 0) {
        p.mesh.position.y = 0.05;
        p.velocity.y = -p.velocity.y * 0.4;
        p.velocity.x *= 0.7;
        p.velocity.z *= 0.7;
      }

      // Scale down over life
      const progress = p.life / p.maxLife;
      const s = THREE.MathUtils.lerp(p.endScale, p.startScale, progress);
      p.mesh.scale.set(s, s, s);
    }
  }
}
