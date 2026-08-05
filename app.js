const DIFF_LABEL = { easy: '하', medium: '중', hard: '상' };
const SAVE_KEY = 'mathWorksheetSaved';

function pageSizeForGroup(groupLabel) {
  return groupLabel === '초등학교' ? 12 : 6;
}

const gradeSelect = document.getElementById('gradeSelect');
const topicList = document.getElementById('topicList');
const customCountModeCb = document.getElementById('customCountMode');
const fontSizeSelect = document.getElementById('fontSizeSelect');
const difficultyField = document.getElementById('difficultyField');
const difficultyRadios = document.querySelectorAll('input[name="difficulty"]');
const countModeField = document.getElementById('countModeField');
const countInput = document.getElementById('countInput');
const includeAnswersCb = document.getElementById('includeAnswers');
const previewAnswersCb = document.getElementById('previewAnswers');
const examModeCb = document.getElementById('examMode');
const typeModeRadios = document.querySelectorAll('input[name="typeMode"]');
const typeChoiceCb = document.getElementById('typeChoice');
const typeEssayCb = document.getElementById('typeEssay');
const typeManualField = document.getElementById('typeManualField');
const mcPercentInput = document.getElementById('mcPercent');
const essayPercentInput = document.getElementById('essayPercent');
const generateBtn = document.getElementById('generateBtn');
const printBtn = document.getElementById('printBtn');
const saveBtn = document.getElementById('saveBtn');
const pagePanel = document.getElementById('pagePanel');
const pageSectionInput = document.getElementById('pageSectionInput');
const generatePagesBtn = document.getElementById('generatePagesBtn');
const savedList = document.getElementById('savedList');
const loadSavedBtn = document.getElementById('loadSavedBtn');
const deleteSavedBtn = document.getElementById('deleteSavedBtn');
const emptyState = document.getElementById('emptyState');
const worksheetSection = document.getElementById('worksheetSection');
const problemList = document.getElementById('problemList');
const answerSheet = document.getElementById('answerSheet');
const answerList = document.getElementById('answerList');
const answerGradeLabel = document.getElementById('answerGradeLabel');
const coverBadge = document.getElementById('coverBadge');
const coverTitle = document.getElementById('coverTitle');
const coverSubtitle = document.getElementById('coverSubtitle');
const coverStats = document.getElementById('coverStats');
const coverFooter = document.getElementById('coverFooter');

const THEME_CLASSES = ['theme-elementary', 'theme-middle', 'theme-high'];
const THEME_BY_GROUP = { '초등학교': 'theme-elementary', '중학교': 'theme-middle', '고등학교': 'theme-high' };

function applyTheme(groupLabel) {
  document.body.classList.remove(...THEME_CLASSES);
  const cls = THEME_BY_GROUP[groupLabel];
  if (cls) document.body.classList.add(cls);
}

let currentProblems = []; // { q, a }
let currentGroupLabel = '';
let currentTitleText = '';
let currentMetaText = '';

function populateGradeSelect() {
  CURRICULUM.forEach((group) => {
    const optgroup = document.createElement('optgroup');
    optgroup.label = group.group;
    group.grades.forEach((g) => {
      const opt = document.createElement('option');
      opt.value = g.id;
      opt.textContent = g.label;
      optgroup.appendChild(opt);
    });
    gradeSelect.appendChild(optgroup);
  });
}

function populateTopics(gradeId) {
  topicList.innerHTML = '';
  const grade = findGrade(gradeId);
  if (!grade) return;
  grade.topics.forEach((topic) => {
    const id = `topic_${topic.id}`;
    const label = document.createElement('label');
    label.className = 'topic-item';
    label.innerHTML = `<input type="checkbox" id="${id}" data-topic="${topic.id}" checked> <span>${topic.label}</span><input type="number" class="topic-count hidden" data-count-for="${topic.id}" value="4" min="0" max="30">`;
    topicList.appendChild(label);
  });
  if (WORD_BANK[gradeId] && WORD_BANK[gradeId].length) {
    const label = document.createElement('label');
    label.className = 'topic-item word-item';
    label.innerHTML = `<input type="checkbox" id="topic_word" data-word="1" checked> <span>문장제(응용) 문제</span><input type="number" class="topic-count hidden" data-count-for="__word__" value="4" min="0" max="30">`;
    topicList.appendChild(label);
  }
  topicList.querySelectorAll('.topic-count').forEach((el) => el.classList.toggle('hidden', !customCountModeCb.checked));
}

function wordGenFactory(gradeId) {
  let queue = shuffle(WORD_BANK[gradeId] || []);
  let idx = 0;
  return () => {
    if (idx >= queue.length) { queue = shuffle(WORD_BANK[gradeId] || []); idx = 0; }
    const item = queue[idx++];
    return { q: item.q, a: item.a };
  };
}

function pickWeightedDifficulty() {
  const r = Math.random();
  if (r < 0.2) return 'easy';
  if (r < 0.7) return 'medium';
  return 'hard';
}

function generateUnique(genFn, count) {
  const out = [];
  const seen = new Set();
  let guard = 0;
  while (out.length < count && guard < count * 8) {
    guard++;
    const p = genFn();
    const key = p.q;
    if (seen.has(key) && guard < count * 6) continue;
    seen.add(key);
    out.push(p);
  }
  return out;
}

function distribute(total, n) {
  const base = Math.floor(total / n);
  const extra = total % n;
  return Array.from({ length: n }, (_, i) => base + (i < extra ? 1 : 0));
}

function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

// Best-effort multiple-choice distractors for plain "number [+ short unit]" answers
// (e.g. "9", "35°", "24cm²"). Anything with HTML (fractions), commas, multiple
// numbers, or a long/complex suffix is left as a subjective answer.
function extractDistractors(answerHtml) {
  if (/<[^>]+>/.test(answerHtml)) return null;
  const trimmed = answerHtml.trim();
  if (trimmed === '>' || trimmed === '<' || trimmed === '=') {
    return ['>', '<', '='].filter((s) => s !== trimmed);
  }
  const m = trimmed.match(/^(-?\d+(?:\.\d+)?)(.*)$/);
  if (!m) return null;
  const suffix = m[2] || '';
  if (/\d/.test(suffix) || suffix.length > 6) return null;
  const num = parseFloat(m[1]);
  const isInt = Number.isInteger(num);
  const magnitude = Math.max(1, Math.round(Math.abs(num) * 0.15));
  const deltaPool = shuffle([1, -1, 2, -2, magnitude, -magnitude, magnitude * 2, -magnitude * 2]);
  const seen = new Set([num]);
  const out = [];
  for (const d of deltaPool) {
    if (out.length >= 3) break;
    const cand = isInt ? num + d : Number((num + d).toFixed(2));
    if (!seen.has(cand)) { seen.add(cand); out.push(`${cand}${suffix}`); }
  }
  return out.length >= 3 ? out : null;
}

function currentTypeSettings() {
  const mode = document.querySelector('input[name="typeMode"]:checked').value;
  const choiceOn = typeChoiceCb.checked;
  const essayOn = typeEssayCb.checked;
  let mcPct = 0;
  let essayPct = 0;
  if (mode === 'auto') {
    const weights = { subjective: 0.65, choice: choiceOn ? 0.25 : 0, essay: essayOn ? 0.1 : 0 };
    const sum = weights.subjective + weights.choice + weights.essay;
    mcPct = (weights.choice / sum) * 100;
    essayPct = (weights.essay / sum) * 100;
  } else {
    mcPct = choiceOn ? clampPct(mcPercentInput.value) : 0;
    essayPct = essayOn ? clampPct(essayPercentInput.value) : 0;
    if (mcPct + essayPct > 100) {
      const scale = 100 / (mcPct + essayPct);
      mcPct *= scale;
      essayPct *= scale;
    }
  }
  return { mcPct, essayPct };
}

function clampPct(v) {
  let n = parseFloat(v);
  if (Number.isNaN(n)) n = 0;
  return Math.max(0, Math.min(100, n));
}

// Assigns 'choice' / 'essay' / 'subjective' to each problem, respecting the
// requested ratio as closely as possible (multiple-choice only where the
// answer can be turned into plausible distractors).
function assignTypes(problems) {
  const { mcPct, essayPct } = currentTypeSettings();
  const total = problems.length;
  let mcTarget = Math.round((total * mcPct) / 100);
  let essayTarget = Math.round((total * essayPct) / 100);
  if (mcTarget + essayTarget > total) essayTarget = Math.max(0, total - mcTarget);

  const order = shuffle(problems.map((_, i) => i));
  const type = new Array(total).fill('subjective');
  const choiceData = new Array(total).fill(null);

  if (mcTarget > 0) {
    let assigned = 0;
    for (const i of order) {
      if (assigned >= mcTarget) break;
      const distractors = extractDistractors(problems[i].a);
      if (!distractors) continue;
      type[i] = 'choice';
      choiceData[i] = distractors;
      assigned++;
    }
  }
  if (essayTarget > 0) {
    let assigned = 0;
    for (const i of order) {
      if (assigned >= essayTarget) break;
      if (type[i] !== 'subjective') continue;
      type[i] = 'essay';
      assigned++;
    }
  }

  return problems.map((p, i) => {
    if (type[i] === 'choice') {
      const opts = shuffle([p.a, ...choiceData[i]]);
      return { ...p, type: 'choice', choices: opts, correctIdx: opts.indexOf(p.a) };
    }
    if (type[i] === 'essay') return { ...p, type: 'essay' };
    return { ...p, type: 'subjective' };
  });
}

const CHOICE_MARKS = ['①', '②', '③', '④'];

function renderProblemHtml(p, num) {
  const cls = 'problem';
  const diffBadge = p.diff ? `<span class="diff-badge diff-${p.diff}">${DIFF_LABEL[p.diff]}</span>` : '';
  const svgHtml = p.svg ? `<div class="diagram-wrap">${p.svg}</div>` : '';

  let bodyHtml;
  if (p.type === 'choice') {
    const choicesHtml = p.choices.map((c, i) => `<span class="choice">${CHOICE_MARKS[i]} ${c}</span>`).join('');
    bodyHtml = `<div class="qblock"><span class="qtext">${p.q}</span>${svgHtml}<div class="choices">${choicesHtml}</div></div>`;
  } else if (p.type === 'essay') {
    bodyHtml = `<div class="qblock"><span class="qtext">${p.q} <span class="essay-tag">(풀이 과정과 답을 쓰세요)</span></span>${svgHtml}<div class="essay-lines"></div></div>`;
  } else if (p.svg) {
    bodyHtml = `<div class="qblock"><span class="qtext">${p.q}</span>${svgHtml}</div>`;
  } else {
    bodyHtml = `<span class="qtext">${p.q}</span>`;
  }
  return `<div class="${cls}"><span class="num">${diffBadge}${num}.</span>${bodyHtml}</div>`;
}

function buildSources(grade, gradeId, examMode, diff) {
  const topicChecks = topicList.querySelectorAll('input[data-topic]:checked');
  const wordCheck = topicList.querySelector('input[data-word]:checked');
  const sources = [];
  topicChecks.forEach((cb) => {
    const topic = grade.topics.find((t) => t.id === cb.dataset.topic);
    if (topic) {
      sources.push({
        label: topic.label,
        topicId: topic.id,
        gen: () => {
          const d = examMode ? pickWeightedDifficulty() : diff;
          return { ...topic.gen(d), diff: d };
        },
      });
    }
  });
  if (wordCheck) {
    const wordGen = wordGenFactory(gradeId);
    sources.push({ label: '문장제(응용) 문제', topicId: '__word__', gen: () => ({ ...wordGen(), diff: null }) });
  }
  return sources;
}

function resolveCount() {
  let count = parseInt(countInput.value, 10);
  if (Number.isNaN(count)) count = 20;
  count = Math.max(6, Math.min(80, count));
  countInput.value = count;
  return count;
}

function pageHeaderHtml(titleText, metaText) {
  return `
    <div class="page-header">
      <h2>${titleText}</h2>
      <div class="page-header-meta">${metaText}</div>
      <div class="page-header-student">
        <span>이름: ________________</span>
        <span class="exam-only">수험번호: ________________</span>
        <span>날짜: ________________</span>
        <span>점수: ________________</span>
      </div>
    </div>`;
}

function renderWorksheet(problems, titleText, metaText, answerTitleText, groupLabel) {
  currentProblems = problems;
  currentTitleText = titleText;
  currentMetaText = metaText;
  currentGroupLabel = groupLabel || currentGroupLabel;
  applyTheme(currentGroupLabel);

  answerGradeLabel.textContent = answerTitleText;

  const pageSize = pageSizeForGroup(currentGroupLabel);
  const pages = chunk(problems, pageSize);
  const totalPages = pages.length;

  coverBadge.textContent = currentGroupLabel || '수학';
  coverTitle.textContent = titleText;
  coverSubtitle.textContent = metaText;
  coverStats.innerHTML = [
    `<span class="stat-chip">문제 수 ${problems.length}문항</span>`,
    `<span class="stat-chip">${totalPages}페이지</span>`,
    `<span class="stat-chip">페이지당 ${pageSize}문항</span>`,
  ].join('');
  coverFooter.textContent = `생성일: ${new Date().toLocaleDateString('ko-KR')}`;

  problemList.innerHTML = pages
    .map((pageProblems, pIdx) => {
      const isLast = pIdx === pages.length - 1;
      const items = pageProblems
        .map((p, i) => renderProblemHtml(p, pIdx * pageSize + i + 1))
        .join('');
      return `
        <div class="sheet page-block${isLast ? '' : ' page-break'}">
          ${pageHeaderHtml(titleText, metaText)}
          <div class="problem-grid">${items}</div>
          <div class="page-footer">${pIdx + 1} / ${totalPages}</div>
        </div>`;
    })
    .join('');

  answerList.innerHTML = problems
    .map((p, i) => `<span class="ans-item"><b>${i + 1}.</b> ${p.type === 'choice' ? CHOICE_MARKS[p.correctIdx] : p.a}</span>`)
    .join('');

  emptyState.classList.add('hidden');
  worksheetSection.classList.remove('hidden');
  worksheetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function finalizeAndRender(grade, sources, counts, examMode, diff, extraNote, groupLabel) {
  let problems = [];
  sources.forEach((src, i) => {
    if (counts[i] <= 0) return;
    problems = problems.concat(generateUnique(src.gen, counts[i]));
  });
  problems = shuffle(problems);

  if (problems.length === 0) {
    alert('생성된 문제가 없습니다. 단원별 문항 수를 확인해주세요.');
    return;
  }

  problems = assignTypes(problems);

  const topicLabels = sources.filter((s, i) => counts[i] > 0).map((s) => s.label).join(', ');
  const perScore = Math.floor(100 / problems.length);
  const noteSuffix = extraNote ? `  |  ${extraNote}` : '';

  if (examMode) {
    renderWorksheet(
      problems,
      `${grade.label} 수학 실전 대비 모의고사`,
      `단원: ${topicLabels}  |  시험 시간: 40분  |  총점: 100점 (문항당 ${perScore}점)  |  문제 수: ${problems.length}문항${noteSuffix}`,
      `${grade.label} 수학 실전 대비 모의고사 - 정답지`,
      groupLabel
    );
  } else {
    renderWorksheet(
      problems,
      `${grade.label} 수학 문제집`,
      `단원: ${topicLabels}  |  난이도: ${DIFF_LABEL[diff]}  |  문제 수: ${problems.length}문항${noteSuffix}`,
      `${grade.label} 수학 문제집 - 정답지 (난이도: ${DIFF_LABEL[diff]})`,
      groupLabel
    );
  }
}

function onGenerate() {
  const gradeId = gradeSelect.value;
  const grade = findGrade(gradeId);
  if (!grade) return;
  const examMode = examModeCb.checked;
  const diff = document.querySelector('input[name="difficulty"]:checked').value;

  const sources = buildSources(grade, gradeId, examMode, diff);
  if (sources.length === 0) {
    alert('최소 하나 이상의 단원을 선택해주세요.');
    return;
  }

  let counts;
  if (customCountModeCb.checked) {
    counts = sources.map((s) => {
      const input = topicList.querySelector(`.topic-count[data-count-for="${s.topicId}"]`);
      let v = input ? parseInt(input.value, 10) : 0;
      if (Number.isNaN(v)) v = 0;
      return Math.max(0, Math.min(30, v));
    });
    if (counts.reduce((a, b) => a + b, 0) === 0) {
      alert('단원별 문항 수를 1개 이상 입력해주세요.');
      return;
    }
  } else {
    const count = resolveCount();
    counts = distribute(count, sources.length);
  }

  finalizeAndRender(grade, sources, counts, examMode, diff, undefined, findGroup(gradeId));
}

function onGeneratePages() {
  if (customCountModeCb.checked) {
    alert('"단원별 문항 수 직접 지정"을 끄면 페이지 수로 생성할 수 있어요.');
    return;
  }
  const gradeId = gradeSelect.value;
  const grade = findGrade(gradeId);
  if (!grade) return;
  const examMode = examModeCb.checked;
  const diff = document.querySelector('input[name="difficulty"]:checked').value;

  const sources = buildSources(grade, gradeId, examMode, diff);
  if (sources.length === 0) {
    alert('최소 하나 이상의 단원을 선택해주세요.');
    return;
  }

  let pages = parseInt(pageSectionInput.value, 10);
  if (Number.isNaN(pages)) pages = 2;
  pages = Math.max(1, Math.min(8, pages));
  pageSectionInput.value = pages;
  const count = pages * pageSizeForGroup(findGroup(gradeId));
  const counts = distribute(count, sources.length);

  finalizeAndRender(grade, sources, counts, examMode, diff, `약 ${pages}페이지 분량`, findGroup(gradeId));
}

function getSaved() {
  try {
    return JSON.parse(localStorage.getItem(SAVE_KEY)) || [];
  } catch {
    return [];
  }
}
function setSaved(list) {
  localStorage.setItem(SAVE_KEY, JSON.stringify(list));
}
function refreshSavedList() {
  const list = getSaved();
  if (!list.length) {
    savedList.innerHTML = '<option value="">저장된 문제집이 없습니다</option>';
    return;
  }
  savedList.innerHTML = list
    .map((item) => `<option value="${item.id}">${item.savedAt} · ${item.title} (${item.problems.length}문항)</option>`)
    .join('');
}
function onSave() {
  if (!currentProblems.length) {
    alert('먼저 문제집을 생성해주세요.');
    return;
  }
  const list = getSaved();
  const entry = {
    id: String(Date.now()),
    savedAt: new Date().toLocaleString('ko-KR', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
    title: currentTitleText,
    meta: currentMetaText,
    answerTitle: answerGradeLabel.textContent,
    groupLabel: currentGroupLabel,
    problems: currentProblems.map((p) => ({ q: p.q, a: p.a, type: p.type, choices: p.choices, correctIdx: p.correctIdx, svg: p.svg, diff: p.diff })),
  };
  list.unshift(entry);
  if (list.length > 20) list.length = 20;
  setSaved(list);
  refreshSavedList();
  savedList.value = entry.id;
  alert('문제집을 저장했어요. "저장된 문제집 불러오기"에서 언제든 다시 불러올 수 있어요.');
}
function onLoadSaved() {
  const id = savedList.value;
  if (!id) return;
  const entry = getSaved().find((e) => e.id === id);
  if (!entry) return;
  renderWorksheet(entry.problems, entry.title, entry.meta, entry.answerTitle, entry.groupLabel || currentGroupLabel);
}
function onDeleteSaved() {
  const id = savedList.value;
  if (!id) return;
  setSaved(getSaved().filter((e) => e.id !== id));
  refreshSavedList();
}

function syncPrintAnswerClass() {
  document.body.classList.toggle('include-answers', includeAnswersCb.checked);
}
function syncPreviewAnswerClass() {
  document.body.classList.toggle('show-answers-preview', previewAnswersCb.checked);
}
function syncExamMode() {
  const on = examModeCb.checked;
  document.body.classList.toggle('exam-mode', on);
  difficultyRadios.forEach((r) => { r.disabled = on; });
  difficultyField.classList.toggle('disabled-field', on);
}
function syncCustomCountMode() {
  const on = customCountModeCb.checked;
  topicList.querySelectorAll('.topic-count').forEach((el) => el.classList.toggle('hidden', !on));
  countModeField.classList.toggle('disabled-field', on);
  countInput.disabled = on;
  pagePanel.classList.toggle('disabled-field', on);
  generatePagesBtn.disabled = on;
}
function syncTypeMode() {
  const manual = document.querySelector('input[name="typeMode"]:checked').value === 'manual';
  typeManualField.classList.toggle('hidden', !manual);
  mcPercentInput.disabled = !manual || !typeChoiceCb.checked;
  essayPercentInput.disabled = !manual || !typeEssayCb.checked;
}
function syncFontSize() {
  document.body.classList.remove('font-large', 'font-xlarge');
  if (fontSizeSelect.value === 'large') document.body.classList.add('font-large');
  if (fontSizeSelect.value === 'xlarge') document.body.classList.add('font-xlarge');
}

gradeSelect.addEventListener('change', () => {
  populateTopics(gradeSelect.value);
  applyTheme(findGroup(gradeSelect.value));
});
generateBtn.addEventListener('click', onGenerate);
generatePagesBtn.addEventListener('click', onGeneratePages);
printBtn.addEventListener('click', () => window.print());
saveBtn.addEventListener('click', onSave);
loadSavedBtn.addEventListener('click', onLoadSaved);
deleteSavedBtn.addEventListener('click', onDeleteSaved);
includeAnswersCb.addEventListener('change', syncPrintAnswerClass);
previewAnswersCb.addEventListener('change', syncPreviewAnswerClass);
examModeCb.addEventListener('change', syncExamMode);
customCountModeCb.addEventListener('change', syncCustomCountMode);
fontSizeSelect.addEventListener('change', syncFontSize);
typeModeRadios.forEach((r) => r.addEventListener('change', syncTypeMode));
typeChoiceCb.addEventListener('change', syncTypeMode);
typeEssayCb.addEventListener('change', syncTypeMode);

populateGradeSelect();
gradeSelect.value = 'e1';
populateTopics('e1');
applyTheme(findGroup('e1'));
syncPrintAnswerClass();
syncPreviewAnswerClass();
syncExamMode();
syncFontSize();
syncTypeMode();
refreshSavedList();
