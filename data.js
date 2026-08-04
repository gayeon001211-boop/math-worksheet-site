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
  if (Math.random() < 0.5) return { q: `반지름이 ${r}cm인 원의 지름을 구하세요.`, a: `${r * 2}cm` };
  const d = r * 2;
  return { q: `지름이 ${d}cm인 원의 반지름을 구하세요.`, a: `${r}cm` };
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
  if (Math.random() < 0.5) return { q: `밑변이 ${b}cm, 높이가 ${h}cm인 삼각형의 넓이를 구하세요.`, a: `${(b * h) / 2}cm²` };
  return { q: `밑변이 ${b}cm, 높이가 ${h}cm인 평행사변형의 넓이를 구하세요.`, a: `${b * h}cm²` };
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
  return { q: `가로 ${l}cm, 세로 ${w}cm, 높이 ${h}cm인 직육면체의 부피를 구하세요.`, a: `${l * w * h}cm³` };
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
  return { q: `점 (${x}, ${y})는 제 몇 사분면 위의 점입니까?`, a: `제${quad}사분면` };
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
  return { q: `${a1}x + ${b1}y = ${c1},  ${a2}x - ${b2}y = ${c2}  연립방정식을 풀어 x, y의 값을 구하세요.`, a: `x=${x}, y=${y}` };
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
  return { q: `주머니에 공이 ${total}개 있고 그중 ${favorable}개가 특정 색입니다. 하나를 뽑을 때 그 색일 확률을 기약분수로 나타내세요.`, a: `${sn}/${sd}` };
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
  if (Math.random() < 0.6) return { q: `직각삼각형의 두 변의 길이가 ${a}, ${b}일 때 빗변의 길이를 구하세요.`, a: String(c) };
  const missing = Math.random() < 0.5 ? a : b;
  const known = missing === a ? b : a;
  return { q: `직각삼각형의 빗변이 ${c}, 다른 한 변이 ${known}일 때 나머지 한 변의 길이를 구하세요.`, a: String(missing) };
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
  return { q: `닮음비가 1:${ratio}인 두 도형이 있습니다. 작은 도형의 한 변이 ${side}cm일 때 큰 도형의 대응변의 길이를 구하세요.`, a: `${side * ratio}cm` };
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
  return { q: `f(x) = ${a}x² ${sgnTerm(b)}x ${sgnTerm(c)} 일 때 f(${x})의 값을 구하세요.`, a: String(a * x * x + b * x + c) };
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
  return { q: `${fn} ${angle}° 의 값을 구하세요.`, a: table[angle][fn] };
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
  const a = randInt(1, 5), n = randInt(2, diff === 'easy' ? 3 : 4), b = randInt(-5, 5);
  return { q: `f(x) = ${a}x^${n} ${sgnTerm(b)}x 일 때 f'(x)를 구하세요.`, a: `${a * n}x^${n - 1} ${sgnTerm(b)}` };
}
function integralProblem(diff) {
  const a = randInt(1, 5), n = randInt(1, diff === 'easy' ? 3 : 4);
  const g = gcd(a, n + 1);
  const coef = g === n + 1 ? `${a / g}` : `${a / g}/${(n + 1) / g}`;
  return { q: `∫ ${a}x^${n} dx 를 구하세요. (적분상수 C)`, a: `${coef} x^${n + 1} + C` };
}
function probStats(diff) {
  if (Math.random() < 0.5) {
    const n = randInt(diff === 'easy' ? 3 : 4, diff === 'easy' ? 5 : 7);
    const r = randInt(2, n);
    const fact = (k) => { let f = 1; for (let i = 2; i <= k; i++) f *= i; return f; };
    return { q: `서로 다른 ${n}개 중 ${r}개를 택하여 일렬로 나열하는 경우의 수를 구하세요.`, a: String(fact(n) / fact(n - r)) };
  }
  const nums = Array.from({ length: 5 }, () => randInt(1, 10));
  const mean = Number((nums.reduce((s, v) => s + v, 0) / nums.length).toFixed(2));
  return { q: `다음 자료의 평균을 구하세요: ${nums.join(', ')}`, a: String(mean) };
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
  return { q: `∫ (${lo}부터 ${hi}까지) ${a}x^${n} dx 의 값을 구하세요.`, a: String(val) };
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
