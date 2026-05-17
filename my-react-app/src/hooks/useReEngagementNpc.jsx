/**
 * useReEngagementNpc — Manages the re-engagement NPC system.
 *
 * Triggers after 3+ consecutive days without a session.
 * Appears ONLY on the first return after the gap (not every return).
 * Provides a small gift upon dismissal.
 *
 * Frequency: Maximum 1 re-engagement period per absence.
 *
 * Persists to localStorage:
 * - `rpg_reengagement_shown` — boolean string
 * - `rpg_reengagement_date` — ISO date of last re-engagement
 * - `rpg_reengagement_reward` — JSON string of reward data
 */

import { useState, useCallback, useRef } from 'react';

const STORAGE_SHOWN_KEY = 'rpg_reengagement_shown';
const STORAGE_DATE_KEY = 'rpg_reengagement_date';
const STORAGE_REWARD_KEY = 'rpg_reengagement_reward';

const REENGAGEMENT_MESSAGES = [
  {
    npcName: 'Traveling Merchant',
    message: 'The traveling merchant stopped by during your rest. He left this for you.',
    reward: { type: 'gold', amount: 50, name: 'Gold Pouch' },
  },
  {
    npcName: 'Traveling Merchant',
    message: 'I explored a bit while you were away. Look what I found...',
    reward: { type: 'item', itemId: 'minor_health_potion', name: 'Minor Health Potion' },
  },
  {
    npcName: 'Old Sage',
    message: 'The tower has been quiet in your absence. I have preserved a small treasure for your return.',
    reward: { type: 'gold', amount: 75, name: 'Gold Pouch' },
  },
  {
    npcName: 'Tower Spirit',
    message: 'The stones remember your footsteps. A token of the tower\'s gratitude awaits you.',
    reward: { type: 'cosmetic', cosmeticId: 'dusty_cloak', name: 'Dusty Cloak' },
  },
];

/**
 * Get today's date as an ISO string (local time, date only).
 */
function getTodayLocal() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Calculate days between two ISO date strings (local time).
 */
// daysBetween is used for future extension

function useReEngagementNpc() {
  const [reEngagementData, setReEngagementData] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_REWARD_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return null;
  });

  const reEngagementDataRef = useRef(reEngagementData);
  reEngagementDataRef.current = reEngagementData;

  /**
   * Check if re-engagement has been shown for the current absence period.
   */
  function isReEngagementShown() {
    try {
      const stored = localStorage.getItem(STORAGE_SHOWN_KEY);
      if (stored === null) return false;
      return stored === 'true';
    } catch {
      return false;
    }
  }

  /**
   * Get the date of the last re-engagement.
   */
  function getLastReEngagementDate() {
    try {
      return localStorage.getItem(STORAGE_DATE_KEY);
    } catch {
      return null;
    }
  }

  /**
   * Check if a re-engagement should be triggered.
   * Conditions:
   * - No re-engagement is currently showing
   * - Re-engagement hasn't been shown for this absence period
   * - daysSinceLastActive >= 3
   *
   * @param {number} daysSinceLastActive
   * @returns {boolean}
   */
  function shouldTriggerReEngagement(daysSinceLastActive) {
    if (reEngagementDataRef.current) return false;
    if (isReEngagementShown()) return false;
    if (daysSinceLastActive < 3) return false;
    return true;
  }

  /**
   * Trigger the re-engagement NPC.
   * Selects a random message and stores the reward data.
   */
  const triggerReEngagement = useCallback(() => {
    const today = getTodayLocal();
    const randomIndex = Math.floor(Math.random() * REENGAGEMENT_MESSAGES.length);
    const data = REENGAGEMENT_MESSAGES[randomIndex];

    const rewardData = {
      ...data,
      date: today,
      timestamp: Date.now(),
    };

    setReEngagementData(rewardData);

    try {
      localStorage.setItem(STORAGE_SHOWN_KEY, 'true');
      localStorage.setItem(STORAGE_DATE_KEY, today);
      localStorage.setItem(STORAGE_REWARD_KEY, JSON.stringify(rewardData));
    } catch {
      // ignore
    }
  }, []);

  /**
   * Dismiss the re-engagement and persist the shown state.
   */
  const dismissReEngagement = useCallback(() => {
    setReEngagementData(null);
    try {
      localStorage.setItem(STORAGE_SHOWN_KEY, 'true');
    } catch {
      // ignore
    }
  }, []);

  /**
   * Reset re-engagement state (useful for testing or manual reset).
   */
  const resetReEngagement = useCallback(() => {
    setReEngagementData(null);
    try {
      localStorage.removeItem(STORAGE_SHOWN_KEY);
      localStorage.removeItem(STORAGE_DATE_KEY);
      localStorage.removeItem(STORAGE_REWARD_KEY);
    } catch {
      // ignore
    }
  }, []);

  return {
    reEngagementData,
    isReEngagementShown,
    getLastReEngagementDate,
    shouldTriggerReEngagement,
    triggerReEngagement,
    dismissReEngagement,
    resetReEngagement,
  };
}

export default useReEngagementNpc;

