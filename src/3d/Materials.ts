import * as THREE from 'three';

// Procedural texture generators for ultra-crisp, zero-download PBR materials
function createStoneTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#607274';
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
      const gray = Math.min(255, Math.max(80, 115 + v));
      ctx.fillStyle = `rgb(${gray - 8}, ${gray}, ${gray + 10})`;
      ctx.fillRect(x + 2, y + 2, cw - 4, rh - 4);

      for (let s = 0; s < 12; s++) {
        ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
        ctx.fillRect(x + 2 + Math.random() * (cw - 6), y + 2 + Math.random() * (rh - 6), 3, 3);
      }
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function createStoneBumpTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#222222'; // Deep recessed mortar
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
      const grad = ctx.createRadialGradient(x + cw / 2, y + rh / 2, 4, x + cw / 2, y + rh / 2, cw * 0.55);
      grad.addColorStop(0, '#e5e5e5');
      grad.addColorStop(0.7, '#b8b8b8');
      grad.addColorStop(0.9, '#656565');
      grad.addColorStop(1, '#222222');
      ctx.fillStyle = grad;
      ctx.fillRect(x + 2, y + 2, cw - 4, rh - 4);

      for (let s = 0; s < 14; s++) {
        ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)';
        ctx.fillRect(x + 3 + Math.random() * (cw - 8), y + 3 + Math.random() * (rh - 8), 2.5, 2.5);
      }
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function createCobblestoneBumpTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#101010'; // Deep mortar gaps
  ctx.fillRect(0, 0, 512, 512);

  const rows = 20;
  const rh = 512 / rows;
  for (let r = 0; r < rows; r++) {
    const cols = 12 + (r % 2 === 0 ? 0 : 1);
    const cw = 512 / cols;
    const offset = (r % 2) * (cw / 2);
    for (let c = -1; c <= cols; c++) {
      const x = c * cw + offset;
      const y = r * rh;
      const grad = ctx.createRadialGradient(x + cw / 2, y + rh / 2, 1, x + cw / 2, y + rh / 2, cw * 0.48);
      grad.addColorStop(0, '#ffffff'); // Domed stone center
      grad.addColorStop(0.65, '#b0b0b0');
      grad.addColorStop(0.9, '#454545');
      grad.addColorStop(1, '#101010');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(x + 2, y + 2, cw - 4, rh - 4, 4);
      ctx.fill();
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function createSlateRoofBumpTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#202020';
  ctx.fillRect(0, 0, 256, 256);

  const rows = 16;
  const rh = 256 / rows;
  const cw = 256 / 8;
  for (let r = 0; r < rows; r++) {
    const offset = (r % 2) * (cw / 2);
    for (let c = -1; c <= 8; c++) {
      const x = c * cw + offset;
      const y = r * rh;
      const grad = ctx.createLinearGradient(0, y, 0, y + rh);
      grad.addColorStop(0, '#707070');
      grad.addColorStop(0.85, '#e0e0e0');
      grad.addColorStop(0.96, '#ffffff'); // Lower lip highlight
      grad.addColorStop(1.0, '#151515'); // Drop shadow lip
      ctx.fillStyle = grad;
      ctx.fillRect(x + 1, y, cw - 2, rh);
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function createTerracottaRoofBumpTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  const cols = 12;
  const cw = 256 / cols;
  for (let c = 0; c < cols; c++) {
    const x = c * cw;
    const grad = ctx.createLinearGradient(x, 0, x + cw, 0);
    grad.addColorStop(0, '#252525');
    grad.addColorStop(0.2, '#858585');
    grad.addColorStop(0.5, '#ffffff'); // Curved barrel peak
    grad.addColorStop(0.8, '#858585');
    grad.addColorStop(1, '#252525');
    ctx.fillStyle = grad;
    ctx.fillRect(x, 0, cw, 256);

    for (let y = 0; y < 256; y += 24) {
      ctx.fillStyle = '#101010';
      ctx.fillRect(x, y, cw, 3);
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function createWoodBumpTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, 256, 256);

  const plankH = 32;
  for (let y = 0; y < 256; y += plankH) {
    ctx.fillStyle = '#151515';
    ctx.fillRect(0, y, 256, 3);

    for (let g = 0; g < 7; g++) {
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)';
      ctx.fillRect(0, y + 4 + Math.random() * (plankH - 8), 256, 1.8);
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function createWaterNormalTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = 'rgb(128, 128, 255)'; // Neutral tangent normal
  ctx.fillRect(0, 0, 256, 256);

  for (let i = 0; i < 32; i++) {
    const y = (i / 32) * 256;
    ctx.strokeStyle = i % 2 === 0 ? 'rgb(160, 110, 255)' : 'rgb(96, 146, 255)';
    ctx.lineWidth = 4.0;
    ctx.beginPath();
    ctx.moveTo(0, y);
    for (let x = 0; x <= 256; x += 16) {
      ctx.quadraticCurveTo(x + 8, y + Math.sin(x * 0.12) * 6, x + 16, y);
    }
    ctx.stroke();
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

  ctx.fillStyle = '#795548';
  ctx.fillRect(0, 0, 256, 256);

  const plankH = 32;
  for (let y = 0; y < 256; y += plankH) {
    const tone = Math.floor(Math.random() * 20 - 10);
    ctx.fillStyle = `rgb(${121 + tone}, ${85 + tone}, ${72 + tone})`;
    ctx.fillRect(0, y + 1, 256, plankH - 2);

    for (let i = 0; i < 6; i++) {
      ctx.fillStyle = 'rgba(0,0,0,0.12)';
      ctx.fillRect(0, y + 2 + Math.random() * (plankH - 4), 256, 1.5);
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

  // Bright, stylized vibrant battlefield grass (high visibility)
  ctx.fillStyle = '#4c7c4c';
  ctx.fillRect(0, 0, 512, 512);

  // Soft lush grass patches
  for (let i = 0; i < 400; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const r = 12 + Math.random() * 32;
    const isGrass = Math.random() > 0.35;
    ctx.fillStyle = isGrass ? 'rgba(92, 168, 92, 0.35)' : 'rgba(68, 108, 68, 0.45)';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Cobblestone path in center
  for (let y = 0; y < 512; y += 16) {
    for (let x = 175; x < 337; x += 18) {
      const v = Math.floor(Math.random() * 25);
      ctx.fillStyle = `rgb(${130 + v}, ${135 + v}, ${140 + v})`;
      ctx.beginPath();
      ctx.roundRect(x + 1, y + 1, 16, 14, 4);
      ctx.fill();
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function createCobblestoneTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#423d38'; // Mortar base
  ctx.fillRect(0, 0, 512, 512);

  const rows = 20;
  const rh = 512 / rows;
  for (let r = 0; r < rows; r++) {
    const cols = 12 + (r % 2 === 0 ? 0 : 1);
    const cw = 512 / cols;
    const offset = (r % 2) * (cw / 2);
    for (let c = -1; c <= cols; c++) {
      const x = c * cw + offset;
      const y = r * rh;
      const v = Math.floor(Math.random() * 30 - 15);
      const tone = Math.min(230, Math.max(90, 140 + v));
      ctx.fillStyle = `rgb(${tone + 8}, ${tone + 4}, ${tone - 4})`;
      ctx.beginPath();
      ctx.roundRect(x + 2, y + 2, cw - 4, rh - 4, 4);
      ctx.fill();

      // Stone highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.fillRect(x + 3, y + 3, cw - 6, 2);
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function createSlateRoofTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#1c2833';
  ctx.fillRect(0, 0, 256, 256);

  const rows = 16;
  const rh = 256 / rows;
  const cw = 256 / 8;
  for (let r = 0; r < rows; r++) {
    const offset = (r % 2) * (cw / 2);
    for (let c = -1; c <= 8; c++) {
      const x = c * cw + offset;
      const y = r * rh;
      const v = Math.floor(Math.random() * 24 - 12);
      ctx.fillStyle = `rgb(${44 + v}, ${62 + v}, ${80 + v})`;
      ctx.fillRect(x + 1, y + 1, cw - 2, rh);

      // Slate bevel edge
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.fillRect(x + 1, y + rh - 2, cw - 2, 2);
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function createTerracottaRoofTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#5c2214';
  ctx.fillRect(0, 0, 256, 256);

  const cols = 12;
  const cw = 256 / cols;
  for (let c = 0; c < cols; c++) {
    const x = c * cw;
    const grad = ctx.createLinearGradient(x, 0, x + cw, 0);
    grad.addColorStop(0, '#752d1b');
    grad.addColorStop(0.3, '#b34d31');
    grad.addColorStop(0.7, '#c95b3b');
    grad.addColorStop(1, '#5c2214');
    ctx.fillStyle = grad;
    ctx.fillRect(x + 1, 0, cw - 2, 256);

    // Clay tile segments
    for (let y = 0; y < 256; y += 24) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
      ctx.fillRect(x, y, cw, 2);
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function createTimberWallTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Stucco cream wall
  ctx.fillStyle = '#ece0d1';
  ctx.fillRect(0, 0, 256, 256);

  // Subtle stucco plaster texture
  for (let i = 0; i < 400; i++) {
    ctx.fillStyle = Math.random() > 0.5 ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.05)';
    ctx.fillRect(Math.random() * 256, Math.random() * 256, 3, 3);
  }

  // Dark timber cross-beams
  ctx.fillStyle = '#3e2723';
  // Outer frame
  ctx.fillRect(0, 0, 256, 12);
  ctx.fillRect(0, 244, 256, 12);
  ctx.fillRect(0, 0, 12, 256);
  ctx.fillRect(244, 0, 12, 256);
  // Center post
  ctx.fillRect(122, 0, 12, 256);
  // Mid rail
  ctx.fillRect(0, 122, 256, 12);

  // Diagonal X braces
  ctx.lineWidth = 10;
  ctx.strokeStyle = '#3e2723';
  ctx.beginPath();
  ctx.moveTo(12, 12);
  ctx.lineTo(122, 122);
  ctx.moveTo(122, 12);
  ctx.lineTo(12, 122);
  ctx.moveTo(134, 134);
  ctx.lineTo(244, 244);
  ctx.moveTo(244, 134);
  ctx.lineTo(134, 244);
  ctx.stroke();

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function createStripedAwningTexture(color1: string, color2: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  const stripes = 8;
  const sw = 128 / stripes;
  for (let i = 0; i < stripes; i++) {
    ctx.fillStyle = i % 2 === 0 ? color1 : color2;
    ctx.fillRect(i * sw, 0, sw, 128);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function createRiverWaterTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Mountain crystal blue gradient
  const grad = ctx.createLinearGradient(0, 0, 256, 256);
  grad.addColorStop(0, '#0277bd');
  grad.addColorStop(0.5, '#0288d1');
  grad.addColorStop(1, '#00acc1');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);

  // Gentle wave caustics
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
  ctx.lineWidth = 2.5;
  for (let y = 16; y < 256; y += 28) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    for (let x = 0; x <= 256; x += 32) {
      ctx.quadraticCurveTo(x + 16, y + (Math.random() - 0.5) * 14, x + 32, y);
    }
    ctx.stroke();
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

// Procedural Cartoon Stylized Eye Texture for Zombies (Tim Burton / PvZ style)
function createCartoonEyeTexture(type: 'normal' | 'bloodshot' | 'yellow' | 'spiral' = 'normal'): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Sclera base (creamy / ivory)
  ctx.fillStyle = type === 'yellow' ? '#fff9a6' : '#ffffff';
  ctx.fillRect(0, 0, 256, 256);

  // Soft darkening around border
  const radialGradient = ctx.createRadialGradient(128, 128, 70, 128, 128, 128);
  radialGradient.addColorStop(0, 'rgba(0,0,0,0)');
  radialGradient.addColorStop(1, 'rgba(150,50,40,0.3)');
  ctx.fillStyle = radialGradient;
  ctx.fillRect(0, 0, 256, 256);

  // Bloodshot veins
  if (type === 'bloodshot' || type === 'normal') {
    ctx.strokeStyle = 'rgba(215, 35, 35, 0.75)';
    ctx.lineWidth = 3.0;

    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2 + Math.random() * 0.25;
      const startX = 128 + Math.cos(angle) * 118;
      const startY = 128 + Math.sin(angle) * 118;
      const midX = 128 + Math.cos(angle) * 65 + (Math.random() - 0.5) * 20;
      const midY = 128 + Math.sin(angle) * 65 + (Math.random() - 0.5) * 20;

      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.quadraticCurveTo(midX, midY, 128 + Math.cos(angle) * 45, 128 + Math.sin(angle) * 45);
      ctx.stroke();
    }
  }

  // Iris Ring
  const irisRadius = type === 'yellow' ? 50 : 58;
  ctx.fillStyle = type === 'yellow' ? '#f57c00' : (type === 'bloodshot' ? '#6e1b1b' : '#32231c');
  ctx.beginPath();
  ctx.arc(128, 128, irisRadius, 0, Math.PI * 2);
  ctx.fill();

  // Pupil
  if (type === 'spiral') {
    ctx.strokeStyle = '#76ff03';
    ctx.lineWidth = 6;
    ctx.beginPath();
    for (let a = 0; a < 6 * Math.PI; a += 0.1) {
      const r = (a / (6 * Math.PI)) * 42;
      const x = 128 + Math.cos(a) * r;
      const y = 128 + Math.sin(a) * r;
      if (a === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  } else {
    // Big dark cartoon pupil
    const pupilRadius = type === 'bloodshot' ? 34 : 38;
    ctx.fillStyle = '#0a0a0a';
    ctx.beginPath();
    ctx.arc(128, 128, pupilRadius, 0, Math.PI * 2);
    ctx.fill();

    // Glossy specular highlight reflections
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.beginPath();
    ctx.arc(112, 112, 13, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(142, 142, 6, 0, Math.PI * 2);
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(canvas);
  return tex;
}

// Procedural Anime / Cartoon Star Eye for the Boy Scout Hero (Matching User's Sample!)
function createScoutEyeTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Bright white sclera
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, 256, 256);

  // Large sapphire-blue cartoon iris
  const irisGrad = ctx.createRadialGradient(128, 128, 10, 128, 128, 70);
  irisGrad.addColorStop(0, '#42a5f5');
  irisGrad.addColorStop(0.7, '#1565c0');
  irisGrad.addColorStop(1, '#0d47a1');
  ctx.fillStyle = irisGrad;
  ctx.beginPath();
  ctx.arc(128, 128, 68, 0, Math.PI * 2);
  ctx.fill();

  // Dark center pupil
  ctx.fillStyle = '#0a192f';
  ctx.beginPath();
  ctx.arc(128, 128, 42, 0, Math.PI * 2);
  ctx.fill();

  // Distinct Four-Point Star Sparkle Glint (Direct match to reference image!)
  ctx.fillStyle = '#ffffff';
  const drawStar = (cx: number, cy: number, spikes: number, outerR: number, innerR: number) => {
    let rot = (Math.PI / 2) * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerR);
    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerR;
      y = cy + Math.sin(rot) * outerR;
      ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerR;
      y = cy + Math.sin(rot) * innerR;
      ctx.lineTo(x, y);
      rot += step;
    }
    ctx.lineTo(cx, cy - outerR);
    ctx.closePath();
    ctx.fill();
  };

  // Sparkle in pupil
  drawStar(112, 112, 4, 18, 6);
  // Secondary sparkle dot
  ctx.beginPath();
  ctx.arc(146, 146, 6, 0, Math.PI * 2);
  ctx.fill();

  return new THREE.CanvasTexture(canvas);
}

// Procedural Ragged Shirt Texture with Stitches
function createTornFabricTexture(baseHex: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = baseHex;
  ctx.fillRect(0, 0, 256, 256);

  for (let i = 0; i < 400; i++) {
    ctx.fillStyle = Math.random() > 0.5 ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)';
    ctx.fillRect(Math.random() * 256, Math.random() * 256, 4, 4);
  }

  // Tattered holes
  for (let h = 0; h < 3; h++) {
    const hx = 60 + h * 70 + (Math.random() - 0.5) * 20;
    const hy = 120 + (Math.random() - 0.5) * 40;
    ctx.fillStyle = '#212121';
    ctx.beginPath();
    ctx.ellipse(hx, hy, 12, 18, Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 2.5;
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
  public static cobblestoneTex = createCobblestoneTexture();
  public static slateRoofTex = createSlateRoofTexture();
  public static terracottaRoofTex = createTerracottaRoofTexture();
  public static timberWallTex = createTimberWallTexture();
  public static riverWaterTex = createRiverWaterTexture();
  public static awningRedTex = createStripedAwningTexture('#c62828', '#fffde7');
  public static awningYellowTex = createStripedAwningTexture('#f9a825', '#fffde7');
  public static awningBlueTex = createStripedAwningTexture('#1565c0', '#e3f2fd');

  // Procedural 3D Bump & Normal Maps (Gives Tangible Physical Surface Relief!)
  public static stoneBumpTex = createStoneBumpTexture();
  public static cobbleBumpTex = createCobblestoneBumpTexture();
  public static slateBumpTex = createSlateRoofBumpTexture();
  public static terracottaBumpTex = createTerracottaRoofBumpTexture();
  public static woodBumpTex = createWoodBumpTexture();
  public static waterNormalTex = createWaterNormalTexture();

  // Cartoon Eye Textures
  public static eyeTexNormal = createCartoonEyeTexture('normal');
  public static eyeTexBloodshot = createCartoonEyeTexture('bloodshot');
  public static eyeTexYellow = createCartoonEyeTexture('yellow');
  public static eyeTexSpiral = createCartoonEyeTexture('spiral');
  public static eyeTexScout = createScoutEyeTexture();

  // Cartoon Fabric Textures
  public static redShirtTex = createTornFabricTexture('#d32f2f');
  public static coatTex = createTornFabricTexture('#37474f');
  public static orangeShirtTex = createTornFabricTexture('#e65100');

  // Castle Materials (PBR Ashlar Stone & Wood with 3D Surface Relief)
  public static stoneWall = new THREE.MeshStandardMaterial({
    map: GameMaterials.stoneTex,
    bumpMap: GameMaterials.stoneBumpTex,
    bumpScale: 0.08,
    roughness: 0.65,
    metalness: 0.1,
  });

  public static castleWood = new THREE.MeshStandardMaterial({
    map: GameMaterials.woodTex,
    bumpMap: GameMaterials.woodBumpTex,
    bumpScale: 0.07,
    roughness: 0.6,
    metalness: 0.1,
  });

  public static darkWood = new THREE.MeshStandardMaterial({
    color: 0x3e2723,
    bumpMap: GameMaterials.woodBumpTex,
    bumpScale: 0.07,
    roughness: 0.7,
    metalness: 0.05,
  });

  public static ironTrim = new THREE.MeshStandardMaterial({
    color: 0x37474f,
    roughness: 0.35,
    metalness: 0.85,
  });

  public static towerRoof = new THREE.MeshStandardMaterial({
    color: 0x2e4057,
    bumpMap: GameMaterials.slateBumpTex,
    bumpScale: 0.09,
    roughness: 0.5,
    metalness: 0.2,
  });

  public static ground = new THREE.MeshStandardMaterial({
    map: GameMaterials.groundTex,
    roughness: 0.85,
    metalness: 0.05,
  });

  // Medieval Tabletop Diorama Materials (Tactile PBR with Physical Depth!)
  public static cobblestone = new THREE.MeshStandardMaterial({
    map: GameMaterials.cobblestoneTex,
    bumpMap: GameMaterials.cobbleBumpTex,
    bumpScale: 0.14,
    roughness: 0.65,
    metalness: 0.08,
  });

  public static bridgeStone = new THREE.MeshStandardMaterial({
    map: GameMaterials.stoneTex,
    bumpMap: GameMaterials.stoneBumpTex,
    bumpScale: 0.10,
    color: 0xdcd0c0, // Warm weathered bridge ashlar stone
    roughness: 0.6,
    metalness: 0.08,
  });

  public static roofSlateBlue = new THREE.MeshStandardMaterial({
    map: GameMaterials.slateRoofTex,
    bumpMap: GameMaterials.slateBumpTex,
    bumpScale: 0.09,
    roughness: 0.45,
    metalness: 0.15,
  });

  public static roofTerracotta = new THREE.MeshStandardMaterial({
    map: GameMaterials.terracottaRoofTex,
    bumpMap: GameMaterials.terracottaBumpTex,
    bumpScale: 0.12,
    roughness: 0.6,
    metalness: 0.05,
  });

  public static timberWall = new THREE.MeshStandardMaterial({
    map: GameMaterials.timberWallTex,
    bumpMap: GameMaterials.woodBumpTex,
    bumpScale: 0.05,
    roughness: 0.75,
    metalness: 0.02,
  });

  public static riverWater = new THREE.MeshStandardMaterial({
    map: GameMaterials.riverWaterTex,
    normalMap: GameMaterials.waterNormalTex,
    normalScale: new THREE.Vector2(0.8, 0.8),
    roughness: 0.12,
    metalness: 0.35,
    transparent: true,
    opacity: 0.92,
  });

  public static awningRed = new THREE.MeshStandardMaterial({
    map: GameMaterials.awningRedTex,
    roughness: 0.6,
  });

  public static awningYellow = new THREE.MeshStandardMaterial({
    map: GameMaterials.awningYellowTex,
    roughness: 0.6,
  });

  public static awningBlue = new THREE.MeshStandardMaterial({
    map: GameMaterials.awningBlueTex,
    roughness: 0.6,
  });

  public static pineNeedles = new THREE.MeshStandardMaterial({
    color: 0x1b4332, // Deep alpine fir green
    roughness: 0.8,
  });

  public static pineTrunk = new THREE.MeshStandardMaterial({
    color: 0x4a2e18,
    roughness: 0.85,
  });

  public static mountainRock = new THREE.MeshStandardMaterial({
    color: 0x5a6577, // Slate alpine mountain granite
    roughness: 0.8,
    metalness: 0.1,
  });

  public static windowGlow = new THREE.MeshBasicMaterial({
    color: 0xffd54f, // Cozy warm candlelight from inside village cottages
  });

  public static fountainWater = new THREE.MeshStandardMaterial({
    color: 0x4fc3f7,
    roughness: 0.1,
    metalness: 0.3,
    transparent: true,
    opacity: 0.85,
  });

  public static flagBlue = new THREE.MeshStandardMaterial({
    color: 0x1976d2,
    roughness: 0.6,
  });

  public static flagRed = new THREE.MeshStandardMaterial({
    color: 0xd32f2f,
    roughness: 0.6,
  });

  // Lava / Molten Oil
  public static moltenOil = new THREE.MeshStandardMaterial({
    color: 0xff3d00,
    emissive: 0xff5722,
    emissiveIntensity: 2.0,
    roughness: 0.2,
    metalness: 0.1,
  });

  // Gold Coin
  public static goldCoin = new THREE.MeshStandardMaterial({
    map: GameMaterials.coinTex,
    color: 0xffd700,
    roughness: 0.2,
    metalness: 0.95,
    emissive: 0xffa000,
    emissiveIntensity: 0.35,
  });

  // ==========================================
  // BOY SCOUT DEFENDER & COLLECTOR MATERIALS
  // (Matching User's Reference Sample Exactly!)
  // ==========================================

  // Cheerful stylized human skin
  public static skinScout = new THREE.MeshStandardMaterial({
    color: 0xffd8b8, // Bright lively cartoon skin
    roughness: 0.6,
  });

  // Blonde Swept Quiff Hair
  public static scoutBlondeHair = new THREE.MeshStandardMaterial({
    color: 0xf6d166, // Golden blonde
    roughness: 0.45,
    metalness: 0.1,
  });

  // Scout Cap & Uniform
  public static scoutCapGreen = new THREE.MeshStandardMaterial({
    color: 0x5a7d45, // Army olive scout green
    roughness: 0.7,
  });

  public static scoutShirtGreen = new THREE.MeshStandardMaterial({
    color: 0x628a4c, // Scout collared shirt
    roughness: 0.7,
  });

  public static scoutShortsGreen = new THREE.MeshStandardMaterial({
    color: 0x547842, // Scout shorts
    roughness: 0.75,
  });

  // Scout Neckerchief / Scarf
  public static scoutScarfRust = new THREE.MeshStandardMaterial({
    color: 0x934a36, // Rust brown scout scarf
    roughness: 0.65,
  });

  public static scoutScarfOrange = new THREE.MeshStandardMaterial({
    color: 0xf57c00, // Adventurer orange scarf for Collector
    roughness: 0.65,
  });

  public static goldWoggle = new THREE.MeshStandardMaterial({
    color: 0xffca28, // Golden slide clip
    roughness: 0.2,
    metalness: 0.9,
  });

  public static scoutBelt = new THREE.MeshStandardMaterial({
    color: 0x4e342e,
    roughness: 0.6,
  });

  // Ribbed green knee socks
  public static scoutSocks = new THREE.MeshStandardMaterial({
    color: 0x82a768,
    roughness: 0.8,
  });

  // Hiking boots
  public static scoutBoots = new THREE.MeshStandardMaterial({
    color: 0x3e2723,
    roughness: 0.5,
  });

  // BIONIC / MECHANICAL ARMS & HANDS
  public static bionicMetalChrome = new THREE.MeshStandardMaterial({
    color: 0xb0bec5, // Polished chrome metal
    roughness: 0.25,
    metalness: 0.88,
  });

  public static bionicJointDark = new THREE.MeshStandardMaterial({
    color: 0x37474f, // Hydraulic hinge joint
    roughness: 0.35,
    metalness: 0.8,
  });

  public static bionicKnuckles = new THREE.MeshStandardMaterial({
    color: 0x78909c,
    roughness: 0.3,
    metalness: 0.85,
  });

  // Scout Anime Eyes (with star pupils)
  public static eyeMatScout = new THREE.MeshStandardMaterial({
    map: GameMaterials.eyeTexScout,
    roughness: 0.1,
    metalness: 0.05,
  });

  // ==========================================
  // CARTOON BOBBLEHEAD ZOMBIE MATERIALS
  // (Bright, High-Visibility, Matching Samples)
  // ==========================================

  // Bright, high-contrast olive/teal/lime skin tones
  public static zombieSkinOlive = new THREE.MeshStandardMaterial({
    color: 0x7ca865, // Bright lively moss olive green (Sample 1 & 3)
    roughness: 0.55,
    metalness: 0.05,
  });

  public static zombieSkinTeal = new THREE.MeshStandardMaterial({
    color: 0x529e8b, // Bright cartoon teal (Sample 3)
    roughness: 0.55,
    metalness: 0.05,
  });

  public static zombieSkinPaleYellow = new THREE.MeshStandardMaterial({
    color: 0xa8b868, // Bright cartoon sickly yellow (Sample 2)
    roughness: 0.55,
    metalness: 0.05,
  });

  public static zombieSkinTank = new THREE.MeshStandardMaterial({
    color: 0x546e7a, // Stone blue-gray
    roughness: 0.6,
    metalness: 0.15,
  });

  public static zombieSkinExploder = new THREE.MeshStandardMaterial({
    color: 0xb71c1c, // Bright inflamed red
    roughness: 0.5,
    emissive: 0x7f0000,
    emissiveIntensity: 0.4,
  });

  // Glossy Cartoon Eyes
  public static eyeMatNormal = new THREE.MeshStandardMaterial({
    map: GameMaterials.eyeTexNormal,
    roughness: 0.1,
    metalness: 0.05,
  });

  public static eyeMatBloodshot = new THREE.MeshStandardMaterial({
    map: GameMaterials.eyeTexBloodshot,
    roughness: 0.1,
    metalness: 0.05,
  });

  public static eyeMatYellow = new THREE.MeshStandardMaterial({
    map: GameMaterials.eyeTexYellow,
    roughness: 0.1,
    metalness: 0.05,
  });

  public static eyeMatSpiral = new THREE.MeshStandardMaterial({
    map: GameMaterials.eyeTexSpiral,
    roughness: 0.15,
    emissive: 0x64dd17,
    emissiveIntensity: 0.8,
  });

  // Eye socket rims
  public static eyeSocketDark = new THREE.MeshStandardMaterial({
    color: 0x3e2723,
    roughness: 0.8,
  });

  // Mouth cavity and teeth
  public static mouthCavity = new THREE.MeshBasicMaterial({
    color: 0x1a0f0f,
  });

  public static rottenTeeth = new THREE.MeshStandardMaterial({
    color: 0xfff9c4,
    roughness: 0.35,
  });

  // Spiky Messy Hair
  public static cartoonHairDark = new THREE.MeshStandardMaterial({
    color: 0x262322,
    roughness: 0.85,
  });

  // Surgical stitches
  public static stitchThread = new THREE.MeshStandardMaterial({
    color: 0x212121,
    roughness: 0.9,
  });

  // Clothing Materials (High-Visibility)
  public static clothRedShirt = new THREE.MeshStandardMaterial({
    map: GameMaterials.redShirtTex,
    roughness: 0.65,
  });

  public static clothDarkCoat = new THREE.MeshStandardMaterial({
    map: GameMaterials.coatTex,
    roughness: 0.7,
  });

  public static clothOrangeShirt = new THREE.MeshStandardMaterial({
    map: GameMaterials.orangeShirtTex,
    roughness: 0.65,
  });

  public static clothKhakiPants = new THREE.MeshStandardMaterial({
    color: 0xa1887f,
    roughness: 0.75,
  });

  public static clothDarkPants = new THREE.MeshStandardMaterial({
    color: 0x37474f,
    roughness: 0.75,
  });

  // Chunky Cartoon Shoes
  public static cartoonShoe = new THREE.MeshStandardMaterial({
    color: 0x4e342e,
    roughness: 0.5,
  });

  public static cartoonShoeSole = new THREE.MeshStandardMaterial({
    color: 0x212121,
    roughness: 0.7,
  });

  public static exploderPustule = new THREE.MeshStandardMaterial({
    color: 0x76ff03,
    emissive: 0x64dd17,
    emissiveIntensity: 2.0,
    roughness: 0.25,
  });

  // Arrow Materials
  public static arrowShaft = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.5,
  });

  public static arrowTip = new THREE.MeshStandardMaterial({
    color: 0xffd54f,
    metalness: 0.9,
    roughness: 0.1,
  });

  public static arrowFletchRed = new THREE.MeshBasicMaterial({
    color: 0xff1744,
  });

  public static arrowFletchGold = new THREE.MeshBasicMaterial({
    color: 0xffea00,
  });
}
