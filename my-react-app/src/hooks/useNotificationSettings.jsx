/**
 * useNotificationSettings — Manages narrative notification preferences.
 *
 * Provides:
 * - enabled: boolean — whether narrative notifications are enabled
 * - toggleNotifications: function — toggle enabled/disabled
 * - notificationsToday: number — count of notifications shown today
 * - lastNotificationDate: string|null — ISO date of last notification (for midnight reset)
 *
 * Persists to localStorage under `rpg_notifications_*` keys.
 * Frequency limit: max 1 per day, resets at midnight local time.
 */

import { useState, useCallback, useEffect } from 'react';

const STORAGE_ENABLED_KEY = 'rpg_notifications_enabled';
const STORAGE_LAST_NOTIF_DATE_KEY = 'rpg_last_notification_date';

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
 * Check if two dates are the same (local time, date only).
 */
function isSameDate(dateA, dateB) {
  if (!dateA || !dateB) return false;
  return dateA === dateB;
}

function useNotificationSettings() {
  const [enabled, setEnabled] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_ENABLED_KEY);
      if (stored === null) return true; // default: enabled
      return stored === 'true';
    } catch {
      return true;
    }
  });

  const [notificationsToday, setNotificationsToday] = useState(0);
  const [lastNotificationDate, setLastNotificationDate] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_LAST_NOTIF_DATE_KEY);
    } catch {
      return null;
    }
  });

  // Check if we need to reset the daily counter at midnight
  useEffect(() => {
    const today = getTodayLocal();
    if (lastNotificationDate && !isSameDate(lastNotificationDate, today)) {
      // Date has changed since last notification — reset counter
      setNotificationsToday(0);
    }
  }, [lastNotificationDate]);

  // Persist enabled state
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_ENABLED_KEY, String(enabled));
    } catch {
      // localStorage may be unavailable
    }
  }, [enabled]);

  /**
   * Toggle narrative notifications on/off.
   */
  const toggleNotifications = useCallback(() => {
    setEnabled((prev) => !prev);
  }, []);

  /**
   * Check if a notification should be shown.
   * Returns true if:
   * - Notifications are enabled
   * - Fewer than 1 notification has been shown today
   */
  const shouldShowNotification = useCallback(() => {
    if (!enabled) return false;

    const today = getTodayLocal();
    const storedDate = localStorage.getItem(STORAGE_LAST_NOTIF_DATE_KEY);
    if (storedDate && isSameDate(storedDate, today)) {
      return notificationsToday < 1;
    }

    return true;
  }, [enabled, notificationsToday]);

  /**
   * Record that a notification was shown today.
   * Caps at 1 per day (per spec section 9.3).
   * Uses localStorage as the source of truth to avoid React batching issues.
   */
  const recordNotification = useCallback(() => {
    const today = getTodayLocal();

    // Read from localStorage as source of truth (avoids React batching issues)
    const storedDate = localStorage.getItem(STORAGE_LAST_NOTIF_DATE_KEY);

    if (!storedDate || !isSameDate(storedDate, today)) {
      // New day or no previous notification — set today's date
      setNotificationsToday(1);
      setLastNotificationDate(today);
      try {
        localStorage.setItem(STORAGE_LAST_NOTIF_DATE_KEY, today);
      } catch {
        // ignore
      }
    } else {
      // Already shown today — cap at 1
      setNotificationsToday(1);
    }
  }, []);

  /**
   * Disable all narrative notifications.
   */
  const disableNotifications = useCallback(() => {
    setEnabled(false);
  }, []);

  /**
   * Enable all narrative notifications.
   */
  const enableNotifications = useCallback(() => {
    setEnabled(true);
  }, []);

  /**
   * Reset the daily counter (useful for testing).
   */
  const resetDailyCounter = useCallback(() => {
    setNotificationsToday(0);
    setLastNotificationDate(null);
    try {
      localStorage.removeItem(STORAGE_LAST_NOTIF_DATE_KEY);
    } catch {
      // ignore
    }
  }, []);

  return {
    enabled,
    notificationsToday,
    lastNotificationDate,
    shouldShowNotification,
    recordNotification,
    toggleNotifications,
    disableNotifications,
    enableNotifications,
    resetDailyCounter,
  };
}

export default useNotificationSettings;
