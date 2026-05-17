/**
 * Tests for Dialogue Service — Context Trigger System and Dialogue Manager
 */

import {
  evaluateTrigger,
  getAvailableDialogues,
  getNextDialogue,
  hasAvailableDialogues,
  showDialogue,
  getMetDialogueCount,
  hasMetAllDialogues,
  resetAllDialogueState,
} from './dialogueService';
import { NPC_ID, TRIGGER } from '../data/npcDialogues';

describe('Dialogue Service', () => {
  beforeEach(() => {
    // Reset state before each test
    resetAllDialogueState();
    localStorage.clear();
  });

  // ─── Context Trigger Evaluation ────────────────────────────────────────

  describe('evaluateTrigger', () => {
    it('returns true for FIRST_VISIT on first meeting', () => {
      const trigger = { type: TRIGGER.FIRST_VISIT };
      const context = { currentFloor: 1, completedFloors: [], discoveredLoreFragments: 0, tower1Completed: false };
      expect(evaluateTrigger(trigger, context, NPC_ID.MERCHANT)).toBe(true);
    });

    it('returns false for FIRST_VISIT after meeting', () => {
      resetAllDialogueState();
      const context = { currentFloor: 1, completedFloors: [], discoveredLoreFragments: 0, tower1Completed: false };
      showDialogue(NPC_ID.MERCHANT, 'merchant_d1', context);

      const trigger = { type: TRIGGER.FIRST_VISIT };
      expect(evaluateTrigger(trigger, context, NPC_ID.MERCHANT)).toBe(false);
    });

    it('returns true for FLOOR_COMPLETED when floor is completed', () => {
      const trigger = { type: TRIGGER.FLOOR_COMPLETED, value: 1 };
      const context = { currentFloor: 1, completedFloors: [1], discoveredLoreFragments: 0, tower1Completed: false };
      expect(evaluateTrigger(trigger, context, NPC_ID.MERCHANT)).toBe(true);
    });

    it('returns false for FLOOR_COMPLETED when floor not completed', () => {
      const trigger = { type: TRIGGER.FLOOR_COMPLETED, value: 2 };
      const context = { currentFloor: 1, completedFloors: [1], discoveredLoreFragments: 0, tower1Completed: false };
      expect(evaluateTrigger(trigger, context, NPC_ID.MERCHANT)).toBe(false);
    });

    it('returns true for LORE_FRAGMENTS when count met', () => {
      const trigger = { type: TRIGGER.LORE_FRAGMENTS, value: 3 };
      const context = { currentFloor: 3, completedFloors: [], discoveredLoreFragments: 5, tower1Completed: false };
      expect(evaluateTrigger(trigger, context, NPC_ID.WANDERER)).toBe(true);
    });

    it('returns false for LORE_FRAGMENTS when count not met', () => {
      const trigger = { type: TRIGGER.LORE_FRAGMENTS, value: 5 };
      const context = { currentFloor: 3, completedFloors: [], discoveredLoreFragments: 3, tower1Completed: false };
      expect(evaluateTrigger(trigger, context, NPC_ID.WANDERER)).toBe(false);
    });

    it('returns true for TOWER1_COMPLETED when true', () => {
      const trigger = { type: TRIGGER.TOWER1_COMPLETED };
      const context = { currentFloor: 5, completedFloors: [1, 2, 3, 4, 5], discoveredLoreFragments: 0, tower1Completed: true };
      expect(evaluateTrigger(trigger, context, NPC_ID.MERCHANT)).toBe(true);
    });

    it('returns false for TOWER1_COMPLETED when false', () => {
      const trigger = { type: TRIGGER.TOWER1_COMPLETED };
      const context = { currentFloor: 5, completedFloors: [], discoveredLoreFragments: 0, tower1Completed: false };
      expect(evaluateTrigger(trigger, context, NPC_ID.MERCHANT)).toBe(false);
    });

    it('returns true for ALWAYS trigger', () => {
      const trigger = { type: TRIGGER.ALWAYS };
      const context = { currentFloor: 1, completedFloors: [], discoveredLoreFragments: 0, tower1Completed: false };
      expect(evaluateTrigger(trigger, context, NPC_ID.MERCHANT)).toBe(true);
    });

    it('returns false for unknown trigger type', () => {
      const trigger = { type: 'UNKNOWN_TYPE' };
      const context = { currentFloor: 1, completedFloors: [], discoveredLoreFragments: 0, tower1Completed: false };
      expect(evaluateTrigger(trigger, context, NPC_ID.MERCHANT)).toBe(false);
    });
  });

  // ─── Dialogue Selection ────────────────────────────────────────────────

  describe('getAvailableDialogues', () => {
    it('returns all dialogues for first visit (only FIRST_VISIT available)', () => {
      resetAllDialogueState();
      const context = { currentFloor: 1, completedFloors: [], discoveredLoreFragments: 0, tower1Completed: false };
      const available = getAvailableDialogues(NPC_ID.MERCHANT, context);

      expect(available).toHaveLength(5);
      // Only the first dialogue (FIRST_VISIT) should be available
      expect(available[0].available).toBe(true);
      // Others should not be available (triggers not met)
      expect(available[1].available).toBe(false);
      expect(available[2].available).toBe(false);
      expect(available[3].available).toBe(false);
      expect(available[4].available).toBe(false);
    });

    it('marks dialogues as met after being shown', () => {
      resetAllDialogueState();
      const context = { currentFloor: 1, completedFloors: [], discoveredLoreFragments: 0, tower1Completed: false };

      // Show first dialogue
      showDialogue(NPC_ID.MERCHANT, 'merchant_d1', context);

      const available = getAvailableDialogues(NPC_ID.MERCHANT, context);
      expect(available[0].met).toBe(true);
      expect(available[0].available).toBe(false); // rotation rule blocks it
    });

    it('makes Floor 2 dialogue available after completing Floor 1', () => {
      resetAllDialogueState();
      const context = {
        currentFloor: 1,
        completedFloors: [1],
        discoveredLoreFragments: 0,
        tower1Completed: false,
      };

      const available = getAvailableDialogues(NPC_ID.MERCHANT, context);
      expect(available[1].available).toBe(true); // merchant_d2 requires floor 1 completed
    });

    it('makes Lore fragment dialogue available after enough fragments', () => {
      resetAllDialogueState();
      const context = {
        currentFloor: 3,
        completedFloors: [],
        discoveredLoreFragments: 5,
        tower1Completed: false,
      };

      const available = getAvailableDialogues(NPC_ID.WANDERER, context);
      expect(available[2].available).toBe(true); // wanderer_d3 requires 5+ fragments
    });

    it('makes Tower 1 completed dialogue available after Tower 1', () => {
      resetAllDialogueState();
      const context = {
        currentFloor: 5,
        completedFloors: [1, 2, 3, 4, 5],
        discoveredLoreFragments: 0,
        tower1Completed: true,
      };

      const available = getAvailableDialogues(NPC_ID.MERCHANT, context);
      expect(available[4].available).toBe(true); // merchant_d5 requires Tower 1 completed
    });
  });

  // ─── Dialogue Management ───────────────────────────────────────────────

  describe('showDialogue', () => {
    it('marks dialogue as met', () => {
      resetAllDialogueState();
      const context = { currentFloor: 1, completedFloors: [], discoveredLoreFragments: 0, tower1Completed: false };

      showDialogue(NPC_ID.MERCHANT, 'merchant_d1', context);

      expect(getMetDialogueCount(NPC_ID.MERCHANT)).toBe(1);
    });

    it('updates lastShownDialogue', () => {
      resetAllDialogueState();
      const context = { currentFloor: 1, completedFloors: [], discoveredLoreFragments: 0, tower1Completed: false };

      showDialogue(NPC_ID.MERCHANT, 'merchant_d1', context);

      const state = JSON.parse(localStorage.getItem('rpg_dialogue_state'));
      expect(state.merchant.lastShownDialogue).toBe('merchant_d1');
    });

    it('persists state to localStorage', () => {
      resetAllDialogueState();
      const context = { currentFloor: 1, completedFloors: [], discoveredLoreFragments: 0, tower1Completed: false };

      showDialogue(NPC_ID.MERCHANT, 'merchant_d1', context);

      const stored = localStorage.getItem('rpg_dialogue_state');
      expect(stored).toBeTruthy();
      const parsed = JSON.parse(stored);
      expect(parsed.merchant.met).toContain('merchant_d1');
    });
  });

  describe('getNextDialogue', () => {
    it('returns first unmet dialogue on first visit', () => {
      resetAllDialogueState();
      const context = { currentFloor: 1, completedFloors: [], discoveredLoreFragments: 0, tower1Completed: false };

      const next = getNextDialogue(NPC_ID.MERCHANT, context);
      expect(next.dialogue.id).toBe('merchant_d1');
      expect(next.type).toBe('unmet');
    });

    it('returns next unmet dialogue after showing first', () => {
      resetAllDialogueState();
      const context = { currentFloor: 1, completedFloors: [], discoveredLoreFragments: 0, tower1Completed: false };

      // Show first dialogue (FIRST_VISIT)
      showDialogue(NPC_ID.MERCHANT, 'merchant_d1', context);

      // Now complete floor 1 to unlock second dialogue
      context.completedFloors = [1];

      const next = getNextDialogue(NPC_ID.MERCHANT, context);
      expect(next.dialogue.id).toBe('merchant_d2');
    });

    it('returns null when no dialogues available', () => {
      resetAllDialogueState();
      const context = { currentFloor: 1, completedFloors: [], discoveredLoreFragments: 0, tower1Completed: false };

      // Show first dialogue
      showDialogue(NPC_ID.MERCHANT, 'merchant_d1', context);

      // No other dialogues available (floor 1 not completed, etc.)
      const next = getNextDialogue(NPC_ID.MERCHANT, context);
      expect(next).toBeNull();
    });
  });

  // ─── State Helpers ─────────────────────────────────────────────────────

  describe('getMetDialogueCount', () => {
    it('returns 0 for unmet NPC', () => {
      resetAllDialogueState();
      expect(getMetDialogueCount(NPC_ID.MERCHANT)).toBe(0);
    });

    it('returns correct count after showing dialogues', () => {
      resetAllDialogueState();
      const context = { currentFloor: 1, completedFloors: [1, 3, 5], discoveredLoreFragments: 0, tower1Completed: false };

      showDialogue(NPC_ID.MERCHANT, 'merchant_d1', context);
      showDialogue(NPC_ID.MERCHANT, 'merchant_d2', context);
      showDialogue(NPC_ID.MERCHANT, 'merchant_d3', context);

      expect(getMetDialogueCount(NPC_ID.MERCHANT)).toBe(3);
    });
  });

  describe('hasMetAllDialogues', () => {
    it('returns false when not all met', () => {
      resetAllDialogueState();
      expect(hasMetAllDialogues(NPC_ID.MERCHANT)).toBe(false);
    });

    it('returns true when all met', () => {
      resetAllDialogueState();
      const context = {
        currentFloor: 5,
        completedFloors: [1, 2, 3, 4, 5],
        discoveredLoreFragments: 10,
        tower1Completed: true,
      };

      // Met all merchant dialogues
      showDialogue(NPC_ID.MERCHANT, 'merchant_d1', context);
      showDialogue(NPC_ID.MERCHANT, 'merchant_d2', context);
      showDialogue(NPC_ID.MERCHANT, 'merchant_d3', context);
      showDialogue(NPC_ID.MERCHANT, 'merchant_d4', context);
      showDialogue(NPC_ID.MERCHANT, 'merchant_d5', context);

      expect(hasMetAllDialogues(NPC_ID.MERCHANT)).toBe(true);
    });
  });

  describe('hasAvailableDialogues', () => {
    it('returns true when dialogues are available', () => {
      resetAllDialogueState();
      const context = { currentFloor: 1, completedFloors: [], discoveredLoreFragments: 0, tower1Completed: false };
      expect(hasAvailableDialogues(NPC_ID.MERCHANT, context)).toBe(true);
    });

    it('returns false when no dialogues available', () => {
      resetAllDialogueState();
      const context = { currentFloor: 1, completedFloors: [], discoveredLoreFragments: 0, tower1Completed: false };

      showDialogue(NPC_ID.MERCHANT, 'merchant_d1', context);
      // After showing first dialogue, no others are available yet
      expect(hasAvailableDialogues(NPC_ID.MERCHANT, context)).toBe(false);
    });
  });

  describe('resetAllDialogueState', () => {
    it('clears all NPC state', () => {
      resetAllDialogueState();
      const context = { currentFloor: 1, completedFloors: [], discoveredLoreFragments: 0, tower1Completed: false };

      showDialogue(NPC_ID.MERCHANT, 'merchant_d1', context);
      expect(getMetDialogueCount(NPC_ID.MERCHANT)).toBe(1);

      resetAllDialogueState();
      expect(getMetDialogueCount(NPC_ID.MERCHANT)).toBe(0);
    });
  });
});
