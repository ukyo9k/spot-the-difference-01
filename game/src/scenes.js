// Scene painters for Lantern Lane. Every scene is drawn twice — once for each
// panel — from the same code. The left panel always gets the base scene; the
// right panel gets the same scene plus the `diffs` set, which switches on the
// changed version of each difference. All art is original vector work drawn
// with the canvas API: no images, no borrowed characters.

const W = 560;
const H = 420;

function circle(ctx, x, y, r, fill) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
}

function ellipse(ctx, x, y, rx, ry, fill) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
}

function rect(ctx, x, y, w, h, fill) {
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, w, h);
}

function poly(ctx, points, fill) {
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1]);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}

function star4(ctx, x, y, r, fill) {
  // A four-point sparkle star.
  ctx.beginPath();
  ctx.moveTo(x, y - r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.quadraticCurveTo(x, y, x, y + r);
  ctx.quadraticCurveTo(x, y, x - r, y);
  ctx.quadraticCurveTo(x, y, x, y - r);
  ctx.fillStyle = fill;
  ctx.fill();
}

function paperLantern(ctx, x, y, color) {
  // A round paper lantern hanging from a short string.
  ctx.strokeStyle = '#3a2a1c';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, y - 26);
  ctx.lineTo(x, y - 14);
  ctx.stroke();
  ellipse(ctx, x, y, 15, 18, color);
  ctx.strokeStyle = 'rgba(0,0,0,0.35)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.ellipse(x, y, 15, 18, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - 13, y - 6);
  ctx.lineTo(x + 13, y - 6);
  ctx.moveTo(x - 13, y + 6);
  ctx.lineTo(x + 13, y + 6);
  ctx.stroke();
  rect(ctx, x - 5, y - 21, 10, 5, '#e8b64c');
  rect(ctx, x - 5, y + 16, 10, 5, '#e8b64c');
}

// ---------------------------------------------------------------------------
// Level 1 — Lantern Lane: a night market alley strung with paper lanterns.
// ---------------------------------------------------------------------------
export function drawLanternLane(ctx, diffs) {
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, '#0b1026');
  sky.addColorStop(0.6, '#1d2a52');
  sky.addColorStop(1, '#3b2b4f');
  rect(ctx, 0, 0, W, H, sky);

  // Stars (one of them is a difference).
  const stars = [[60, 40], [150, 30], [230, 52], [330, 34], [392, 44], [510, 96], [40, 110], [520, 40]];
  for (const [x, y] of stars) {
    if (diffs.has('star') && x === 392 && y === 44) continue;
    star4(ctx, x, y, x % 3 === 0 ? 5 : 3.5, '#ffe9a8');
  }

  // Moon: full on the left, a crescent on the right.
  circle(ctx, 472, 58, 26, '#f7e7a0');
  if (diffs.has('moon')) circle(ctx, 484, 52, 22, '#1d2a52');

  // Rooftops and walls.
  poly(ctx, [[0, 150], [0, H], [180, H], [180, 210], [150, 180], [90, 180], [60, 150]], '#241a30');
  poly(ctx, [[380, 170], [380, H], [W, H], [W, 140], [500, 140], [470, 170]], '#2c1e33');
  rect(ctx, 180, 210, 200, 210, '#3a2a1c'); // shop front wall
  rect(ctx, 0, 380, W, 40, '#171019'); // alley ground

  // Shop awning: red/white stripes on the left, teal/white on the right.
  const stripeA = diffs.has('awning') ? '#2a9d8f' : '#d64541';
  for (let i = 0; i < 6; i++) {
    rect(ctx, 60 + i * 26, 168, 26, 26, i % 2 === 0 ? stripeA : '#fdf6e9');
  }
  rect(ctx, 60, 192, 156, 6, '#8a5a2b');

  // Shop window with four panes — three on the right.
  rect(ctx, 82, 220, 72, 56, '#ffd98a');
  ctx.strokeStyle = '#3a2a1c';
  ctx.lineWidth = 4;
  ctx.strokeRect(82, 220, 72, 56);
  ctx.beginPath();
  ctx.moveTo(118, 220); ctx.lineTo(118, 276);
  if (!diffs.has('window')) {
    ctx.moveTo(82, 248); ctx.lineTo(154, 248);
  }
  ctx.stroke();

  // Vertical signboard with a painted dumpling.
  rect(ctx, 252, 176, 34, 96, '#e8b64c');
  ctx.strokeStyle = '#3a2a1c';
  ctx.lineWidth = 3;
  ctx.strokeRect(252, 176, 34, 96);
  ellipse(ctx, 269, 214, 11, 8, '#fdf6e9');
  ctx.beginPath();
  ctx.arc(269, 214, 11, Math.PI, 0);
  ctx.stroke();
  circle(ctx, 269, 246, 4, '#c2410c');

  // String of paper lanterns across the alley (one is a difference).
  ctx.strokeStyle = '#3a2a1c';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(20, 84);
  ctx.quadraticCurveTo(280, 128, 540, 84);
  ctx.stroke();
  const lanternXs = [70, 130, 190, 240, 300, 360, 420, 480];
  for (const x of lanternXs) {
    if (diffs.has('lantern') && x === 300) continue;
    const y = 84 + Math.sin((x - 20) / 520 * Math.PI) * 22;
    paperLantern(ctx, x, y + 16, x % 120 === 0 ? '#e8b64c' : '#d64541');
  }

  // Bunting flags on the right building.
  const flagColors = ['#e76f51', '#2a9d8f', '#e9c46a', '#e76f51', '#2a9d8f'];
  for (let i = 0; i < 5; i++) {
    poly(ctx, [[400 + i * 26, 150], [426 + i * 26, 150], [413 + i * 26, 172]], flagColors[i]);
  }

  // Cat on a crate: orange on the left, grey on the right.
  const catColor = diffs.has('cat') ? '#8d99ae' : '#e07b39';
  rect(ctx, 78, 348, 62, 32, '#6b4a2f');
  ctx.strokeStyle = '#4a2f1c';
  ctx.lineWidth = 2;
  ctx.strokeRect(78, 348, 62, 32);
  ellipse(ctx, 110, 340, 24, 18, catColor); // body
  circle(ctx, 128, 318, 13, catColor); // head
  poly(ctx, [[120, 308], [124, 296], [130, 306]], catColor);
  poly(ctx, [[132, 306], [138, 295], [140, 308]], catColor);
  ctx.strokeStyle = catColor;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(88, 344);
  ctx.quadraticCurveTo(74, 330, 82, 316);
  ctx.stroke();
  circle(ctx, 132, 316, 2, '#1c1410');
  circle(ctx, 124, 316, 2, '#1c1410');

  // Puddle with the moon's reflection — missing on the right.
  ellipse(ctx, 300, 388, 74, 12, '#4a5d8a');
  if (!diffs.has('puddle')) {
    ellipse(ctx, 300, 388, 34, 7, '#f7e7a0');
    ellipse(ctx, 288, 386, 10, 3, '#fff3c4');
  }
}

// ---------------------------------------------------------------------------
// Level 2 — Tea Garden: a quiet garden with a koi pond and a little pagoda.
// ---------------------------------------------------------------------------
export function drawTeaGarden(ctx, diffs) {
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, '#aee3f5');
  sky.addColorStop(1, '#e8f7d9');
  rect(ctx, 0, 0, W, H, sky);

  // Sun: shining on the left, tucked behind a cloud on the right.
  if (!diffs.has('sun')) {
    circle(ctx, 478, 56, 26, '#ffd23f');
    ctx.strokeStyle = '#ffd23f';
    ctx.lineWidth = 4;
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(478 + Math.cos(a) * 32, 56 + Math.sin(a) * 32);
      ctx.lineTo(478 + Math.cos(a) * 40, 56 + Math.sin(a) * 40);
      ctx.stroke();
    }
  }
  ellipse(ctx, 478, 56, 44, 20, '#ffffff');
  ellipse(ctx, 120, 60, 46, 16, '#ffffff');
  ellipse(ctx, 150, 50, 30, 14, '#ffffff');
  ellipse(ctx, 330, 44, 40, 14, '#ffffff');

  // Grass and path.
  rect(ctx, 0, 250, W, 170, '#7fb069');
  ellipse(ctx, 280, 420, 320, 60, '#6a9e58');
  poly(ctx, [[200, 250], [360, 250], [420, 420], [140, 420]], '#e7d9bd');

  // Cherry tree, left: one blossom cluster is bare on the right.
  rect(ctx, 96, 150, 16, 110, '#6b4a2f');
  ctx.beginPath();
  ctx.moveTo(104, 170); ctx.lineTo(70, 130);
  ctx.lineTo(84, 128); ctx.lineTo(104, 160);
  ctx.closePath(); ctx.fillStyle = '#6b4a2f'; ctx.fill();
  const blossoms = [[70, 110, 34], [120, 88, 40], [168, 116, 34], [100, 140, 30], [150, 148, 30], [52, 146, 26]];
  for (const [x, y, r] of blossoms) {
    if (diffs.has('blossom') && x === 150 && y === 148) continue;
    circle(ctx, x, y, r, '#f7a8c4');
    circle(ctx, x - 10, y + 6, r * 0.6, '#f9c1d4');
    circle(ctx, x + 12, y - 4, r * 0.55, '#f9c1d4');
  }

  // Pagoda, centre-right, with a window that is lit on the left only.
  rect(ctx, 300, 200, 64, 70, '#b5533c');
  poly(ctx, [[292, 202], [372, 202], [332, 176]], '#3a2a1c');
  rect(ctx, 310, 150, 44, 28, '#b5533c');
  poly(ctx, [[304, 152], [360, 152], [332, 130]], '#3a2a1c');
  rect(ctx, 330, 120, 4, 12, '#e8b64c');
  circle(ctx, 332, 116, 5, '#e8b64c');
  rect(ctx, 322, 216, 20, 26, diffs.has('pagodaWindow') ? '#3a2a1c' : '#ffd98a');
  ctx.strokeStyle = '#3a2a1c';
  ctx.lineWidth = 3;
  ctx.strokeRect(322, 216, 20, 26);

  // Koi pond, bottom: three koi on the left, two on the right.
  ellipse(ctx, 280, 348, 180, 52, '#5b8fb9');
  ellipse(ctx, 280, 348, 160, 42, '#6fa3cc');
  const koi = [
    { x: 200, y: 336, c: '#e76f51' },
    { x: 300, y: 356, c: '#f4f1de' },
    { x: 370, y: 332, c: '#e9c46a' },
  ];
  for (const k of koi) {
    if (diffs.has('koi') && k.x === 370) continue;
    ellipse(ctx, k.x, k.y, 20, 9, k.c);
    poly(ctx, [[k.x + 18, k.y], [k.x + 30, k.y - 7], [k.x + 30, k.y + 7]], k.c);
    circle(ctx, k.x - 14, k.y - 3, 2, '#1c1410');
  }
  // Pond ripples.
  ctx.strokeStyle = 'rgba(255,255,255,0.5)';
  ctx.lineWidth = 2;
  for (const [x, y, rx] of [[220, 366, 26], [320, 330, 22], [160, 344, 18]]) {
    ctx.beginPath(); ctx.ellipse(x, y, rx, 6, 0, 0, Math.PI * 2); ctx.stroke();
  }

  // Arched bridge over the pond; one plank is red on the left, brown on the right.
  ctx.strokeStyle = '#8a5a2b';
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.arc(280, 360, 78, Math.PI * 1.15, Math.PI * 1.85);
  ctx.stroke();
  for (let i = 0; i < 7; i++) {
    const a = Math.PI * (1.18 + i * 0.11);
    const x = 280 + Math.cos(a) * 78;
    const y = 360 + Math.sin(a) * 78;
    const isRed = i === 3;
    rect(ctx, x - 9, y - 5, 18, 9, isRed && !diffs.has('plank') ? '#c0392b' : '#8a5a2b');
  }
  ctx.strokeStyle = '#6b4a2f';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(208, 300); ctx.lineTo(208, 268);
  ctx.moveTo(352, 300); ctx.lineTo(352, 268);
  ctx.stroke();

  // Stone lantern, right: flame lit on the left, unlit on the right.
  rect(ctx, 462, 300, 16, 44, '#9a9a8f');
  rect(ctx, 452, 288, 36, 12, '#9a9a8f');
  rect(ctx, 458, 262, 24, 26, '#7a7a70');
  if (!diffs.has('lanternFlame')) {
    ellipse(ctx, 470, 272, 6, 9, '#ffb703');
    ellipse(ctx, 470, 273, 3, 5, '#fff3c4');
  }
  poly(ctx, [[448, 262], [492, 262], [470, 244]], '#7a7a70');

  // Bushes and flowers.
  ellipse(ctx, 60, 300, 46, 26, '#4e7a3d');
  ellipse(ctx, 500, 310, 40, 22, '#4e7a3d');
  const tulips = [
    { x: 60, y: 378, c: '#e63946' },
    { x: 96, y: 388, c: '#e63946' },
    { x: 130, y: 376, c: '#f4a261' },
  ];
  for (const t of tulips) {
    const color = diffs.has('tulip') && t.x === 60 ? '#ffd23f' : t.c;
    ctx.strokeStyle = '#2d6a2d';
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(t.x, t.y + 8); ctx.lineTo(t.x, t.y + 22); ctx.stroke();
    circle(ctx, t.x, t.y, 8, color);
    poly(ctx, [[t.x - 8, t.y - 2], [t.x, t.y - 12], [t.x + 8, t.y - 2]], color);
  }
}

// ---------------------------------------------------------------------------
// Level 3 — Lighthouse Cove: a sunset coast with a striped lighthouse.
// ---------------------------------------------------------------------------
export function drawLighthouseCove(ctx, diffs) {
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, '#ff9e5e');
  sky.addColorStop(0.55, '#ffb703');
  sky.addColorStop(1, '#ffe8a3');
  rect(ctx, 0, 0, W, H, sky);

  // Low sun: rays on the left, a bare disc on the right.
  if (!diffs.has('rays')) {
    ctx.strokeStyle = '#ff7b00';
    ctx.lineWidth = 4;
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(92 + Math.cos(a) * 34, 92 + Math.sin(a) * 34);
      ctx.lineTo(92 + Math.cos(a) * 44, 92 + Math.sin(a) * 44);
      ctx.stroke();
    }
  }
  circle(ctx, 92, 92, 28, '#fff3c4');

  // Clouds.
  ellipse(ctx, 300, 70, 52, 14, 'rgba(255,255,255,0.85)');
  ellipse(ctx, 470, 110, 44, 12, 'rgba(255,255,255,0.8)');

  // Seagulls: three on the left, two on the right.
  const gulls = [[400, 60], [440, 84], [480, 56]];
  for (const [x, y] of gulls) {
    if (diffs.has('gull') && x === 480) continue;
    ctx.strokeStyle = '#3a2a1c';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x - 10, y); ctx.quadraticCurveTo(x - 4, y - 8, x, y);
    ctx.quadraticCurveTo(x + 4, y - 8, x + 10, y);
    ctx.stroke();
  }

  // Sea.
  rect(ctx, 0, 240, W, 180, '#2a6f97');
  rect(ctx, 0, 240, W, 10, '#61a5c2');
  ctx.strokeStyle = 'rgba(255,255,255,0.45)';
  ctx.lineWidth = 2;
  for (const [x, y, rx] of [[120, 290, 40], [330, 320, 48], [470, 280, 36], [200, 360, 44]]) {
    ctx.beginPath(); ctx.ellipse(x, y, rx, 5, 0, 0, Math.PI * 2); ctx.stroke();
  }
  // Sun glitter on the water.
  for (let i = 0; i < 5; i++) {
    ellipse(ctx, 92, 258 + i * 26, 26 - i * 3, 3, 'rgba(255,243,196,0.7)');
  }

  // Lighthouse on its rock, centre.
  poly(ctx, [[220, 260], [340, 260], [320, 240], [240, 240]], '#6b5844');
  rect(ctx, 262, 120, 36, 122, '#fdf6e9');
  rect(ctx, 262, 150, 36, 18, '#c0392b');
  rect(ctx, 262, 196, 36, 18, '#c0392b');
  rect(ctx, 256, 104, 48, 18, '#3a2a1c');
  rect(ctx, 270, 108, 20, 10, '#ffe9a8');
  poly(ctx, [[252, 104], [308, 104], [280, 88]], '#c0392b');
  // Light beam: shining on the left, dark on the right.
  if (!diffs.has('beam')) {
    ctx.fillStyle = 'rgba(255,233,168,0.55)';
    ctx.beginPath();
    ctx.moveTo(292, 112);
    ctx.lineTo(430, 84);
    ctx.lineTo(430, 142);
    ctx.closePath();
    ctx.fill();
  }

  // Sailboat: white sail on the left, red sail on the right.
  const sailColor = diffs.has('sail') ? '#c0392b' : '#fdf6e9';
  poly(ctx, [[150, 296], [150, 250], [188, 296]], sailColor);
  poly(ctx, [[154, 296], [154, 262], [128, 296]], sailColor);
  ctx.strokeStyle = '#3a2a1c';
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(150, 246); ctx.lineTo(150, 300); ctx.stroke();
  poly(ctx, [[118, 300], [196, 300], [186, 312], [128, 312]], '#8a5a2b');

  // Extra rock in the sea: present on the left, gone on the right.
  if (!diffs.has('rock')) {
    ellipse(ctx, 390, 338, 26, 14, '#6b5844');
    ellipse(ctx, 380, 330, 14, 10, '#7a6a55');
  }
  ellipse(ctx, 480, 360, 34, 16, '#6b5844');

  // Palm on the right cliff.
  rect(ctx, 498, 210, 10, 60, '#6b4a2f');
  ctx.strokeStyle = '#2d6a2d';
  ctx.lineWidth = 6;
  for (const [dx, dy, ex, ey] of [[-34, -16, -52, -6], [-24, -26, -40, -30], [0, -30, 4, -52], [24, -26, 44, -32], [34, -14, 54, -8]]) {
    ctx.beginPath(); ctx.moveTo(503 + dx, 214 + dy); ctx.quadraticCurveTo(503 + ex, 214 + ey, 503 + dx * 1.4, 214 + dy * 1.6); ctx.stroke();
  }
  // Coconuts: three on the left, two on the right.
  const nuts = [[498, 218], [508, 220], [503, 226]];
  for (const [x, y] of nuts) {
    if (diffs.has('coconut') && x === 503 && y === 226) continue;
    circle(ctx, x, y, 6, '#6b4a2f');
  }

  // Beach strip and bucket: present on the left, gone on the right.
  ellipse(ctx, 280, 412, 340, 26, '#e9d8a6');
  if (!diffs.has('bucket')) {
    poly(ctx, [[188, 378], [212, 378], [208, 398], [192, 398]], '#e76f51');
    rect(ctx, 186, 374, 28, 6, '#c0392b');
    ctx.strokeStyle = '#c0392b';
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(200, 374, 10, Math.PI, 0); ctx.stroke();
  }
  // Beach shells.
  star4(ctx, 320, 396, 6, '#fff');
  circle(ctx, 350, 404, 5, '#e76f51');
}

export const SCENES = {
  lantern: drawLanternLane,
  garden: drawTeaGarden,
  cove: drawLighthouseCove,
};

export { W, H };
