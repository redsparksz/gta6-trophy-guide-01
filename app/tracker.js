// Tracker state: what the player has earned, kept in localStorage under a
// versioned key so a later guide version never inherits a stale shape.
export const STORAGE_KEY = 'gta6-trophy-guide-v1';

export function defaultState() {
  return { v: 1, earned: {}, spoiler: true };
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return defaultState();
    const state = defaultState();
    if (parsed.earned && typeof parsed.earned === 'object') {
      for (const [id, value] of Object.entries(parsed.earned)) {
        if (value) state.earned[Number(id)] = true;
      }
    }
    if (typeof parsed.spoiler === 'boolean') state.spoiler = parsed.spoiler;
    return state;
  } catch {
    return defaultState();
  }
}

export function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function isEarned(state, trophyId) {
  return Boolean(state.earned[trophyId]);
}

export function earnedCount(state) {
  return Object.keys(state.earned).length;
}

export function toggleEarned(state, trophyId) {
  if (state.earned[trophyId]) delete state.earned[trophyId];
  else state.earned[trophyId] = true;
  saveState(state);
}

export function earnedIds(state) {
  return Object.keys(state.earned).map(Number).sort((a, b) => a - b);
}

export function resetState() {
  const state = defaultState();
  saveState(state);
  return state;
}
