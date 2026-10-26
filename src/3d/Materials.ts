import * as THREE from 'three';

// Procedural texture generators for ultra-crisp, zero-download PBR materials
function createStoneTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Base stone color
  ctx.fillStyle = '#4a5568';
  ctx.fillRect(0, 0, 512, 512);

  // Stone block grid with mortar
  const rows = 16;
  const cols = 8;
  const rh = 512 / rows;
  const cw = 512 / cols;

  for (let r = 0; r < rows; r++) {
    const offset = (r % 2) * (cw / 2);
    for (let c = -1; c <= cols; c++) {
      const x = c * cw + offset;
      const y = r * rh;
      // Slight color variation
      const v = Math.floor(Math.random() * 25 - 12);
      const gray = Math.min(255, Math.max(50, 85 + v));
      ctx.fillStyle = `rgb(${gray - 10}, ${gray}, ${gray + 8})`;
      ctx.fillRect(x + 2, y + 2, cw - 4, rh - 4);

      // Noise speckles
      for (let s = 0; s < 15; s++) {
        ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.12)';
        ctx.fillRect(x + 2 + Math.random() * (cw - 6), y + 2 + Math.random() * (rh - 6), 3, 3);
      }
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function createWoodTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#5c4033';
  ctx.fillRect(0, 0, 256, 256);

  // Planks
  const plankH = 32;
  for (let y = 0; y < 256; y += plankH) {
    const tone = Math.floor(Math.random() * 20 - 10);
    ctx.fillStyle = `rgb(${92 + tone}, ${64 + tone}, ${51 + tone})`;
    ctx.fillRect(0, y + 1, 256, plankH - 2);

    // Wood grain lines
    for (let i = 0; i < 6; i++) {
      ctx.fillStyle = 'rgba(0,0,0,0.1)';
      ctx.fillRect(0, y + 2 + Math.random() * (plankH - 4), 256, 1);
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function createGroundTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Dark gothic battleground soil
  ctx.fillStyle = '#1c281e';
  ctx.fillRect(0, 0, 512, 512);

  // Patches of dark trampled grass and mud
  for (let i = 0; i < 300; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const r = 10 + Math.random() * 30;
    const isGrass = Math.random() > 0.4;
    ctx.fillStyle = isGrass ? 'rgba(34, 56, 32, 0.4)' : 'rgba(28, 20, 15, 0.5)';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Cobblestone path in center
  for (let y = 0; y < 512; y += 14) {
    for (let x = 180; x < 332; x += 16) {
      const v = Math.floor(Math.random() * 20);
      ctx.fillStyle = `rgb(${60 + v}, ${62 + v}, ${65 + v})`;
      ctx.beginPath();
      ctx.roundRect(x + 1, y + 1, 14, 12, 3);
      ctx.fill();
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function createGoldCoinTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#ffb300';
  ctx.fillRect(0, 0, 128, 128);

  ctx.strokeStyle = '#ffe082';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.arc(64, 64, 52, 0, Math.PI * 2);
  ctx.stroke();

  // Star in center
  ctx.fillStyle = '#ffe082';
  ctx.font = 'bold 44px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('★', 64, 64);

  return new THREE.CanvasTexture(canvas);
}

// Global cached materials
export class GameMaterials {
  public static stoneTex = createStoneTexture();
  public static woodTex = createWoodTexture();
  public static groundTex = createGroundTexture();
  public static coinTex = createGoldCoinTexture();

  // Castle Materials
  public static stoneWall = new THREE.MeshStandardMaterial({
    map: GameMaterials.stoneTex,
    roughness: 0.85,
    metalness: 0.1,
  });

  public static castleWood = new THREE.MeshStandardMaterial({
    map: GameMaterials.woodTex,
    roughness: 0.7,
    metalness: 0.1,
  });

  public static ironTrim = new THREE.MeshStandardMaterial({
    color: 0x22252a,
    roughness: 0.4,
    metalness: 0.85,
  });

  public static towerRoof = new THREE.MeshStandardMaterial({
    color: 0x1b2838,
    roughness: 0.6,
    metalness: 0.2,
  });

  public static ground = new THREE.MeshStandardMaterial({
    map: GameMaterials.groundTex,
    roughness: 0.95,
    metalness: 0.05,
  });

  // Lava / Molten Oil
  public static moltenOil = new THREE.MeshStandardMaterial({
    color: 0xff3d00,
    emissive: 0xff5722,
    emissiveIntensity: 1.5,
    roughness: 0.2,
    metalness: 0.1,
  });

  // Gold Coin
  public static goldCoin = new THREE.MeshStandardMaterial({
    map: GameMaterials.coinTex,
    color: 0xffd700,
    roughness: 0.25,
    metalness: 0.9,
    emissive: 0xff9900,
    emissiveIntensity: 0.2,
  });

  // Human / Defender Materials
  public static skinHuman = new THREE.MeshStandardMaterial({
    color: 0xf5cba7,
    roughness: 0.8,
  });

  public static clothRookie = new THREE.MeshStandardMaterial({
    color: 0x8d6e63, // Leather brown
    roughness: 0.8,
  });

  public static clothCaptain = new THREE.MeshStandardMaterial({
    color: 0x1565c0, // Royal blue
    roughness: 0.6,
    metalness: 0.3,
  });

  public static clothMajor = new THREE.MeshStandardMaterial({
    color: 0xb0bec5, // Silver plate armor
    roughness: 0.3,
    metalness: 0.8,
  });

  public static clothArcher = new THREE.MeshStandardMaterial({
    color: 0x2e7d32, // Forest Ranger Green
    roughness: 0.6,
  });

  public static clothCollector = new THREE.MeshStandardMaterial({
    color: 0xe65100, // Vibrant orange jacket
    roughness: 0.8,
  });

  // Zombie Materials
  public static zombieSkin = new THREE.MeshStandardMaterial({
    color: 0x43a047, // Decayed green
    roughness: 0.9,
    metalness: 0.05,
  });

  public static zombieSkinRunner = new THREE.MeshStandardMaterial({
    color: 0x7cb342, // Sickly lime
    roughness: 0.85,
  });

  public static zombieSkinTank = new THREE.MeshStandardMaterial({
    color: 0x37474f, // Dark armored charcoal
    roughness: 0.5,
    metalness: 0.6,
  });

  public static zombieSkinExploder = new THREE.MeshStandardMaterial({
    color: 0xb71c1c, // Inflamed diseased red
    roughness: 0.7,
    emissive: 0x7f0000,
    emissiveIntensity: 0.5,
  });

  public static zombieEyeGlow = new THREE.MeshBasicMaterial({
    color: 0xff1744, // Glowing evil red
  });

  public static runnerEyeGlow = new THREE.MeshBasicMaterial({
    color: 0xffeb3b, // Piercing yellow
  });

  public static exploderPustule = new THREE.MeshStandardMaterial({
    color: 0x76ff03,
    emissive: 0x64dd17,
    emissiveIntensity: 1.8,
    roughness: 0.3,
  });

  // Arrow Materials
  public static arrowShaft = new THREE.MeshStandardMaterial({
    color: 0xd7ccc8,
    roughness: 0.7,
  });

  public static arrowTip = new THREE.MeshStandardMaterial({
    color: 0x90a4ae,
    metalness: 0.9,
    roughness: 0.2,
  });

  public static arrowFletchRed = new THREE.MeshBasicMaterial({
    color: 0xd32f2f,
  });

  public static arrowFletchGold = new THREE.MeshBasicMaterial({
    color: 0xffd54f,
  });
}
