/**
 * useDialogue — React Hook for NPC Dialogue Management
 *
 * Provides:
 *   - Current available dialogues for each NPC
 *   - Functions to show dialogues and cycle through them
 *   - NPC presence detection (which NPCs appear on current floor)
 *   - Dialogue state (met count, all met, etc.)
 *
 * Usage:
 *   const {
 *     availableDialogues,
 *     showNextDialogue,
 *     showDialogue,
 *     npcPresence,
 *     metCount,
 *     allMet,
 *     hasDialogues,
 *   } = useDialogue(currentFloor, completedFloors, discoveredLoreFragments, tower1Completed);
 *
 *   // In component:
 *   {npcPresence.merchant && (
 *     <NpcAvatar npcId="merchant" onClick={() => showNextDialogue('merchant')} />
 *   )}
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import {
  NPC_ID,
  getNpcsForFloor,
  getNpcById,
} from '../data/npcDialogues';
import {
  getAvailableDialogues,
  getNextDialogue,
  hasAvailableDialogues,
  showDialogue,
  getMetDialogueCount,
  hasMetAllDialogues,
  loadDialogueState,
} from '../services/dialogueService';

// ─── Hook Return Type ──────────────────────────────────────────────────────

/**
 * @typedef {Object} DialogueHookReturn
 * @property {Object<string, Object[]>} availableDialogues - Map of npcId -> available dialogue objects
 * @property {Function} showNextDialogue - Show the next available dialogue for an NPC
 * @property {Function} showDialogue - Show a specific dialogue for an NPC
 * @property {Object<string, boolean>} npcPresence - Which NPCs are present on current floor
 * @property {Object<string, number>} metCount - Count of met dialogues per NPC
 * @property {Object<string, boolean>} allMet - Whether all dialogues are met per NPC
 * @property {Object<string, boolean>} hasDialogues - Whether NPC has any available dialogues
 * @property {Function} refreshState - Force reload dialogue state from localStorage
 */

/**
 * Hook for managing NPC dialogues.
 *
 * @param {number} currentFloor - Current floor number (1-5)
 * @param {number[]} completedFloors - Array of completed floor numbers
 * @param {number} [discoveredLoreFragments] - Count of discovered lore fragments
 * @param {boolean} [tower1Completed] - Whether Tower 1 is complete
 * @returns {DialogueHookReturn}
 */
export function useDialogue(
  currentFloor,
  completedFloors = [],
  discoveredLoreFragments = 0,
  tower1Completed = false
) {
  // Local state for reactive updates
  const [localAvailableDialogues, setLocalAvailableDialogues] = useState({});

  // Build player context from hook parameters
  const playerContext = useMemo(
    () => ({
      currentFloor,
      completedFloors,
      discoveredLoreFragments,
      tower1Completed: tower1Completed || false,
    }),
    [currentFloor, completedFloors, discoveredLoreFragments, tower1Completed]
  );

  // NPC presence: which NPCs appear on the current floor
  const npcsOnFloor = useMemo(
    () => getNpcsForFloor(currentFloor),
    [currentFloor]
  );

  const npcPresence = useMemo(() => {
    const presence = {
      [NPC_ID.MERCHANT]: false,
      [NPC_ID.GUIDE]: false,
      [NPC_ID.WANDERER]: false,
    };
    npcsOnFloor.forEach((npc) => {
      presence[npc.id] = true;
    });
    return presence;
  }, [npcsOnFloor]);

  // Calculate available dialogues for present NPCs
  const availableDialogues = useMemo(() => {
    const dialogues = {};
    npcsOnFloor.forEach((npc) => {
      dialogues[npc.id] = getAvailableDialogues(npc.id, playerContext);
    });
    return dialogues;
  }, [npcsOnFloor, playerContext]);

  // Merge with local state for reactivity
  useEffect(() => {
    setLocalAvailableDialogues(availableDialogues);
  }, [availableDialogues]);

  // Met counts
  const metCount = useMemo(() => {
    const counts = {};
    npcsOnFloor.forEach((npc) => {
      counts[npc.id] = getMetDialogueCount(npc.id);
    });
    return counts;
  }, [npcsOnFloor]);

  // All met flags
  const allMet = useMemo(() => {
    const flags = {};
    npcsOnFloor.forEach((npc) => {
      flags[npc.id] = hasMetAllDialogues(npc.id);
    });
    return flags;
  }, [npcsOnFloor]);

  // Has dialogues flags
  const hasDialogues = useMemo(() => {
    const flags = {};
    npcsOnFloor.forEach((npc) => {
      flags[npc.id] = hasAvailableDialogues(npc.id, playerContext);
    });
    return flags;
  }, [npcsOnFloor, playerContext]);

  // Show next available dialogue for an NPC
  const showNextDialogue = useCallback(
    (npcId) => {
      const next = getNextDialogue(npcId, playerContext);
      if (next) {
        return showDialogue(npcId, next.dialogue.id, playerContext);
      }
      return { success: false, availableDialogues: {} };
    },
    [playerContext]
  );

  // Show a specific dialogue for an NPC
  const showDialogueById = useCallback(
    (npcId, dialogueId) => {
      return showDialogue(npcId, dialogueId, playerContext);
    },
    [playerContext]
  );

  // Force reload state from localStorage
  const refreshState = useCallback(() => {
    loadDialogueState();
    // Trigger re-render by updating a ref-like pattern
    setLocalAvailableDialogues((prev) => ({ ...prev }));
  }, []);

  return {
    availableDialogues: localAvailableDialogues,
    showNextDialogue,
    showDialogue: showDialogueById,
    npcPresence,
    metCount,
    allMet,
    hasDialogues,
    refreshState,
    npcsOnFloor,
  };
}

export default useDialogue;
