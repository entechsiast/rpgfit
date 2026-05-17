/**
 * Contextual NPC Messages — Message pools for gameplay triggers
 *
 * Each trigger type has a pool of 2-3 messages. The system rotates through
 * messages, ensuring no message repeats within 30 seconds.
 *
 * Trigger types:
 *   - FLOOR_ENTRY: Shown when the player enters a new floor
 *   - COMBAT_START: Shown when combat begins
 *   - FLOOR_COMPLETE: Shown when a floor is completed
 *   - DEATH: Shown when the player dies
 */

// ─── Floor Entry Messages ───────────────────────────────────────────────────

/**
 * @type {Record<number, string[]>}
 */
const FLOOR_ENTRY_MESSAGES = {
  1: [
    'You have climbed before. The tower remembers.',
    'The moss glows brighter when you approach.',
  ],
  2: [
    'The embers recognize you. They have been waiting.',
    'Warmth reaches for you. Always warmth.',
  ],
  3: [
    'The crystals sing your name. Or perhaps they are lying.',
    'You can see farther than you ever have.',
  ],
  4: [
    'The wind speaks your name in a voice older than words.',
    'The tower reaches back. You feel it.',
  ],
  5: [
    'The water ripples. Something beneath is watching.',
    'You have climbed. The tower has been waiting.',
  ],
};

// ─── Combat Start Messages ─────────────────────────────────────────────────

const COMBAT_START_MESSAGES = [
  'The tower sends its guardians.',
  'The walls close in. You can feel it.',
];

// ─── Floor Completion Messages ─────────────────────────────────────────────

const FLOOR_COMPLETE_MESSAGES = [
  'You have climbed. The tower has been waiting.',
  'Another floor conquered. The tower notes this.',
];

// ─── Death Messages ────────────────────────────────────────────────────────

const DEATH_MESSAGES = [
  'The tower does not forget. It will remember you.',
  'Rest. The tower will be here when you return.',
];

// ─── Message Pool Types ────────────────────────────────────────────────────

/**
 * @typedef {'FLOOR_ENTRY' | 'COMBAT_START' | 'FLOOR_COMPLETE' | 'DEATH'} ContextTrigger
 */

/**
 * Get the message pool for a given trigger type and floor number.
 * @param {ContextTrigger} trigger
 * @param {number} [floorNumber]
 * @returns {string[]}
 */
export function getMessagePool(trigger, floorNumber) {
  switch (trigger) {
    case 'FLOOR_ENTRY': {
      const pool = FLOOR_ENTRY_MESSAGES[floorNumber];
      return pool || FLOOR_ENTRY_MESSAGES[1];
    }
    case 'COMBAT_START':
      return COMBAT_START_MESSAGES;
    case 'FLOOR_COMPLETE':
      return FLOOR_COMPLETE_MESSAGES;
    case 'DEATH':
      return DEATH_MESSAGES;
    default:
      return [];
  }
}

/**
 * Get the trigger type that a floor entry message belongs to.
 * @param {number} _floorNumber
 * @returns {ContextTrigger}
 */
export function getFloorEntryTrigger(_floorNumber) {
  return 'FLOOR_ENTRY';
}

const messageData = {
  FLOOR_ENTRY_MESSAGES,
  COMBAT_START_MESSAGES,
  FLOOR_COMPLETE_MESSAGES,
  DEATH_MESSAGES,
};

export default messageData;
