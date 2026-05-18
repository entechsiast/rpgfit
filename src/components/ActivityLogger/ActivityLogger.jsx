import React, { useState, useCallback, useEffect, useRef } from "react";
import { useCharacter } from "../../context/CharacterContext";

// ═══════════════════════════════════════════════════════════════════════════
// Constants
// ═══════════════════════════════════════════════════════════════════════════

/** API endpoint for session persistence (set via env or default). */
const API_ENDPOINT = process.env.REACT_APP_API_URL || "/api/sessions";

/** Gold earned per minute of activity. */
const GOLD_PER_MINUTE = 10;

/** Default maximum guaranteed rewards allowed per day (anti‑farming). */
const DEFAULT_MAX_DAILY_REWARDS = 2;

/** Base bonus chance (percentage). */
const PITY_BASE_CHANCE = 15;

/** Bonus chance increment per consecutive session without bonus. */
const PITY_INCREMENT = 15;

/** Maximum consecutive sessions without bonus before forced bonus. */
const PITY_MAX_STREAK = 5;

/** Feedback display duration in milliseconds. */
const FEEDBACK_DISPLAY_MS = 4000;

/** Minimum valid session duration in minutes. */
const MIN_DURATION = 1;

/** Maximum valid session duration in minutes (24 hours). */
const MAX_DURATION = 1440;

/** Floor completion gold reward. */
const FLOOR_COMPLETION_GOLD = 500;

/** LocalStorage key for reward persistence. */
const LS_REWARD_KEY = "aigon_reward_tracker";

/** Fallback for bonus generation when something fails. */
const DEFAULT_BONUS = { type: "extraGold", amount: 25, name: "consolation gold" };

/** Empty feedback state for initialization. */
const NO_FEEDBACK = { message: "", type: "" };

/** Difficulty options for session logging. */
const DIFFICULTY_OPTIONS = [
  { value: "easy", label: "Easy" },
  { value: "normal", label: "Normal" },
  { value: "hard", label: "Hard" },
  { value: "extreme", label: "Extreme" },
];

/** Error messages used across the component. Keep in one place for maintainability. */
const ER = {
  durationRequired: "Please enter a duration for the session.",
  durationInvalid: `Duration must be a whole number between ${MIN_DURATION} and ${MAX_DURATION} minutes.`,
  contextMissing: "Character context is not available.",
  unexpected: "An unexpected error occurred. Please try again.",
  floorAdvance: "Failed to advance floor. Please try again.",
  persistenceLoad: "Failed to load reward state from storage.",
  persistenceSave: "Failed to save reward state to storage.",
  apiSave: "Failed to persist session to API, saved locally instead.",
  apiLoad: "Failed to load persistence from API, falling back to local.",
};

// ═══════════════════════════════════════════════════════════════════════════
// Type Definitions (JSDoc) – for editors, linters, and human readers
// ═══════════════════════════════════════════════════════════════════════════

/**
 * @typedef {'extraGold'|'equipment'|'consumable'} BonusType
 */

/**
 * @typedef {Object} BonusReward
 * @property {BonusType} type
 * @property {number} [amount] - Gold amount if type is 'extraGold'.
 * @property {string} [rarity] - Rarity string for 'equipment'.
 * @property {string} [name] - Human readable name.
 */

/**
 * @typedef {Object} SessionRewards
 * @property {number} goldReward - Guaranteed gold (0 if daily limit reached).
 * @property {BonusReward|null} bonusReward - Bonus reward if awarded, else null.
 * @property {boolean} gotBonus - Whether a bonus was granted.
 * @property {number} newStreak - Updated consecutive sessions without bonus.
 * @property {number} newTodayCount - Updated guaranteed reward count for today.
 * @property {string} lastRewardDate - Today's date string (toDateString).
 * @property {boolean} eligibleForGuaranteed - Whether the gold reward was given.
 */

/**
 * @typedef {Object} RewardPersistence
 * @property {number} rewardStreak
 * @property {number} todayRewardCount
 * @property {string|null} lastRewardDate
 */

/**
 * @typedef {Object} DurationValidation
 * @property {boolean} valid
 * @property {number} value - Parsed integer in minutes.
 * @property {string|null} error - Error message.
 */

/**
 * @typedef {'success'|'bonus'|'milestone'|'error'|''} FeedbackType
 */

/**
 * @typedef {Object} FeedbackState
 * @property {string} message
 * @property {FeedbackType} type
 */

// ═══════════════════════════════════════════════════════════════════════════
// Storage Helpers (error‑safe, with logging, now with API fallback)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Attempt to load reward persistence from API, fallback to localStorage.
 * @returns {Promise<RewardPersistence>}
 */
async function loadRewardPersistence() {
  // Try API first
  try {
    const response = await fetch(`${API_ENDPOINT}/persistence`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
    });
    if (response.ok) {
      const data = await response.json();
      if (
        typeof data.rewardStreak === "number" &&
        typeof data.todayRewardCount === "number" &&
        (data.lastRewardDate === null || typeof data.lastRewardDate === "string")
      ) {
        return data;
      }
      throw new Error("Invalid API response schema");
    }
  } catch (err) {
    console.warn(ER.apiLoad, err);
  }

  // Fallback to localStorage
  try {
    const raw = localStorage.getItem(LS_REWARD_KEY);
    if (!raw) {
      return { rewardStreak: 0, todayRewardCount: 0, lastRewardDate: null };
    }
    const parsed = JSON.parse(raw);
    if (
      typeof parsed.rewardStreak !== "number" ||
      typeof parsed.todayRewardCount !== "number" ||
      (parsed.lastRewardDate !== null && typeof parsed.lastRewardDate !== "string")
    ) {
      throw new Error("Invalid persistence schema");
    }
    return parsed;
  } catch (err) {
    console.error(ER.persistenceLoad, err);
    return { rewardStreak: 0, todayRewardCount: 0, lastRewardDate: null };
  }
}

/**
 * Save reward persistence data to API and localStorage.
 * @param {RewardPersistence} data
 * @returns {Promise<boolean>} true if at least one save succeeded
 */
async function saveRewardPersistence(data) {
  let apiSuccess = false;
  // Try API
  try {
    const response = await fetch(`${API_ENDPOINT}/persistence`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "same-origin",
    });
    if (response.ok) {
      apiSuccess = true;
    } else {
      console.warn(ER.apiSave);
    }
  } catch (err) {
    console.warn(ER.apiSave, err);
  }

  // Always save locally as fallback
  try {
    localStorage.setItem(LS_REWARD_KEY, JSON.stringify(data));
    return true; // local always works unless storage full
  } catch (err) {
    console.error(ER.persistenceSave, err);
    return apiSuccess;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// Pure Helper Functions
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Generate a random bonus reward.
 * @returns {BonusReward}
 */
function generateBonusReward() {
  try {
    const roll = Math.floor(Math.random() * 3); // 0, 1, 2
    switch (roll) {
      case 0:
        return { type: "extraGold", amount: 50, name: "Bonus Gold" };
      case 1:
        return { type: "equipment", rarity: "Common", name: "Iron Boots" };
      case 2:
        return { type: "consumable", name: "Health Potion" };
      default:
        console.warn("generateBonusReward: unexpected roll value", roll);
        return DEFAULT_BONUS;
    }
  } catch (err) {
    console.error("Failed to generate bonus reward:", err);
    return DEFAULT_BONUS;
  }
}

/**
 * Pure business logic: compute rewards for a single session.
 * All decisions are derived from input state & duration; no side effects.
 *
 * @param {Object} state - Must contain rewardStreak, todayRewardCount, lastRewardDate.
 * @param {number} mins - Session duration in minutes (already validated integer).
 * @param {number} maxDailyRewards - Maximum guaranteed rewards per day.
 * @returns {SessionRewards}
 */
function calculateSessionRewards(state, mins, maxDailyRewards) {
  if (process.env.NODE_ENV === "development") {
    console.info("calculateSessionRewards called", { state, mins, maxDailyRewards });
  }

  const { rewardStreak, todayRewardCount, lastRewardDate } = state;

  // 1. Guaranteed gold (floor(duration * GOLD_PER_MINUTE))
  const goldReward = Math.floor(mins * GOLD_PER_MINUTE);

  // 2. Anti‑farming: max maxDailyRewards per calendar day
  const today = new Date().toDateString();
  const isSameDay = lastRewardDate === today;
  const eligibleForGuaranteed = isSameDay
    ? todayRewardCount < maxDailyRewards
    : true;
  const finalGold = eligibleForGuaranteed ? goldReward : 0;

  if (!eligibleForGuaranteed) {
    console.warn("Daily guaranteed reward limit reached for today:", today);
  }

  // 3. Pity timer – effective streak (resets if no session yesterday)
  const currentStreak = isSameDay ? rewardStreak : 0;

  // 4. Determine if a bonus reward is awarded
  let gotBonus;
  if (currentStreak >= PITY_MAX_STREAK) {
    gotBonus = true;
    console.info("Pity timer forced bonus (streak >= 5)");
  } else {
    const pityChance = PITY_BASE_CHANCE + currentStreak * PITY_INCREMENT;
    const roll = Math.random() * 100;
    gotBonus = roll < pityChance;
  }

  // 5. Generate bonus reward if applicable
  const bonusReward = gotBonus ? generateBonusReward() : null;

  // 6. Update streak
  const newStreak = gotBonus ? 0 : currentStreak + 1;

  // 7. Update daily guaranteed reward count
  const newTodayCount = isSameDay
    ? todayRewardCount + (eligibleForGuaranteed ? 1 : 0)
    : 1; // first session of the day always increments to 1

  if (process.env.NODE_ENV === "development") {
    console.info("Session rewards computed", {
      goldReward: finalGold,
      gotBonus,
      bonusReward,
      newStreak,
      newTodayCount,
    });
  }

  return {
    goldReward: finalGold,
    bonusReward,
    gotBonus,
    newStreak,
    newTodayCount,
    lastRewardDate: today,
    eligibleForGuaranteed,
  };
}

/**
 * Build a human readable feedback message from reward data.
 * Bonus notification is kept distinct from the guaranteed reward message.
 *
 * @param {SessionRewards} rewards
 * @returns {string}
 */
function buildFeedbackMessage(rewards) {
  const parts = [];

  if (rewards.eligibleForGuaranteed && rewards.goldReward > 0) {
    parts.push(`🎖️ Guaranteed: +${rewards.goldReward} gold`);
  } else if (!rewards.eligibleForGuaranteed) {
    parts.push("⚠️ Daily guaranteed limit reached – no gold this session");
  }

  if (rewards.gotBonus && rewards.bonusReward) {
    const bonus = rewards.bonusReward;
    switch (bonus.type) {
      case "extraGold":
        parts.push(`⚡ Bonus: +${bonus.amount} extra gold`);
        break;
      case "equipment":
        parts.push(`⚡ Bonus: ${bonus.rarity} item — ${bonus.name}`);
        break;
      case "consumable":
        parts.push(`⚡ Bonus: ${bonus.name}`);
        break;
      default:
        parts.push(`⚡ Bonus: ${bonus.name || "Mystery reward"}`);
    }
  }

  return parts.length > 0 ? parts.join(" | ") : "✅ Session logged, no new rewards.";
}

/**
 * Validate and parse a session duration input.
 * @param {string} input - Raw user input.
 * @returns {DurationValidation}
 */
function validateDuration(input) {
  if (!input || input.trim() === "") {
    return { valid: false, value: 0, error: ER.durationRequired };
  }
  const trimmed = input.trim();
  const num = Number(trimmed);
  if (!Number.isInteger(num) || !Number.isFinite(num)) {
    return { valid: false, value: NaN, error: ER.durationInvalid };
  }
  if (num < MIN_DURATION || num > MAX_DURATION) {
    return { valid: false, value: num, error: ER.durationInvalid };
  }
  return { valid: true, value: num, error: null };
}

/**
 * Generate a random equipment item of Uncommon or Rare rarity.
 * @returns {Object} equipment object with name, rarity, type.
 */
function generateMilestoneEquipment() {
  try {
    const rarities = ["Uncommon", "Rare"];
    const rarity = rarities[Math.floor(Math.random() * rarities.length)];
    const equipmentNames = [
      "Steel Sword", "Elven Bow", "Mage Staff", "Leather Armor", "Silver Shield",
      "Amulet of Power", "Boots of Speed", "Ring of Focus",
    ];
    const name = equipmentNames[Math.floor(Math.random() * equipmentNames.length)];
    return { name, rarity, type: "equipment" };
  } catch (err) {
    console.error("Failed to generate milestone equipment:", err);
    return { name: "Basic Sword", rarity: "Common", type: "equipment" };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// Error Boundary Component (optional but recommended for production)
// ═══════════════════════════════════════════════════════════════════════════

class RewardErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("RewardErrorBoundary caught an error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <p>Something went wrong. Please refresh and try again.</p>
          <button onClick={() => this.setState({ hasError: false, error: null })}>
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════════════════

/**
 * ActivityLogger component – handles session logging with reward logic
 * and floor advancement milestone rewards.
 *
 * Now collects difficulty and activities performed on each session,
 * uses context's getLimit for anti‑farming, and persists via API with local fallback.
 *
 * @component
 * @returns {React.ReactElement}
 */
function ActivityLogger() {
  // ── Context ──────────────────────────────────────────────────────────────
  const characterContext = useCharacter();
  if (!characterContext) {
    console.error(ER.contextMissing);
    return null;
  }
  const { dispatch, state } = characterContext;

  // Retrieve daily session limit from context (with fallback)
  const maxDailySessions = state.getLimit
    ? state.getLimit()
    : DEFAULT_MAX_DAILY_REWARDS;

  // ── State ─────────────────────────────────────────────────────────────────
  const [durationInput, setDurationInput] = useState("");
  const [difficulty, setDifficulty] = useState(DIFFICULTY_OPTIONS[0].value);
  const [activities, setActivities] = useState("");
  const [feedback, setFeedback] = useState(NO_FEEDBACK);
  const [isLogging, setIsLogging] = useState(false);
  const [isAdvancingFloor, setIsAdvancingFloor] = useState(false);
  const feedbackTimer = useRef(null);

  // Load persisted reward streak/count on mount (async)
  const [rewardPersistence, setRewardPersistence] = useState({ rewardStreak: 0, todayRewardCount: 0, lastRewardDate: null });
  useEffect(() => {
    loadRewardPersistence().then(setRewardPersistence);
  }, []);

  // ── Effects ───────────────────────────────────────────────────────────────

  // Persist reward state whenever it changes (async save)
  useEffect(() => {
    saveRewardPersistence(rewardPersistence).catch(console.warn);
  }, [rewardPersistence]);

  // Auto‑clear feedback after timeout
  useEffect(() => {
    if (feedback.message) {
      if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
      feedbackTimer.current = setTimeout(() => {
        setFeedback(NO_FEEDBACK);
      }, FEEDBACK_DISPLAY_MS);
    }
    return () => {
      if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    };
  }, [feedback]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  /**
   * Log an activity session: collect duration, difficulty, activities,
   * compute rewards, dispatch to context, persist via API, show feedback.
   * @returns {Promise<void>}
   */
  const handleLogSession = useCallback(async () => {
    try {
      setIsLogging(true);

      // Validate input
      const validation = validateDuration(durationInput);
      if (!validation.valid) {
        setFeedback({ message: validation.error, type: "error" });
        setIsLogging(false);
        return;
      }

      const mins = validation.value;
      const selectedDifficulty = difficulty;
      const activitiesPerformed = activities.trim();

      // Compute rewards using pure function with dynamic max daily limit
      const rewards = calculateSessionRewards(rewardPersistence, mins, maxDailySessions);

      // Dispatch ADD_SESSION action with all session data
      dispatch({
        type: "ADD_SESSION",
        payload: {
          duration: mins,
          difficulty: selectedDifficulty,
          activities: activitiesPerformed,
          gold: rewards.goldReward,
          bonusReward: rewards.bonusReward,
          gotBonus: rewards.gotBonus,
        },
      });

      // Update persistence state
      const newPersistence = {
        rewardStreak: rewards.newStreak,
        todayRewardCount: rewards.newTodayCount,
        lastRewardDate: rewards.lastRewardDate,
      };
      setRewardPersistence(newPersistence);

      // Build and show feedback
      const message = buildFeedbackMessage(rewards);
      const feedbackType = rewards.gotBonus ? "bonus" : "success";
      setFeedback({ message, type: feedbackType });

      // Clear inputs
      setDurationInput("");
      setDifficulty(DIFFICULTY_OPTIONS[0].value);
      setActivities("");

      if (process.env.NODE_ENV === "development") {
        console.info("Session logged successfully", rewards);
      }
    } catch (err) {
      console.error("Failed to log session:", err);
      setFeedback({ message: ER.unexpected, type: "error" });
    } finally {
      setIsLogging(false);
    }
  }, [durationInput, difficulty, activities, rewardPersistence, maxDailySessions, dispatch]);

  /**
   * Advance to the next floor: grant milestone rewards, dispatch, show celebration.
   * @returns {Promise<void>}
   */
  const handleAdvanceFloor = useCallback(async () => {
    try {
      setIsAdvancingFloor(true);

      // Generate milestone equipment
      const equipment = generateMilestoneEquipment();

      // Dispatch ADVANCE_FLOOR action with rewards
      dispatch({
        type: "ADVANCE_FLOOR",
        payload: {
          gold: FLOOR_COMPLETION_GOLD,
          equipment,
        },
      });

      // Show celebration feedback
      const message = `🎉 Floor completed! +${FLOOR_COMPLETION_GOLD} gold & ${equipment.rarity} ${equipment.name}`;
      setFeedback({ message, type: "milestone" });

      if (process.env.NODE_ENV === "development") {
        console.info("Floor advanced successfully", { gold: FLOOR_COMPLETION_GOLD, equipment });
      }
    } catch (err) {
      console.error(ER.floorAdvance, err);
      setFeedback({ message: ER.unexpected, type: "error" });
    } finally {
      setIsAdvancingFloor(false);
    }
  }, [dispatch]);

  /**
   * Handle input change with basic sanitization.
   * @param {React.ChangeEvent<HTMLInputElement} e
   */
  const handleDurationChange = useCallback((e) => {
    const value = e.target.value;
    const sanitized = value.replace(/[^0-9]/g, "");
    setDurationInput(sanitized);
  }, []);

  /**
   * Handle difficulty selection change.
   * @param {React.ChangeEvent<HTMLSelectElement} e
   */
  const handleDifficultyChange = useCallback((e) => {
    setDifficulty(e.target.value);
  }, []);

  /**
   * Handle activities text input.
   * @param {React.ChangeEvent<HTMLTextAreaElement} e
   */
  const handleActivitiesChange = useCallback((e) => {
    setActivities(e.target.value);
  }, []);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <RewardErrorBoundary>
      <div className="activity-logger">
        <h2>Log Activity Session</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleLogSession();
          }}
        >
          <label htmlFor="session-duration">Duration (minutes):</label>
          <input
            id="session-duration"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={durationInput}
            onChange={handleDurationChange}
            placeholder={`${MIN_DURATION}–${MAX_DURATION}`}
            aria-label="Session duration in minutes"
            disabled={isLogging}
            autoComplete="off"
          />

          <label htmlFor="session-difficulty">Difficulty:</label>
          <select
            id="session-difficulty"
            value={difficulty}
            onChange={handleDifficultyChange}
            disabled={isLogging}
          >
            {DIFFICULTY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <label htmlFor="session-activities">Activities performed (optional):</label>
          <textarea
            id="session-activities"
            value={activities}
            onChange={handleActivitiesChange}
            placeholder="e.g. solved puzzles, fought monsters"
            rows={2}
            disabled={isLogging}
          />

          <button type="submit" disabled={isLogging || !durationInput.trim()}>
            {isLogging ? "Logging..." : "Log Session"}
          </button>
        </form>

        <hr />

        <h2>Advance Floor</h2>
        <button onClick={handleAdvanceFloor} disabled={isAdvancingFloor}>
          {isAdvancingFloor ? "Advancing..." : "Complete Floor"}
        </button>

        {feedback.message && (
          <div
            className={`feedback feedback--${feedback.type}`}
            role="status"
            aria-live="polite"
          >
            {feedback.message}
          </div>
        )}

        {/* Optional: display current streak and daily count for player awareness */}
        <div className="reward-status">
          <span>🔥 Consecutive sessions without bonus: {rewardPersistence.rewardStreak}</span>
          <span>📅 Guaranteed rewards today: {rewardPersistence.todayRewardCount}/{maxDailySessions}</span>
        </div>
      </div>
    </RewardErrorBoundary>
  );
}

export default ActivityLogger;