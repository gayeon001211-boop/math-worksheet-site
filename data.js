// ---------- utils ----------
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randChoice(arr) { return arr[randInt(0, arr.length - 1)]; }
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = randInt(0, i);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { [a, b] = [b, a % b]; } return a || 1; }
function simplifyFrac(n, d) {
  if (d < 0) { n = -n; d = -d; }
  const g = gcd(n, d);
  return [n / g, d / g];
}
function frac(n, d) {
  const [sn, sd] = simplifyFrac(n, d);
  const sign = sn < 0 ? '-' : '';
  if (sd === 1) return `${sign}${Math.abs(sn)}`;
  return `${sign}<span class="frac"><span class="num">${Math.abs(sn)}</span><span class="den">${sd}</span></span>`;
}
function sgnTerm(v) { return `${v >= 0 ? '+' : '-'} ${Math.abs(v)}`; }

// ---------- diagram (schematic, not to scale) ----------
function svgWrap(inner, w, h) {
  return `<svg class="prob-diagram" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`;
}
function svgCircleDiagram(label, isRadius) {
  const inner = `
    <circle cx="50" cy="50" r="34" fill="none" stroke="currentColor" stroke-width="2"/>
    <circle cx="50" cy="50" r="2" fill="currentColor"/>
    ${isRadius
      ? `<line x1="50" y1="50" x2="84" y2="50" stroke="currentColor" stroke-width="1.5"/><text x="58" y="46" font-size="11">${label}</text>`
      : `<line x1="16" y1="50" x2="84" y2="50" stroke="currentColor" stroke-width="1.5"/><text x="35" y="46" font-size="11">${label}</text>`}
  `;
  return svgWrap(inner, 100, 100);
}
function svgRightTriangle(labelA, labelB, labelC) {
  const inner = `
    <polygon points="12,68 88,68 12,12" fill="none" stroke="currentColor" stroke-width="2"/>
    <rect x="12" y="60" width="8" height="8" fill="none" stroke="currentColor" stroke-width="1"/>
    <text x="50" y="82" font-size="11" text-anchor="middle">${labelA}</text>
    <text x="2" y="42" font-size="11">${labelB}</text>
    <text x="52" y="36" font-size="11">${labelC}</text>
  `;
  return svgWrap(inner, 100, 90);
}
// Real box net (전개도): a cross layout of the 6 faces, not a pseudo-3D sketch.
function svgBox(l, w, h) {
  const maxDim = Math.max(l, w, h);
  const unit = 24 / maxDim;
  const dim = (v) => Math.max(9, v * unit);
  const L = dim(l), W = dim(w), H = dim(h);
  const gap = 2, x0 = 4, y0 = 4;
  const xLeft = x0, xFront = xLeft + W + gap, xRight = xFront + L + gap, xBack = xRight + W + gap;
  const yMid = y0 + W + gap, yBottom = yMid + H + gap;
  const rect = (x, y, rw, rh) => `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${rw.toFixed(1)}" height="${rh.toFixed(1)}" fill="none" stroke="currentColor" stroke-width="1.3"/>`;
  const inner = `
    ${rect(xFront, y0, L, W)}
    ${rect(xLeft, yMid, W, H)}
    ${rect(xFront, yMid, L, H)}
    ${rect(xRight, yMid, W, H)}
    ${rect(xBack, yMid, L, H)}
    ${rect(xFront, yBottom, L, W)}
    <text x="${(xFront + L / 2).toFixed(1)}" y="${(yMid + H / 2 + 3).toFixed(1)}" font-size="8" text-anchor="middle">${l}</text>
    <text x="${(xLeft + W / 2).toFixed(1)}" y="${(yMid + H / 2 + 3).toFixed(1)}" font-size="8" text-anchor="middle">${w}</text>
    <text x="${(xFront + L / 2).toFixed(1)}" y="${(yMid - 3).toFixed(1)}" font-size="8" text-anchor="middle">${h}</text>
  `;
  return svgWrap(inner, xBack + L + 4, yBottom + W + 4);
}
// Two similar polygons drawn side by side with the given corresponding sides labeled.
function svgSimilarTriangles(smallLabel, largeLabel, ratio) {
  const hSmall = 30;
  const hLarge = Math.min(hSmall * ratio, 62);
  const bSmall = hSmall * 0.85;
  const bLarge = bSmall * (hLarge / hSmall);
  const y0 = 66, sx = 8;
  const lx = sx + bSmall + 22;
  const inner = `
    <polygon points="${sx},${y0} ${(sx + bSmall).toFixed(1)},${y0} ${sx},${(y0 - hSmall).toFixed(1)}" fill="none" stroke="currentColor" stroke-width="1.7"/>
    <rect x="${sx}" y="${(y0 - 7).toFixed(1)}" width="7" height="7" fill="none" stroke="currentColor" stroke-width="1"/>
    <text x="${(sx + bSmall / 2).toFixed(1)}" y="${y0 + 12}" font-size="9" text-anchor="middle">${smallLabel}</text>
    <polygon points="${lx.toFixed(1)},${y0} ${(lx + bLarge).toFixed(1)},${y0} ${lx.toFixed(1)},${(y0 - hLarge).toFixed(1)}" fill="none" stroke="currentColor" stroke-width="1.7"/>
    <rect x="${lx.toFixed(1)}" y="${(y0 - 7).toFixed(1)}" width="7" height="7" fill="none" stroke="currentColor" stroke-width="1"/>
    <text x="${(lx + bLarge / 2).toFixed(1)}" y="${y0 + 12}" font-size="9" text-anchor="middle">${largeLabel}</text>
  `;
  return svgWrap(inner, lx + bLarge + 10, 90);
}
// Regular n-gon inscribed in a circle of radius r.
function svgInscribedPolygon(r, n) {
  const cx = 52, cy = 52, R = 38;
  const pts = Array.from({ length: n }, (_, i) => {
    const angle = -Math.PI / 2 + i * ((2 * Math.PI) / n);
    return [cx + R * Math.cos(angle), cy + R * Math.sin(angle)];
  });
  const ptsStr = pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
  const midX = ((cx + pts[0][0]) / 2 + 5).toFixed(1), midY = ((cy + pts[0][1]) / 2).toFixed(1);
  const inner = `
    <circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="currentColor" stroke-width="1.2" opacity="0.55"/>
    <polygon points="${ptsStr}" fill="none" stroke="currentColor" stroke-width="1.8"/>
    <line x1="${cx}" y1="${cy}" x2="${pts[0][0].toFixed(1)}" y2="${pts[0][1].toFixed(1)}" stroke="currentColor" stroke-width="1" stroke-dasharray="2,2"/>
    <text x="${midX}" y="${midY}" font-size="9">${r}</text>
  `;
  return svgWrap(inner, 104, 104);
}
function svgTriangleArea(base, height) {
  const inner = `
    <polygon points="10,65 90,65 40,10" fill="none" stroke="currentColor" stroke-width="2"/>
    <line x1="40" y1="65" x2="40" y2="10" stroke="currentColor" stroke-width="1.2" stroke-dasharray="3,2"/>
    <rect x="36" y="59" width="6" height="6" fill="none" stroke="currentColor" stroke-width="1"/>
    <text x="50" y="80" font-size="11" text-anchor="middle">${base}</text>
    <text x="44" y="38" font-size="11">${height}</text>
  `;
  return svgWrap(inner, 100, 88);
}
function svgParallelogramArea(base, height) {
  const inner = `
    <polygon points="20,65 90,65 70,10 5,10" fill="none" stroke="currentColor" stroke-width="2"/>
    <line x1="70" y1="65" x2="70" y2="10" stroke="currentColor" stroke-width="1.2" stroke-dasharray="3,2"/>
    <rect x="66" y="59" width="6" height="6" fill="none" stroke="currentColor" stroke-width="1"/>
    <text x="55" y="80" font-size="11" text-anchor="middle">${base}</text>
    <text x="74" y="38" font-size="11">${height}</text>
  `;
  return svgWrap(inner, 100, 88);
}
function svgCoordPlane(x, y) {
  const cx = 50, cy = 50, scale = 3.4;
  const px = cx + x * scale, py = cy - y * scale;
  const inner = `
    <line x1="6" y1="50" x2="94" y2="50" stroke="currentColor" stroke-width="1.2"/>
    <line x1="50" y1="6" x2="50" y2="94" stroke="currentColor" stroke-width="1.2"/>
    <text x="88" y="47" font-size="9">x</text>
    <text x="53" y="14" font-size="9">y</text>
    <line x1="${px}" y1="${py}" x2="${px}" y2="50" stroke="currentColor" stroke-width="1" stroke-dasharray="2,2"/>
    <line x1="${px}" y1="${py}" x2="50" y2="${py}" stroke="currentColor" stroke-width="1" stroke-dasharray="2,2"/>
    <circle cx="${px}" cy="${py}" r="3" fill="currentColor"/>
    <text x="${px + 5}" y="${py - 5}" font-size="10">(${x}, ${y})</text>
  `;
  return svgWrap(inner, 100, 100);
}

// ---------- function graphs (schematic) ----------
function makeMapper(xMin, xMax, yMin, yMax, w, h, pad) {
  const sx = (w - 2 * pad) / (xMax - xMin || 1);
  const sy = (h - 2 * pad) / (yMax - yMin || 1);
  return {
    toSX: (x) => pad + (x - xMin) * sx,
    toSY: (y) => h - pad - (y - yMin) * sy,
  };
}
function buildCurvePath(f, xMin, xMax, toSX, toSY, steps) {
  let d = '';
  for (let i = 0; i <= steps; i++) {
    const x = xMin + ((xMax - xMin) * i) / steps;
    const cmd = i === 0 ? 'M' : 'L';
    d += `${cmd}${toSX(x).toFixed(1)},${toSY(f(x)).toFixed(1)} `;
  }
  return d;
}
function axisZero(toSX, toSY, pad, w, h) {
  return {
    zx: Math.max(pad, Math.min(w - pad, toSX(0))),
    zy: Math.max(pad, Math.min(h - pad, toSY(0))),
  };
}
function axesSvg(zx, zy, pad, w, h) {
  return `
    <line x1="${pad}" y1="${zy}" x2="${w - pad}" y2="${zy}" stroke="currentColor" stroke-width="1" opacity="0.45"/>
    <line x1="${zx}" y1="${pad}" x2="${zx}" y2="${h - pad}" stroke="currentColor" stroke-width="1" opacity="0.45"/>
    <text x="${zx - 8}" y="${zy + 10}" font-size="8" opacity="0.7">O</text>
  `;
}
// Dashed guide from a curve point down to the x-axis, with the dot and its x-value labeled.
function markPoint(px, py, zy, label) {
  const belowRoom = zy < 92;
  const ty = belowRoom ? zy + 10 : zy - 5;
  return `
    <line x1="${px.toFixed(1)}" y1="${py.toFixed(1)}" x2="${px.toFixed(1)}" y2="${zy.toFixed(1)}" stroke="currentColor" stroke-width="1" stroke-dasharray="2,2" opacity="0.7"/>
    <circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="2.6" fill="currentColor"/>
    <text x="${px.toFixed(1)}" y="${ty.toFixed(1)}" font-size="9" text-anchor="middle">${label}</text>
  `;
}
function svgQuadraticGraph(a, b, c, markX) {
  const f = (x) => a * x * x + b * x + c;
  const x0 = -b / (2 * a);
  let xMin = Math.min(x0, markX, 0) - 2, xMax = Math.max(x0, markX, 0) + 2;
  const samples = Array.from({ length: 21 }, (_, i) => f(xMin + ((xMax - xMin) * i) / 20));
  samples.push(f(markX), 0);
  let yMin = Math.min(...samples), yMax = Math.max(...samples);
  if (yMax - yMin < 4) { yMin -= 2; yMax += 2; }
  const w = 120, h = 116, pad = 14;
  const { toSX, toSY } = makeMapper(xMin, xMax, yMin, yMax, w, h, pad);
  const { zx, zy } = axisZero(toSX, toSY, pad, w, h);
  const path = buildCurvePath(f, xMin, xMax, toSX, toSY, 30);
  const mx = toSX(markX), my = toSY(f(markX));
  const inner = `
    ${axesSvg(zx, zy, pad, w, h)}
    <path d="${path}" fill="none" stroke="currentColor" stroke-width="1.8"/>
    ${markPoint(mx, my, zy, markX)}
  `;
  return svgWrap(inner, w, h);
}
function svgTangentGraph(a, b, c, d, tx) {
  const f = (x) => a * x ** 3 + b * x * x + c * x + d;
  const fp = (x) => 3 * a * x * x + 2 * b * x + c;
  const slope = fp(tx), y0 = f(tx);
  const tangentF = (x) => slope * (x - tx) + y0;
  let xMin = Math.min(tx, 0) - 2.5, xMax = Math.max(tx, 0) + 2.5;
  const samples = [];
  for (let i = 0; i <= 20; i++) samples.push(f(xMin + ((xMax - xMin) * i) / 20));
  samples.push(y0, 0);
  let yMin = Math.min(...samples), yMax = Math.max(...samples);
  if (yMax - yMin < 4) { yMin -= 2; yMax += 2; }
  const w = 120, h = 116, pad = 14;
  const { toSX, toSY } = makeMapper(xMin, xMax, yMin, yMax, w, h, pad);
  const { zx, zy } = axisZero(toSX, toSY, pad, w, h);
  const curvePath = buildCurvePath(f, xMin, xMax, toSX, toSY, 30);
  const tanPath = `M${toSX(xMin).toFixed(1)},${toSY(tangentF(xMin)).toFixed(1)} L${toSX(xMax).toFixed(1)},${toSY(tangentF(xMax)).toFixed(1)}`;
  const inner = `
    ${axesSvg(zx, zy, pad, w, h)}
    <path d="${curvePath}" fill="none" stroke="currentColor" stroke-width="1.8"/>
    <path d="${tanPath}" stroke="currentColor" stroke-width="1.2" stroke-dasharray="3,2" opacity="0.85"/>
    ${markPoint(toSX(tx), toSY(y0), zy, `x=${tx}`)}
  `;
  return svgWrap(inner, w, h);
}
function svgAreaGraph(a, n, lo, hi) {
  const f = (x) => a * Math.pow(x, n);
  const xMin = Math.min(lo, 0) - 0.5, xMax = Math.max(hi, 0) + 0.5;
  const samples = [];
  for (let i = 0; i <= 20; i++) samples.push(f(xMin + ((xMax - xMin) * i) / 20));
  let yMin = Math.min(...samples, 0), yMax = Math.max(...samples, 0);
  if (yMax - yMin < 2) yMax += 2;
  const w = 120, h = 116, pad = 14;
  const { toSX, toSY } = makeMapper(xMin, xMax, yMin, yMax, w, h, pad);
  const { zx, zy } = axisZero(toSX, toSY, pad, w, h);
  const curvePath = buildCurvePath(f, xMin, xMax, toSX, toSY, 30);
  let shadeD = `M${toSX(lo).toFixed(1)},${toSY(0).toFixed(1)} `;
  for (let i = 0; i <= 16; i++) {
    const x = lo + ((hi - lo) * i) / 16;
    shadeD += `L${toSX(x).toFixed(1)},${toSY(f(x)).toFixed(1)} `;
  }
  shadeD += `L${toSX(hi).toFixed(1)},${toSY(0).toFixed(1)} Z`;
  const loLabel = lo === 0 ? '' : `<text x="${toSX(lo).toFixed(1)}" y="${(zy + 10).toFixed(1)}" font-size="9" text-anchor="middle">${lo}</text>`;
  const hiLabel = `<text x="${toSX(hi).toFixed(1)}" y="${(zy + 10).toFixed(1)}" font-size="9" text-anchor="middle">${hi}</text>`;
  const inner = `
    ${axesSvg(zx, zy, pad, w, h)}
    <path d="${shadeD}" fill="currentColor" opacity="0.15"/>
    <path d="${curvePath}" fill="none" stroke="currentColor" stroke-width="1.8"/>
    <line x1="${toSX(lo).toFixed(1)}" y1="${toSY(f(lo)).toFixed(1)}" x2="${toSX(lo).toFixed(1)}" y2="${zy.toFixed(1)}" stroke="currentColor" stroke-width="1" stroke-dasharray="2,2" opacity="0.6"/>
    <line x1="${toSX(hi).toFixed(1)}" y1="${toSY(f(hi)).toFixed(1)}" x2="${toSX(hi).toFixed(1)}" y2="${zy.toFixed(1)}" stroke="currentColor" stroke-width="1" stroke-dasharray="2,2" opacity="0.6"/>
    ${loLabel}
    ${hiLabel}
  `;
  return svgWrap(inner, w, h);
}
function svgUnitCircleAngle(deg) {
  const rad = (deg * Math.PI) / 180;
  const r = 32, cx = 52, cy = 52;
  const px = cx + r * Math.cos(rad), py = cy - r * Math.sin(rad);
  const inner = `
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="currentColor" stroke-width="1.3"/>
    <line x1="${cx - r - 6}" y1="${cy}" x2="${cx + r + 6}" y2="${cy}" stroke="currentColor" stroke-width="1" opacity="0.6"/>
    <line x1="${cx}" y1="${cy - r - 6}" x2="${cx}" y2="${cy + r + 6}" stroke="currentColor" stroke-width="1" opacity="0.6"/>
    <line x1="${cx}" y1="${cy}" x2="${px.toFixed(1)}" y2="${py.toFixed(1)}" stroke="currentColor" stroke-width="1.6"/>
    <line x1="${px.toFixed(1)}" y1="${py.toFixed(1)}" x2="${px.toFixed(1)}" y2="${cy}" stroke="currentColor" stroke-width="1" stroke-dasharray="2,2"/>
    <text x="${cx + r - 4}" y="${cy + 16}" font-size="9">${deg}°</text>
  `;
  return svgWrap(inner, 104, 104);
}
function htmlDataTable(headers, rows) {
  const thead = `<tr>${headers.map((h) => `<th>${h}</th>`).join('')}</tr>`;
  const tbody = rows.map((r) => `<tr>${r.map((cell) => `<td>${cell}</td>`).join('')}</tr>`).join('');
  return `<table class="prob-table"><thead>${thead}</thead><tbody>${tbody}</tbody></table>`;
}
function svgBallsDiagram(total, favorable) {
  const cols = Math.min(total, 5);
  const rows = Math.ceil(total / cols);
  const r = 7, gap = 18, pad = 10;
  let dots = '';
  for (let i = 0; i < total; i++) {
    const col = i % cols, row = Math.floor(i / cols);
    const cx = pad + r + col * gap, cy = pad + r + row * gap;
    const filled = i < favorable;
    dots += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${filled ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.3"/>`;
  }
  return svgWrap(dots, pad * 2 + cols * gap, pad * 2 + rows * gap);
}

// ---------- grade 1 (초1) ----------
function addSub1Digit(diff) {
  let a = randInt(0, 9), b = randInt(0, 9);
  const op = Math.random() < 0.5 ? '+' : '-';
  if (diff === 'easy' && op === '+' && a + b > 9) b = randInt(0, 9 - a);
  if (op === '-' && a < b) [a, b] = [b, a];
  const ans = op === '+' ? a + b : a - b;
  return { q: `${a} ${op} ${b} = `, a: String(ans) };
}
function compareNumbers(diff) {
  const [lo, hi] = diff === 'easy' ? [0, 20] : diff === 'medium' ? [0, 50] : [0, 100];
  let a = randInt(lo, hi), b = randInt(lo, hi);
  while (a === b) b = randInt(lo, hi);
  return { q: `${a}  ○  ${b}   (>, <, = 중 알맞은 부호를 쓰세요)`, a: a > b ? '>' : '<' };
}
function addSubCarry(diff) {
  const [lo, hi] = diff === 'easy' ? [10, 30] : diff === 'medium' ? [10, 60] : [10, 99];
  let a = randInt(lo, hi), b = randInt(lo, hi);
  const op = Math.random() < 0.5 ? '+' : '-';
  if (op === '-' && a < b) [a, b] = [b, a];
  const ans = op === '+' ? a + b : a - b;
  return { q: `${a} ${op} ${b} = `, a: String(ans) };
}
function make10(diff) {
  const a = randInt(1, 9);
  return { q: `${a} + ___ = 10`, a: String(10 - a) };
}
function clockHour(diff) {
  const start = randInt(1, 12);
  const add = diff === 'easy' ? randInt(1, 3) : diff === 'medium' ? randInt(1, 6) : randInt(1, 11);
  let end = (start + add) % 12; if (end === 0) end = 12;
  return { q: `지금이 ${start}시입니다. ${add}시간 후는 몇 시입니까?`, a: `${end}시` };
}

// ---------- grade 2 (초2) ----------
function addSub2Digit(diff) {
  const hi = diff === 'easy' ? 50 : diff === 'medium' ? 99 : 999;
  let a = randInt(10, hi), b = randInt(10, diff === 'hard' ? 99 : hi);
  const op = Math.random() < 0.5 ? '+' : '-';
  if (op === '-' && a < b) [a, b] = [b, a];
  const ans = op === '+' ? a + b : a - b;
  return { q: `${a} ${op} ${b} = `, a: String(ans) };
}
function multTable(diff) {
  const bmax = diff === 'easy' ? 5 : 9;
  const a = randInt(2, 9), b = randInt(2, bmax);
  return { q: `${a} × ${b} = `, a: String(a * b) };
}
function lengthAddSub(diff) {
  const [lo, hi] = diff === 'easy' ? [10, 50] : diff === 'medium' ? [10, 99] : [10, 199];
  let a = randInt(lo, hi), b = randInt(lo, Math.min(hi, 99));
  const op = Math.random() < 0.5 ? '+' : '-';
  if (op === '-' && a < b) [a, b] = [b, a];
  const ans = op === '+' ? a + b : a - b;
  return { q: `${a}cm ${op} ${b}cm = `, a: `${ans}cm` };
}
function clockMinutes(diff) {
  const h = randInt(1, 12), m = randChoice([0, 10, 20, 30, 40, 50]);
  const addMin = diff === 'easy' ? randChoice([10, 20, 30]) : diff === 'medium' ? randChoice([10, 20, 30, 40, 50]) : randInt(5, 90);
  const total = h * 60 + m + addMin;
  let eh = Math.floor(total / 60) % 12; if (eh === 0) eh = 12;
  const em = total % 60;
  return { q: `${h}시 ${m}분에서 ${addMin}분 후는 몇 시 몇 분입니까?`, a: `${eh}시 ${em}분` };
}

// ---------- grade 3 (초3) ----------
function multDiv(diff) {
  if (Math.random() < 0.5) {
    const a = randInt(10, diff === 'hard' ? 99 : diff === 'medium' ? 50 : 30);
    const b = diff === 'easy' ? randInt(2, 9) : randInt(2, diff === 'hard' ? 99 : 20);
    return { q: `${a} × ${b} = `, a: String(a * b) };
  }
  const divisor = randInt(2, 9);
  const quotient = randInt(2, diff === 'easy' ? 9 : 20);
  const remainder = diff === 'easy' ? 0 : randInt(0, divisor - 1);
  const dividend = divisor * quotient + remainder;
  if (remainder === 0) return { q: `${dividend} ÷ ${divisor} = `, a: String(quotient) };
  return { q: `${dividend} ÷ ${divisor} = ___ … ___ (몫과 나머지)`, a: `${quotient} … ${remainder}` };
}
function fractionCompare(diff) {
  const den = diff === 'easy' ? randInt(2, 6) : randInt(2, 12);
  let n1 = randInt(1, den - 1), n2 = randInt(1, den - 1);
  while (n1 === n2) n2 = randInt(1, den - 1);
  return { q: `${frac(n1, den)}  ○  ${frac(n2, den)}   (>, <, = 중 알맞은 부호를 쓰세요)`, a: n1 > n2 ? '>' : '<' };
}
function timeCalcE3(diff) {
  const h1 = randInt(1, 3), m1 = randInt(0, 59);
  const h2 = randInt(0, diff === 'easy' ? 1 : 3), m2 = randInt(0, 59);
  const total1 = h1 * 60 + m1, total2 = h2 * 60 + m2;
  const op = Math.random() < 0.5 ? '+' : '-';
  let a = total1, b = total2;
  if (op === '-' && a < b) [a, b] = [b, a];
  const res = op === '+' ? a + b : a - b;
  const rh = Math.floor(res / 60), rm = res % 60;
  return { q: `${h1}시간 ${m1}분 ${op} ${h2}시간 ${m2}분 = `, a: `${rh}시간 ${rm}분` };
}
function circleBasic(diff) {
  const r = randInt(2, diff === 'easy' ? 10 : 30);
  if (Math.random() < 0.5) return { q: `반지름이 ${r}cm인 원의 지름을 구하세요.`, a: `${r * 2}cm`, svg: svgCircleDiagram(`${r}cm`, true) };
  const d = r * 2;
  return { q: `지름이 ${d}cm인 원의 반지름을 구하세요.`, a: `${r}cm`, svg: svgCircleDiagram(`${d}cm`, false) };
}

// ---------- grade 4 (초4) ----------
function bigNumberOps(diff) {
  const digits = diff === 'easy' ? 3 : diff === 'medium' ? 4 : 5;
  const min = Math.pow(10, digits - 1), max = Math.pow(10, digits) - 1;
  let a = randInt(min, max), b = randInt(min, max);
  const op = Math.random() < 0.5 ? '+' : '-';
  if (op === '-' && a < b) [a, b] = [b, a];
  const ans = op === '+' ? a + b : a - b;
  return { q: `${a} ${op} ${b} = `, a: String(ans) };
}
function decimalBasic(diff) {
  const denom = diff === 'easy' ? 10 : 100;
  const mk = () => randInt(1, diff === 'easy' ? 90 : 990) / denom;
  let a = mk(), b = mk();
  const op = Math.random() < 0.5 ? '+' : '-';
  if (op === '-' && a < b) [a, b] = [b, a];
  const ans = Number((op === '+' ? a + b : a - b).toFixed(2));
  return { q: `${a} ${op} ${b} = `, a: String(ans) };
}
function angleCalc(diff) {
  const a = randInt(20, 130), b = randInt(20, 130);
  if (a + b >= 170) return angleCalc(diff);
  if (Math.random() < 0.5) {
    const c = 180 - a - b;
    return { q: `삼각형의 세 각 중 두 각이 ${a}°, ${b}°일 때 나머지 한 각을 구하세요.`, a: `${c}°` };
  }
  const sum = diff === 'easy' ? 90 : 180;
  const x = sum - a;
  if (x <= 0) return angleCalc(diff);
  return { q: `두 각의 합이 ${sum}°이고 한 각이 ${a}°일 때 다른 한 각을 구하세요.`, a: `${x}°` };
}
function multiDigitMultDiv(diff) {
  if (Math.random() < 0.5) {
    const a = randInt(100, 999), b = randInt(10, diff === 'easy' ? 20 : 99);
    return { q: `${a} × ${b} = `, a: String(a * b) };
  }
  const divisor = randInt(10, diff === 'easy' ? 20 : 99);
  const quotient = randInt(10, 99);
  const dividend = divisor * quotient;
  return { q: `${dividend} ÷ ${divisor} = `, a: String(quotient) };
}

// ---------- grade 5 (초5) ----------
function fractionAddSub(diff) {
  let d1 = randInt(2, diff === 'easy' ? 6 : 12), d2 = randInt(2, diff === 'easy' ? 6 : 12);
  let n1 = randInt(1, d1 - 1), n2 = randInt(1, d2 - 1);
  const op = Math.random() < 0.5 ? '+' : '-';
  let lcm = (d1 * d2) / gcd(d1, d2);
  let num1 = n1 * (lcm / d1), num2 = n2 * (lcm / d2);
  if (op === '-' && num1 < num2) {
    [n1, n2] = [n2, n1];
    [d1, d2] = [d2, d1];
    [num1, num2] = [num2, num1];
  }
  const resNum = op === '+' ? num1 + num2 : num1 - num2;
  return { q: `${frac(n1, d1)} ${op} ${frac(n2, d2)} = `, a: frac(resNum, lcm) };
}
function decimalMult(diff) {
  const a = (randInt(1, diff === 'easy' ? 90 : 990) / 10).toFixed(1);
  const b = randInt(2, diff === 'easy' ? 9 : 20);
  const ans = (parseFloat(a) * b).toFixed(2).replace(/\.?0+$/, '');
  return { q: `${a} × ${b} = `, a: ans };
}
function factorsMultiples(diff) {
  const [lo, hi] = diff === 'easy' ? [4, 20] : diff === 'medium' ? [8, 50] : [10, 100];
  const a = randInt(lo, hi), b = randInt(lo, hi);
  if (Math.random() < 0.5) return { q: `${a}과(와) ${b}의 최대공약수를 구하세요.`, a: String(gcd(a, b)) };
  const l = (a * b) / gcd(a, b);
  return { q: `${a}과(와) ${b}의 최소공배수를 구하세요.`, a: String(l) };
}
function averageBasic(diff) {
  const n = diff === 'easy' ? 3 : diff === 'medium' ? 4 : 5;
  const maxVal = diff === 'easy' ? 20 : 50;
  const targetAvg = randInt(diff === 'easy' ? 3 : 5, maxVal - 5);
  let nums = [], sum = 0;
  for (let i = 0; i < n - 1; i++) { const v = randInt(1, maxVal); nums.push(v); sum += v; }
  const last = targetAvg * n - sum;
  if (last < 1 || last > maxVal * 2) return averageBasic(diff);
  nums.push(last);
  nums = shuffle(nums);
  return { q: `다음 수들의 평균을 구하세요: ${nums.join(', ')}`, a: String(targetAvg) };
}
function polygonArea(diff) {
  const b = randInt(3, diff === 'easy' ? 15 : 30), h = randInt(3, diff === 'easy' ? 15 : 30);
  if (Math.random() < 0.5) return { q: `밑변이 ${b}cm, 높이가 ${h}cm인 삼각형의 넓이를 구하세요.`, a: `${(b * h) / 2}cm²`, svg: svgTriangleArea(`${b}cm`, `${h}cm`) };
  return { q: `밑변이 ${b}cm, 높이가 ${h}cm인 평행사변형의 넓이를 구하세요.`, a: `${b * h}cm²`, svg: svgParallelogramArea(`${b}cm`, `${h}cm`) };
}

// ---------- grade 6 (초6) ----------
function fractionDiv(diff) {
  const d1 = randInt(2, diff === 'easy' ? 6 : 12), n1 = randInt(1, d1 - 1);
  const d2 = randInt(2, diff === 'easy' ? 6 : 12), n2 = randInt(1, d2 - 1);
  const resNum = n1 * d2, resDen = d1 * n2;
  return { q: `${frac(n1, d1)} ÷ ${frac(n2, d2)} = `, a: frac(resNum, resDen) };
}
function decimalDiv(diff) {
  const b = randInt(2, diff === 'easy' ? 9 : 20);
  const q = randInt(1, diff === 'easy' ? 90 : 500) / 10;
  const a = (b * q).toFixed(2);
  return { q: `${a} ÷ ${b} = `, a: String(q) };
}
function ratioProblem(diff) {
  const [lo, hi] = diff === 'easy' ? [2, 20] : diff === 'medium' ? [5, 50] : [5, 100];
  let a = randInt(lo, hi), b = randInt(lo, hi);
  while (a === b) b = randInt(lo, hi);
  const g = gcd(a, b);
  return { q: `${a} : ${b} 를 가장 간단한 자연수의 비로 나타내세요.`, a: `${a / g} : ${b / g}` };
}
function proportionEq(diff) {
  const a = randInt(2, diff === 'easy' ? 9 : 20), b = randInt(2, diff === 'easy' ? 9 : 20);
  const k = randInt(2, 5);
  const c = a * k, x = b * k;
  return { q: `${a} : ${b} = ${c} : x  일 때 x의 값을 구하세요.`, a: String(x) };
}
function volumeBox(diff) {
  const l = randInt(2, diff === 'easy' ? 10 : 20), w = randInt(2, diff === 'easy' ? 10 : 20), h = randInt(2, diff === 'easy' ? 10 : 20);
  return { q: `가로 ${l}cm, 세로 ${w}cm, 높이 ${h}cm인 직육면체의 부피를 구하세요.`, a: `${l * w * h}cm³`, svg: svgBox(l, w, h) };
}

// ---------- 중1 ----------
function integerOps(diff) {
  const range = diff === 'easy' ? 10 : diff === 'medium' ? 20 : 50;
  let a = randInt(-range, range), b = randInt(-range, range);
  const ops = diff === 'easy' ? ['+', '-'] : ['+', '-', '×', '÷'];
  let op = randChoice(ops);
  if (op === '÷') { b = b === 0 ? 1 : b; a = b * randInt(-10, 10); }
  let ans;
  if (op === '+') ans = a + b; else if (op === '-') ans = a - b; else if (op === '×') ans = a * b; else ans = a / b;
  return { q: `(${a}) ${op} (${b}) = `, a: String(ans) };
}
function linearExpr(diff) {
  const a = randInt(-9, 9) || 2, x = randInt(1, diff === 'easy' ? 10 : 20);
  const b = randInt(-9, 9);
  return { q: `x = ${x} 일 때, ${a}x ${sgnTerm(b)} 의 값을 구하세요.`, a: String(a * x + b) };
}
function linearEq(diff) {
  const a = randInt(1, diff === 'easy' ? 9 : 12), x = randInt(-10, 10);
  const b = randInt(-20, 20);
  const c = a * x + b;
  return { q: `${a}x ${sgnTerm(b)} = ${c} 를 만족하는 x의 값을 구하세요.`, a: String(x) };
}
function coordQuadrant(diff) {
  const x = randInt(-10, 10) || 1, y = randInt(-10, 10) || 1;
  let quad;
  if (x > 0 && y > 0) quad = 1; else if (x < 0 && y > 0) quad = 2; else if (x < 0 && y < 0) quad = 3; else quad = 4;
  return { q: `점 (${x}, ${y})는 제 몇 사분면 위의 점입니까?`, a: `제${quad}사분면`, svg: svgCoordPlane(x, y) };
}
function statsMean(diff) {
  const n = diff === 'easy' ? 4 : 5;
  const maxVal = diff === 'easy' ? 15 : 20;
  const targetAvg = randInt(-5, maxVal);
  let nums = [], sum = 0;
  for (let i = 0; i < n - 1; i++) { const v = randInt(-10, maxVal); nums.push(v); sum += v; }
  const last = targetAvg * n - sum;
  if (Math.abs(last) > 30) return statsMean(diff);
  nums.push(last);
  nums = shuffle(nums);
  return { q: `다음 자료의 평균을 구하세요: ${nums.join(', ')}`, a: String(targetAvg) };
}

// ---------- 중2 ----------
function simultaneousEq(diff) {
  const x = randInt(-10, 10), y = randInt(-10, 10);
  const a1 = randInt(1, 5), b1 = randInt(1, 5), a2 = randInt(1, 5), b2 = randInt(1, 5);
  const c1 = a1 * x + b1 * y, c2 = a2 * x - b2 * y;
  return {
    q: `x, y의 값을 구하세요.`,
    condition: `${a1}x + ${b1}y = ${c1}\n${a2}x - ${b2}y = ${c2}`,
    a: `x=${x}, y=${y}`,
    solution: `두 식을 연립하여 풀면 x=${x}, y=${y}`,
  };
}
function linearFunc(diff) {
  const a = randInt(-5, 5) || 2, b = randInt(-10, 10);
  const x = randInt(-10, 10);
  return { q: `일차함수 y = ${a}x ${sgnTerm(b)} 에서 x = ${x} 일 때 y의 값을 구하세요.`, a: String(a * x + b) };
}
function probabilityBasic(diff) {
  const total = randInt(diff === 'easy' ? 5 : 10, diff === 'easy' ? 10 : 20);
  const favorable = randInt(1, total - 1);
  const [sn, sd] = simplifyFrac(favorable, total);
  return {
    q: `주머니에 공이 ${total}개 있고 그중 ${favorable}개가 특정 색입니다. 하나를 뽑을 때 그 색일 확률을 기약분수로 나타내세요.`,
    a: `${sn}/${sd}`,
    svg: svgBallsDiagram(total, favorable),
    solution: `${favorable}/${total} = ${sn}/${sd} (기약분수)`,
  };
}
function linearInequality(diff) {
  const a = randInt(1, diff === 'easy' ? 5 : 9), b = randInt(-20, 20);
  const x = randInt(-10, 10);
  const c = a * x + b;
  const dir = Math.random() < 0.5 ? '>' : '<';
  return { q: `${a}x ${sgnTerm(b)} ${dir} ${c} 의 해를 구하세요.`, a: dir === '>' ? `x > ${x}` : `x < ${x}` };
}
function exponentLaws(diff) {
  const base = randChoice(['a', 'x']);
  const m = randInt(2, diff === 'easy' ? 5 : 9), n = randInt(2, diff === 'easy' ? 5 : 9);
  if (Math.random() < 0.5) return { q: `${base}^${m} × ${base}^${n} 을 간단히 하세요.`, a: `${base}^${m + n}` };
  const [big, small] = m > n ? [m, n] : [n, m];
  return { q: `${base}^${big} ÷ ${base}^${small} 을 간단히 하세요.`, a: big - small === 0 ? '1' : `${base}^${big - small}` };
}

// ---------- 중3 ----------
function factorization(diff) {
  const p = randInt(1, diff === 'easy' ? 5 : 9), q = randInt(1, diff === 'easy' ? 5 : 9);
  return { q: `x² + ${p + q}x + ${p * q} 를 인수분해하세요.`, a: `(x+${p})(x+${q})` };
}
function quadraticEq(diff) {
  const p = randInt(-9, 9) || 1, q = randInt(-9, 9) || 1;
  const b = -(p + q), c = p * q;
  const bTerm = b === 0 ? '' : ` ${sgnTerm(b)}x`;
  return { q: `x²${bTerm} ${sgnTerm(c)} = 0 을 만족하는 x의 값을 모두 구하세요.`, a: `x=${p} 또는 x=${q}` };
}
function pythagorean(diff) {
  const triples = [[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [9, 12, 15], [7, 24, 25], [20, 21, 29]];
  const [a, b, c] = randChoice(triples);
  if (Math.random() < 0.6) return { q: `직각삼각형의 두 변의 길이가 ${a}, ${b}일 때 빗변의 길이를 구하세요.`, a: String(c), svg: svgRightTriangle(a, b, '?') };
  const missing = Math.random() < 0.5 ? a : b;
  const known = missing === a ? b : a;
  const svg = missing === a ? svgRightTriangle('?', known, c) : svgRightTriangle(known, '?', c);
  return { q: `직각삼각형의 빗변이 ${c}, 다른 한 변이 ${known}일 때 나머지 한 변의 길이를 구하세요.`, a: String(missing), svg };
}
function squareRootCalc(diff) {
  const b = randChoice([2, 3, 5, 6, 7]);
  const k1 = randInt(1, diff === 'easy' ? 5 : 9), k2 = randInt(1, diff === 'easy' ? 5 : 9);
  const op = Math.random() < 0.5 ? '+' : '-';
  const res = op === '+' ? k1 + k2 : k1 - k2;
  const resStr = res === 0 ? '0' : res === 1 ? `√${b}` : res === -1 ? `-√${b}` : `${res}√${b}`;
  return { q: `${k1}√${b} ${op} ${k2}√${b} = `, a: resStr };
}
function similarity(diff) {
  const ratio = randInt(2, diff === 'easy' ? 3 : 5);
  const side = randInt(2, diff === 'easy' ? 10 : 20);
  return {
    q: `닮음비가 1:${ratio}인 두 도형이 있습니다. 작은 도형의 한 변이 ${side}cm일 때 큰 도형의 대응변의 길이를 구하세요.`,
    a: `${side * ratio}cm`,
    svg: svgSimilarTriangles(`${side}cm`, `${side * ratio}cm`, ratio),
  };
}
function regularPolygonInCircle(diff) {
  const r = randInt(diff === 'easy' ? 4 : 6, diff === 'easy' ? 10 : 20);
  const n = randChoice([3, 4, 6]);
  const names = { 3: '정삼각형', 4: '정사각형', 6: '정육각형' };
  const answers = { 3: `${r}√3`, 4: `${r}√2`, 6: `${r}` };
  return {
    q: `반지름이 ${r}cm인 원에 내접하는 ${names[n]}의 한 변의 길이를 구하세요.`,
    a: `${answers[n]}cm`,
    svg: svgInscribedPolygon(r, n),
  };
}

// ---------- 고1 ----------
function polynomialOps(diff) {
  const a = randInt(1, 5), b = randInt(1, 5);
  return { q: `(x + ${a})(x + ${b}) 를 전개하세요.`, a: `x² + ${a + b}x + ${a * b}` };
}
function quadraticIneq(diff) {
  const p = randInt(-8, 8) || 1, q = randInt(-8, 8) || 2;
  const lo = Math.min(p, q), hi = Math.max(p, q);
  const b = -(p + q), c = p * q;
  return { q: `x² ${sgnTerm(b)}x ${sgnTerm(c)} < 0 의 해를 구하세요.`, a: `${lo} < x < ${hi}` };
}
function functionEval(diff) {
  const a = randInt(-5, 5) || 1, b = randInt(-5, 5), c = randInt(-5, 5);
  const x = randInt(-5, 5);
  return { q: `f(x) = ${a}x² ${sgnTerm(b)}x ${sgnTerm(c)} 일 때 f(${x})의 값을 구하세요.`, a: String(a * x * x + b * x + c), svg: svgQuadraticGraph(a, b, c, x) };
}
function quadraticMinMax(diff) {
  const a = randChoice([1, -1, 2, -2]);
  const h = randInt(-3, 3), k = randInt(-5, 5);
  const b = -2 * a * h, c = a * h * h + k;
  const span = diff === 'easy' ? [2, 3] : diff === 'medium' ? [2, 4] : [3, 5];
  const lo = h - randInt(span[0], span[1]), hi = h + randInt(span[0], span[1]);
  const f = (x) => a * x * x + b * x + c;
  const fLo = f(lo), fHi = f(hi);
  const maxV = a > 0 ? Math.max(fLo, fHi) : k;
  const minV = a > 0 ? k : Math.min(fLo, fHi);
  return {
    q: `최댓값과 최솟값의 합을 구하세요.`,
    condition: `${lo} ≤ x ≤ ${hi} 에서 함수 f(x) = ${a}x² ${sgnTerm(b)}x ${sgnTerm(c)}`,
    a: String(maxV + minV),
    svg: svgQuadraticGraph(a, b, c, h),
    solution: `꼭짓점 (${h}, ${k}), f(${lo})=${fLo}, f(${hi})=${fHi} → 최댓값 ${maxV}, 최솟값 ${minV}`,
  };
}
function remainderTheorem(diff) {
  const a = randInt(1, diff === 'easy' ? 3 : 5), b = randInt(-5, 5), c = randInt(-5, 5);
  const k = randInt(-3, 3) || 1;
  const rem = a * k * k + b * k + c;
  return { q: `f(x) = ${a}x² ${sgnTerm(b)}x ${sgnTerm(c)} 를 (x ${k >= 0 ? '-' : '+'} ${Math.abs(k)})로 나눈 나머지를 구하세요.`, a: String(rem) };
}
function setOps(diff) {
  const total = randInt(diff === 'easy' ? 10 : 15, diff === 'easy' ? 20 : 30);
  const A = randInt(4, total - 4), B = randInt(4, total - 4);
  const inter = randInt(1, Math.min(A, B));
  const union = A + B - inter;
  if (Math.random() < 0.5) return { q: `전체집합의 부분집합 A, B에 대해 n(A)=${A}, n(B)=${B}, n(A∩B)=${inter}일 때 n(A∪B)를 구하세요.`, a: String(union) };
  return { q: `n(A)=${A}, n(B)=${B}, n(A∪B)=${union}일 때 n(A∩B)를 구하세요.`, a: String(inter) };
}

// ---------- 고2 ----------
function exponentLog(diff) {
  if (Math.random() < 0.5) {
    const base = randInt(2, 5), exp = randInt(2, diff === 'easy' ? 3 : 5);
    return { q: `${base}^${exp} 의 값을 구하세요.`, a: String(Math.pow(base, exp)) };
  }
  const base = randInt(2, 5), exp = randInt(1, 4);
  return { q: `log₍${base}₎ ${Math.pow(base, exp)} 의 값을 구하세요.`, a: String(exp) };
}
function trig(diff) {
  const table = {
    0: { sin: '0', cos: '1', tan: '0' },
    30: { sin: '1/2', cos: '√3/2', tan: '√3/3' },
    45: { sin: '√2/2', cos: '√2/2', tan: '1' },
    60: { sin: '√3/2', cos: '1/2', tan: '√3' },
    90: { sin: '1', cos: '0', tan: '정의되지 않음' },
  };
  const angle = randChoice([0, 30, 45, 60, 90]);
  const fn = randChoice(['sin', 'cos', 'tan']);
  return { q: `${fn} ${angle}° 의 값을 구하세요.`, a: table[angle][fn], svg: svgUnitCircleAngle(angle) };
}
function sequence(diff) {
  if (Math.random() < 0.5) {
    const a1 = randInt(1, 10), d = randInt(1, diff === 'easy' ? 5 : 9);
    const n = randInt(5, diff === 'easy' ? 10 : 20);
    return { q: `등차수열 ${a1}, ${a1 + d}, ${a1 + 2 * d}, ... 의 제 ${n}항을 구하세요.`, a: String(a1 + (n - 1) * d) };
  }
  const a1 = randInt(1, 5), r = randInt(2, 3);
  const n = randInt(3, diff === 'easy' ? 5 : 7);
  return { q: `등비수열 ${a1}, ${a1 * r}, ${a1 * r * r}, ... 의 제 ${n}항을 구하세요.`, a: String(a1 * Math.pow(r, n - 1)) };
}
function sigmaSum(diff) {
  const n = randInt(5, diff === 'easy' ? 10 : 20);
  if (Math.random() < 0.5) return { q: `∑ (k=1부터 ${n}까지) k 의 값을 구하세요.`, a: String((n * (n + 1)) / 2) };
  return { q: `∑ (k=1부터 ${n}까지) k² 의 값을 구하세요.`, a: String((n * (n + 1) * (2 * n + 1)) / 6) };
}
function vectorMagnitude(diff) {
  const pairs = [[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [9, 12, 15]];
  const [x, y, m] = randChoice(pairs);
  const sx = Math.random() < 0.5 ? x : -x, sy = Math.random() < 0.5 ? y : -y;
  return { q: `벡터 a = (${sx}, ${sy}) 의 크기 |a|를 구하세요.`, a: String(m) };
}

// ---------- 고3 ----------
function derivative(diff) {
  if (diff === 'easy') {
    const a = randInt(1, 5), n = randInt(2, 3), b = randInt(-5, 5);
    return { q: `f(x) = ${a}x^${n} ${sgnTerm(b)}x 일 때 f'(x)를 구하세요.`, a: `${a * n}x^${n - 1} ${sgnTerm(b)}` };
  }
  // 중/상: 극값 조건 두 개를 연립해서 미지의 두 계수를 구하는 실전형 문제
  const p = randInt(-2, 2) || 1;
  const trueA = randInt(-3, 3), trueB = -3 * p * p - 2 * trueA * p;
  const c = randInt(-5, 5);
  const givenV = p ** 3 + trueA * p * p + trueB * p + c;
  const cTerm = c === 0 ? '' : ` ${sgnTerm(c)}`;
  return {
    q: `상수 a, b에 대하여 a+b의 값을 구하세요.`,
    condition: `삼차함수 f(x) = x³ + ax² + bx${cTerm} 는 x = ${p} 에서 극값 ${givenV}를 가진다.`,
    a: String(trueA + trueB),
    svg: svgTangentGraph(1, trueA, trueB, c, p),
    solution: `f'(${p})=0 과 f(${p})=${givenV} 를 연립하면 a=${trueA}, b=${trueB}`,
  };
}
function integralProblem(diff) {
  const a = randInt(1, 5), n = randInt(1, diff === 'easy' ? 3 : 4);
  const g = gcd(a, n + 1);
  const coef = g === n + 1 ? `${a / g}` : `${a / g}/${(n + 1) / g}`;
  return { q: `∫ ${a}x^${n} dx 를 구하세요. (적분상수 C)`, a: `${coef} x^${n + 1} + C` };
}
function probStats(diff) {
  const branch = Math.random();
  if (branch < 0.4) {
    const n = randInt(diff === 'easy' ? 3 : 4, diff === 'easy' ? 5 : 7);
    const r = randInt(2, n);
    const fact = (k) => { let f = 1; for (let i = 2; i <= k; i++) f *= i; return f; };
    return { q: `서로 다른 ${n}개 중 ${r}개를 택하여 일렬로 나열하는 경우의 수를 구하세요.`, a: String(fact(n) / fact(n - r)) };
  }
  if (branch < 0.7) {
    const nums = Array.from({ length: 5 }, () => randInt(1, 10));
    const mean = Number((nums.reduce((s, v) => s + v, 0) / nums.length).toFixed(2));
    return { q: `다음 자료의 평균을 구하세요: ${nums.join(', ')}`, a: String(mean) };
  }
  // 도수분포표를 이용한 평균 계산 (계급값 사용)
  const width = 10;
  const start = randInt(0, 3) * width;
  const classes = Array.from({ length: 4 }, (_, i) => [start + i * width, start + (i + 1) * width]);
  const freqs = classes.map(() => randInt(2, 8));
  const total = freqs.reduce((s, v) => s + v, 0);
  const mids = classes.map(([lo, hi]) => (lo + hi) / 2);
  const sum = mids.reduce((s, m, i) => s + m * freqs[i], 0);
  const mean = sum / total;
  const rows = classes.map(([lo, hi], i) => [`${lo} 이상 ${hi} 미만`, String(freqs[i])]);
  rows.push(['합계', String(total)]);
  return {
    q: `다음은 어떤 자료를 계급의 크기가 ${width}인 도수분포표로 나타낸 것입니다. 이 자료의 평균을 계급값을 이용하여 구하세요.`,
    a: Number.isInteger(mean) ? String(mean) : mean.toFixed(2),
    svg: htmlDataTable(['계급', '도수'], rows),
    solution: `평균 = (계급값×도수)의 합 ÷ 도수의 합 = ${sum}/${total}`,
  };
}
function limitBasic(diff) {
  const a = randInt(1, 5), b = randInt(-5, 5), x = randInt(-5, 5);
  return { q: `lim (x→${x}) (${a}x ${sgnTerm(b)}) 의 값을 구하세요.`, a: String(a * x + b) };
}
function definiteIntegral(diff) {
  const a = randInt(1, 5), n = randInt(1, diff === 'easy' ? 2 : 3);
  const lo = randInt(0, 2), hi = lo + randInt(1, diff === 'easy' ? 2 : 4);
  const antiAt = (x) => (a / (n + 1)) * Math.pow(x, n + 1);
  const val = Number((antiAt(hi) - antiAt(lo)).toFixed(2));
  return {
    q: `곡선 y = ${a}x^${n} 과 x축, 두 직선 x=${lo}, x=${hi}로 둘러싸인 부분의 넓이를 구하세요.`,
    a: String(val),
    svg: svgAreaGraph(a, n, lo, hi),
    solution: `∫ ${a}x^${n} dx = ${a}/${n + 1} x^${n + 1}, [${lo}, ${hi}] 대입하면 ${val}`,
  };
}

// ---------- curriculum tree ----------
const CURRICULUM = [
  {
    group: '초등학교',
    grades: [
      { id: 'e1', label: '초등학교 1학년', topics: [
        { id: 'add_sub_1digit', label: '한 자리 수 덧셈과 뺄셈', gen: addSub1Digit },
        { id: 'compare', label: '수의 크기 비교', gen: compareNumbers },
        { id: 'add_sub_carry', label: '두 자리 수 덧셈과 뺄셈', gen: addSubCarry },
        { id: 'make10', label: '10 만들기', gen: make10 },
        { id: 'clock_hour', label: '시각과 시간(시 단위)', gen: clockHour },
      ] },
      { id: 'e2', label: '초등학교 2학년', topics: [
        { id: 'add_sub_2digit', label: '두 자리 수 덧셈과 뺄셈', gen: addSub2Digit },
        { id: 'mult_table', label: '곱셈구구', gen: multTable },
        { id: 'length_add_sub', label: '길이의 합과 차', gen: lengthAddSub },
        { id: 'clock_minutes', label: '시각과 시간(분 단위)', gen: clockMinutes },
      ] },
      { id: 'e3', label: '초등학교 3학년', topics: [
        { id: 'mult_div', label: '곱셈과 나눗셈', gen: multDiv },
        { id: 'fraction_compare', label: '분수의 크기 비교', gen: fractionCompare },
        { id: 'time_calc_e3', label: '시간의 덧셈과 뺄셈', gen: timeCalcE3 },
        { id: 'circle_basic', label: '원의 반지름과 지름', gen: circleBasic },
      ] },
      { id: 'e4', label: '초등학교 4학년', topics: [
        { id: 'big_number_ops', label: '큰 수의 덧셈과 뺄셈', gen: bigNumberOps },
        { id: 'decimal_basic', label: '소수의 덧셈과 뺄셈', gen: decimalBasic },
        { id: 'angle_calc', label: '각도의 계산', gen: angleCalc },
        { id: 'multi_digit_multdiv', label: '곱셈과 나눗셈(세 자리 수)', gen: multiDigitMultDiv },
      ] },
      { id: 'e5', label: '초등학교 5학년', topics: [
        { id: 'fraction_add_sub', label: '분수의 덧셈과 뺄셈', gen: fractionAddSub },
        { id: 'decimal_mult', label: '소수의 곱셈', gen: decimalMult },
        { id: 'factors_multiples', label: '약수와 배수', gen: factorsMultiples },
        { id: 'average_basic', label: '평균 구하기', gen: averageBasic },
        { id: 'polygon_area', label: '다각형의 넓이', gen: polygonArea },
      ] },
      { id: 'e6', label: '초등학교 6학년', topics: [
        { id: 'fraction_div', label: '분수의 나눗셈', gen: fractionDiv },
        { id: 'decimal_div', label: '소수의 나눗셈', gen: decimalDiv },
        { id: 'ratio', label: '비와 비율', gen: ratioProblem },
        { id: 'proportion_eq', label: '비례식', gen: proportionEq },
        { id: 'volume_box', label: '직육면체의 부피', gen: volumeBox },
      ] },
    ],
  },
  {
    group: '중학교',
    grades: [
      { id: 'm1', label: '중학교 1학년', topics: [
        { id: 'integer_ops', label: '정수와 유리수의 계산', gen: integerOps },
        { id: 'linear_expr', label: '문자와 식', gen: linearExpr },
        { id: 'linear_eq', label: '일차방정식', gen: linearEq },
        { id: 'coord_quadrant', label: '좌표평면과 사분면', gen: coordQuadrant },
        { id: 'stats_mean', label: '자료의 평균', gen: statsMean },
      ] },
      { id: 'm2', label: '중학교 2학년', topics: [
        { id: 'simultaneous_eq', label: '연립방정식', gen: simultaneousEq },
        { id: 'linear_func', label: '일차함수', gen: linearFunc },
        { id: 'probability_basic', label: '확률', gen: probabilityBasic },
        { id: 'linear_inequality', label: '일차부등식', gen: linearInequality },
        { id: 'exponent_laws', label: '지수법칙', gen: exponentLaws },
      ] },
      { id: 'm3', label: '중학교 3학년', topics: [
        { id: 'factorization', label: '인수분해', gen: factorization },
        { id: 'quadratic_eq', label: '이차방정식', gen: quadraticEq },
        { id: 'pythagorean', label: '피타고라스 정리', gen: pythagorean },
        { id: 'square_root_calc', label: '제곱근의 계산', gen: squareRootCalc },
        { id: 'similarity', label: '도형의 닮음', gen: similarity },
        { id: 'regular_polygon_circle', label: '원에 내접하는 정다각형', gen: regularPolygonInCircle },
      ] },
    ],
  },
  {
    group: '고등학교',
    grades: [
      { id: 'h1', label: '고등학교 1학년', topics: [
        { id: 'polynomial_ops', label: '다항식의 연산', gen: polynomialOps },
        { id: 'quadratic_ineq', label: '이차부등식', gen: quadraticIneq },
        { id: 'function_eval', label: '함수의 값', gen: functionEval },
        { id: 'remainder_theorem', label: '나머지정리', gen: remainderTheorem },
        { id: 'set_ops', label: '집합의 연산', gen: setOps },
        { id: 'quadratic_minmax', label: '이차함수의 최댓값과 최솟값', gen: quadraticMinMax },
      ] },
      { id: 'h2', label: '고등학교 2학년', topics: [
        { id: 'exponent_log', label: '지수와 로그', gen: exponentLog },
        { id: 'trig', label: '삼각함수', gen: trig },
        { id: 'sequence', label: '수열', gen: sequence },
        { id: 'sigma_sum', label: '수열의 합(시그마)', gen: sigmaSum },
        { id: 'vector_magnitude', label: '벡터의 크기', gen: vectorMagnitude },
      ] },
      { id: 'h3', label: '고등학교 3학년', topics: [
        { id: 'derivative', label: '미분', gen: derivative },
        { id: 'integral', label: '적분(부정적분)', gen: integralProblem },
        { id: 'prob_stats', label: '확률과 통계', gen: probStats },
        { id: 'limit_basic', label: '함수의 극한', gen: limitBasic },
        { id: 'definite_integral', label: '정적분', gen: definiteIntegral },
      ] },
    ],
  },
];

// ---------- curated word problems (문장제) ----------
const WORD_BANK = {
  e1: [
    { q: '사과가 4개 있었는데 3개를 더 샀습니다. 사과는 모두 몇 개입니까?', a: '7개' },
    { q: '연필 9자루 중에서 4자루를 친구에게 주었습니다. 남은 연필은 몇 자루입니까?', a: '5자루' },
    { q: '빨간 구슬이 6개, 파란 구슬이 5개 있습니다. 구슬은 모두 몇 개입니까?', a: '11개' },
    { q: '초콜릿 12개 중 7개를 먹었습니다. 남은 초콜릿은 몇 개입니까?', a: '5개' },
  ],
  e2: [
    { q: '한 상자에 사탕이 24개 들어 있습니다. 3상자에는 사탕이 모두 몇 개 있습니까?', a: '72개' },
    { q: '구슬 45개를 5명이 똑같이 나누어 가지면 한 명이 몇 개씩 가지게 됩니까?', a: '9개' },
    { q: '학생 128명 중 남학생이 67명입니다. 여학생은 몇 명입니까?', a: '61명' },
    { q: '한 봉지에 8개씩 들어있는 사탕이 7봉지 있습니다. 사탕은 모두 몇 개입니까?', a: '56개' },
  ],
  e3: [
    { q: '한 상자에 딸기가 15개씩 들어 있습니다. 6상자에는 딸기가 모두 몇 개 있습니까?', a: '90개' },
    { q: '리본 84cm를 7명이 똑같이 나누어 가지면 한 명이 몇 cm씩 가지게 됩니까?', a: '12cm' },
    { q: '피자 한 판을 8조각으로 나누었습니다. 3조각을 먹었다면 먹은 양은 피자 전체의 몇 분의 몇입니까?', a: '3/8' },
    { q: '책 96권을 한 칸에 12권씩 꽂으면 책장은 몇 칸이 필요합니까?', a: '8칸' },
  ],
  e4: [
    { q: '어느 공장에서 하루에 1,250개의 제품을 생산합니다. 15일 동안 생산하는 제품은 모두 몇 개입니까?', a: '18,750개' },
    { q: '물통에 물이 2.5L 들어 있었는데 1.8L를 사용했습니다. 남은 물의 양은 몇 L입니까?', a: '0.7L' },
    { q: '각도기로 잰 각이 35°인 각과 90°인 각이 있습니다. 두 각의 크기의 합은 몇 도입니까?', a: '125°' },
    { q: '사탕 3,240개를 한 봉지에 40개씩 담으면 몇 봉지가 되고 몇 개가 남습니까?', a: '81봉지, 0개' },
  ],
  e5: [
    { q: '우유 3/4L 중에서 1/3L를 마셨습니다. 남은 우유는 몇 L입니까?', a: '5/12L' },
    { q: '가로 2.4m, 세로 1.5m인 직사각형 텃밭의 넓이는 몇 m²입니까?', a: '3.6m²' },
    { q: '12와 18의 최대공약수와 최소공배수를 각각 구하세요.', a: '최대공약수 6, 최소공배수 36' },
    { q: '리본 5/6m 중에서 친구에게 1/2m를 주었습니다. 남은 리본은 몇 m입니까?', a: '1/3m' },
  ],
  e6: [
    { q: '쌀 5/8kg을 2등분하면 한 봉지에 몇 kg씩 담게 됩니까?', a: '5/16kg' },
    { q: '휘발유 12.6L로 자동차가 90.72km를 달렸습니다. 1L로 몇 km를 달린 셈입니까?', a: '7.2km' },
    { q: '남학생과 여학생의 비가 3:2이고 전체 학생이 40명일 때 남학생은 몇 명입니까?', a: '24명' },
    { q: '반지름이 7cm인 원의 넓이를 구하세요. (원주율 3.14 사용)', a: '153.86cm²' },
  ],
  m1: [
    { q: '어떤 수에 5를 더한 후 3을 곱했더니 24가 되었습니다. 어떤 수를 구하세요.', a: '3' },
    { q: '영하 7도였던 기온이 12도 올랐습니다. 현재 기온은 몇 도입니까?', a: '5도' },
    { q: '한 변의 길이가 (x+2)cm인 정사각형의 둘레를 x에 대한 식으로 나타내세요.', a: '4x+8 (cm)' },
    { q: '형이 동생보다 5살 많고 두 사람 나이의 합이 27살입니다. 동생의 나이를 구하세요.', a: '11살' },
  ],
  m2: [
    { q: '두 자연수의 합이 15이고 차가 3일 때 두 수를 구하세요.', a: '9와 6' },
    { q: '시속 4km로 걷는 사람과 시속 6km로 걷는 사람이 같은 지점에서 반대 방향으로 동시에 출발했습니다. 2시간 후 두 사람 사이의 거리를 구하세요.', a: '20km' },
    { q: '일차함수 y=2x-3의 그래프가 x축과 만나는 점의 좌표를 구하세요.', a: '(3/2, 0)' },
    { q: '주사위 하나를 던질 때 짝수의 눈이 나올 확률을 구하세요.', a: '1/2' },
  ],
  m3: [
    { q: '가로가 세로보다 3cm 긴 직사각형의 넓이가 40cm²일 때 세로의 길이를 구하세요.', a: '5cm' },
    { q: '이차방정식 x²-5x+6=0의 두 근의 합과 곱을 각각 구하세요.', a: '합 5, 곱 6' },
    { q: '사다리를 벽에 기대어 놓았더니 벽에서 바닥까지의 높이가 12m, 사다리 밑과 벽 사이의 거리가 5m였습니다. 사다리의 길이를 구하세요.', a: '13m' },
    { q: '이차함수 y=x²-4x+3의 꼭짓점의 좌표를 구하세요.', a: '(2, -1)' },
  ],
  h1: [
    { q: '다항식 (x+3)²-(x-3)² 을 간단히 하세요.', a: '12x' },
    { q: '이차부등식 x²-x-6>0 의 해를 구하세요.', a: 'x<-2 또는 x>3' },
    { q: '함수 f(x)=3x-2 에서 f(4)의 값을 구하세요.', a: '10' },
    { q: '이차방정식 2x²-3x-2=0 의 해를 구하세요.', a: 'x=2 또는 x=-1/2' },
  ],
  h2: [
    { q: 'log₂ 8 + log₂ 4 의 값을 구하세요.', a: '5' },
    { q: 'sin30° + cos60° 의 값을 구하세요.', a: '1' },
    { q: '첫째항이 3, 공차가 4인 등차수열의 첫 10항의 합을 구하세요.', a: '210' },
    { q: '함수 f(x)=x³-3x 의 도함수 f\'(x)를 구하세요.', a: '3x²-3' },
  ],
  h3: [
    { q: '함수 f(x)=x³-3x²+2 의 극댓값을 구하세요.', a: '2 (x=0에서)' },
    { q: '정적분 ∫₀² 3x² dx 의 값을 구하세요.', a: '8' },
    { q: '서로 다른 5개의 문자를 일렬로 나열하는 경우의 수를 구하세요.', a: '120' },
    { q: '동전을 3번 던질 때 앞면이 2번 나올 확률을 구하세요.', a: '3/8' },
  ],
};

function findGrade(gradeId) {
  for (const g of CURRICULUM) {
    const found = g.grades.find((x) => x.id === gradeId);
    if (found) return found;
  }
  return null;
}

function findGroup(gradeId) {
  for (const g of CURRICULUM) {
    if (g.grades.some((x) => x.id === gradeId)) return g.group;
  }
  return null;
}
