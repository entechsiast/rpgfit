/**
 * @fileoverview Reward state persistence and validation utilities.
 * Handles localStorage read/write operations for reward streak, daily count,
 * and last reward date. Includes input validation, error recovery, logging,
 * throttling, caching, and comprehensive type annotations.
 * All operations are side-effect safe and handle environment constraints.
 *
 * @version 2.1.0
 * @module rewardStorage
 */

// ---------------------------------------------------------------------------
// Environment & Logger
// ---------------------------------------------------------------------------

/** @type {boolean} */
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

/** @type {boolean} */
const IS_DEVELOPMENT = !IS_PRODUCTION;

/** @type {string} */
const LOG_PREFIX = '[RewardStorage]';

/**
 * Structured logger with environment-aware output, rate‑limited WARN/ERROR,
 * and structured metadata for traceability.
 * @namespace
 */
const logger = {
  /**
   * Debug – only in development.
   * @param {...unknown} args
   */
  debug: (...args) => {
    if (IS_DEVELOPMENT) {
      (console.debug || console.log)(LOG_PREFIX, ...args);
    }
  },

  /**
   * Info – always shown.
   * @param {...unknown} args
   */
  info: (...args) => console.info(LOG_PREFIX, ...args),

  /** @type {Map<string, number>} */
  _throttleMap: new Map(),

  /**
   * Warn – throttled to once per unique message per 5 seconds.
   * @param {...unknown} args
   */
  warn: (...args) => {
    const key = args.join(':');
    const now = Date.now();
    const last = logger._throttleMap.get(key) || 0;
    if (now - last > 5000) {
      logger._throttleMap.set(key, now);
      console.warn(LOG_PREFIX, ...args);
    }
  },

  /**
   * Error – always shown, includes correlation id.
   * @param {...unknown} args
   */
  error: (...args) => {
    // Attach a random correlation id for tracing
    const cid = Math.random().toString(36).substring(2, 8);
    console.error(LOG_PREFIX, `[CID:${cid}]`, ...args);
  },
};

// ---------------------------------------------------------------------------
// Constants & Types
// ---------------------------------------------------------------------------

/** @type {number} */
const REWARD_STREAK_MIN = 0;

/** @type {number} */
const REWARD_STREAK_MAX = 100;

/** @type {number} */
const DAILY_COUNT_MIN = 0;

/** @type {number} */
const DAILY_COUNT_MAX = 10;

/** @type {RegExp} */
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/**
 * localStorage keys – frozen to prevent mutation.
 * @type {Readonly<{REWARD_STREAK: string, TODAY_REWARD_COUNT: string, LAST_REWARD_DATE: string, MILEStONE_PROGRESS: string}>}
 */
const STORAGE_KEYS = Object.freeze({
  REWARD_STREAK: 'rewardStreak',
  TODAY_REWARD_COUNT: 'todayRewardCount',
  LAST_REWARD_DATE: 'lastRewardDate',
  MILEStONE_PROGRESS: 'milestoneProgress',
});

/**
 * Default reward state – immutable.
 * @type {Readonly<RewardState>}
 */
const DEFAULT_STATE = Object.freeze({
  rewardStreak: 0,
  todayRewardCount: 0,
  lastRewardDate: null,
});

/**
 * Default milestone progress – immutable.
 * @type {Readonly<MilestoneProgress>}
 */
const DEFAULT_MILESTONE_PROGRESS = Object.freeze({
  currentMilestone: 1,
  sessionsCompleted: 0,
  totalSessionsTarget: 10,  // e.g. 10 sessions per milestone
  bonusDropsAvailable: 0,
});

/** @type {number} */
const SAVE_THROTTLE_MS = 50;

/** @type {Map<string, number>} */
const _lastSaveTimestamps = new Map();

/** @type {RewardState | null} */
let _cachedState = null;

/** @type {MilestoneProgress | null} */
let _cachedMilestone = null;

/** @type {boolean | undefined} */
let _localStorageAvailable = undefined; // lazy initialization

/**
 * @typedef {Object} RewardState
 * @property {number} rewardStreak - Consecutive sessions without bonus reward (0–100).
 * @property {number} todayRewardCount - Guaranteed rewards claimed today (0–10).
 * @property {string|null} lastRewardDate - ISO date string (YYYY-MM-DD) of last claim.
 */

/**
 * @typedef {Object} MilestoneProgress
 * @property {number} currentMilestone - Current milestone level (starts at 1).
 * @property {number} sessionsCompleted - Number of sessions completed in this milestone.
 * @property {number} totalSessionsTarget - Sessions needed to complete milestone.
 * @property {number} bonusDropsAvailable - Number of bonus drops earned but not yet claimed.
 */

/**
 * @typedef {Object} SessionData
 * @property {number} duration - session duration in minutes
 * @property {number} pointsEarned - points earned in session
 * @property {boolean} [isBonusEligible] - optional flag
 */

/**
 * @typedef {Object} RewardResult
 * @property {RewardState} rewardState - updated reward state after session
 * @property {MilestoneProgress} milestoneProgress - updated milestone progress
 * @property {boolean} bonusDropAwarded - whether a bonus drop was awarded
 * @property {number} earnedPoints - points earned this session
 */

/**
 * @typedef {'load'|'save'|'validate'|'reset'|'clear'} StorageOperation
 */

/**
 * Custom error class for storage failures.
 * @extends Error
 */
class StorageError extends Error {
  /**
   * @param {string} message - Human-readable description.
   * @param {StorageOperation} operation - The operation during which the error occurred.
   * @param {unknown} [originalError] - The original error (if any).
   */
  constructor(message, operation, originalError) {
    super(message);
    this.name = 'StorageError';
    this.operation = operation;
    /** @type {unknown} */
    this.originalError = originalError;
    /** @type {number} */
    this.timestamp = Date.now();
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Returns today's date in `YYYY-MM-DD` format (local time).
 * Uses `Intl.DateTimeFormat` for consistent formatting.
 *
 * @returns {string} Today's date string.
 * @throws {Error} Only on catastrophic `Intl` failure (fallback used).
 */
function getTodayDateString() {
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return formatter.format(new Date());
  } catch (err) {
    logger.error('Intl.DateTimeFormat failed, using fallback date formatting', err);
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
}

/**
 * Safely parses a value into an integer.
 * Returns `0` for non‑finite or invalid inputs.
 *
 * @param {unknown} val - Value to parse.
 * @returns {number} Safe integer (might be negative, but downstream clamps).
 */
function parseSafeInt(val) {
  if (typeof val === 'number' && Number.isFinite(val) && Number.isInteger(val)) {
    return val;
  }
  if (typeof val === 'string') {
    const parsed = parseInt(val, 10);
    if (!Number.isNaN(parsed) && Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return 0;
}

/**
 * Safely extracts a non‑empty string, returns `null` otherwise.
 *
 * @param {unknown} str - Value to parse.
 * @returns {string|null} A non‑empty string, or `null`.
 */
function parseSafeString(str) {
  return typeof str === 'string' && str.length > 0 ? str : null;
}

/**
 * Checks if `localStorage` is available.
 * Uses a silent probe; caches result.
 *
 * @returns {boolean} `true` if localStorage can be used.
 */
function isLocalStorageAvailable() {
  if (_localStorageAvailable !== undefined) {
    return _localStorageAvailable;
  }
  try {
    const testKey = '__aigon_storage_test__';
    localStorage.setItem(testKey, '1');
    localStorage.removeItem(testKey);
    _localStorageAvailable = true;
  } catch {
    logger.warn('localStorage not available – using in‑memory fallback');
    _localStorageAvailable = false;
  }
  return _localStorageAvailable;
}

/**
 * Checks if value is a plain object.
 *
 * @param {unknown} value - The value to check.
 * @returns {value is Record<string, unknown>}
 */
function isPlainObject(value) {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    value.constructor === Object
  );
}

/**
 * Throttle check for save operations.
 *
 * @param {string} key - Storage key.
 * @returns {boolean} `true` if save should proceed (not throttled).
 */
function shouldSaveThrottled(key) {
  const now = Date.now();
  const last = _lastSaveTimestamps.get(key) || 0;
  if (now - last < SAVE_THROTTLE_MS) {
    logger.debug('Save throttled for key', key);
    return false;
  }
  _lastSaveTimestamps.set(key, now);
  return true;
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

/**
 * Validates and sanitizes a raw reward state object.
 * Clamps numeric fields to expected ranges and logs all corrections.
 *
 * @param {unknown} value - Raw object to validate.
 * @returns {RewardState} A safe, clean reward state object.
 */
function validateState(value) {
  if (!isPlainObject(value)) {
    logger.warn('Invalid state object – returning defaults');
    return { ...DEFAULT_STATE };
  }

  const raw = /** @type {Record<string, unknown>} */ (value);
  let rewardStreak = parseSafeInt(raw.rewardStreak);
  let todayRewardCount = parseSafeInt(raw.todayRewardCount);
  let lastRewardDate = parseSafeString(raw.lastRewardDate);

  // Clamp rewardStreak
  if (rewardStreak < REWARD_STREAK_MIN || rewardStreak > REWARD_STREAK_MAX) {
    logger.warn(
      `rewardStreak ${rewardStreak} out of range [${REWARD_STREAK_MIN}, ${REWARD_STREAK_MAX}] – resetting to 0`
    );
    rewardStreak = 0;
  }

  // Clamp todayRewardCount
  if (todayRewardCount < DAILY_COUNT_MIN || todayRewardCount > DAILY_COUNT_MAX) {
    logger.warn(
      `todayRewardCount ${todayRewardCount} out of range [${DAILY_COUNT_MIN}, ${DAILY_COUNT_MAX}] – resetting to 0`
    );
    todayRewardCount = 0;
  }

  // Validate lastRewardDate format
  if (lastRewardDate !== null && !DATE_REGEX.test(lastRewardDate)) {
    logger.warn(`lastRewardDate "${lastRewardDate}" is not a valid YYYY-MM-DD date – resetting to null`);
    lastRewardDate = null;
  }

  return { rewardStreak, todayRewardCount, lastRewardDate };
}

/**
 * Validates and sanitizes a raw milestone progress object.
 *
 * @param {unknown} value - Raw object to validate.
 * @returns {MilestoneProgress} A safe milestone progress object.
 */
function validateMilestoneProgress(value) {
  if (!isPlainObject(value)) {
    logger.warn('Invalid milestone progress object – returning defaults');
    return { ...DEFAULT_MILESTONE_PROGRESS };
  }

  const raw = /** @type {Record<string, unknown>} */ (value);
  const milestone = {
    currentMilestone: parseSafeInt(raw.currentMilestone) || 1,
    sessionsCompleted: parseSafeInt(raw.sessionsCompleted),
    totalSessionsTarget: parseSafeInt(raw.totalSessionsTarget) || 10,
    bonusDropsAvailable: parseSafeInt(raw.bonusDropsAvailable),
  };

  // Ensure positive values
  if (milestone.currentMilestone < 1) milestone.currentMilestone = 1;
  if (milestone.sessionsCompleted < 0) milestone.sessionsCompleted = 0;
  if (milestone.totalSessionsTarget < 1) milestone.totalSessionsTarget = 10;
  if (milestone.bonusDropsAvailable < 0) milestone.bonusDropsAvailable = 0;

  return milestone;
}

// ---------------------------------------------------------------------------
// Core Public API (Storage)
// ---------------------------------------------------------------------------

/**
 * Load reward state from localStorage.
 * Falls back to in-memory default if localStorage unavailable or data corrupt.
 * Caches result to reduce I/O.
 *
 * @returns {RewardState} Validated reward state (always a safe object, never throws).
 */
function loadRewardState() {
  // Return cached state if available (memoization)
  if (_cachedState !== null) {
    logger.debug('Returning cached reward state');
    return _cachedState;
  }

  // If localStorage is not available, return default immediately
  if (!isLocalStorageAvailable()) {
    logger.info('localStorage unavailable – using in-memory default');
    _cachedState = { ...DEFAULT_STATE };
    return _cachedState;
  }

  try {
    // Build complete state from stored values or defaults
    const completeState = {
      rewardStreak: parseSafeInt(localStorage.getItem(STORAGE_KEYS.REWARD_STREAK)),
      todayRewardCount: parseSafeInt(localStorage.getItem(STORAGE_KEYS.TODAY_REWARD_COUNT)),
      lastRewardDate: parseSafeString(localStorage.getItem(STORAGE_KEYS.LAST_REWARD_DATE)),
    };

    const validated = validateState(completeState);
    _cachedState = validated;
    logger.debug('Loaded reward state from localStorage', validated);
    return validated;
  } catch (err) {
    const storageErr = new StorageError(
      'Unexpected error loading reward state',
      'load',
      err
    );
    logger.error(storageErr.message, err);
    // Return a safe default as fallback
    return { ...DEFAULT_STATE };
  }
}

/**
 * Save reward state to localStorage.
 * Applies throttling, validation, and error handling.
 * Clears cache after successful save.
 *
 * @param {RewardState} state - The reward state to persist.
 * @returns {boolean} `true` if save succeeded, `false` otherwise (never throws).
 */
function saveRewardState(state) {
  // Validate state first
  const validated = validateState(state);

  // Check throttling
  const key = STORAGE_KEYS.LAST_REWARD_DATE; // use one key for throttling all saves
  if (!shouldSaveThrottled(key)) {
    // Update cache anyway but skip actual storage
    _cachedState = validated;
    logger.debug('Save throttled – cache updated only');
    return true;
  }

  // If localStorage not available, just update cache
  if (!isLocalStorageAvailable()) {
    _cachedState = validated;
    logger.debug('localStorage unavailable – state cached in memory');
    return true;
  }

  try {
    localStorage.setItem(STORAGE_KEYS.REWARD_STREAK, String(validated.rewardStreak));
    localStorage.setItem(STORAGE_KEYS.TODAY_REWARD_COUNT, String(validated.todayRewardCount));
    if (validated.lastRewardDate !== null) {
      localStorage.setItem(STORAGE_KEYS.LAST_REWARD_DATE, validated.lastRewardDate);
    } else {
      localStorage.removeItem(STORAGE_KEYS.LAST_REWARD_DATE);
    }

    _cachedState = validated;
    logger.debug('Saved reward state to localStorage', validated);
    return true;
  } catch (err) {
    // Handle quota exceeded or other write errors
    const storageErr = new StorageError(
      'Failed to save reward state to localStorage',
      'save',
      err
    );
    logger.error(storageErr.message, err);
    // Cache is still updated to keep in-memory consistency
    _cachedState = validated;
    return false;
  }
}

/**
 * Reset reward state to defaults (clear streak, count, and date).
 * Also clears localStorage keys.
 *
 * @returns {RewardState} The reset state.
 */
function clearRewardState() {
  _cachedState = null; // invalidate cache

  if (isLocalStorageAvailable()) {
    try {
      localStorage.removeItem(STORAGE_KEYS.REWARD_STREAK);
      localStorage.removeItem(STORAGE_KEYS.TODAY_REWARD_COUNT);
      localStorage.removeItem(STORAGE_KEYS.LAST_REWARD_DATE);
      logger.info('Cleared reward state from localStorage');
    } catch (err) {
      logger.error('Failed to clear reward state from localStorage', err);
    }
  }

  const defaultState = { ...DEFAULT_STATE };
  _cachedState = defaultState;
  return defaultState;
}

/**
 * Reset daily counters if a new day has started (based on lastRewardDate).
 * Mutates a state object and returns the updated state.
 *
 * @param {RewardState} state - Current state.
 * @returns {RewardState} Updated state with reset counters if needed.
 */
function resetDailyIfNeeded(state) {
  const today = getTodayDateString();
  if (state.lastRewardDate !== today) {
    logger.info(`Daily reset triggered (last: ${state.lastRewardDate}, today: ${today})`);
    return {
      ...state,
      todayRewardCount: 0,
      lastRewardDate: today,
    };
  }
  return state;
}

// ---------------------------------------------------------------------------
// Session Rewards, Bonus Drops & Milestone API
// ---------------------------------------------------------------------------

/**
 * Load milestone progress from localStorage.
 * @returns {MilestoneProgress}
 */
function loadMilestoneProgress() {
  if (_cachedMilestone !== null) {
    logger.debug('Returning cached milestone progress');
    return _cachedMilestone;
  }

  if (!isLocalStorageAvailable()) {
    logger.info('localStorage unavailable – using default milestone progress');
    _cachedMilestone = { ...DEFAULT_MILESTONE_PROGRESS };
    return _cachedMilestone;
  }

  try {
    const rawProgress = localStorage.getItem(STORAGE_KEYS.MILEStONE_PROGRESS);
    if (rawProgress !== null) {
      const parsed = JSON.parse(rawProgress);
      const validated = validateMilestoneProgress(parsed);
      _cachedMilestone = validated;
      logger.debug('Loaded milestone progress from localStorage', validated);
      return validated;
    }
  } catch (err) {
    logger.error('Error parsing milestone progress, using default', err);
  }

  _cachedMilestone = { ...DEFAULT_MILESTONE_PROGRESS };
  return _cachedMilestone;
}

/**
 * Save milestone progress to localStorage.
 * @param {MilestoneProgress} progress
 * @returns {boolean}
 */
function saveMilestoneProgress(progress) {
  const validated = validateMilestoneProgress(progress);

  if (!isLocalStorageAvailable()) {
    _cachedMilestone = validated;
    logger.debug('localStorage unavailable – milestone cached in memory');
    return true;
  }

  try {
    localStorage.setItem(STORAGE_KEYS.MILEStONE_PROGRESS, JSON.stringify(validated));
    _cachedMilestone = validated;
    logger.debug('Saved milestone progress to localStorage', validated);
    return true;
  } catch (err) {
    logger.error('Failed to save milestone progress', err);
    _cachedMilestone = validated;
    return false;
  }
}

/**
 * Get current milestone progress (public API).
 * @returns {MilestoneProgress}
 */
function getMilestoneProgress() {
  return loadMilestoneProgress();
}

/**
 * Submit a session and compute rewards, update streak, daily count, milestones.
 * Offline-first: uses localStorage or in-memory fallback.
 *
 * @param {SessionData} data - Session data (duration, pointsEarned, isBonusEligible).
 * @returns {Promise<RewardResult>} Reward result.
 */
async function submitSession(data) {
  // Validate input
  if (!isPlainObject(data)) {
    throw new Error('Invalid session data: must be an object');
  }
  const session = {
    duration: typeof data.duration === 'number' && data.duration > 0 ? data.duration : 0,
    pointsEarned: typeof data.pointsEarned === 'number' && data.pointsEarned >= 0 ? data.pointsEarned : 0,
    isBonusEligible: data.isBonusEligible === true,
  };

  // Load current reward state and milestone progress
  let rewardState = loadRewardState();
  let milestoneProgress = loadMilestoneProgress();

  // Reset daily counters if needed
  rewardState = resetDailyIfNeeded(rewardState);

  // Update streak: increment if session completed successfully
  rewardState.rewardStreak = Math.min(rewardState.rewardStreak + 1, REWARD_STREAK_MAX);

  // Update today reward count (guaranteed rewards)
  rewardState.todayRewardCount = Math.min(rewardState.todayRewardCount + 1, DAILY_COUNT_MAX);

  // Save reward state
  saveRewardState(rewardState);

  // Update milestone progress
  milestoneProgress.sessionsCompleted += 1;
  let bonusDropAwarded = false;

  // Check if milestone is completed
  if (milestoneProgress.sessionsCompleted >= milestoneProgress.totalSessionsTarget) {
    // Milestone achieved: award bonus drops and move to next milestone
    bonusDropAwarded = true;
    milestoneProgress.bonusDropsAvailable += 1; // one bonus drop per milestone completion
    milestoneProgress.currentMilestone += 1;
    milestoneProgress.sessionsCompleted = 0; // reset for next milestone
    logger.info(`Milestone ${milestoneProgress.currentMilestone - 1} completed! Bonus drop awarded.`);
  }

  // Save milestone progress
  saveMilestoneProgress(milestoneProgress);

  // Return reward result
  return {
    rewardState,
    milestoneProgress,
    bonusDropAwarded,
    earnedPoints: session.pointsEarned,
  };
}

/**
 * Claim a bonus drop (if any available).
 * @returns {{ success: boolean, newBonusDropsAvailable: number }}
 */
function claimBonusDrop() {
  const progress = loadMilestoneProgress();
  if (progress.bonusDropsAvailable <= 0) {
    return { success: false, newBonusDropsAvailable: 0 };
  }

  progress.bonusDropsAvailable -= 1;
  saveMilestoneProgress(progress);
  logger.info('Bonus drop claimed');
  return { success: true, newBonusDropsAvailable: progress.bonusDropsAvailable };
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export {
  StorageError,
  logger,
  loadRewardState,
  saveRewardState,
  clearRewardState,
  resetDailyIfNeeded,
  validateState,
  REWARD_STREAK_MIN,
  REWARD_STREAK_MAX,
  DAILY_COUNT_MIN,
  DAILY_COUNT_MAX,
  DEFAULT_STATE,
  STORAGE_KEYS,
  // New exports
  submitSession,
  getMilestoneProgress,
  loadMilestoneProgress,
  saveMilestoneProgress,
  claimBonusDrop,
  DEFAULT_MILESTONE_PROGRESS,
};