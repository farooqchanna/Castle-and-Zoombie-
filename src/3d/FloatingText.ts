import * as THREE from 'three';

interface FloatingItem {
  sprite: THREE.Sprite;
  velocity: THREE.Vector3;
  life: number;
  maxLife: number;
}

export class FloatingTextManager {
  private scene: THREE.Scene;
  private items: FloatingItem[] = [];

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  public spawn(
    text: string,
    pos: THREE.Vector3,
    color: string = '#ffffff',
    isLarge: boolean = false
  ): void {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 96;
    const ctx = canvas.getContext('2d')!;

    ctx.clearRect(0, 0, 256, 96);

    ctx.font = isLarge ? '900 42px "Arial Black", sans-serif' : 'bold 36px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Black outline / drop shadow for ultra readability
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 6;
    ctx.strokeText(text, 128, 48);

    ctx.fillStyle = color;
    ctx.fillText(text, 128, 48);

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    const material = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthTest: false,
    });

    const sprite = new THREE.Sprite(material);
    const scaleFactor = isLarge ? 2.8 : 1.9;
    sprite.scale.set(scaleFactor, scaleFactor * (96 / 256), 1);
    sprite.position.copy(pos);
    sprite.position.y += 0.8;

    this.scene.add(sprite);

    this.items.push({
      sprite,
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * 0.8,
        isLarge ? 2.8 : 2.2,
        (Math.random() - 0.5) * 0.8
      ),
      life: 1.0,
      maxLife: 1.0,
    });
  }

  public update(dt: number): void {
    for (let i = this.items.length - 1; i >= 0; i--) {
      const item = this.items[i];
      item.life -= dt * 1.4;

      if (item.life <= 0) {
        this.scene.remove(item.sprite);
        item.sprite.material.map?.dispose();
        item.sprite.material.dispose();
        this.items.splice(i, 1);
        continue;
      }

      item.sprite.position.addScaledVector(item.velocity, dt);
      item.velocity.y *= 0.94; // Decelerate upward drift
      item.sprite.material.opacity = Math.min(1.0, item.life * 1.5);
    }
  }

  public clear(): void {
    for (const item of this.items) {
      this.scene.remove(item.sprite);
      item.sprite.material.map?.dispose();
      item.sprite.material.dispose();
    }
    this.items = [];
  }
}
