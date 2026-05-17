/**
 * NPC Dialogue System — Data Structures and Dialogue Data
 *
 * Defines the NPC types, dialogue data structures, trigger conditions,
 * and the fixed dialogue content for all Tower 1 NPCs.
 *
 * NPCs:
 *   - TravelingMerchant: Appears on Floors 1, 3, 5
 *   - TowerGuide: Appears on Floors 2, 4
 *   - ShadowWanderer: Appears on Floor 3 only
 *
 * Each NPC has up to 5 dialogues triggered by specific conditions:
 *   - FIRST_VISIT: Always available on first meeting
 *   - FLOOR_COMPLETED(n): Available after completing floor n
 *   - LORE_FRAGMENTS(n): Available after discovering n+ lore fragments
 *   - TOWER1_COMPLETED: Available after completing Tower 1
 *   - ALWAYS: Always available
 */

// ─── NPC IDs ───────────────────────────────────────────────────────────────

export const NPC_ID = {
  MERCHANT: 'merchant',
  GUIDE: 'guide',
  WANDERER: 'wanderer',
};

// ─── Trigger Types ─────────────────────────────────────────────────────────

export const TRIGGER = {
  FIRST_VISIT: 'FIRST_VISIT',
  FLOOR_COMPLETED: 'FLOOR_COMPLETED',
  LORE_FRAGMENTS: 'LORE_FRAGMENTS',
  TOWER1_COMPLETED: 'TOWER1_COMPLETED',
  ALWAYS: 'ALWAYS',
};

// ─── NPC Appearance Data (manhwa aesthetic) ────────────────────────────────

/**
 * @typedef {Object} NpcAppearance
 * @property {string} primaryColor - Main color for the NPC's visual
 * @property {string} secondaryColor - Secondary/accent color
 * @property {string} glowColor - Glow/aura color
 * @property {string[]} visualElements - SVG elements to render
 * @property {string} description - Brief visual description
 */

export const NPC_APPEARANCES = {
  [NPC_ID.MERCHANT]: {
    primaryColor: '#8b6914',
    secondaryColor: '#d4a017',
    glowColor: '#f0c040',
    visualElements: ['patched_cloak', 'cart', 'shadowed_face', 'pockets'],
    description: 'A figure in a patched cloak with many pockets. Carries a cart that seems impossibly large on the inside. Face is partially shadowed — friendly but mysterious.',
  },
  [NPC_ID.GUIDE]: {
    primaryColor: '#4a90d9',
    secondaryColor: '#a8d8ea',
    glowColor: '#ffe066',
    visualElements: ['uniform', 'tower_insignia', 'lantern', 'clear_face'],
    description: 'Wears a simple uniform with tower insignia. Carries a lantern that glows with tower light. Face is clear and warm — genuinely wants you to succeed.',
  },
  [NPC_ID.WANDERER]: {
    primaryColor: '#1a1a2e',
    secondaryColor: '#2d1b4e',
    glowColor: '#a855f7',
    visualElements: ['dark_cloak', 'glowing_eyes', 'shadow_aura', 'barely_visible_face'],
    description: 'Cloaked in darkness that seems to absorb light. Face is barely visible — eyes glow faintly. Speaks in riddles but never unhelpfully.',
  },
};

// ─── Dialogue Data ─────────────────────────────────────────────────────────

/**
 * @typedef {Object} Dialogue
 * @property {string} id - Unique dialogue ID (format: `<npcId>_d<num>`)
 * @property {string} text - The dialogue text
 * @property {Object} trigger - Trigger condition
 * @property {string} trigger.type - Trigger type (TRIGGER constant)
 * @property {number} [trigger.value] - Trigger-specific value (floor number or fragment count)
 * @property {string} [npcId] - Override: which NPC this dialogue belongs to (defaults to parent NPC)
 */

/**
 * @typedef {Object} NpcData
 * @property {string} id - NPC ID (NPC_ID constant)
 * @property {string} name - Display name
 * @property {string} personality - Personality descriptor
 * @property {string} appearanceKey - Key into NPC_APPEARANCES
 * @property {number[]} appearingFloors - Floor numbers where this NPC appears
 * @property {Dialogue[]} dialogues - Array of dialogue definitions
 */

const MERCHANT_DIALOGUES = [
  {
    id: 'merchant_d1',
    text: 'Ah, a new climber! Don\'t worry about the prices — I\'ve been climbing this tower longer than it\'s been standing. Everything I sell has survived the ascent. That\'s its own kind of guarantee.',
    trigger: { type: TRIGGER.FIRST_VISIT },
  },
  {
    id: 'merchant_d2',
    text: 'You made it through the Mossward! The moss was particularly hungry this season, I\'m afraid. But you look well — the tower\'s blessing is already on you. I can see it in the way the light hits your shoulders.',
    trigger: { type: TRIGGER.FLOOR_COMPLETED, value: 1 },
  },
  {
    id: 'merchant_d3',
    text: 'The Glass Wastes, hmm? Beautiful place. Terrible for a merchant — everything shatters if you look at it wrong. But you walked through it. Do you feel different? Lighter, perhaps? Don\'t worry about it. The tower takes care of its own.',
    trigger: { type: TRIGGER.FLOOR_COMPLETED, value: 3 },
  },
  {
    id: 'merchant_d4',
    text: 'The Crown Chamber. I\'ve never been there — I sell my wares to those who come back down. But I\'ve heard the light down there... it doesn\'t just illuminate. It remembers. Every climber who\'s worn that crown, the tower keeps a piece of them. How wonderful is that?',
    trigger: { type: TRIGGER.FLOOR_COMPLETED, value: 5 },
  },
  {
    id: 'merchant_d5',
    text: 'You\'re ready for the next floor. I can tell — not from your gear, but from the way you stand. The tower doesn\'t just test climbers. It watches them grow. And you, my friend, have grown beautifully.',
    trigger: { type: TRIGGER.TOWER1_COMPLETED },
  },
];

const GUIDE_DIALOGUES = [
  {
    id: 'guide_d1',
    text: 'Welcome to the Ember Gallery. The walls are warm because they\'re alive — not in the way the moss is alive, but in the way a library is alive. Every ember holds a memory. If you\'re lucky, one of them will show you something useful.',
    trigger: { type: TRIGGER.FIRST_VISIT },
  },
  {
    id: 'guide_d2',
    text: 'You\'ve touched the ember walls, I can see. Did they show you anything? Don\'t be afraid of what you saw. The tower doesn\'t show climbers things to frighten them. It shows them things they need to see. Even if they don\'t understand yet.',
    trigger: { type: TRIGGER.FLOOR_COMPLETED, value: 2 },
  },
  {
    id: 'guide_d3',
    text: 'The Wind Spire is the hardest floor to explain to newcomers. How do you tell someone that the wind has opinions? That it will push you where it wants, and you\'ll just have to convince it you\'re going the right way? It\'s not combat. It\'s conversation.',
    trigger: { type: TRIGGER.FLOOR_COMPLETED, value: 4 },
  },
  {
    id: 'guide_d4',
    text: 'The Crown Chamber is not a finish line. It\'s a doorway. The tower\'s power gathers at the center, and from there it flows back down through every floor. You\'ve touched the source. Now you carry a piece of it with you. That\'s not something that fades.',
    trigger: { type: TRIGGER.FLOOR_COMPLETED, value: 5 },
  },
  {
    id: 'guide_d5',
    text: 'When you\'re ready, the tower will show you the way down. Not up — down. The next floor isn\'t above the Crown Chamber. It\'s beneath it. The tower has two directions, climber. You\'ve only explored one. Are you curious enough to find out what the other side remembers?',
    trigger: { type: TRIGGER.TOWER1_COMPLETED },
  },
];

const WANDERER_DIALOGUES = [
  {
    id: 'wanderer_d1',
    text: 'You see me? Good. Most climbers walk right through me. The tower doesn\'t want everyone to know I\'m here. But you... you\'ve been looking at the crystals long enough to see what\'s behind them. That\'s why I\'m speaking to you.',
    trigger: { type: TRIGGER.FIRST_VISIT },
  },
  {
    id: 'wanderer_d2',
    text: 'The fragments you\'ve found — they\'re not scattered by accident. The tower places them where it thinks climbers will find them. But maybe it\'s not placing them. Maybe they\'re placing themselves. Maybe the tower doesn\'t control its memories. Maybe they choose.',
    trigger: { type: TRIGGER.LORE_FRAGMENTS, value: 3 },
  },
  {
    id: 'wanderer_d3',
    text: 'The sixth climber didn\'t fall into the walls. They stepped into them. Voluntarily. They looked at the tower and said "I want to stay," and the tower, in its strange way, said "Are you sure?" and they said "Yes." That\'s the part they don\'t tell you about the tower. It always asks.',
    trigger: { type: TRIGGER.LORE_FRAGMENTS, value: 5 },
  },
  {
    id: 'wanderer_d4',
    text: 'You\'re close to the Crown Chamber now. When you reach it, don\'t look at the light. Look at the water. The reflection shows what the tower truly is — not a building, not a test, not a machine. It\'s a question. And you\'re the answer it\'s been waiting for.',
    trigger: { type: TRIGGER.LORE_FRAGMENTS, value: 7 },
  },
  {
    id: 'wanderer_d5',
    text: 'I\'ll be here when you come back. I always am. The tower wears my face now, the way it wore the seventh climber\'s face. But I don\'t mind. Being part of something that big... it\'s not so different from being a merchant, or a guide. We all become what the tower needs us to be. The question is: what does the tower need you to be?',
    trigger: { type: TRIGGER.TOWER1_COMPLETED },
  },
];

// ─── NPC Registry ──────────────────────────────────────────────────────────

export const NPC_DATA = [
  {
    id: NPC_ID.MERCHANT,
    name: 'Traveling Merchant',
    personality: 'friendly_mysterious',
    appearanceKey: NPC_ID.MERCHANT,
    appearingFloors: [1, 3, 5],
    dialogues: MERCHANT_DIALOGUES,
  },
  {
    id: NPC_ID.GUIDE,
    name: 'Tower Guide',
    personality: 'warm_encouraging',
    appearanceKey: NPC_ID.GUIDE,
    appearingFloors: [2, 4],
    dialogues: GUIDE_DIALOGUES,
  },
  {
    id: NPC_ID.WANDERER,
    name: 'Shadow Wanderer',
    personality: 'cryptic_helpful',
    appearanceKey: NPC_ID.WANDERER,
    appearingFloors: [3],
    dialogues: WANDERER_DIALOGUES,
  },
];

/**
 * Get NPC data by ID.
 * @param {string} npcId - The NPC ID
 * @returns {NpcData | undefined}
 */
export function getNpcById(npcId) {
  return NPC_DATA.find((npc) => npc.id === npcId);
}

/**
 * Get all NPCs that appear on a given floor.
 * @param {number} floorNumber
 * @returns {NpcData[]}
 */
export function getNpcsForFloor(floorNumber) {
  return NPC_DATA.filter((npc) => npc.appearingFloors.includes(floorNumber));
}

/**
 * Get all dialogue IDs that a player has met (seen at least once).
 * @param {string[]} metDialogueIds - Array of dialogue IDs from localStorage
 * @returns {Set<string>}
 */
export function getMetDialogueSet(metDialogueIds) {
  return new Set(metDialogueIds || []);
}

export default NPC_DATA;
