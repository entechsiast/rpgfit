import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import {
  getRandomUncommonPlusItem,
  getRandomCommonEquipment,
  getRandomConsumable,
} from '../data/rewards';

// ---------------------------------------------------------------------------
// Type Definitions (JSDoc)
// ---------------------------------------------------------------------------

/**
 * @typedef {Object} EquipmentItem
 * @property {string} name
 * @property {string} slot
 * @property {string} rarity
 * @property {Object} stats
 */

/**
 * @typedef {Object} CharacterState
 * @property {number} gold
 * @property {number} experience
 * @property {number} level
 * @property {EquipmentItem[]} equipment
 * @property {number} sessionCount – total number of sessions completed
 * @property {string|null} lastSessionDate – ISO date string (YYYY-MM-DD) of last session
 * @property {number} pityCounter – consecutive sessions without a bonus reward
 * @property {number} todayRewardCount – number of guaranteed rewards claimed today
 * @property {string|null} lastRewardDate – ISO date string (YYYY-MM-DD) of last reward
 * @property {number[]} floorMilestones – list of milestone thresholds already reached (e.g., [10, 50])
 * @property {Object|null} _lastReward – last guaranteed reward data (for UI display)
 * @property {string|null} _lastMilestone – last floor completion milestone description (for UI)
 * @property {boolean} _displayMilestone – whether floor completion milestone should be shown
 * @property {string|null} _lastSessionMilestone – last session-based milestone description (for UI)
 * @property {boolean} _displaySessionMilestone – whether session milestone should be shown
 * @property {boolean} _displayGuaranteed – whether guaranteed reward should be shown
 * @property {Object|null} _bonusReward – last bonus reward data (for UI display)
 * @property {boolean} _displayBonus – whether bonus reward should be shown
 */

/**
 * @typedef {'ADD_SESSION'|'ADVANCE_FLOOR'|'SET_STATE'|'DISMISS_REWARD'|'DISMISS_MILESTONE'|'DISMISS_BONUS'|'DISMISS_SESSION_MILESTONE'} ActionType
 */

/**
 * @typedef {Object} AddSessionPayload
 * @property {number} duration – session duration in minutes (must be positive integer)
 * @property {number} [difficulty] – optional difficulty multiplier (default 1)
 */

/**
 * @typedef {Object} AdvanceFloorPayload
 * @property {number} floorNumber – completed floor number (positive integer)
 */

/**
 * @typedef {Object} SetStatePayload
 * @property {Partial<CharacterState>} [partialState] – state fields to merge
 */

/**
 * @typedef {Object} BonusReward
 * @property {'bonus_gold'|'common_equipment'|'consumable'} type
 * @property {Object} data
 * @property {number} [data.amount] – for bonus_gold
 * @property {EquipmentItem} [data.item] – for common_equipment
 * @property {Object} [data.consumable] – for consumable
 */

/**
 * @typedef {Object} Action
 * @property {ActionType} type
 * @property {AddSessionPayload|AdvanceFloorPayload|SetStatePayload|undefined} [payload]
 */

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ACTION_TYPES = Object.freeze({
  ADD_SESSION: 'ADD_SESSION',
  ADVANCE_FLOOR: 'ADVANCE_FLOOR',
  SET_STATE: 'SET_STATE',
  DISMISS_REWARD: 'DISMISS_REWARD',
  DISMISS_MILESTONE: 'DISMISS_MILESTONE',
  DISMISS_BONUS: 'DISMISS_BONUS',
  DISMISS_SESSION_MILESTONE: 'DISMISS_SESSION_MILESTONE',
});

const STORAGE_KEYS = Object.freeze({
  GOLD: 'character_gold',
  EXPERIENCE: 'character_experience',
  LEVEL: 'character_level',
  EQUIPMENT: 'character_equipment',
  SESSION_COUNT: 'session_count',
  LAST_SESSION_DATE: 'last_session_date',
  PITY_COUNTER: 'pity_counter',
  TODAY_REWARD_COUNT: 'today_reward_count',
  LAST_REWARD_DATE: 'last_reward_date',
  FLOOR_MILESTONES: 'floor_milestones',
});

const DAILY_GUARANTEED_LIMIT = 2;
const BASE_BONUS_CHANCE = 0.15;
const PITY_INCREMENT = 0.15;
const MAX_PITY_STREAK = 5; // After this many consecutive no‑bonus, bonus is guaranteed
const BONUS_GOLD_MIN = 10;
const BONUS_GOLD_RANGE = 50; // random bonus gold = BONUS_GOLD_MIN + random(0, BONUS_GOLD_RANGE)
const FLOOR_COMPLETION_GOLD = 500;
const GOLD_PER_DURATION_FACTOR = 10;
const SESSION_MILESTONE_THRESHOLDS = Object.freeze([10, 50, 100]); // cumulative sessions
const SESSION_MILESTONE_GOLD = 100; // gold bonus per milestone
const DEFAULT_LEVEL = 1;
const DEFAULT_GOLD = 0;
const DEFAULT_EXPERIENCE = 0;

const DEFAULT_EQUIPMENT = Object.freeze([]);

const CONSUMABLES = Object.freeze([
  { name: 'Health Potion', effect: 'heal_20' },
  { name: 'Mana Potion', effect: 'restore_mana_20' },
  { name: 'Stamina Elixir', effect: 'energy_15' },
]);

// ---------------------------------------------------------------------------
// Logger (production-safe)
// ---------------------------------------------------------------------------

const logger = Object.freeze({
  info: (...args) => console.info('[CharacterContext]', ...args),
  warn: (...args) => console.warn('[CharacterContext]', ...args),
  error: (...args) => console.error('[CharacterContext]', ...args),
  debug: (...args) => {
    if (process.env.NODE_ENV !== 'production') {
      console.debug('[CharacterContext]', ...args);
    }
  },
});

// ---------------------------------------------------------------------------
// Validation Helpers
// ---------------------------------------------------------------------------

/**
 * Validates that a value is a non‑negative integer.
 * @param {*} value
 * @param {string} name
 * @returns {number}
 * @throws {TypeError}
 */
function validateNonNegativeInt(value, name) {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 0) {
    throw new TypeError(`${name} must be a non‑negative integer, got ${value}`);
  }
  return value;
}

/**
 * Validates that a value is a positive integer.
 * @param {*} value
 * @param {string} name
 * @returns {number}
 * @throws {TypeError}
 */
function validatePositiveInt(value, name) {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 1) {
    throw new TypeError(`${name} must be a positive integer, got ${value}`);
  }
  return value;
}

// ---------------------------------------------------------------------------
// Date Utilities
// ---------------------------------------------------------------------------

/**
 * Returns today's ISO date (YYYY‑MM‑DD) in the local timezone.
 * @returns {string}
 */
function getTodayDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Checks whether daily counters need to be reset based on the last reward date.
 * @param {string|null} lastRewardDate – stored date string
 * @returns {{ shouldReset: boolean, today: string }}
 */
function checkDailyReset(lastRewardDate) {
  const today = getTodayDateString();
  const shouldReset = lastRewardDate !== today;
  return { shouldReset, today };
}

// ---------------------------------------------------------------------------
// LocalStorage Helpers (safe, with error handling)
// ---------------------------------------------------------------------------

/**
 * Loads a numeric value from localStorage.
 * @param {string} key
 * @param {number} defaultValue
 * @param {function(number): boolean} [validator] – optional validation function
 * @returns {number}
 */
function loadNumeric(key, defaultValue, validator) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return defaultValue;
    const parsed = parseFloat(raw);
    if (!Number.isFinite(parsed) || Number.isNaN(parsed)) return defaultValue;
    const floored = Math.floor(parsed);
    if (validator && !validator(floored)) return defaultValue;
    return floored;
  } catch (error) {
    logger.error(`Failed to load numeric key "${key}"`, error);
    return defaultValue;
  }
}

/**
 * Loads a string value from localStorage.
 * @param {string} key
 * @param {string|null} defaultValue
 * @returns {string|null}
 */
function loadString(key, defaultValue = null) {
  try {
    const raw = localStorage.getItem(key);
    return raw !== null ? raw : defaultValue;
  } catch (error) {
    logger.error(`Failed to load string key "${key}"`, error);
    return defaultValue;
  }
}

/**
 * Loads a JSON array from localStorage.
 * @param {string} key
 * @param {*} defaultValue
 * @returns {*}
 */
function loadArray(key, defaultValue = []) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return defaultValue;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : defaultValue;
  } catch (error) {
    logger.error(`Failed to load array key "${key}"`, error);
    return defaultValue;
  }
}

/**
 * Safely saves a value to localStorage.
 * @param {string} key
 * @param {*} value
 */
function saveToStorage(key, value) {
  try {
    const str = typeof value === 'string' ? value : JSON.stringify(value);
    localStorage.setItem(key, str);
  } catch (error) {
    logger.error(`Failed to save key "${key}"`, error);
  }
}

/**
 * Load persisted state including reward tracking variables.
 * @returns {CharacterState}
 */
function loadInitialState() {
  const gold = loadNumeric(STORAGE_KEYS.GOLD, DEFAULT_GOLD, (v) => v >= 0);
  const experience = loadNumeric(STORAGE_KEYS.EXPERIENCE, DEFAULT_EXPERIENCE, (v) => v >= 0);
  const level = loadNumeric(STORAGE_KEYS.LEVEL, DEFAULT_LEVEL, (v) => v >= 1);
  const equipment = loadArray(STORAGE_KEYS.EQUIPMENT, DEFAULT_EQUIPMENT);
  const sessionCount = loadNumeric(STORAGE_KEYS.SESSION_COUNT, 0, (v) => v >= 0);
  const lastSessionDate = loadString(STORAGE_KEYS.LAST_SESSION_DATE, null);
  const pityCounter = loadNumeric(STORAGE_KEYS.PITY_COUNTER, 0, (v) => v >= 0);
  const todayRewardCount = loadNumeric(STORAGE_KEYS.TODAY_REWARD_COUNT, 0, (v) => v >= 0 && v <= DAILY_GUARANTEED_LIMIT);
  const lastRewardDate = loadString(STORAGE_KEYS.LAST_REWARD_DATE, null);
  const floorMilestones = loadArray(STORAGE_KEYS.FLOOR_MILESTONES, []);

  // Daily reset check
  const { shouldReset, today } = checkDailyReset(lastRewardDate);
  const finalRewardCount = shouldReset ? 0 : todayRewardCount;
  const finalRewardDate = shouldReset ? today : lastRewardDate;

  if (shouldReset) {
    saveToStorage(STORAGE_KEYS.TODAY_REWARD_COUNT, 0);
    saveToStorage(STORAGE_KEYS.LAST_REWARD_DATE, today);
  }

  return {
    gold,
    experience,
    level,
    equipment: Array.isArray(equipment) ? equipment : [],
    sessionCount,
    lastSessionDate,
    pityCounter,
    todayRewardCount: finalRewardCount,
    lastRewardDate: finalRewardDate,
    floorMilestones,
    _lastReward: null,
    _lastMilestone: null,
    _displayMilestone: false,
    _lastSessionMilestone: null,
    _displaySessionMilestone: false,
    _displayGuaranteed: false,
    _bonusReward: null,
    _displayBonus: false,
  };
}

// ---------------------------------------------------------------------------
// Reward Helpers
// ---------------------------------------------------------------------------

/**
 * Calculates the gold reward for a session.
 * @param {number} duration – session duration in minutes
 * @param {number} [difficulty=1] – difficulty multiplier
 * @returns {number} gold amount (floored)
 */
function calculateSessionGold(duration, difficulty = 1) {
  return Math.floor(duration * GOLD_PER_DURATION_FACTOR * difficulty);
}

/**
 * Determines whether a bonus reward should be awarded based on pity counter.
 * @param {number} pityCounter – current consecutive no‑bonus count
 * @returns {{ willBonus: boolean, newPityCounter: number, bonusChance: number }}
 */
function resolveBonusReward(pityCounter) {
  let bonusChance = BASE_BONUS_CHANCE + pityCounter * PITY_INCREMENT;
  if (pityCounter >= MAX_PITY_STREAK - 1) {
    bonusChance = 1.0; // Guaranteed after MAX_PITY_STREAK - 1 consecutive no‑bonus
  }
  bonusChance = Math.min(bonusChance, 1.0);
  const roll = Math.random();
  const willBonus = roll < bonusChance;
  const newPityCounter = willBonus ? 0 : pityCounter + 1;
  logger.debug(
    `Bonus roll: chance=${bonusChance.toFixed(2)}, roll=${roll.toFixed(4)}, willBonus=${willBonus}, newPityCounter=${newPityCounter}`
  );
  return { willBonus, newPityCounter, bonusChance };
}

/**
 * Generates a random bonus reward object.
 * @returns {BonusReward}
 */
function generateBonusReward() {
  const typeRoll = Math.random();
  if (typeRoll < 0.33) {
    // Extra gold
    const amount = BONUS_GOLD_MIN + Math.floor(Math.random() * BONUS_GOLD_RANGE);
    return { type: 'bonus_gold', data: { amount } };
  } else if (typeRoll < 0.66) {
    // Random common equipment
    const item = getRandomCommonEquipment();
    return { type: 'common_equipment', data: { item } };
  } else {
    // Random consumable
    const consumable = getRandomConsumable(CONSUMABLES);
    return { type: 'consumable', data: { consumable } };
  }
}

/**
 * Generates a floor completion milestone reward.
 * @returns {{ gold: number, item: EquipmentItem }}
 */
function generateMilestoneReward() {
  const item = getRandomUncommonPlusItem();
  return { gold: FLOOR_COMPLETION_GOLD, item };
}

/**
 * Generates a session milestone reward (gold + uncommon item).
 * @returns {{ gold: number, item: EquipmentItem }}
 */
function generateSessionMilestoneReward() {
  const item = getRandomUncommonPlusItem();
  const gold = SESSION_MILESTONE_GOLD;
  return { gold, item };
}

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

/**
 * Main reducer for character state.
 * @param {CharacterState} state
 * @param {Action} action
 * @returns {CharacterState}
 */
function characterReducer(state, action) {
  switch (action.type) {
    case ACTION_TYPES.ADD_SESSION: {
      try {
        const { duration, difficulty = 1 } = action.payload || {};
        validatePositiveInt(duration, 'duration');
        validateNonNegativeInt(difficulty, 'difficulty');

        const today = getTodayDateString();

        // Daily reset check for guaranteed reward limit
        const { shouldReset } = checkDailyReset(state.lastRewardDate);
        const effectiveCount = shouldReset ? 0 : state.todayRewardCount;

        // Anti‑farming: only first DAILY_GUARANTEED_LIMIT sessions give guaranteed gold
        const canGetGuaranteed = effectiveCount < DAILY_GUARANTEED_LIMIT;
        const goldReward = canGetGuaranteed ? calculateSessionGold(duration, difficulty) : 0;

        // Resolve bonus reward using pity counter
        const { willBonus, newPityCounter } = resolveBonusReward(state.pityCounter);

        // Build new state without mutation
        let newGold = state.gold + goldReward;
        let newEquipment = state.equipment.slice();
        let bonusReward = null;
        let displayBonus = false;

        if (willBonus) {
          bonusReward = generateBonusReward();
          displayBonus = true;

          if (bonusReward.type === 'bonus_gold') {
            newGold += bonusReward.data.amount;
          } else if (bonusReward.type === 'common_equipment') {
            newEquipment = [...newEquipment, bonusReward.data.item];
          }
          // consumable stored in bonusReward.data.consumable; UI handles display
        }

        // Update today count and last reward date
        const newTodayCount = shouldReset
          ? (goldReward > 0 ? 1 : 0)
          : (goldReward > 0 ? state.todayRewardCount + 1 : state.todayRewardCount);
        const newLastRewardDate = goldReward > 0 ? today : (shouldReset ? today : state.lastRewardDate);

        // Increment session count and update last session date
        const newSessionCount = state.sessionCount + 1;

        // Check session milestones (only if not already achieved)
        let sessionMilestone = null;
        let displaySessionMilestone = false;
        if (SESSION_MILESTONE_THRESHOLDS.includes(newSessionCount) && !state.floorMilestones.includes(newSessionCount)) {
          sessionMilestone = generateSessionMilestoneReward();
          displaySessionMilestone = true;
          newGold += sessionMilestone.gold;
          newEquipment = [...newEquipment, sessionMilestone.item];
        }

        const newFloorMilestones = sessionMilestone
          ? [...state.floorMilestones, newSessionCount]
          : state.floorMilestones;

        return {
          ...state,
          gold: newGold,
          equipment: newEquipment,
          sessionCount: newSessionCount,
          lastSessionDate: today,
          pityCounter: newPityCounter,
          todayRewardCount: newTodayCount,
          lastRewardDate: newLastRewardDate,
          floorMilestones: newFloorMilestones,
          _lastReward: goldReward > 0 ? { gold: goldReward } : null,
          _displayGuaranteed: goldReward > 0,
          _displayMilestone: false,
          _lastMilestone: null,
          _displaySessionMilestone,
          _lastSessionMilestone: sessionMilestone
            ? `Session milestone (${newSessionCount} total) reached! You earned ${sessionMilestone.gold} gold and a ${sessionMilestone.item.rarity} ${sessionMilestone.item.name}.`
            : null,
          _displayBonus: displayBonus,
          _bonusReward: bonusReward,
        };
      } catch (error) {
        logger.error('Error in ADD_SESSION reducer:', error);
        return state;
      }
    }

    case ACTION_TYPES.ADVANCE_FLOOR: {
      try {
        const { floorNumber } = action.payload || {};
        validatePositiveInt(floorNumber, 'floorNumber');

        const milestone = generateMilestoneReward();
        const newGold = state.gold + milestone.gold;
        const newEquipment = [...state.equipment, milestone.item];

        return {
          ...state,
          gold: newGold,
          equipment: newEquipment,
          _lastMilestone: `Floor ${floorNumber} completed! You earned ${milestone.gold} gold and a ${milestone.item.rarity} ${milestone.item.name}.`,
          _displayMilestone: true,
          _displayGuaranteed: false,
          _displayBonus: false,
          _displaySessionMilestone: false,
          _lastSessionMilestone: null,
        };
      } catch (error) {
        logger.error('Error in ADVANCE_FLOOR reducer:', error);
        return state;
      }
    }

    case ACTION_TYPES.SET_STATE: {
      try {
        const { partialState } = action.payload || {};
        if (!partialState || typeof partialState !== 'object') {
          logger.warn('SET_STATE received invalid partialState');
          return state;
        }
        // Only merge known keys to prevent pollution
        const allowedKeys = [
          'gold', 'experience', 'level', 'equipment',
          'sessionCount', 'lastSessionDate', 'pityCounter',
          'todayRewardCount', 'lastRewardDate', 'floorMilestones',
        ];
        const merged = {};
        for (const key of allowedKeys) {
          if (key in partialState) {
            merged[key] = partialState[key];
          }
        }
        return { ...state, ...merged };
      } catch (error) {
        logger.error('Error in SET_STATE reducer:', error);
        return state;
      }
    }

    case ACTION_TYPES.DISMISS_REWARD:
      return { ...state, _displayGuaranteed: false, _lastReward: null };

    case ACTION_TYPES.DISMISS_MILESTONE:
      return { ...state, _displayMilestone: false, _lastMilestone: null };

    case ACTION_TYPES.DISMISS_BONUS:
      return { ...state, _displayBonus: false, _bonusReward: null };

    case ACTION_TYPES.DISMISS_SESSION_MILESTONE:
      return { ...state, _displaySessionMilestone: false, _lastSessionMilestone: null };

    default:
      logger.warn(`Unknown action type: ${action.type}`);
      return state;
  }
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const CharacterContext = createContext(undefined);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

/**
 * Provider component for character state.
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @returns {JSX.Element}
 */
function CharacterProvider({ children }) {
  const [state, dispatch] = useReducer(characterReducer, null, loadInitialState);
  const stateRef = useRef(state);
  stateRef.current = state; // Keep ref up to date for logging side effects

  // Persist relevant state changes to localStorage
  useEffect(() => {
    try {
      saveToStorage(STORAGE_KEYS.GOLD, state.gold);
      saveToStorage(STORAGE_KEYS.EXPERIENCE, state.experience);
      saveToStorage(STORAGE_KEYS.LEVEL, state.level);
      saveToStorage(STORAGE_KEYS.EQUIPMENT, state.equipment);
      saveToStorage(STORAGE_KEYS.SESSION_COUNT, state.sessionCount);
      saveToStorage(STORAGE_KEYS.LAST_SESSION_DATE, state.lastSessionDate);
      saveToStorage(STORAGE_KEYS.PITY_COUNTER, state.pityCounter);
      saveToStorage(STORAGE_KEYS.TODAY_REWARD_COUNT, state.todayRewardCount);
      saveToStorage(STORAGE_KEYS.LAST_REWARD_DATE, state.lastRewardDate);
      saveToStorage(STORAGE_KEYS.FLOOR_MILESTONES, state.floorMilestones);
    } catch (error) {
      logger.error('Failed to persist state to localStorage', error);
    }
  }, [
    state.gold,
    state.experience,
    state.level,
    state.equipment,
    state.sessionCount,
    state.lastSessionDate,
    state.pityCounter,
    state.todayRewardCount,
    state.lastRewardDate,
    state.floorMilestones,
  ]);

  // Daily reset effect (run on mount and on day change)
  useEffect(() => {
    const checkReset = () => {
      const { shouldReset, today } = checkDailyReset(stateRef.current.lastRewardDate);
      if (shouldReset) {
        dispatch({
          type: ACTION_TYPES.SET_STATE,
          payload: { partialState: { todayRewardCount: 0, lastRewardDate: today } },
        });
        logger.info('Daily reward counters reset');
      }
    };

    // Initial check
    checkReset();

    // Check every minute for day change (simplified polling)
    const interval = setInterval(checkReset, 60000);
    return () => clearInterval(interval);
  }, []);

  // Memoized dispatch actions for public API
  const addSession = useCallback((duration, difficulty = 1) => {
    dispatch({ type: ACTION_TYPES.ADD_SESSION, payload: { duration, difficulty } });
  }, []);

  const advanceFloor = useCallback((floorNumber) => {
    dispatch({ type: ACTION_TYPES.ADVANCE_FLOOR, payload: { floorNumber } });
  }, []);

  const setState = useCallback((partialState) => {
    dispatch({ type: ACTION_TYPES.SET_STATE, payload: { partialState } });
  }, []);

  const dismissReward = useCallback(() => {
    dispatch({ type: ACTION_TYPES.DISMISS_REWARD });
  }, []);

  const dismissMilestone = useCallback(() => {
    dispatch({ type: ACTION_TYPES.DISMISS_MILESTONE });
  }, []);

  const dismissBonus = useCallback(() => {
    dispatch({ type: ACTION_TYPES.DISMISS_BONUS });
  }, []);

  const dismissSessionMilestone = useCallback(() => {
    dispatch({ type: ACTION_TYPES.DISMISS_SESSION_MILESTONE });
  }, []);

  const value = {
    character: state,
    addSession,
    advanceFloor,
    setState,
    dismissReward,
    dismissMilestone,
    dismissBonus,
    dismissSessionMilestone,
  };

  return (
    <CharacterContext.Provider value={value}>
      {children}
    </CharacterContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Hook to access character context.
 * @returns {{
 *   character: CharacterState,
 *   addSession: (duration: number, difficulty?: number) => void,
 *   advanceFloor: (floorNumber: number) => void,
 *   setState: (partialState: Partial<CharacterState>) => void,
 *   dismissReward: () => void,
 *   dismissMilestone: () => void,
 *   dismissBonus: () => void,
 *   dismissSessionMilestone: () => void,
 * }}
 * @throws {Error} if used outside CharacterProvider
 */
function useCharacter() {
  const context = useContext(CharacterContext);
  if (!context) {
    throw new Error('useCharacter must be used within a CharacterProvider');
  }
  return context;
}

export { CharacterProvider, useCharacter, ACTION_TYPES };