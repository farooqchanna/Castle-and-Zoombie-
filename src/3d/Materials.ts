import * as THREE from 'three';

// Procedural texture generators for ultra-crisp, zero-download PBR materials
function createStoneTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#4a5568';
  ctx.fillRect(0, 0, 512, 512);

  const rows = 16;
  const cols = 8;
  const rh = 512 / rows;
  const cw = 512 / cols;

  for (let r = 0; r < rows; r++) {
    const offset = (r % 2) * (cw / 2);
    for (let c = -1; c <= cols; c++) {
      const x = c * cw + offset;
      const y = r * rh;
      const v = Math.floor(Math.random() * 25 - 12);
      const gray = Math.min(255, Math.max(50, 85 + v));
      ctx.fillStyle = `rgb(${gray - 10}, ${gray}, ${gray + 8})`;
      ctx.fillRect(x + 2, y + 2, cw - 4, rh - 4);

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

  const plankH = 32;
  for (let y = 0; y < 256; y += plankH) {
    const tone = Math.floor(Math.random() * 20 - 10);
    ctx.fillStyle = `rgb(${92 + tone}, ${64 + tone}, ${51 + tone})`;
    ctx.fillRect(0, y + 1, 256, plankH - 2);

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

  ctx.fillStyle = '#1c281e';
  ctx.fillRect(0, 0, 512, 512);

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

  ctx.fillStyle = '#ffe082';
  ctx.font = 'bold 44px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('★', 64, 64);

  return new THREE.CanvasTexture(canvas);
}

// Procedural Cartoon Stylized Eye Texture (Tim Burton / PvZ style)
function createCartoonEyeTexture(type: 'normal' | 'bloodshot' | 'yellow' | 'spiral' = 'normal'): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Sclera base (creamy / ivory)
  ctx.fillStyle = type === 'yellow' ? '#f5ee9e' : '#f8f4e6';
  ctx.fillRect(0, 0, 256, 256);

  // Soft darkening around border
  const radialGradient = ctx.createRadialGradient(128, 128, 60, 128, 128, 128);
  radialGradient.addColorStop(0, 'rgba(0,0,0,0)');
  radialGradient.addColorStop(1, 'rgba(120,40,30,0.35)');
  ctx.fillStyle = radialGradient;
  ctx.fillRect(0, 0, 256, 256);

  // Bloodshot veins
  if (type === 'bloodshot' || type === 'normal') {
    ctx.strokeStyle = 'rgba(180, 30, 30, 0.6)';
    ctx.lineWidth = 2.5;

    for (let i = 0; i < 7; i++) {
      const angle = (i / 7) * Math.PI * 2 + Math.random() * 0.3;
      const startX = 128 + Math.cos(angle) * 115;
      const startY = 128 + Math.sin(angle) * 115;
      const midX = 128 + Math.cos(angle) * 65 + (Math.random() - 0.5) * 20;
      const midY = 128 + Math.sin(angle) * 65 + (Math.random() - 0.5) * 20;

      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.quadraticCurveTo(midX, midY, 128 + Math.cos(angle) * 45, 128 + Math.sin(angle) * 45);
      ctx.stroke();
    }
  }

  // Iris Ring
  const irisRadius = type === 'yellow' ? 48 : 56;
  ctx.fillStyle = type === 'yellow' ? '#e65100' : (type === 'bloodshot' ? '#5c1d1d' : '#2d241e');
  ctx.beginPath();
  ctx.arc(128, 128, irisRadius, 0, Math.PI * 2);
  ctx.fill();

  // Pupil
  if (type === 'spiral') {
    ctx.strokeStyle = '#76ff03';
    ctx.lineWidth = 5;
    ctx.beginPath();
    for (let a = 0; a < 6 * Math.PI; a += 0.1) {
      const r = (a / (6 * Math.PI)) * 40;
      const x = 128 + Math.cos(a) * r;
      const y = 128 + Math.sin(a) * r;
      if (a === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  } else {
    // Big dark cartoon pupil
    const pupilRadius = type === 'bloodshot' ? 32 : 36;
    ctx.fillStyle = '#0a0a0a';
    ctx.beginPath();
    ctx.arc(128, 128, pupilRadius, 0, Math.PI * 2);
    ctx.fill();

    // Glossy specular highlight reflections
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.beginPath();
    ctx.arc(114, 114, 11, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(138, 138, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(canvas);
  return tex;
}

// Procedural Ragged Shirt Texture with Stitches and Fabric Grunge
function createTornFabricTexture(baseHex: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = baseHex;
  ctx.fillRect(0, 0, 256, 256);

  // Grunge noise
  for (let i = 0; i < 400; i++) {
    ctx.fillStyle = Math.random() > 0.5 ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.05)';
    ctx.fillRect(Math.random() * 256, Math.random() * 256, 4, 4);
  }

  // Tattered holes
  for (let h = 0; h < 3; h++) {
    const hx = 60 + h * 70 + (Math.random() - 0.5) * 20;
    const hy = 120 + (Math.random() - 0.5) * 40;
    ctx.fillStyle = '#1c1b18';
    ctx.beginPath();
    ctx.ellipse(hx, hy, 12, 18, Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();

    // Stitches around hole
    ctx.strokeStyle = '#d7ccc8';
    ctx.lineWidth = 2;
    for (let s = -2; s <= 2; s++) {
      ctx.beginPath();
      ctx.moveTo(hx + s * 7 - 4, hy - 16);
      ctx.lineTo(hx + s * 7 + 4, hy - 12);
      ctx.stroke();
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  return tex;
}

// Global cached materials
export class GameMaterials {
  public static stoneTex = createStoneTexture();
  public static woodTex = createWoodTexture();
  public static groundTex = createGroundTexture();
  public static coinTex = createGoldCoinTexture();

  // Cartoon Eye Textures
  public static eyeTexNormal = createCartoonEyeTexture('normal');
  public static eyeTexBloodshot = createCartoonEyeTexture('bloodshot');
  public static eyeTexYellow = createCartoonEyeTexture('yellow');
  public static eyeTexSpiral = createCartoonEyeTexture('spiral');

  // Cartoon Fabric Textures
  public static redShirtTex = createTornFabricTexture('#b23b47');
  public static coatTex = createTornFabricTexture('#3c3430');
  public static orangeShirtTex = createTornFabricTexture('#c4542d');

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
    roughness: 0.75,
  });

  public static clothRookie = new THREE.MeshStandardMaterial({
    color: 0x8d6e63,
    roughness: 0.8,
  });

  public static clothCaptain = new THREE.MeshStandardMaterial({
    color: 0x1565c0,
    roughness: 0.6,
    metalness: 0.3,
  });

  public static clothMajor = new THREE.MeshStandardMaterial({
    color: 0xb0bec5,
    roughness: 0.3,
    metalness: 0.8,
  });

  public static clothArcher = new THREE.MeshStandardMaterial({
    color: 0x2e7d32,
    roughness: 0.6,
  });

  public static clothCollector = new THREE.MeshStandardMaterial({
    color: 0xe65100,
    roughness: 0.8,
  });

  // ==========================================
  // CARTOON BOBBLEHEAD ZOMBIE MATERIALS
  // ==========================================

  // Sickly Olive / Teal / Lime Skin Tones from the reference images
  public static zombieSkinOlive = new THREE.MeshStandardMaterial({
    color: 0x6e8a5b, // Muted olive green (Sample 1)
    roughness: 0.65,
    metalness: 0.05,
  });

  public static zombieSkinTeal = new THREE.MeshStandardMaterial({
    color: 0x4f8274, // Desaturated teal zombie skin (Sample 3)
    roughness: 0.65,
    metalness: 0.05,
  });

  public static zombieSkinPaleYellow = new THREE.MeshStandardMaterial({
    color: 0x859158, // Sickly yellowish green (Sample 2)
    roughness: 0.65,
    metalness: 0.05,
  });

  public static zombieSkinTank = new THREE.MeshStandardMaterial({
    color: 0x475b52, // Dark stony olive-gray
    roughness: 0.7,
    metalness: 0.1,
  });

  public static zombieSkinExploder = new THREE.MeshStandardMaterial({
    color: 0x933d3d, // Inflamed feverish cartoon red
    roughness: 0.6,
    emissive: 0x5a1818,
    emissiveIntensity: 0.4,
  });

  // Glossy Cartoon Eyes
  public static eyeMatNormal = new THREE.MeshStandardMaterial({
    map: GameMaterials.eyeTexNormal,
    roughness: 0.15,
    metalness: 0.1,
  });

  public static eyeMatBloodshot = new THREE.MeshStandardMaterial({
    map: GameMaterials.eyeTexBloodshot,
    roughness: 0.15,
    metalness: 0.1,
  });

  public static eyeMatYellow = new THREE.MeshStandardMaterial({
    map: GameMaterials.eyeTexYellow,
    roughness: 0.15,
    metalness: 0.1,
  });

  public static eyeMatSpiral = new THREE.MeshStandardMaterial({
    map: GameMaterials.eyeTexSpiral,
    roughness: 0.2,
    emissive: 0x64dd17,
    emissiveIntensity: 0.6,
  });

  // Eye socket rims (dark sunken rings)
  public static eyeSocketDark = new THREE.MeshStandardMaterial({
    color: 0x2b2020,
    roughness: 0.85,
  });

  // Mouth cavity and teeth
  public static mouthCavity = new THREE.MeshBasicMaterial({
    color: 0x160d0d,
  });

  public static rottenTeeth = new THREE.MeshStandardMaterial({
    color: 0xf0e6c8,
    roughness: 0.4,
  });

  // Spiky Messy Hair
  public static cartoonHairDark = new THREE.MeshStandardMaterial({
    color: 0x1e1c1b,
    roughness: 0.9,
  });

  // Surgical stitches & scars
  public static stitchThread = new THREE.MeshStandardMaterial({
    color: 0x1f140e,
    roughness: 0.9,
  });

  // Clothing Materials (Tattered & Stylized)
  public static clothRedShirt = new THREE.MeshStandardMaterial({
    map: GameMaterials.redShirtTex,
    roughness: 0.75,
  });

  public static clothDarkCoat = new THREE.MeshStandardMaterial({
    map: GameMaterials.coatTex,
    roughness: 0.8,
  });

  public static clothOrangeShirt = new THREE.MeshStandardMaterial({
    map: GameMaterials.orangeShirtTex,
    roughness: 0.75,
  });

  public static clothKhakiPants = new THREE.MeshStandardMaterial({
    color: 0x8a6e43, // Tattered tan shorts
    roughness: 0.85,
  });

  public static clothDarkPants = new THREE.MeshStandardMaterial({
    color: 0x2e3438,
    roughness: 0.85,
  });

  // Chunky Cartoon Shoes / Sneakers
  public static cartoonShoe = new THREE.MeshStandardMaterial({
    color: 0x3e2826,
    roughness: 0.6,
  });

  public static cartoonShoeSole = new THREE.MeshStandardMaterial({
    color: 0x212121,
    roughness: 0.7,
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
