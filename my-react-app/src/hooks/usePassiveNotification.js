import { useState, useEffect, useCallback, useRef } from 'react';
import { getRandomPassiveMessage } from '../data/passiveMessages';

// ─── Constants ───────────────────────────────────────────────────────────────
const STORAGE_KEY_LAST_NOTIFICATION = 'rpg_passive_last_notification';
const STORAGE_KEY_LAST_MESSAGE = 'rpg_passive_last_message';
const STORAGE_KEY_LAST_SHOWN_DATE = 'rpg_passive_last_shown_date';

// Default thresholds (in milliseconds)
const DEFAULT_INACTIVITY_THRESHOLD = 48 * 60 * 60 * 1000; // 48 hours
const DEFAULT_DAILY_COOLDOWN = 24 * 60 * 60 * 1000; // 24 hours
const DEFAULT_MESSAGE_COOLDOWN = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Read a value from localStorage.
 * @param {string} key
 * @returns {string|null}
 */
function readStorage(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

/**
 * Write a value to localStorage.
 * @param {string} key
 * @param {string} value
 */
function writeStorage(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Storage full or unavailable — silently ignore
  }
}

/**
 * usePassiveNotification — Hook that tracks player inactivity and triggers
 * curiosity-driven passive messages about the tower.
 *
 * Behavior:
 *   1. Tracks last player activity via mouse/keyboard/touch events.
 *   2. After 48 hours of inactivity, shows a passive message.
 *   3. Enforces a 24-hour daily cooldown (max 1 per day).
 *   4. Enforces a 7-day message cooldown (same message won't repeat within 7 days).
 *   5. Respects the current floor context (messages are floor-specific).
 *
 * @param {object} options
 * @param {number} [options.inactivityThreshold] — ms before showing a notification (default: 48h)
 * @param {number} [options.dailyCooldown] — ms cooldown between notifications (default: 24h)
 * @param {number} [options.messageCooldown] — ms cooldown for message repetition (default: 7 days)
 * @param {number} options.currentFloor — the player's current floor number
 * @param {boolean} [options.enabled] — whether to enable passive notifications (default: true)
 * @param {function} options.onNotification — called when a notification should be shown
 * @returns {object} — { activeMessage: string|null, dismiss: function }
 */
export default function usePassiveNotification({
  inactivityThreshold = DEFAULT_INACTIVITY_THRESHOLD,
  dailyCooldown = DEFAULT_DAILY_COOLDOWN,
  messageCooldown = DEFAULT_MESSAGE_COOLDOWN,
  currentFloor,
  enabled = true,
  onNotification,
}) {
  const [activeMessage, setActiveMessage] = useState(null);
  const lastActivityRef = useRef(Date.now());
  const initializedRef = useRef(false);

  // Load persisted state from localStorage on mount
  const lastNotificationTime = useRef(
    parseInt(readStorage(STORAGE_KEY_LAST_NOTIFICATION), 10) || 0
  );
  const lastMessage = useRef(readStorage(STORAGE_KEY_LAST_MESSAGE) || '');
  const lastShownDate = useRef(
    parseInt(readStorage(STORAGE_KEY_LAST_SHOWN_DATE), 10) || 0
  );

  // Mark as initialized after first render
  useEffect(() => {
    initializedRef.current = true;
  }, []);

  // Persist last notification timestamp to localStorage
  useEffect(() => {
    if (lastNotificationTime.current > 0) {
      writeStorage(STORAGE_KEY_LAST_NOTIFICATION, String(lastNotificationTime.current));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastNotificationTime]);

  useEffect(() => {
    if (lastShownDate.current > 0) {
      writeStorage(STORAGE_KEY_LAST_SHOWN_DATE, String(lastShownDate.current));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastShownDate]);

  // Track player activity
  useEffect(() => {
    if (!enabled) return;

    const updateActivity = () => {
      lastActivityRef.current = Date.now();
    };

    const events = ['mousedown', 'keydown', 'touchstart', 'scroll', 'mousemove'];
    events.forEach((evt) => {
      window.addEventListener(evt, updateActivity, { passive: true });
    });

    return () => {
      events.forEach((evt) => {
        window.removeEventListener(evt, updateActivity);
      });
    };
  }, [enabled]);

  // Check if cooldown has expired
  const hasDailyCooldownExpired = useCallback(() => {
    const now = Date.now();
    const elapsed = now - lastNotificationTime.current;
    return elapsed >= dailyCooldown;
  }, [dailyCooldown]);

  const hasMessageCooldownExpired = useCallback(() => {
    const now = Date.now();
    const elapsed = now - lastShownDate.current;
    return elapsed >= messageCooldown;
  }, [messageCooldown]);

  // Check if player is inactive long enough
  const isInactive = useCallback(() => {
    const elapsed = Date.now() - lastActivityRef.current;
    return elapsed >= inactivityThreshold;
  }, [inactivityThreshold]);

  // Periodically check for notification eligibility
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!enabled) return;

    const interval = setInterval(() => {
      setTick((t) => t + 1);
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [enabled]);

  // Determine if we should show a notification
  useEffect(() => {
    if (!enabled) return;

    // Skip until after mount (ref loaded from localStorage)
    if (!initializedRef.current) return;

    // If a notification is already active, don't show another
    if (activeMessage) return;

    // Must be inactive for the threshold period
    if (!isInactive()) return;

    // Daily cooldown check
    if (!hasDailyCooldownExpired()) return;

    // Message cooldown check
    if (!hasMessageCooldownExpired()) return;

    // Get a message that hasn't been shown recently
    const message = getRandomPassiveMessage(currentFloor);
    if (!message) return;
    if (message === lastMessage.current && !hasMessageCooldownExpired()) return;

    // Show the notification
    const now = Date.now();
    lastNotificationTime.current = now;
    lastShownDate.current = now;
    lastMessage.current = message;

    setActiveMessage(message);
    if (onNotification) onNotification(message);
  }, [tick, enabled, isInactive, hasDailyCooldownExpired, hasMessageCooldownExpired, currentFloor, activeMessage, onNotification]);

  // Dismiss the active notification
  const dismiss = useCallback(() => {
    setActiveMessage(null);
  }, []);

  return { activeMessage, dismiss };
}
