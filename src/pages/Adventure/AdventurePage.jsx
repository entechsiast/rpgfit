import React, {
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from 'react';
import PropTypes from 'prop-types';
import { CharacterContext } from '../../context/CharacterContext';
import ActivityLogger from '../../components/ActivityLogger/ActivityLogger';
import RewardNotification from '../../components/RewardNotification/RewardNotification';
import logger from '../../utils/logger';
import equipmentData from '../../data/equipment';

// ===== Constants =====

/** @constant {number} Maximum guaranteed rewards per day. */
const MAX_GUARANTEED_REWARDS_PER_DAY = 2;

/** @constant {number} Gold per minute of session. */
const GOLD_PER_MINUTE = 10;

/** @constant {number} Floor completion gold reward. */
const FLOOR_COMPLETION_GOLD = 500;

/** @constant {number} Base bonus reward chance (0-1). */
const BONUS_BASE_CHANCE = 0.15;

/** @constant {number} Pity increment per no-bonus session. */
const BONUS_PITY_INCREMENT = 0.15;

/** @constant {number} Maximum streak before guarantee. */
const BONUS_MAX_STREAK = 5;

/** @constant {number} Guaranteed chance after max streak. */
const BONUS_GUARANTEED_CHANCE = 1.0;

/** @constant {number} Duration (ms) reward notification is displayed. */
const REWARD_DISMISS_TIMEOUT_MS = 3000;

/** @constant {number} Duration (ms) error notification is displayed. */
const ERROR_DISMISS_TIMEOUT_MS = 5000;

/** @constant {string} localStorage key for streak/counter data. */
const LS_KEY = 'adventure_reward_counters';

/** @constant {number} Minimum gold per bonus. */
const BONUS_GOLD_MIN = 10;
/** @constant {number} Maximum gold per bonus. */
const BONUS_GOLD_MAX = 59;
/** @constant {number} Fallback gold per bonus if no common equipment. */
const FALLBACK_GOLD_MIN = 5;
/** @constant {number} Fallback gold per bonus if no common equipment. */
const FALLBACK_GOLD_MAX = 34;

/** @constant {string[]} Consumable options. */
const CONSUMABLES = ['Health Potion', 'Mana Elixir', 'Stamina Boost'];

// ===== Types =====

/**
 * @typedef {Object} RewardDisplay
 * @property {string|null} guaranteed - Guaranteed reward description.
 * @property {string|null} bonus - Bonus reward description.
 * @property {string|null} milestone - Milestone reward description.
 */

/**
 * @typedef {Object} RewardCounters
 * @property {number} rewardStreak - Consecutive sessions without a bonus.
 * @property {number} todayRewardCount - Number of guaranteed rewards today.
 * @property {string|null} lastRewardDate - ISO date string of last reward.
 */

/**
 * @typedef {Object} BonusRewardResult
 * @property {string} description
 * @property {number} [gold]
 * @property {import('../../data/equipment').EquipmentItem} [equipment]
 * @property {string} [consumable]
 */

/**
 * @typedef {Object} MilestoneRewardResult
 * @property {number} gold
 * @property {import('../../data/equipment').EquipmentItem} equipment
 */

// ===== Validation Helpers =====

/**
 * Checks if a value is a valid positive finite number and not NaN.
 * @param {unknown} value
 * @returns {value is number}
 */
const isPositiveFinite = (value) =>
  typeof value === 'number' && Number.isFinite(value) && value > 0;

/**
 * Checks if a value is a valid non‑negative integer.
 * @param {unknown} value
 * @returns {value is number}
 */
const isNonNegativeInteger = (value) =>
  typeof value === 'number' && Number.isInteger(value) && value >= 0;

/**
 * Checks if a value is a valid positive integer.
 * @param {unknown} value
 * @returns {value is number}
 */
const isPositiveInteger = (value) =>
  typeof value === 'number' && Number.isInteger(value) && value > 0;

/**
 * Validates that an object has the expected RewardCounters shape.
 * @param {unknown} obj
 * @returns {obj is RewardCounters}
 */
const isValidCounters = (obj) =>
  typeof obj === 'object' &&
  obj !== null &&
  isNonNegativeInteger(obj.rewardStreak) &&
  isNonNegativeInteger(obj.todayRewardCount) &&
  (obj.lastRewardDate === null || typeof obj.lastRewardDate === 'string');

/**
 * Validates that the duration is a positive finite number and not NaN.
 * @param {unknown} duration
 * @returns {boolean}
 */
const isValidDuration = (duration) =>
  isPositiveFinite(duration);

/**
 * Validates that a floor number is a positive integer.
 * @param {unknown} floor
 * @returns {boolean}
 */
const isValidFloor = (floor) => isPositiveInteger(floor);

/**
 * Validates that an equipment item has the required fields.
 * @param {unknown} item
 * @returns {item is import('../../data/equipment').EquipmentItem}
 */
const isValidEquipmentItem = (item) =>
  typeof item === 'object' &&
  item !== null &&
  typeof item.id === 'string' &&
  typeof item.name === 'string' &&
  (item.rarity === 'common' || item.rarity === 'uncommon' || item.rarity === 'rare' || item.rarity === 'legendary');

// ===== Persistence =====

/**
 * Loads reward counters from localStorage.
 * Falls back to defaults if data is missing, corrupt, or an error occurs.
 * @returns {RewardCounters}
 */
const loadCounters = () => {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (isValidCounters(parsed)) {
        return parsed;
      }
      logger.warn('AdventurePage: Invalid counters in localStorage, resetting to defaults.');
    }
  } catch (err) {
    logger.error('AdventurePage: Failed to load counters from localStorage.', {
      error: err instanceof Error ? err.message : String(err),
    });
  }
  return { rewardStreak: 0, todayRewardCount: 0, lastRewardDate: null };
};

/**
 * Saves reward counters to localStorage.
 * @param {RewardCounters} counters
 * @returns {void}
 */
const saveCounters = (counters) => {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(counters));
  } catch (err) {
    logger.error('AdventurePage: Failed to save counters to localStorage.', {
      error: err instanceof Error ? err.message : String(err),
    });
  }
};

/**
 * Determines if the reward date has changed (i.e., a new day has started).
 * @param {string|null} lastRewardDate - The date string of the last reward.
 * @returns {boolean}
 */
const isNewDay = (lastRewardDate) => {
  const today = new Date().toISOString().split('T')[0];
  return lastRewardDate !== today;
};

/**
 * Returns an updated set of counters, resetting daily counters if day changed.
 * @param {RewardCounters} current
 * @returns {RewardCounters}
 */
const resolveDailyCounters = (current) => {
  if (isNewDay(current.lastRewardDate)) {
    logger.debug('AdventurePage: New day detected, resetting daily reward count.');
    return { ...current, todayRewardCount: 0, lastRewardDate: new Date().toISOString() };
  }
  return current;
};

// ===== Bonus Rewards =====

/**
 * Returns the effective bonus chance based on current streak.
 * @param {number} streak
 * @returns {number}
 */
const getEffectiveBonusChance = (streak) => {
  if (streak >= BONUS_MAX_STREAK) return BONUS_GUARANTEED_CHANCE;
  return Math.min(BONUS_BASE_CHANCE + streak * BONUS_PITY_INCREMENT, BONUS_GUARANTEED_CHANCE);
};

/**
 * Rolls for a bonus reward. Returns true if bonus is awarded.
 * @param {number} streak - Current consecutive no-bonus sessions.
 * @returns {boolean}
 */
const rollForBonus = (streak) => {
  const chance = getEffectiveBonusChance(streak);
  const roll = Math.random();
  logger.debug('AdventurePage: Bonus roll', { streak, chance, roll });
  return roll < chance;
};

/**
 * Generates a random bonus reward description and payload.
 * Uses weighted selection: gold (40%), equipment (30%), consumable (30%).
 * @returns {BonusRewardResult}
 */
const generateBonusReward = () => {
  const options = ['gold', 'equipment', 'consumable'];
  const weights = [0.4, 0.3, 0.3];

  if (options.length !== weights.length) {
    logger.error('AdventurePage: options/weights length mismatch.');
    return { description: 'Bonus Reward: Something special!' };
  }
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  if (totalWeight <= 0) {
    logger.error('AdventurePage: Total weight for bonus rewards is non-positive.');
    return { description: 'Bonus Reward: Something special!' };
  }

  const randomValue = Math.random() * totalWeight;
  let cumulativeWeight = 0;
  let selectedOption = options[0];

  for (let i = 0; i < options.length; i++) {
    cumulativeWeight += weights[i];
    if (randomValue < cumulativeWeight) {
      selectedOption = options[i];
      break;
    }
  }

  switch (selectedOption) {
    case 'gold': {
      const gold = Math.floor(Math.random() * (BONUS_GOLD_MAX - BONUS_GOLD_MIN)) + BONUS_GOLD_MIN;
      return { description: `Bonus Reward: ${gold} gold!`, gold };
    }
    case 'equipment': {
      const commonEquipment = equipmentData.filter(
        (item) => isValidEquipmentItem(item) && item.rarity === 'common'
      );
      if (commonEquipment.length > 0) {
        const equipment =
          commonEquipment[Math.floor(Math.random() * commonEquipment.length)];
        return { description: `Bonus Reward: ${equipment.name} (Common)`, equipment };
      }
      // Fallback: gold if no common equipment
      const fallbackGold =
        Math.floor(Math.random() * (FALLBACK_GOLD_MAX - FALLBACK_GOLD_MIN)) +
        FALLBACK_GOLD_MIN;
      logger.warn('AdventurePage: No common equipment available, awarding gold instead.');
      return { description: `Bonus Reward: ${fallbackGold} gold!`, gold: fallbackGold };
    }
    case 'consumable': {
      const consumable =
        CONSUMABLES[Math.floor(Math.random() * CONSUMABLES.length)];
      return { description: `Bonus Reward: ${consumable}`, consumable };
    }
    default:
      logger.error(`AdventurePage: Unexpected bonus option "${selectedOption}".`);
      return { description: 'Bonus Reward: Something special!' };
  }
};

/**
 * Generates a random Uncommon or Rare equipment item for floor completion.
 * @returns {MilestoneRewardResult}
 * @throws {Error} If no eligible equipment items are found.
 */
const generateMilestoneReward = () => {
  const eligibleItems = equipmentData.filter(
    (item) =>
      isValidEquipmentItem(item) &&
      (item.rarity === 'uncommon' || item.rarity === 'rare')
  );

  if (eligibleItems.length === 0) {
    logger.error('AdventurePage: No Uncommon or Rare equipment items available for milestone reward.');
    throw new Error('No eligible equipment items for milestone reward.');
  }

  const equipment =
    eligibleItems[Math.floor(Math.random() * eligibleItems.length)];
  return {
    gold: FLOOR_COMPLETION_GOLD,
    equipment,
  };
};

// ===== Component =====

/**
 * AdventurePage component allowing players to log activities and advance floors.
 * Manages reward logic with anti-farming, pity timer, and milestone rewards.
 *
 * @returns {React.ReactElement} The rendered AdventurePage.
 */
const AdventurePage = () => {
  const { state, dispatch } = useContext(CharacterContext);

  // Initialize counters from localStorage
  const [counters, setCounters] = useState(() => resolveDailyCounters(loadCounters()));

  // Reward display state
  const [rewardDisplay, setRewardDisplay] = useState({
    guaranteed: null,
    bonus: null,
    milestone: null,
  });

  // Error state for user feedback
  const [error, setError] = useState(null);

  // Timer refs for auto-dismiss
  const rewardTimerRef = useRef(null);
  const errorTimerRef = useRef(null);

  // Persist counters on change
  useEffect(() => {
    saveCounters(counters);
  }, [counters]);

  // Clear display after timeout
  const scheduleRewardClear = useCallback(() => {
    if (rewardTimerRef.current) {
      clearTimeout(rewardTimerRef.current);
    }
    rewardTimerRef.current = setTimeout(() => {
      logger.debug('AdventurePage: Clearing reward display.');
      setRewardDisplay({ guaranteed: null, bonus: null, milestone: null });
    }, REWARD_DISMISS_TIMEOUT_MS);
  }, []);

  const scheduleErrorClear = useCallback(() => {
    if (errorTimerRef.current) {
      clearTimeout(errorTimerRef.current);
    }
    errorTimerRef.current = setTimeout(() => {
      logger.debug('AdventurePage: Clearing error display.');
      setError(null);
    }, ERROR_DISMISS_TIMEOUT_MS);
  }, []);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (rewardTimerRef.current) clearTimeout(rewardTimerRef.current);
      if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    };
  }, []);

  /**
   * Handle logging a session reward.
   * Validates duration, checks anti-farming, applies pity timer, rolls for bonus.
   * Dispatches ADD_SESSION state updates.
   *
   * @param {number} duration - Session duration in minutes.
   */
  const handleLogSession = useCallback(
    (duration) => {
      if (!isValidDuration(duration)) {
        logger.warn('AdventurePage: Invalid duration provided to handleLogSession', { duration });
        setError('Invalid session duration. Please enter a positive number.');
        scheduleErrorClear();
        return;
      }

      // Resolve daily counters (reset if new day)
      const resolvedCounters = resolveDailyCounters(counters);

      if (resolvedCounters.todayRewardCount >= MAX_GUARANTEED_REWARDS_PER_DAY) {
        logger.warn('AdventurePage: Anti-farming limit reached, no guaranteed reward.', {
          todayRewardCount: resolvedCounters.todayRewardCount,
        });
        setError('Daily reward limit reached (max 2 per day). Come back tomorrow!');
        scheduleErrorClear();
        return;
      }

      // Calculate gold reward
      const goldReward = Math.floor(duration * GOLD_PER_MINUTE);
      const guaranteedDescription = `Guaranteed Reward: ${goldReward} gold for ${duration} min session.`;

      logger.info('AdventurePage: Processing session reward', {
        duration,
        goldReward,
        todayRewardCount: resolvedCounters.todayRewardCount,
        streak: resolvedCounters.rewardStreak,
      });

      // Pity timer
      const gotBonus = rollForBonus(resolvedCounters.rewardStreak);
      let bonusDescription = null;
      let bonusGold = 0;
      let bonusEquipment = null;
      let bonusConsumable = null;

      if (gotBonus) {
        const bonus = generateBonusReward();
        bonusDescription = bonus.description;
        if (bonus.gold) bonusGold = bonus.gold;
        if (bonus.equipment) bonusEquipment = { ...bonus.equipment };
        if (bonus.consumable) bonusConsumable = bonus.consumable;

        logger.info('AdventurePage: Bonus reward awarded', {
          bonusDescription,
          bonusGold,
          bonusEquipment: bonusEquipment?.name,
          bonusConsumable,
        });
      }

      // Update counters
      const newStreak = gotBonus ? 0 : resolvedCounters.rewardStreak + 1;
      const newTodayCount = resolvedCounters.todayRewardCount + 1;
      const newCounters = {
        rewardStreak: newStreak,
        todayRewardCount: newTodayCount,
        lastRewardDate: new Date().toISOString(),
      };

      setCounters(newCounters);

      // Dispatch ADD_SESSION to context (handles gold, equipment, etc.)
      const sessionPayload = {
        duration,
        gold: goldReward + bonusGold,
        equipment: bonusEquipment || null,
        consumable: bonusConsumable || null,
      };

      try {
        dispatch({ type: 'ADD_SESSION', payload: sessionPayload });
      } catch (err) {
        logger.error('AdventurePage: Failed to dispatch ADD_SESSION', {
          error: err instanceof Error ? err.message : String(err),
        });
        setError('An unexpected error occurred while logging your session. Please try again.');
        scheduleErrorClear();
        return;
      }

      // Show reward display
      setRewardDisplay({
        guaranteed: guaranteedDescription,
        bonus: bonusDescription,
        milestone: null,
      });
      scheduleRewardClear();
    },
    [counters, dispatch, scheduleRewardClear, scheduleErrorClear]
  );

  /**
   * Handle advancing a floor.
   * Validates floor number, generates milestone reward (gold + equipment),
   * dispatches ADVANCE_FLOOR state update, and updates reward display.
   */
  const handleAdvanceFloor = useCallback(() => {
    // Current floor from context state
    const currentFloor = state.floor || 0;
    if (!isValidFloor(currentFloor)) {
      logger.warn('AdventurePage: Invalid current floor in state', { currentFloor });
      setError('Invalid floor state. Please reload the page.');
      scheduleErrorClear();
      return;
    }

    logger.info('AdventurePage: Advancing floor', { currentFloor });

    let milestoneReward;
    try {
      milestoneReward = generateMilestoneReward();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      logger.error('AdventurePage: Failed to generate milestone reward', { error: message });
      setError('Could not generate floor completion reward. Please try again.');
      scheduleErrorClear();
      return;
    }

    const milestoneGold = milestoneReward.gold;
    const milestoneEquipment = milestoneReward.equipment;
    const milestoneDescription = `Floor ${currentFloor} Complete! Rewards: ${milestoneGold} gold + ${milestoneEquipment.name} (${milestoneEquipment.rarity})`;

    logger.info('AdventurePage: Milestone reward generated', {
      milestoneGold,
      milestoneEquipment: milestoneEquipment.name,
    });

    // Dispatch ADVANCE_FLOOR
    try {
      dispatch({
        type: 'ADVANCE_FLOOR',
        payload: {
          gold: milestoneGold,
          equipment: { ...milestoneEquipment },
        },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error('AdventurePage: Failed to dispatch ADVANCE_FLOOR', { error: message });
      setError('An error occurred while advancing the floor. Please try again.');
      scheduleErrorClear();
      return;
    }

    // Show milestone reward display
    setRewardDisplay({
      guaranteed: null,
      bonus: null,
      milestone: milestoneDescription,
    });
    scheduleRewardClear();
  }, [state.floor, dispatch, scheduleRewardClear, scheduleErrorClear]);

  // Compute pity timer progress
  const pityProgress = useMemo(() => {
    const needed = BONUS_MAX_STREAK - counters.rewardStreak;
    if (needed <= 0) {
      return "Guaranteed bonus on next session!";
    }
    return `${needed} session${needed === 1 ? '' : 's'} until guaranteed bonus`;
  }, [counters.rewardStreak]);

  // Player inventory summary
  const inventorySummary = useMemo(() => {
    if (!state.inventory || state.inventory.length === 0) {
      return "No items";
    }
    return `${state.inventory.length} item${state.inventory.length === 1 ? '' : 's'}`;
  }, [state.inventory]);

  // Memoize children to avoid unnecessary re-renders
  const activityLogger = useMemo(() => {
    return (
      <ActivityLogger onLogSession={handleLogSession} />
    );
  }, [handleLogSession]);

  const rewardNotification = useMemo(() => {
    return (
      <RewardNotification
        guaranteed={rewardDisplay.guaranteed}
        bonus={rewardDisplay.bonus}
        milestone={rewardDisplay.milestone}
      />
    );
  }, [rewardDisplay]);

  /** @type {React.CSSProperties} */
  const errorStyle = {
    color: 'red',
    marginTop: '1rem',
  };

  return (
    <div className="adventure-page">
      <h1>Adventure Dashboard</h1>

      {/* Player Status Section */}
      <div className="player-status">
        <h2>Player Status</h2>
        <p><strong>Gold:</strong> {state.gold ?? 0}</p>
        <p><strong>Floor:</strong> {state.floor ?? 0}</p>
        <p><strong>Inventory:</strong> {inventorySummary}</p>
        <p className="pity-timer"><strong>Pity Timer:</strong> {pityProgress}</p>
      </div>

      <hr />

      {/* Activity Logger */}
      {activityLogger}

      {/* Floor Advance Button */}
      <button onClick={handleAdvanceFloor} className="advance-floor-button">
        Complete Current Floor
      </button>

      {/* Reward Notification */}
      {rewardNotification}

      {/* Error Display */}
      {error && (
        <div style={errorStyle} role="alert">
          {error}
        </div>
      )}
    </div>
  );
};

AdventurePage.propTypes = {
  // No props; uses context
};

export default AdventurePage;