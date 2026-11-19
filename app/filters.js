// Filters: kind chips, grade, earned status and free-text search over the
// trophy list. The Online kind is real and always empty — the game has no
// online trophies, so it shows the empty state instead of a list.
import { isEarned } from './tracker.js';

export const KINDS = ['all', 'story', 'missable', 'collectibles', 'activities', 'online'];

export function countByKind(trophies) {
  const counts = { all: trophies.length, online: 0 };
  for (const kind of KINDS) counts[kind] = counts[kind] ?? 0;
  for (const trophy of trophies) {
    if (trophy.kind === 'missable') counts.missable += 1;
    else if (trophy.kind === 'story') counts.story += 1;
    else if (trophy.kind === 'collectibles') counts.collectibles += 1;
    else if (trophy.kind === 'activities') counts.activities += 1;
  }
  return counts;
}

export function applyFilters(trophies, state, criteria) {
  const query = (criteria.search ?? '').trim().toLowerCase();
  return trophies.filter((trophy) => {
    if (criteria.kind === 'online') return false;
    if (criteria.kind && criteria.kind !== 'all' && trophy.kind !== criteria.kind) return false;
    if (criteria.grade && criteria.grade !== 'all' && trophy.grade !== criteria.grade) return false;
    if (criteria.status === 'earned' && !isEarned(state, trophy.id)) return false;
    if (criteria.status === 'notyet' && isEarned(state, trophy.id)) return false;
    if (query) {
      const haystack = `${trophy.name} ${trophy.description} ${trophy.guide} ${(trophy.tags ?? []).join(' ')}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  });
}

export function gradeBreakdown(trophies, state) {
  const total = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  const earned = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  for (const trophy of trophies) {
    total[trophy.grade] += 1;
    if (isEarned(state, trophy.id)) earned[trophy.grade] += 1;
  }
  return { total, earned };
}
