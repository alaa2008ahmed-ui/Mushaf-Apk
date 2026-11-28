import * as THREE from 'three';

function finalizeTexture(
  canvas: HTMLCanvasElement,
  repeatX = 1,
  repeatY = 1,
  maxAnisotropy = 4
): THREE.CanvasTexture {
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeatX, repeatY);
  tex.anisotropy = Math.min(8, maxAnisotropy);
  tex.needsUpdate = true;
  return tex;
}

/**
 * Generates high-resolution (1024x1024) authentic Kiswah cloth texture with
 * woven black silk jacquard sheen, ornate Thuluth-styled golden Hizam belt,
 * Qandil lanterns above Hizam, Samadiyah medallions below, corner embroidery bands,
 * and rich multi-panel East-wall Sitara (Burqa) door curtain.
 */
export function createKiswahTexture(hasSitara: boolean, maxAnisotropy = 4): THREE.CanvasTexture {
  const S = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = S;
  canvas.height = S;
  const ctx = canvas.getContext('2d')!;

  // Rich black silk gradient base with vertical drape shading
  const grad = ctx.createLinearGradient(0, 0, 0, S);
  grad.addColorStop(0, '#141419');
  grad.addColorStop(0.28, '#0b0b0f');
  grad.addColorStop(0.65, '#09090d');
  grad.addColorStop(1, '#111116');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, S, S);

  // Subtle vertical silk fold sheen
  for (let x = 0; x < S; x += 64) {
    const foldGrad = ctx.createLinearGradient(x, 0, x + 64, 0);
    foldGrad.addColorStop(0, 'rgba(255,255,255,0.0)');
    foldGrad.addColorStop(0.5, 'rgba(255,255,255,0.018)');
    foldGrad.addColorStop(1, 'rgba(255,255,255,0.0)');
    ctx.fillStyle = foldGrad;
    ctx.fillRect(x, 0, 64, S);
  }

  // Woven silk jacquard chevron & octagonal tasbeeh pattern (7-pattern subtle relief)
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.038)';
  ctx.lineWidth = 1.6;
  for (let y = 16; y < S; y += 34) {
    ctx.beginPath();
    for (let x = 0; x <= S; x += 28) {
      const dy = (x / 28) % 2 === 0 ? 0 : 10;
      if (x === 0) ctx.moveTo(x, y + dy);
      else ctx.lineTo(x, y + dy);
    }
    ctx.stroke();

    for (let x = 28; x < S; x += 56) {
      ctx.beginPath();
      ctx.arc(x, y + 17, 6.5, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  // Vertical corner embroidered gold edge borders (Rukn seam bands)
  const edgeGold = ctx.createLinearGradient(0, 0, 24, 0);
  edgeGold.addColorStop(0, '#8d6516');
  edgeGold.addColorStop(0.5, '#f2d272');
  edgeGold.addColorStop(1, '#8d6516');
  ctx.fillStyle = edgeGold;
  ctx.fillRect(0, 0, 12, S);
  ctx.fillRect(S - 12, 0, 12, S);

  // Upper decorative Qandil (lamps/banners) above the Hizam
  for (let i = 0; i < 4; i++) {
    const cx = 128 + i * 256;
    const qy = 66;

    // Outer double-bordered arched cartouche
    ctx.fillStyle = 'rgba(222, 182, 74, 0.10)';
    ctx.fillRect(cx - 72, qy, 144, 114);
    ctx.strokeStyle = '#d7b048';
    ctx.lineWidth = 3.2;
    ctx.strokeRect(cx - 72, qy, 144, 114);
    ctx.strokeStyle = 'rgba(248, 224, 138, 0.65)';
    ctx.lineWidth = 1.4;
    ctx.strokeRect(cx - 63, qy + 9, 126, 96);

    // Ornate inner Qandil lamp medallion & calligraphy motif
    ctx.beginPath();
    ctx.arc(cx, qy + 57, 30, 0, Math.PI * 2);
    ctx.strokeStyle = '#efd074';
    ctx.lineWidth = 2.6;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, qy + 57, 17, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(249, 232, 162, 0.78)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Stylized Arabic praise strokes inside Qandil
    ctx.strokeStyle = '#f6df8c';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(cx - 42, qy + 57);
    ctx.bezierCurveTo(cx - 20, qy + 38, cx + 20, qy + 74, cx + 42, qy + 54);
    ctx.stroke();
  }

  // Golden Hizam (upper horizontal calligraphic belt)
  const beltY = 228;
  const beltH = 114;
  const goldGrad = ctx.createLinearGradient(0, beltY, S, beltY + beltH);
  goldGrad.addColorStop(0, '#9c7119');
  goldGrad.addColorStop(0.25, '#e8c45a');
  goldGrad.addColorStop(0.5, '#fbe69a');
  goldGrad.addColorStop(0.75, '#d9af3b');
  goldGrad.addColorStop(1, '#946b17');

  // Triple ornate border rails of Hizam
  ctx.fillStyle = goldGrad;
  ctx.fillRect(0, beltY, S, 13);
  ctx.fillRect(0, beltY + beltH - 13, S, 13);
  ctx.fillStyle = '#0e0c08';
  ctx.fillRect(0, beltY + 13, S, beltH - 26);

  // Subtle gold hairline inner borders
  ctx.fillStyle = '#d4a63a';
  ctx.fillRect(0, beltY + 17, S, 3);
  ctx.fillRect(0, beltY + beltH - 20, S, 3);

  // 4 Calligraphic Cartouche Panels separated by round rosette medallions
  for (let i = 0; i < 4; i++) {
    const px = 26 + i * 248;
    const pw = 224;
    const py = beltY + 25;
    const ph = beltH - 50;

    // Cartouche frame
    ctx.strokeStyle = '#e7c35a';
    ctx.lineWidth = 3.2;
    ctx.strokeRect(px, py, pw, ph);

    // Inner beveled filigree corners
    ctx.fillStyle = '#f6de87';
    [
      [px + 4, py + 4],
      [px + pw - 10, py + 4],
      [px + 4, py + ph - 10],
      [px + pw - 10, py + ph - 10],
    ].forEach(([bx, by]) => ctx.fillRect(bx, by, 6, 6));

    // Authentic Thuluth-inspired rhythmic golden script strokes
    ctx.strokeStyle = '#f3d474';
    ctx.lineWidth = 3.6;
    ctx.beginPath();
    ctx.moveTo(px + 18, py + ph * 0.58);
    ctx.bezierCurveTo(px + 54, py + ph * 0.25, px + 88, py + ph * 0.8, px + 124, py + ph * 0.44);
    ctx.bezierCurveTo(px + 156, py + ph * 0.2, px + 184, py + ph * 0.72, px + pw - 18, py + ph * 0.48);
    ctx.stroke();

    // Vertical Alif / Lam ascenders & diacritic dots
    ctx.lineWidth = 2.8;
    for (let s = 26; s < pw - 22; s += 22) {
      const topOff = (s % 44 === 0 ? 7 : 12);
      ctx.beginPath();
      ctx.moveTo(px + s, py + topOff);
      ctx.lineTo(px + s, py + ph - 11);
      ctx.stroke();

      ctx.fillStyle = '#fbe89c';
      ctx.beginPath();
      ctx.arc(px + s + 6, py + ph * 0.26, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Rosette separator between cartouches
    if (i < 3) {
      const rx = px + pw + 12;
      const ry = beltY + beltH / 2;
      ctx.beginPath();
      ctx.arc(rx, ry, 10, 0, Math.PI * 2);
      ctx.fillStyle = '#e6c156';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(rx, ry, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = '#14110b';
      ctx.fill();
    }
  }

  // Four round Samadiyah medallions below the Hizam (with star filigree)
  for (let i = 0; i < 4; i++) {
    const cx = 128 + i * 256;
    const cy = 446;

    ctx.beginPath();
    ctx.arc(cx, cy, 42, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(218, 178, 66, 0.16)';
    ctx.fill();
    ctx.lineWidth = 4.2;
    ctx.strokeStyle = '#dfba4c';
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy, 30, 0, Math.PI * 2);
    ctx.lineWidth = 2.2;
    ctx.strokeStyle = '#f5da80';
    ctx.stroke();

    // Inner floral star
    ctx.strokeStyle = '#f7e49c';
    ctx.lineWidth = 1.8;
    ctx.strokeRect(cx - 14, cy - 14, 28, 28);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(Math.PI / 4);
    ctx.strokeRect(-14, -14, 28, 28);
    ctx.restore();
  }

  // Secondary lower horizontal gold embroidery band near middle-lower third
  ctx.fillStyle = 'rgba(202, 158, 52, 0.42)';
  ctx.fillRect(0, 954, S, 10);
  ctx.fillStyle = '#c4962c';
  ctx.fillRect(0, 972, S, 14);

  // Eastern Wall Sitara (Kaaba Door Golden Embroidered Curtain / Burqa)
  if (hasSitara) {
    const sx = 544;
    const sw = 216;
    const sy = beltY + beltH + 10;
    const sh = 610;

    // Deep dark backing of the Sitara
    ctx.fillStyle = '#0b0a08';
    ctx.fillRect(sx, sy, sw, sh);

    // Triple embroidered border frame
    ctx.strokeStyle = '#e7c35a';
    ctx.lineWidth = 8;
    ctx.strokeRect(sx + 4, sy + 4, sw - 8, sh - 8);
    ctx.strokeStyle = '#b98b24';
    ctx.lineWidth = 3;
    ctx.strokeRect(sx + 14, sy + 14, sw - 28, sh - 28);

    const sGrad = ctx.createLinearGradient(sx, sy, sx + sw, sy + sh);
    sGrad.addColorStop(0, '#be8e24');
    sGrad.addColorStop(0.45, '#fae08a');
    sGrad.addColorStop(0.65, '#dfb444');
    sGrad.addColorStop(1, '#a97b1a');

    // Top arched inscription header (Burqa crown)
    ctx.fillStyle = sGrad;
    ctx.fillRect(sx + 20, sy + 24, sw - 40, 56);
    ctx.fillStyle = '#18140c';
    ctx.fillRect(sx + 26, sy + 30, sw - 52, 44);
    ctx.strokeStyle = '#f6dc84';
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.moveTo(sx + 38, sy + 52);
    ctx.bezierCurveTo(sx + 76, sy + 36, sx + 140, sy + 68, sx + sw - 38, sy + 48);
    ctx.stroke();

    // Central golden Mihrab arch canopy above the door curtain
    ctx.fillStyle = sGrad;
    ctx.beginPath();
    ctx.arc(sx + sw / 2, sy + 188, 66, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = '#15120a';
    ctx.beginPath();
    ctx.arc(sx + sw / 2, sy + 188, 50, Math.PI, 0);
    ctx.fill();

    // Central circular medallion inside the arch
    ctx.beginPath();
    ctx.arc(sx + sw / 2, sy + 154, 24, 0, Math.PI * 2);
    ctx.fillStyle = '#e9c458';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(sx + sw / 2, sy + 154, 15, 0, Math.PI * 2);
    ctx.fillStyle = '#15120a';
    ctx.fill();

    // Twin vertical embroidered door curtain panels
    const panelW = (sw - 58) / 2;
    const panelY = sy + 200;
    const panelH = 315;
    [sx + 24, sx + 34 + panelW].forEach((px) => {
      ctx.fillStyle = sGrad;
      ctx.fillRect(px, panelY, panelW, panelH);

      // Recessed dark-silk calligraphy & floral medallions on each curtain leaf
      [panelY + 24, panelY + 128, panelY + 228].forEach((my, idx) => {
        ctx.fillStyle = '#17130b';
        ctx.fillRect(px + 10, my, panelW - 20, idx === 1 ? 82 : 70);
        ctx.strokeStyle = '#f7e296';
        ctx.lineWidth = 2;
        ctx.strokeRect(px + 14, my + 4, panelW - 28, (idx === 1 ? 82 : 70) - 8);

        ctx.beginPath();
        ctx.arc(px + panelW / 2, my + (idx === 1 ? 41 : 35), 14, 0, Math.PI * 2);
        ctx.stroke();
      });
    });

    // Twin golden Sitara locks/rings & lower embroidered fringe tassels
    ctx.fillStyle = '#fff0ae';
    ctx.beginPath();
    ctx.arc(sx + sw / 2 - 14, sy + 360, 7, 0, Math.PI * 2);
    ctx.arc(sx + sw / 2 + 14, sy + 360, 7, 0, Math.PI * 2);
    ctx.fill();

    // Hanging golden tassels along Sitara base
    ctx.fillStyle = '#e7c153';
    for (let tx = sx + 22; tx <= sx + sw - 22; tx += 14) {
      ctx.fillRect(tx, sy + 530, 6, 48);
      ctx.beginPath();
      ctx.arc(tx + 3, sy + 584, 5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  return finalizeTexture(canvas, 1, 1, maxAnisotropy);
}

/**
 * Kaaba roof marble pavers & geometric framing texture.
 */
export function createKaabaRoofTexture(maxAnisotropy = 4): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#ded9cf';
  ctx.fillRect(0, 0, 512, 512);

  // Marble slab grid
  ctx.strokeStyle = 'rgba(130, 122, 108, 0.32)';
  ctx.lineWidth = 2;
  for (let i = 0; i <= 512; i += 64) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, 512);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(512, i);
    ctx.stroke();
  }

  // Outer perimeter marble border & drainage frame
  ctx.strokeStyle = '#7c7466';
  ctx.lineWidth = 18;
  ctx.strokeRect(18, 18, 476, 476);

  return finalizeTexture(canvas, 1, 1, maxAnisotropy);
}

/**
 * Cooling white Thassos marble texture for Mataf floor with subtle radial Tawaf rings.
 */
export function createMatafMarbleTexture(maxAnisotropy = 4): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#f3f5f8';
  ctx.fillRect(0, 0, 512, 512);

  // Subtle marble veins
  ctx.strokeStyle = 'rgba(165, 180, 198, 0.24)';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 28; i++) {
    ctx.beginPath();
    const y0 = (i * 27) % 512;
    ctx.moveTo(0, y0);
    ctx.bezierCurveTo(170, y0 + 18, 340, y0 - 16, 512, (y0 + 12) % 512);
    ctx.stroke();
  }

  // Concentric Tawaf alignment rings
  const cx = 256;
  const cy = 256;
  ctx.strokeStyle = 'rgba(182, 162, 120, 0.34)';
  ctx.lineWidth = 1.6;
  for (let r = 46; r <= 248; r += 20) {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Radial marble joint rays
  ctx.strokeStyle = 'rgba(188, 178, 158, 0.22)';
  ctx.lineWidth = 1;
  for (let a = 0; a < 24; a++) {
    const ang = (a / 24) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(ang) * 44, cy + Math.sin(ang) * 44);
    ctx.lineTo(cx + Math.cos(ang) * 252, cy + Math.sin(ang) * 252);
    ctx.stroke();
  }

  return finalizeTexture(canvas, 1, 1, maxAnisotropy);
}

/**
 * Exterior Makkah plaza marble tile texture with Islamic geometric star medallions.
 */
export function createPlazaMarbleTexture(maxAnisotropy = 4): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#ece8df';
  ctx.fillRect(0, 0, 256, 256);

  // Tile grid
  ctx.strokeStyle = 'rgba(145, 134, 112, 0.28)';
  ctx.lineWidth = 2;
  for (let i = 0; i <= 256; i += 64) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, 256);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(256, i);
    ctx.stroke();
  }

  // Warm granite geometric star accents
  ctx.fillStyle = 'rgba(192, 166, 118, 0.28)';
  for (let x = 32; x < 256; x += 64) {
    for (let y = 32; y < 256; y += 64) {
      ctx.beginPath();
      ctx.moveTo(x, y - 11);
      ctx.lineTo(x + 11, y);
      ctx.lineTo(x, y + 11);
      ctx.lineTo(x - 11, y);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = 'rgba(168, 140, 88, 0.35)';
      ctx.lineWidth = 1;
      ctx.strokeRect(x - 8, y - 8, 16, 16);
    }
  }

  return finalizeTexture(canvas, 18, 22, maxAnisotropy);
}

/**
 * Rich high-resolution (512x512) Masjid al-Haram prayer carpet texture featuring
 * royal emerald woven pile, golden saf row bands, arched mihrab prayer mats,
 * geometric corner medallions, and delicate arabesque floral motifs.
 */
export function createPrayerCarpetTexture(maxAnisotropy = 4): THREE.CanvasTexture {
  const S = 512;
  const canvas = document.createElement('canvas');
  canvas.width = S;
  canvas.height = S;
  const ctx = canvas.getContext('2d')!;

  // Rich Masjid al-Haram emerald pile base
  ctx.fillStyle = '#124e37';
  ctx.fillRect(0, 0, S, S);

  // Subtle woven alternating pile rows
  ctx.fillStyle = '#0e412d';
  for (let y = 0; y < S; y += 64) {
    ctx.fillRect(0, y, S, 32);
  }

  // Fine horizontal weave texture
  ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
  for (let y = 0; y < S; y += 4) {
    ctx.fillRect(0, y, S, 1);
  }

  // Saf prayer rows (8 rows across 512px -> 64px each)
  for (let y = 0; y < S; y += 64) {
    // Crisp golden saf shoulder alignment band
    ctx.fillStyle = '#dfb556';
    ctx.fillRect(0, y, S, 5);
    ctx.fillStyle = '#9c7322';
    ctx.fillRect(0, y + 5, S, 2);

    // Foot alignment divider line at bottom of row
    ctx.fillStyle = 'rgba(224, 184, 92, 0.35)';
    ctx.fillRect(0, y + 58, S, 2);

    // Individual arched Mihrab prayer spots (8 per row)
    for (let x = 32; x < S; x += 64) {
      // Pointed arch mihrab niche outline
      ctx.strokeStyle = 'rgba(232, 194, 98, 0.62)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x - 22, y + 56);
      ctx.lineTo(x - 22, y + 28);
      ctx.quadraticCurveTo(x - 22, y + 14, x, y + 10);
      ctx.quadraticCurveTo(x + 22, y + 14, x + 22, y + 28);
      ctx.lineTo(x + 22, y + 56);
      ctx.stroke();

      // Inner dark-emerald mihrab field
      ctx.fillStyle = 'rgba(8, 42, 29, 0.45)';
      ctx.fill();

      // Central hanging floral lamp rosette inside each prayer spot
      ctx.fillStyle = 'rgba(235, 198, 102, 0.58)';
      ctx.beginPath();
      ctx.arc(x, y + 29, 4.5, 0, Math.PI * 2);
      ctx.fill();

      // Bottom ornamental diamond between mats
      ctx.fillStyle = 'rgba(220, 180, 84, 0.45)';
      ctx.beginPath();
      ctx.moveTo(x + 32, y + 40);
      ctx.lineTo(x + 36, y + 46);
      ctx.lineTo(x + 32, y + 52);
      ctx.lineTo(x + 28, y + 46);
      ctx.closePath();
      ctx.fill();
    }
  }

  return finalizeTexture(canvas, 12, 12, maxAnisotropy);
}

/**
 * Makkah limestone / granite facade texture (512x512) for arches, colonnades and outer walls.
 */
export function createFacadeStoneTexture(maxAnisotropy = 4): THREE.CanvasTexture {
  const S = 512;
  const canvas = document.createElement('canvas');
  canvas.width = S;
  canvas.height = S;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createLinearGradient(0, 0, 0, S);
  grad.addColorStop(0, '#efe6d6');
  grad.addColorStop(0.5, '#e9decb');
  grad.addColorStop(1, '#e1d3bd');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, S, S);

  // Ashlar limestone courses
  ctx.strokeStyle = 'rgba(155, 136, 108, 0.28)';
  ctx.lineWidth = 2;
  for (let y = 0; y < S; y += 48) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(S, y);
    ctx.stroke();
    const offset = (y / 48) % 2 === 0 ? 0 : 48;
    for (let x = offset; x < S; x += 96) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y + 48);
      ctx.stroke();
    }
  }

  // Carved Islamic dentil & gilded cornice frieze bands
  ctx.fillStyle = 'rgba(198, 158, 76, 0.48)';
  ctx.fillRect(0, 14, S, 18);
  ctx.fillStyle = 'rgba(130, 108, 78, 0.30)';
  ctx.fillRect(0, 36, S, 6);

  ctx.fillStyle = 'rgba(198, 158, 76, 0.32)';
  for (let x = 12; x < S; x += 32) {
    ctx.fillRect(x, 46, 16, 8);
  }

  return finalizeTexture(canvas, 4, 2, maxAnisotropy);
}

/**
 * Ornate Islamic Mashrabiya pierced arch window grille texture (512x512)
 * with double stone surround, warm amber glass, brass star latticework & upper fanlight.
 */
export function createMashrabiyaTexture(maxAnisotropy = 4): THREE.CanvasTexture {
  const S = 512;
  const canvas = document.createElement('canvas');
  canvas.width = S;
  canvas.height = S;
  const ctx = canvas.getContext('2d')!;

  // Carved stone outer surround
  ctx.fillStyle = '#ddd0ba';
  ctx.fillRect(0, 0, S, S);

  // Outer carved golden-stone frame
  ctx.strokeStyle = '#c9a456';
  ctx.lineWidth = 14;
  ctx.strokeRect(14, 14, S - 28, S - 28);
  ctx.strokeStyle = '#8b6d3b';
  ctx.lineWidth = 3;
  ctx.strokeRect(26, 26, S - 52, S - 52);

  // Warm illuminated amber-stained interior behind bronze/wooden lattice
  const bg = ctx.createRadialGradient(256, 240, 20, 256, 256, 240);
  bg.addColorStop(0, '#b58438');
  bg.addColorStop(0.55, '#6e4e24');
  bg.addColorStop(1, '#2b1f12');

  // Pointed Islamic Arch Window Cutout
  ctx.beginPath();
  ctx.moveTo(64, 476);
  ctx.lineTo(64, 212);
  ctx.quadraticCurveTo(64, 72, 256, 46);
  ctx.quadraticCurveTo(448, 72, 448, 212);
  ctx.lineTo(448, 476);
  ctx.closePath();
  ctx.fillStyle = bg;
  ctx.fill();

  ctx.save();
  ctx.clip();

  // Subtle colored stained-glass diamond accents near upper arch
  ctx.fillStyle = 'rgba(16, 185, 129, 0.24)';
  ctx.beginPath();
  ctx.arc(256, 142, 42, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(251, 191, 36, 0.26)';
  ctx.beginPath();
  ctx.arc(178, 178, 24, 0, Math.PI * 2);
  ctx.arc(334, 178, 24, 0, Math.PI * 2);
  ctx.fill();

  // Dense diagonal & vertical Islamic Mashrabiya lattice
  ctx.strokeStyle = 'rgba(232, 192, 104, 0.85)';
  ctx.lineWidth = 3.8;
  for (let i = -S; i < S * 2; i += 36) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + S, S);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(i + S, 0);
    ctx.lineTo(i, S);
    ctx.stroke();
  }

  // Central vertical mullion & horizontal transom bars dividing twin window lights
  ctx.fillStyle = '#3b2b18';
  ctx.fillRect(248, 46, 16, 430);
  ctx.fillRect(64, 212, 384, 14);
  ctx.strokeStyle = '#e7c46a';
  ctx.lineWidth = 2.5;
  ctx.strokeRect(248, 46, 16, 430);
  ctx.strokeRect(64, 212, 384, 14);

  // Ornamental 8-pointed star rosette inside transom arch
  ctx.save();
  ctx.translate(256, 142);
  ctx.strokeStyle = '#f7dc84';
  ctx.lineWidth = 3.2;
  ctx.strokeRect(-26, -26, 52, 52);
  ctx.rotate(Math.PI / 4);
  ctx.strokeRect(-26, -26, 52, 52);
  ctx.restore();

  ctx.restore();

  // Outer carved golden arch molding
  ctx.strokeStyle = '#e5be62';
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.moveTo(64, 476);
  ctx.lineTo(64, 212);
  ctx.quadraticCurveTo(64, 72, 256, 46);
  ctx.quadraticCurveTo(448, 72, 448, 212);
  ctx.lineTo(448, 476);
  ctx.stroke();

  return finalizeTexture(canvas, 1, 1, maxAnisotropy);
}

/**
 * Polished marble floor texture for Al-Mas'a (Safa & Marwah corridor)
 * featuring dual directional track borders and subtle emerald accents.
 */
export function createMasaFloorTexture(maxAnisotropy = 4): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#f4f1ea';
  ctx.fillRect(0, 0, 512, 512);

  // Subtle marble veining
  ctx.strokeStyle = 'rgba(182, 170, 150, 0.25)';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 20; i++) {
    ctx.beginPath();
    const y0 = (i * 31) % 512;
    ctx.moveTo(0, y0);
    ctx.bezierCurveTo(160, y0 + 14, 350, y0 - 12, 512, y0 + 6);
    ctx.stroke();
  }

  // Track guide borders along X (left = going, center = wheelchair lane, right = returning)
  ctx.fillStyle = 'rgba(180, 152, 92, 0.34)';
  ctx.fillRect(24, 0, 8, 512);
  ctx.fillRect(196, 0, 8, 512);
  ctx.fillRect(308, 0, 8, 512);
  ctx.fillRect(480, 0, 8, 512);

  // Subtle central lane emerald accent strip
  ctx.fillStyle = 'rgba(16, 185, 129, 0.16)';
  ctx.fillRect(204, 0, 104, 512);

  // Horizontal marble slab lines
  ctx.strokeStyle = 'rgba(165, 152, 130, 0.28)';
  ctx.lineWidth = 1.5;
  for (let y = 0; y < 512; y += 64) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(512, y);
    ctx.stroke();
  }

  return finalizeTexture(canvas, 1, 6, maxAnisotropy);
}

/**
 * Arabic/Golden decorative plaque texture for Safa, Marwah, and major gate headers.
 */
export function createCalligraphyPlaqueTexture(
  titleAr: string,
  subtitleAr: string,
  bgHex = '#0b3b2e',
  maxAnisotropy = 4
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 192;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = bgHex;
  ctx.fillRect(0, 0, 512, 192);

  // Ornate double gold frame
  ctx.strokeStyle = '#f5d061';
  ctx.lineWidth = 8;
  ctx.strokeRect(8, 8, 496, 176);
  ctx.strokeStyle = '#d4a338';
  ctx.lineWidth = 2.5;
  ctx.strokeRect(18, 18, 476, 156);

  // Title text
  ctx.fillStyle = '#fde68a';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = 'bold 54px Cairo, Amiri, serif';
  ctx.fillText(titleAr, 256, 78);

  // Subtitle text
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 26px Cairo, sans-serif';
  ctx.fillText(subtitleAr, 256, 138);

  return finalizeTexture(canvas, 1, 1, maxAnisotropy);
}

/**
 * High-contrast 3D portal signboard texture showing each gate's Arabic name and number.
 */
export function createGatePlaqueTexture(
  gateNameAr: string,
  gateNumber: string,
  isMajor = false,
  maxAnisotropy = 4
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 384;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = isMajor ? '#09382b' : '#10253f';
  ctx.fillRect(0, 0, 384, 128);

  // Double golden border
  ctx.strokeStyle = '#f5d061';
  ctx.lineWidth = 6;
  ctx.strokeRect(5, 5, 374, 118);
  ctx.strokeStyle = '#d4a338';
  ctx.lineWidth = 2;
  ctx.strokeRect(12, 12, 360, 104);

  // Gate name (auto-fit width cleanly)
  ctx.fillStyle = '#fde68a';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  let fontSize = gateNameAr.length > 18 ? 26 : gateNameAr.length > 13 ? 31 : 36;
  ctx.font = `bold ${fontSize}px Cairo, Amiri, sans-serif`;
  while (ctx.measureText(gateNameAr).width > 338 && fontSize > 18) {
    fontSize -= 2;
    ctx.font = `bold ${fontSize}px Cairo, Amiri, sans-serif`;
  }
  ctx.fillText(gateNameAr, 192, 48);

  // Gate number subtitle
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 24px Cairo, sans-serif';
  ctx.fillText(`باب رقم ${gateNumber}`, 192, 92);

  return finalizeTexture(canvas, 1, 1, maxAnisotropy);
}

/**
 * Zamzam drinking water fountain & colman station Arabic badge texture.
 */
export function createZamzamSignTexture(maxAnisotropy = 4): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 96;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#083b2b';
  ctx.fillRect(0, 0, 256, 96);

  ctx.strokeStyle = '#e8c156';
  ctx.lineWidth = 4;
  ctx.strokeRect(4, 4, 248, 88);

  ctx.fillStyle = '#fde68a';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = 'bold 30px Cairo, sans-serif';
  ctx.fillText('ماء زمزم المبارك', 128, 36);

  ctx.fillStyle = '#a7f3d0';
  ctx.font = 'bold 18px Cairo, sans-serif';
  ctx.fillText('مبرد  •  غير مبرد', 128, 68);

  return finalizeTexture(canvas, 1, 1, maxAnisotropy);
}

/**
 * Natural Makkah granite rock texture for Safa and Marwah outcrops.
 */
export function createGraniteRockTexture(maxAnisotropy = 4): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#685f55';
  ctx.fillRect(0, 0, 256, 256);

  for (let i = 0; i < 480; i++) {
    const x = (i * 73) % 256;
    const y = (i * 137) % 256;
    const r = 2 + (i % 5);
    ctx.fillStyle =
      i % 3 === 0
        ? 'rgba(36,32,28,0.4)'
        : i % 3 === 1
          ? 'rgba(165,152,138,0.3)'
          : 'rgba(95,85,76,0.34)';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  return finalizeTexture(canvas, 2, 2, maxAnisotropy);
}

/**
 * Iconic Makkah Royal Clock Tower (Abraj Al-Bait) dial face texture (1024x1024):
 * Deep forest-emerald Islamic mosaic spandrels with gold filigree corners,
 * pearlescent white-ivory dial, golden-champagne arabesque star backing,
 * Saudi Royal Palm-and-Swords emblem, 60 precision ticks, and 12 sculpted hour batons.
 * (Hands are rendered as real 3D physical meshes synced to live Makkah time.)
 */
export function createClockFaceTexture(maxAnisotropy = 4): THREE.CanvasTexture {
  const size = 1024;
  const cx = size / 2;
  const cy = size / 2;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Deep forest-emerald Islamic mosaic spandrel panel
  const bgGrad = ctx.createRadialGradient(cx, cy, 240, cx, cy, 720);
  bgGrad.addColorStop(0, '#0f3d2e');
  bgGrad.addColorStop(0.65, '#092b20');
  bgGrad.addColorStop(1, '#061d15');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, size, size);

  // Subtle emerald mosaic grid tiles on the spandrel background
  ctx.strokeStyle = 'rgba(218, 178, 72, 0.14)';
  ctx.lineWidth = 1.5;
  for (let g = 32; g < size; g += 32) {
    ctx.beginPath();
    ctx.moveTo(g, 0);
    ctx.lineTo(g, size);
    ctx.moveTo(0, g);
    ctx.lineTo(size, g);
    ctx.stroke();
  }

  // Ornate outer 24k gold double frame
  ctx.strokeStyle = '#d9b047';
  ctx.lineWidth = 24;
  ctx.strokeRect(14, 14, size - 28, size - 28);
  ctx.strokeStyle = '#f5dc86';
  ctx.lineWidth = 4;
  ctx.strokeRect(34, 34, size - 68, size - 68);

  // 4 Corner Islamic 8-pointed Arabesque Star Medallions
  const cornerCenters: Array<[number, number]> = [
    [110, 110],
    [size - 110, 110],
    [110, size - 110],
    [size - 110, size - 110],
  ];
  cornerCenters.forEach(([mx, my]) => {
    ctx.save();
    ctx.translate(mx, my);
    for (let k = 0; k < 2; k++) {
      ctx.save();
      ctx.rotate((k * Math.PI) / 4);
      ctx.fillStyle = '#c99c33';
      ctx.strokeStyle = '#f7e199';
      ctx.lineWidth = 3;
      ctx.fillRect(-38, -38, 76, 76);
      ctx.strokeRect(-38, -38, 76, 76);
      ctx.restore();
    }
    ctx.beginPath();
    ctx.arc(0, 0, 26, 0, Math.PI * 2);
    ctx.fillStyle = '#093426';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#f3d678';
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, 10, 0, Math.PI * 2);
    ctx.fillStyle = '#e7be52';
    ctx.fill();
    ctx.restore();
  });

  // Pearlescent white-ivory luminous dial face (matches real Makkah Clock)
  const dialR = 428;
  const dialGrad = ctx.createRadialGradient(cx, cy, 40, cx, cy, dialR);
  dialGrad.addColorStop(0, '#ffffff');
  dialGrad.addColorStop(0.68, '#f8faf8');
  dialGrad.addColorStop(0.9, '#edf4ef');
  dialGrad.addColorStop(1, '#d3e5db');
  ctx.beginPath();
  ctx.arc(cx, cy, dialR, 0, Math.PI * 2);
  ctx.fillStyle = dialGrad;
  ctx.fill();

  // Outer emerald & gold concentric bezel rings
  ctx.beginPath();
  ctx.arc(cx, cy, dialR + 8, 0, Math.PI * 2);
  ctx.lineWidth = 22;
  ctx.strokeStyle = '#d4a93d';
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(cx, cy, dialR - 10, 0, Math.PI * 2);
  ctx.lineWidth = 10;
  ctx.strokeStyle = '#0a4a34';
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(cx, cy, dialR - 22, 0, Math.PI * 2);
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#d4a93d';
  ctx.stroke();

  // Delicate pale gold-champagne 12-petal Islamic rosette & radial mosaic geometry inside dial
  ctx.save();
  ctx.translate(cx, cy);
  ctx.strokeStyle = 'rgba(186, 152, 72, 0.24)';
  ctx.lineWidth = 2.5;
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * 58, Math.sin(a) * 58);
    ctx.lineTo(Math.cos(a) * 285, Math.sin(a) * 285);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(Math.cos(a) * 165, Math.sin(a) * 165, 86, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.arc(0, 0, 260, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(10, 74, 52, 0.28)';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.restore();

  // 60 precision minute ticks + 12 bold sculptural dark-emerald/charcoal & gold hour batons
  for (let i = 0; i < 60; i++) {
    const ang = (i / 60) * Math.PI * 2 - Math.PI / 2;
    const isHour = i % 5 === 0;
    const isCardinal = i % 15 === 0;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(ang);
    if (isHour) {
      const outerX = 392;
      const innerX = isCardinal ? 314 : 326;
      const halfH = isCardinal ? 16 : 11;
      // Gold backing plate
      ctx.fillStyle = '#c89b2b';
      ctx.fillRect(innerX - 3, -halfH - 3, outerX - innerX + 6, (halfH + 3) * 2);
      // Dark forest-charcoal sculpted baton
      ctx.fillStyle = '#0c241b';
      ctx.fillRect(innerX, -halfH, outerX - innerX, halfH * 2);
      // Inner gold highlight line
      ctx.fillStyle = '#f1d37a';
      ctx.fillRect(innerX + 8, -2.5, outerX - innerX - 16, 5);
    } else {
      ctx.fillStyle = '#14533d';
      ctx.fillRect(366, -3, 24, 6);
    }
    ctx.restore();
  }

  // Saudi Royal Coat of Arms emblem (Palm tree & crossed swords) below 12 o'clock
  ctx.save();
  ctx.translate(cx, cy - 178);
  ctx.strokeStyle = '#c29327';
  ctx.fillStyle = '#c29327';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  // Crossed curved swords
  ctx.beginPath();
  ctx.moveTo(-44, 34);
  ctx.quadraticCurveTo(0, 12, 42, -16);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(44, 34);
  ctx.quadraticCurveTo(0, 12, -42, -16);
  ctx.stroke();
  // Palm trunk & fronds above swords
  ctx.fillRect(-4, -38, 8, 44);
  for (let f = -3; f <= 3; f++) {
    ctx.beginPath();
    ctx.moveTo(0, -34);
    ctx.quadraticCurveTo(f * 14, -56, f * 20, -40 + Math.abs(f) * 3);
    ctx.lineWidth = 4;
    ctx.stroke();
  }
  ctx.restore();

  // Central gold & emerald medallion hub
  ctx.beginPath();
  ctx.arc(cx, cy, 48, 0, Math.PI * 2);
  ctx.fillStyle = '#e7be52';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx, cy, 34, 0, Math.PI * 2);
  ctx.fillStyle = '#0a3a29';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx, cy, 18, 0, Math.PI * 2);
  ctx.fillStyle = '#f6dc84';
  ctx.fill();

  return finalizeTexture(canvas, 1, 1, maxAnisotropy);
}

/**
 * Illuminated Arabic calligraphic frieze plaque for Makkah Royal Clock Tower
 * (e.g. "الله أكبر" crown above the dial, or Tasbih band below the dial).
 */
export function createClockCrestTexture(
  arabicText: string,
  arched = true,
  maxAnisotropy = 4
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = arched ? 384 : 256;
  const ctx = canvas.getContext('2d')!;
  const w = canvas.width;
  const h = canvas.height;

  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, '#07241a');
  grad.addColorStop(0.5, '#0d3e2d');
  grad.addColorStop(1, '#07241a');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Subtle glowing radial center behind the calligraphy
  const glow = ctx.createRadialGradient(w / 2, h / 2, 30, w / 2, h / 2, w * 0.45);
  glow.addColorStop(0, 'rgba(52, 211, 153, 0.28)');
  glow.addColorStop(1, 'rgba(7, 36, 26, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);

  // Gold filigree borders
  ctx.strokeStyle = '#e0b74d';
  ctx.lineWidth = 14;
  ctx.strokeRect(10, 10, w - 20, h - 20);
  ctx.strokeStyle = '#f8e08e';
  ctx.lineWidth = 3;
  ctx.strokeRect(26, 26, w - 52, h - 52);

  if (arched) {
    ctx.beginPath();
    ctx.moveTo(84, h - 28);
    ctx.quadraticCurveTo(84, 46, w / 2, 34);
    ctx.quadraticCurveTo(w - 84, 46, w - 84, h - 28);
    ctx.strokeStyle = '#f3d478';
    ctx.lineWidth = 8;
    ctx.stroke();
  }

  // Crisp illuminated golden-cream Arabic calligraphy
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(253, 230, 138, 0.55)';
  ctx.shadowBlur = 14;
  ctx.fillStyle = '#fef3c7';
  ctx.font = arched
    ? 'bold 144px "Amiri", "Cairo", serif'
    : 'bold 64px "Amiri", "Cairo", serif';
  ctx.fillText(arabicText, w / 2, h / 2 + (arched ? 10 : 4));

  return finalizeTexture(canvas, 1, 1, maxAnisotropy);
}

/**
 * Dark emerald-obsidian Mashrabiya diamond lattice cladding texture
 * for the upper shaft of the Makkah Royal Clock Tower directly below the dials.
 */
export function createClockMashrabiyaTexture(maxAnisotropy = 4): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#122420';
  ctx.fillRect(0, 0, 512, 512);

  // Diagonal golden diamond lattice
  ctx.strokeStyle = '#cfa23a';
  ctx.lineWidth = 5;
  const step = 64;
  for (let i = -512; i < 1024; i += step) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + 512, 512);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(i, 512);
    ctx.lineTo(i + 512, 0);
    ctx.stroke();
  }

  // Emerald backlit diamond centers
  ctx.fillStyle = 'rgba(16, 185, 129, 0.16)';
  for (let y = 32; y < 512; y += step) {
    for (let x = 32; x < 512; x += step) {
      ctx.beginPath();
      ctx.arc(x, y, 10, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Gold horizontal spandrel bands
  ctx.fillStyle = '#d9b04a';
  ctx.fillRect(0, 0, 512, 10);
  ctx.fillRect(0, 252, 512, 8);

  return finalizeTexture(canvas, 2, 2, maxAnisotropy);
}

/**
 * Modern Makkah high-rise tower facade texture (limestone/granite piers,
 * reflective curtain glass bays, Islamic arched header bays, and gold cornices).
 */
export function createTowerFacadeTexture(
  stoneHex = '#ece2cf',
  glassHex = '#2a4d66',
  corniceHex = '#caa042',
  maxAnisotropy = 4
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = stoneHex;
  ctx.fillRect(0, 0, 256, 512);

  // Subtle vertical limestone pier shading
  for (let col = 0; col < 256; col += 32) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.04)';
    ctx.fillRect(col, 0, 6, 512);
  }

  // Vertical glass window bays separated by warm stone mullions
  for (let row = 10; row < 504; row += 22) {
    const isArchBand = row % 88 === 10;
    for (let col = 8; col < 248; col += 32) {
      ctx.fillStyle = glassHex;
      if (isArchBand) {
        ctx.beginPath();
        ctx.moveTo(col, row + 16);
        ctx.lineTo(col, row + 5);
        ctx.quadraticCurveTo(col + 12, row - 2, col + 24, row + 5);
        ctx.lineTo(col + 24, row + 16);
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.fillRect(col, row, 24, 15);
      }
      // Subtle sunlit sky/warm room reflections
      if ((row + col * 3) % 7 === 0) {
        ctx.fillStyle = 'rgba(253, 230, 138, 0.28)';
        ctx.fillRect(col + 2, row + 3, 20, 10);
      } else if ((row + col) % 5 === 0) {
        ctx.fillStyle = 'rgba(186, 230, 253, 0.16)';
        ctx.fillRect(col + 2, row + 2, 10, 11);
      }
      ctx.strokeStyle = 'rgba(220, 194, 136, 0.4)';
      ctx.lineWidth = 1;
      ctx.strokeRect(col, row, 24, 15);
    }
  }

  // Horizontal cornice stripes
  ctx.fillStyle = corniceHex;
  ctx.fillRect(0, 0, 256, 7);
  ctx.fillRect(0, 252, 256, 6);

  return finalizeTexture(canvas, 2, 4, maxAnisotropy);
}
