/**
 * useInactivityDetection — Tracks time since the player last interacted.
 *
 * Provides:
 * - lastActiveDate: string|null — ISO date of last activity (local time, date only)
 * - daysSinceLastActive: number — how many days since last activity
 * - updateActivity: function — call on any user interaction to update timestamp
 * - isInactivityWindow: (minDays, maxDays) => boolean — check if in a specific inactivity window
 *
 * Persists last active date to localStorage under `rpg_last_active_date`.
 *
 * Usage:
 * - Call updateActivity() on mount and on any user interaction
 * - Use isInactivityWindow(2, Infinity) for passive notification trigger (2+ days)
 * - Use isInactivityWindow(3, Infinity) for re-engagement NPC trigger (3+ days)
 */

import { useState, useCallback, useEffect } from 'react';

const STORAGE_LAST_ACTIVE_KEY = 'rpg_last_active_date';

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
function daysBetween(dateA, dateB) {
  if (!dateA || !dateB) return 0;
  const a = new Date(dateA + 'T00:00:00');
  const b = new Date(dateB + 'T00:00:00');
  const diffMs = b - a;
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

function useInactivityDetection() {
  const [lastActiveDate, setLastActiveDate] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_LAST_ACTIVE_KEY);
    } catch {
      return null;
    }
  });

  const today = getTodayLocal();
  const daysSinceLastActive = lastActiveDate ? daysBetween(lastActiveDate, today) : 0;

  /**
   * Update the last active date to today.
   * Call this on mount and on any meaningful user interaction.
   */
  const updateActivity = useCallback(() => {
    const today = getTodayLocal();
    setLastActiveDate(today);
    try {
      localStorage.setItem(STORAGE_LAST_ACTIVE_KEY, today);
    } catch {
      // localStorage may be unavailable
    }
  }, []);

  /**
   * Check if the current inactivity falls within a given range.
   * @param {number} minDays — minimum days of inactivity (inclusive)
   * @param {number|null} maxDays — maximum days of inactivity (inclusive), null = no upper bound
   * @returns {boolean}
   */
  const isInactivityWindow = useCallback(
    (minDays, maxDays) => {
      if (daysSinceLastActive < minDays) return false;
      if (maxDays !== null && daysSinceLastActive > maxDays) return false;
      return true;
    },
    [daysSinceLastActive]
  );

  // Update activity on mount
  useEffect(() => {
    updateActivity();
  }, [updateActivity]);

  return {
    lastActiveDate,
    daysSinceLastActive,
    updateActivity,
    isInactivityWindow,
  };
}

export default useInactivityDetection;
