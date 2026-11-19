// Leonida Trophy Guide — bootstrap: loads the trophy data, renders the
// checklist and the guide panel, and wires the filters, spoiler setting,
// progress ring, tabs, export and import. No network: it fetches only its
// own data/trophies.json.
import { loadState, saveState, isEarned, toggleEarned, earnedCount, resetState } from './tracker.js';
import { displayName, displayDescription, displayGuide, isSpoilerMasked } from './spoiler.js';
import { countByKind, applyFilters, gradeBreakdown } from './filters.js';
import { renderRoadmap } from './roadmap.js';
import { exportProgress, importProgressFile } from './export-import.js';

const GRADE_COLORS = { platinum: '#e5e4e2', gold: '#d4af37', silver: '#c0c0c0', bronze: '#cd7f32' };
const GRADE_LABELS = { platinum: 'Platinum', gold: 'Gold', silver: 'Silver', bronze: 'Bronze' };

const state = loadState();
let trophies = [];
let selectedId = 28;
const criteria = { kind: 'all', grade: 'all', status: 'all', search: '' };

const listEl = document.getElementById('trophyList');
const detailEl = document.getElementById('detailPanel');
const listMetaEl = document.getElementById('listMeta');
const emptyStateEl = document.getElementById('emptyState');
const earnedCountEl = document.getElementById('earnedCount');
const gradeCountsEl = document.getElementById('gradeCounts');
const platinumNoteEl = document.getElementById('platinumNote');
const ringEl = document.getElementById('progressRing');

function trophyIcon(grade) {
  const color = GRADE_COLORS[grade] ?? '#c0c0c0';
  return `<svg viewBox="0 0 48 48" role="img" aria-label="${GRADE_LABELS[grade] ?? grade} trophy">
    <path fill="${color}" d="M14 6h20v6a10 10 0 0 1-20 0V6zm2 2v4a8 8 0 0 0 16 0V8H16z"/>
    <path fill="${color}" d="M14 8H6a8 8 0 0 0 8 10M34 8h8a8 8 0 0 1-8 10" fill="none" stroke="${color}" stroke-width="2.5"/>
    <rect x="22" y="24" width="4" height="8" fill="${color}"/>
    <rect x="15" y="32" width="18" height="4" rx="2" fill="${color}"/>
    <rect x="18" y="38" width="12" height="3" rx="1.5" fill="${color}"/>
  </svg>`;
}

function escapeHtml(text) {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function gradeTag(trophy) {
  return `<span class="tag grade-${trophy.grade}">${GRADE_LABELS[trophy.grade]}</span>`;
}

function flagTags(trophy) {
  const tags = [gradeTag(trophy)];
  if (trophy.count) tags.push(`<span class="tag count">${escapeHtml(trophy.count)}</span>`);
  if (trophy.missable) tags.push('<span class="tag missable">⚠ Potentially missable</span>');
  if (trophy.status === 'unconfirmed') tags.push('<span class="tag unconfirmed">Method not yet confirmed</span>');
  if (trophy.hidden && !trophy.story) tags.push('<span class="tag hidden-flag">Hidden on PlayStation</span>');
  if (trophy.story) tags.push('<span class="tag hidden-flag">Story — spoiler</span>');
  if (trophy.chapter) tags.push(`<span class="tag">Chapter ${trophy.chapter}</span>`);
  return tags.join('');
}

function renderProgress() {
  const earned = earnedCount(state);
  const total = trophies.length || 55;
  const pct = Math.round((earned / total) * 100);
  earnedCountEl.textContent = String(earned);
  ringEl.style.setProperty('--pct', String(pct));
  ringEl.innerHTML = `<span>${pct}%</span>`;
  ringEl.setAttribute('aria-label', `${earned} of ${total} trophies earned`);
  const { total: totals, earned: earnedByGrade } = gradeBreakdown(trophies, state);
  gradeCountsEl.textContent =
    `Platinum ${earnedByGrade.platinum}/${totals.platinum} · Gold ${earnedByGrade.gold}/${totals.gold} · Silver ${earnedByGrade.silver}/${totals.silver} · Bronze ${earnedByGrade.bronze}/${totals.bronze}`;
  const platinum = trophies.find((t) => t.grade === 'platinum');
  if (platinum && isEarned(state, platinum.id)) {
    platinumNoteEl.textContent = 'Platinum earned — Leonida Legend!';
    platinumNoteEl.classList.add('earned');
  } else {
    platinumNoteEl.textContent = 'Platinum: Vice Got a Price! — not yet';
    platinumNoteEl.classList.remove('earned');
  }
}

function renderList() {
  const filtered = applyFilters(trophies, state, criteria);
  const isOnline = criteria.kind === 'online';
  emptyStateEl.hidden = !isOnline;
  listEl.hidden = isOnline;
  listMetaEl.textContent = isOnline
    ? 'Online trophies: 0 of 55 — this game has none.'
    : `Showing ${filtered.length} of ${trophies.length} trophies — ${earnedCount(state)} earned`;
  listEl.replaceChildren();
  for (const trophy of filtered) {
    const li = document.createElement('li');
    li.className = 'trophy-card' + (trophy.id === selectedId ? ' is-selected' : '') + (isEarned(state, trophy.id) ? ' is-earned' : '');
    li.tabIndex = 0;
    li.setAttribute('role', 'button');
    li.setAttribute('aria-label', `${displayName(trophy, state)}, ${GRADE_LABELS[trophy.grade]}`);
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.className = 'trophy-check';
    box.checked = isEarned(state, trophy.id);
    box.setAttribute('aria-label', `Mark ${displayName(trophy, state)} as earned`);
    box.addEventListener('change', (event) => {
      event.stopPropagation();
      toggleEarned(state, trophy.id);
      selectedId = trophy.id;
      renderAll();
    });
    box.addEventListener('click', (event) => event.stopPropagation());
    const icon = document.createElement('span');
    icon.className = 'trophy-icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.innerHTML = trophyIcon(trophy.grade);
    const body = document.createElement('div');
    body.innerHTML = `
      <p class="trophy-name">${escapeHtml(displayName(trophy, state))}</p>
      <p class="trophy-desc">${escapeHtml(displayDescription(trophy, state))}</p>
      <div class="trophy-meta">${flagTags(trophy)}</div>`;
    li.addEventListener('click', () => {
      selectedId = trophy.id;
      renderAll();
    });
    li.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        selectedId = trophy.id;
        renderAll();
      }
    });
    li.append(box, icon, body);
    listEl.append(li);
  }
  if (!isOnline && filtered.length === 0) {
    listMetaEl.textContent = 'No trophies match these filters — try clearing the search or a filter.';
  }
}

function renderDetail() {
  const trophy = trophies.find((t) => t.id === selectedId) ?? trophies[0];
  if (!trophy) {
    detailEl.innerHTML = '<p class="detail-empty">Pick a trophy from the list to see its guide.</p>';
    return;
  }
  const masked = isSpoilerMasked(trophy, state);
  const kindLabel = trophy.kind === 'missable' ? 'Missable · Collectible' : trophy.kind[0].toUpperCase() + trophy.kind.slice(1);
  const facts = [];
  if (trophy.chapter) facts.push(`<li><strong>Chapter:</strong> ${trophy.chapter} of 5</li>`);
  if (trophy.count) facts.push(`<li><strong>Count:</strong> ${escapeHtml(trophy.count)}</li>`);
  facts.push(`<li><strong>Hidden on PlayStation:</strong> ${trophy.hidden ? 'yes' : 'no'}</li>`);
  const warning = trophy.missable
    ? `<div class="detail-warning"><strong>⚠ Potentially missable.</strong> Do the Chapter 1 meditation at Jason's house before Chapter 1 ends — see the guide below.</div>`
    : '';
  const unconfirmed = trophy.status === 'unconfirmed'
    ? `<div class="detail-note"><strong>Method not yet confirmed.</strong> No verified unlock method exists yet (19 Nov 2026). This guide does not guess — it will be updated once the community confirms it.</div>`
    : '';
  const sources = masked
    ? ''
    : `<div class="detail-sources"><h3>Sources</h3><ul>${trophy.sources.map((s) => `<li><a href="${escapeHtml(s.url)}" target="_blank" rel="noopener">${escapeHtml(s.name)}</a></li>`).join('')}</ul></div>`;
  detailEl.innerHTML = `
    <p class="detail-eyebrow">${escapeHtml(kindLabel)} · ${GRADE_LABELS[trophy.grade]}</p>
    <h2>${escapeHtml(displayName(trophy, state))}</h2>
    <p class="detail-desc">${escapeHtml(displayDescription(trophy, state))}</p>
    <div class="trophy-meta">${flagTags(trophy)}</div>
    ${unconfirmed}
    <div class="detail-guide"><p>${escapeHtml(displayGuide(trophy, state))}</p></div>
    ${warning}
    <ul class="detail-facts">${facts.join('')}</ul>
    ${sources}`;
}

function renderChips() {
  const counts = countByKind(trophies);
  for (const chip of document.querySelectorAll('#kindFilters .chip')) {
    chip.classList.toggle('is-active', chip.dataset.kind === criteria.kind);
    const countEl = chip.querySelector('.chip-count');
    if (countEl) countEl.textContent = counts[chip.dataset.kind] ?? '';
  }
}

function renderAll() {
  renderProgress();
  renderChips();
  renderList();
  renderDetail();
}

function applyDeepLinks() {
  const params = new URLSearchParams(location.search);
  if (params.get('view') === 'roadmap') switchView('roadmap');
  const kind = params.get('kind');
  if (kind && ['all', 'story', 'missable', 'collectibles', 'activities', 'online'].includes(kind)) criteria.kind = kind;
  const grade = params.get('grade');
  if (grade && ['all', 'platinum', 'gold', 'silver', 'bronze'].includes(grade)) criteria.grade = grade;
  const status = params.get('status');
  if (status && ['all', 'earned', 'notyet'].includes(status)) criteria.status = status;
  if (params.get('search')) criteria.search = params.get('search');
  const select = Number(params.get('select'));
  if (Number.isInteger(select) && select >= 1 && select <= 55) selectedId = select;
  document.getElementById('gradeFilter').value = criteria.grade;
  document.getElementById('statusFilter').value = criteria.status;
  document.getElementById('searchBox').value = criteria.search;
}

function switchView(view) {
  const checklist = view === 'checklist';
  document.getElementById('viewChecklist').hidden = !checklist;
  document.getElementById('viewRoadmap').hidden = checklist;
  document.getElementById('tabChecklist').classList.toggle('is-active', checklist);
  document.getElementById('tabRoadmap').classList.toggle('is-active', !checklist);
}

async function boot() {
  const response = await fetch('data/trophies.json');
  const data = await response.json();
  trophies = data.trophies;
  applyDeepLinks();
  renderRoadmap(document.getElementById('roadmapContent'), trophies);
  document.getElementById('spoilerToggle').checked = state.spoiler;

  document.getElementById('tabChecklist').addEventListener('click', () => switchView('checklist'));
  document.getElementById('tabRoadmap').addEventListener('click', () => switchView('roadmap'));
  document.getElementById('kindFilters').addEventListener('click', (event) => {
    const chip = event.target.closest('.chip');
    if (!chip) return;
    criteria.kind = chip.dataset.kind;
    renderAll();
  });
  document.getElementById('gradeFilter').addEventListener('change', (event) => {
    criteria.grade = event.target.value;
    renderAll();
  });
  document.getElementById('statusFilter').addEventListener('change', (event) => {
    criteria.status = event.target.value;
    renderAll();
  });
  document.getElementById('searchBox').addEventListener('input', (event) => {
    criteria.search = event.target.value;
    renderAll();
  });
  document.getElementById('spoilerToggle').addEventListener('change', (event) => {
    state.spoiler = event.target.checked;
    saveState(state);
    renderAll();
  });
  document.getElementById('exportBtn').addEventListener('click', () => {
    const count = exportProgress(state);
    const message = document.getElementById('importMessage');
    message.classList.remove('error');
    message.textContent = `Exported ${count} earned ${count === 1 ? 'trophy' : 'trophies'} to gta6-trophy-progress.json.`;
  });
  document.getElementById('importFile').addEventListener('change', async (event) => {
    const message = document.getElementById('importMessage');
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const count = await importProgressFile(file, state, trophies);
      message.classList.remove('error');
      message.textContent = `Imported ${count} earned ${count === 1 ? 'trophy' : 'trophies'} from ${file.name}.`;
      renderAll();
    } catch (error) {
      message.classList.add('error');
      message.textContent = error.message;
    }
    event.target.value = '';
  });
  document.getElementById('resetBtn').addEventListener('click', () => {
    if (!window.confirm('Reset the checklist? All earned marks will be cleared.')) return;
    resetState();
    Object.assign(state, loadState());
    renderAll();
  });
  renderAll();
}

boot();
