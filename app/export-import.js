// Export and import of checklist progress: a JSON download the player can
// keep, and an import that validates the file before it touches the state.
import { earnedIds, saveState } from './tracker.js';

export const EXPORT_APP = 'gta6-trophy-guide';
export const EXPORT_VERSION = 1;

export function exportProgress(state) {
  const payload = {
    app: EXPORT_APP,
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    earned: earnedIds(state),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'gta6-trophy-progress.json';
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return payload.earned.length;
}

export function parseProgressFile(text) {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('That file is not valid JSON.');
  }
  const earned = parsed?.earned ?? parsed;
  if (!Array.isArray(earned)) {
    throw new Error('That file has no earned-trophy list in it.');
  }
  const ids = [];
  for (const value of earned) {
    const id = Number(value);
    if (!Number.isInteger(id) || id < 1 || id > 55) {
      throw new Error('That file lists a trophy number that does not exist (expected 1–55).');
    }
    ids.push(id);
  }
  return [...new Set(ids)].sort((a, b) => a - b);
}

export async function importProgressFile(file, state, trophies) {
  const text = await file.text();
  const ids = parseProgressFile(text);
  const known = new Set(trophies.map((t) => t.id));
  const unknown = ids.filter((id) => !known.has(id));
  if (unknown.length) {
    throw new Error(`That file lists unknown trophies: ${unknown.join(', ')}.`);
  }
  state.earned = {};
  for (const id of ids) state.earned[id] = true;
  saveState(state);
  return ids.length;
}
