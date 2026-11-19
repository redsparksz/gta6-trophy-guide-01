// Spoiler masking: with spoilers on, a story trophy the player has not
// earned yet shows a placeholder name and description instead of the real
// ones. Hidden non-story trophies (side quests, places) are not plot
// spoilers, so they always show normally. Earning a trophy reveals it.
import { isEarned } from './tracker.js';

export const SPOILER_NAME = 'Hidden Story Trophy';
export const SPOILER_DESC = 'Complete a story mission to reveal this trophy.';

export function isSpoilerMasked(trophy, state) {
  return Boolean(state.spoiler && trophy.story && !isEarned(state, trophy.id));
}

export function displayName(trophy, state) {
  return isSpoilerMasked(trophy, state) ? SPOILER_NAME : trophy.name;
}

export function displayDescription(trophy, state) {
  return isSpoilerMasked(trophy, state) ? SPOILER_DESC : trophy.description;
}

export function displayGuide(trophy, state) {
  if (isSpoilerMasked(trophy, state)) {
    return 'This trophy is a story spoiler. Tick it off in the checklist once you have earned it in the game and its guide will appear here.';
  }
  return trophy.guide;
}
