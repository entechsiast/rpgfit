/**
 * Dialogue Service — Context Trigger System and Dialogue Manager
 *
 * Handles:
 *   - Context trigger evaluation (floor progression, lore fragments, etc.)
 *   - Dialogue selection based on player state
 *   - Dialogue rotation (no reuse until 5 others shown)
 *   - localStorage persistence for NPC state
 *
 * Player State Requirements (from CharacterContext):
 *   - currentFloor: number — current floor the player is on
 *   - completedFloors: number[] — floors the player has completed
 *   - discoveredLoreFragments: number — count of lore fragments discovered
 *   - tower1Completed: boolean — whether Tower 1 is complete
 *   - npcState: { [npcId]: { met: string[], lastShownDialogue: string|undefined } }
 */

import { NPC_ID, TRIGGER, getNpcById, getMetDialogueSet, NPC_APPEARANCES } from '../data/npcDialogues';

// ─── Storage Keys ──────────────────────────────────────────────────────────

const DIALOGUE_STATE_KEY = 'rpg_dialogue_state';

// ─── Default State ─────────────────────────────────────────────────────────

const DEFAULT_DIALOGUE_STATE = {
  [NPC_ID.MERCHANT]: { met: [], lastShownDialogue: null, lastShownTime: null },
  [NPC_ID.GUIDE]: { met: [], lastShownDialogue: null, lastShownTime: null },
  [NPC_ID.WANDERER]: { met: [], lastShownDialogue: null, lastShownTime: null },
};

// ─── localStorage Persistence ──────────────────────────────────────────────

/**
 * Load NPC dialogue state from localStorage.
 * @returns {{ [npcId: string]: { met: string[], lastShownDialogue: string|null, lastShownTime: number|null } }}
 */
export function loadDialogueState() {
  try {
    const raw = localStorage.getItem(DIALOGUE_STATE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Merge with defaults to ensure all NPC keys exist
      const merged = { ...DEFAULT_DIALOGUE_STATE };
      for (const npcId of Object.keys(DEFAULT_DIALOGUE_STATE)) {
        if (parsed[npcId]) {
          merged[npcId] = { ...DEFAULT_DIALOGUE_STATE[npcId], ...parsed[npcId] };
        }
      }
      return merged;
    }
  } catch (e) {
    // Corrupted state — reset
    console.warn('Failed to load dialogue state, resetting:', e);
  }
  return { ...DEFAULT_DIALOGUE_STATE };
}

/**
 * Save NPC dialogue state to localStorage.
 * @param {{ [npcId: string]: any }} state
 */
function saveDialogueState(state) {
  try {
    localStorage.setItem(DIALOGUE_STATE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Failed to save dialogue state:', e);
  }
}

// ─── Context Trigger Evaluation ────────────────────────────────────────────

/**
 * Evaluates whether a dialogue's trigger condition is met based on player state.
 *
 * @param {Object} trigger - The trigger definition from dialogue data
 * @param {Object} playerContext - Current player context
 * @param {number} playerContext.currentFloor - Current floor number
 * @param {number[]} playerContext.completedFloors - Completed floor numbers
 * @param {number} playerContext.discoveredLoreFragments - Count of discovered lore fragments
 * @param {boolean} playerContext.tower1Completed - Whether Tower 1 is complete
 * @param {string} npcId - The NPC this dialogue belongs to
 * @returns {boolean}
 */
export function evaluateTrigger(trigger, playerContext, npcId) {
  const { type, value } = trigger;

  switch (type) {
    case TRIGGER.FIRST_VISIT:
      return isFirstVisit(npcId, playerContext);

    case TRIGGER.FLOOR_COMPLETED:
      return completedFloor(value, playerContext);

    case TRIGGER.LORE_FRAGMENTS:
      return enoughLoreFragments(value, playerContext);

    case TRIGGER.TOWER1_COMPLETED:
      return isTower1Complete(playerContext);

    case TRIGGER.ALWAYS:
      return true;

    default:
      return false;
  }
}

/**
 * Check if this is the first time the player has met this NPC.
 * @param {string} npcId
 * @param {Object} playerContext
 * @returns {boolean}
 */
function isFirstVisit(npcId, playerContext) {
  const state = loadDialogueState();
  const npcState = state[npcId];
  return !npcState || !npcState.met || npcState.met.length === 0;
}

/**
 * Check if a specific floor has been completed.
 * @param {number} floorNumber
 * @param {Object} playerContext
 * @returns {boolean}
 */
function completedFloor(floorNumber, playerContext) {
  const completed = playerContext.completedFloors || [];
  return completed.includes(floorNumber);
}

/**
 * Check if player has discovered enough lore fragments.
 * @param {number} minCount
 * @param {Object} playerContext
 * @returns {boolean}
 */
function enoughLoreFragments(minCount, playerContext) {
  const count = playerContext.discoveredLoreFragments || 0;
  return count >= minCount;
}

/**
 * Check if Tower 1 is complete.
 * @param {Object} playerContext
 * @returns {boolean}
 */
function isTower1Complete(playerContext) {
  return playerContext.tower1Completed === true;
}

// ─── Dialogue Selection ────────────────────────────────────────────────────

/**
 * Get all available dialogues for a given NPC, filtered by triggers and rotation rules.
 *
 * Dialogue rotation rule: A dialogue is unavailable if it was the last one shown
 * and fewer than 5 other dialogues have been shown since then.
 *
 * @param {string} npcId - The NPC ID
 * @param {Object} playerContext - Current player context
 * @returns {Object[]} Array of { dialogue, available } objects
 */
export function getAvailableDialogues(npcId, playerContext) {
  const npc = getNpcById(npcId);
  if (!npc) return [];

  const state = loadDialogueState();
  const npcState = state[npcId];
  const metSet = getMetDialogueSet(npcState?.met || []);
  const lastShown = npcState?.lastShownDialogue;

  // Count dialogues shown since lastShown
  const shownSinceLast = countDialoguesShownSince(npcId, lastShown, metSet);

  return npc.dialogues.map((dialogue) => {
    // Check trigger
    const triggerMet = evaluateTrigger(dialogue.trigger, playerContext, npcId);

    // Check rotation rule
    let rotationOk = true;
    if (lastShown && dialogue.id === lastShown) {
      // This dialogue was last shown — check if 5+ others have been shown since
      rotationOk = shownSinceLast >= 5;
    }

    return {
      dialogue,
      available: triggerMet && rotationOk,
      met: metSet.has(dialogue.id),
    };
  });
}

/**
 * Count how many distinct dialogues have been shown since a given dialogue.
 * @param {string} npcId
 * @param {string|null} sinceDialogueId
 * @param {Set<string>} metSet
 * @returns {number}
 */
function countDialoguesShownSince(npcId, sinceDialogueId, metSet) {
  if (!sinceDialogueId) {
    // No last shown dialogue — all met dialogues count
    return metSet.size;
  }

  const state = loadDialogueState();
  const npcState = state[npcId];
  if (!npcState || !npcState.lastShownTime) return 0;

  // Count dialogues met after the lastShownDialogue was shown
  // We use met array order — dialogues met after the lastShown dialogue
  const met = npcState.met || [];
  const lastShownIndex = met.indexOf(sinceDialogueId);
  if (lastShownIndex < 0) return met.length; // lastShown not in met, count all

  return met.length - lastShownIndex - 1;
}

// ─── Dialogue Manager ──────────────────────────────────────────────────────

/**
 * Mark a dialogue as shown and update state.
 *
 * @param {string} npcId - The NPC ID
 * @param {string} dialogueId - The dialogue ID that was shown
 * @param {Object} playerContext - Current player context (for trigger evaluation)
 * @returns {{ success: boolean, availableDialogues: Object[] }}
 */
export function showDialogue(npcId, dialogueId, playerContext) {
  const state = loadDialogueState();

  if (!state[npcId]) {
    state[npcId] = { ...DEFAULT_DIALOGUE_STATE[npcId] };
  }

  const npcState = state[npcId];

  // Mark as met if not already
  if (!npcState.met.includes(dialogueId)) {
    npcState.met.push(dialogueId);
  }

  // Update last shown dialogue and timestamp
  npcState.lastShownDialogue = dialogueId;
  npcState.lastShownTime = Date.now();

  saveDialogueState(state);

  // Return updated available dialogues
  const availableDialogues = getAvailableDialogues(npcId, playerContext);

  return { success: true, availableDialogues };
}

/**
 * Get the next dialogue to show for an NPC (first available one).
 * Prefers unmet dialogues, then falls back to met ones.
 *
 * @param {string} npcId
 * @param {Object} playerContext
 * @returns {Object|null} { dialogue, type: 'unmet'|'met'|null }
 */
export function getNextDialogue(npcId, playerContext) {
  const available = getAvailableDialogues(npcId, playerContext);
  const unmet = available.find((d) => d.available && !d.met);
  if (unmet) return { dialogue: unmet.dialogue, type: 'unmet' };

  const met = available.find((d) => d.available && d.met);
  if (met) return { dialogue: met.dialogue, type: 'met' };

  return null;
}

/**
 * Check if a specific NPC has any available dialogues.
 *
 * @param {string} npcId
 * @param {Object} playerContext
 * @returns {boolean}
 */
export function hasAvailableDialogues(npcId, playerContext) {
  const available = getAvailableDialogues(npcId, playerContext);
  return available.some((d) => d.available);
}

/**
 * Check if a specific dialogue is available for an NPC.
 *
 * @param {string} npcId
 * @param {string} dialogueId
 * @param {Object} playerContext
 * @returns {boolean}
 */
export function isDialogueAvailable(npcId, dialogueId, playerContext) {
  const available = getAvailableDialogues(npcId, playerContext);
  return available.find((d) => d.dialogue.id === dialogueId)?.available || false;
}

/**
 * Get the count of met dialogues for an NPC.
 *
 * @param {string} npcId
 * @returns {number}
 */
export function getMetDialogueCount(npcId) {
  const state = loadDialogueState();
  const npcState = state[npcId];
  return (npcState?.met || []).length;
}

/**
 * Check if all dialogues for an NPC have been met.
 *
 * @param {string} npcId
 * @returns {boolean}
 */
export function hasMetAllDialogues(npcId) {
  const npc = getNpcById(npcId);
  if (!npc) return false;
  const metCount = getMetDialogueCount(npcId);
  return metCount >= npc.dialogues.length;
}

/**
 * Reset dialogue state for an NPC (for testing/debugging).
 * @param {string} npcId
 */
export function resetNpcState(npcId) {
  const state = loadDialogueState();
  state[npcId] = { ...DEFAULT_DIALOGUE_STATE[npcId] };
  saveDialogueState(state);
}

/**
 * Reset all NPC dialogue state (for testing/debugging).
 */
export function resetAllDialogueState() {
  saveDialogueState({ ...DEFAULT_DIALOGUE_STATE });
}

// ─── NPC Appearance Helpers ────────────────────────────────────────────────

export { NPC_APPEARANCES as NPCVisuals };

const dialogueService = {
  // Trigger evaluation
  evaluateTrigger,
  isFirstVisit,
  completedFloor,
  enoughLoreFragments,
  isTower1Complete,

  // Dialogue selection
  getAvailableDialogues,
  getNextDialogue,
  hasAvailableDialogues,
  isDialogueAvailable,

  // Dialogue manager
  showDialogue,

  // State helpers
  getMetDialogueCount,
  hasMetAllDialogues,
  loadDialogueState,
  saveDialogueState,
  resetNpcState,
  resetAllDialogueState,

  // Visuals
  NPCVisuals: NPC_APPEARANCES,
};

export default dialogueService;
