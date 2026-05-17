/**
 * usePassiveNotification — Manages passive narrative notification display.
 *
 * Provides:
 * - passiveMessage: string|null — the current passive message to display
 * - dismissPassiveNotification: function — dismiss the current notification
 * - triggerPassiveNotification: function — trigger a passive notification if conditions allow
 *
 * Frequency limits (per spec section 9.3):
 * - Triggers after 2+ days of inactivity
 * - Maximum 1 per day
 * - Same message does not repeat within 7 days
 *
 * Persists to localStorage:
 * - `rpg_last_passive_dismissed` — timestamp of last dismissal
 * - `rpg_last_passive_message_key` — key of last shown message (floor + index)
 */

import { useState, useCallback, useRef } from 'react';

const STORAGE_LAST_DISMISSED_KEY = 'rpg_last_passive_dismissed';
const STORAGE_LAST_MESSAGE_KEY_KEY = 'rpg_last_passive_message_key';
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Generate a unique key for a message to track repetition.
 */
function getMessageKey(floorNumber, messageIndex) {
  return `floor_${floorNumber}_msg_${messageIndex}`;
}

function usePassiveNotification() {
  const [passiveMessage, setPassiveMessage] = useState(null);
  const passiveMessageRef = useRef(null);

  passiveMessageRef.current = passiveMessage;

  /**
   * Get the timestamp of the last passive notification dismissal.
   */
  function getLastDismissedTimestamp() {
    try {
      const stored = localStorage.getItem(STORAGE_LAST_DISMISSED_KEY);
      if (stored) return Number(stored);
    } catch {
      // ignore
    }
    return 0;
  }

  /**
   * Get the key of the last shown passive message.
   */
  function getLastMessageKey() {
    try {
      return localStorage.getItem(STORAGE_LAST_MESSAGE_KEY_KEY);
    } catch {
      return null;
    }
  }

  /**
   * Dismiss the passive notification and persist the timestamp.
   */
  const dismissPassiveNotification = useCallback(() => {
    setPassiveMessage(null);
    try {
      localStorage.setItem(STORAGE_LAST_DISMISSED_KEY, String(Date.now()));
    } catch {
      // ignore
    }
  }, []);

  /**
   * Try to trigger a passive notification for the given floor.
   * Only triggers if:
   * - No notification is currently showing
   * - The message hasn't been shown in the last 7 days
   *
   * Note: Frequency limiting (1/day) and inactivity threshold (2+ days)
   * are checked by the caller before calling this function.
   */
  const triggerPassiveNotification = useCallback((floorNumber) => {
    // Don't show if one is already active
    if (passiveMessageRef.current) return;

    const messages = [
      'The walls hum faintly, as if the tower itself is breathing.',
      'A path laid out by patient hands. You wonder who, and why.',
      'The embers pulse. They are counting. You feel it.',
      'Warmth reaches for you — not the warmth of fire, but the warmth of something that has been waiting.',
      'The crystals hum. They have opinions about you.',
      'The silence here has weight. It presses against your ears.',
      'The wind speaks in a language older than words. You almost understand.',
      'The tower reaches back. You feel its fingers on your shoulder.',
      'The water ripples. Something beneath is watching.',
      'The light pulses. It knows you are here. It has always known.',
    ];

    const messageKey = getMessageKey(floorNumber, 0);
    const lastKey = getLastMessageKey();

    // Check if this message was shown in the last 7 days
    if (lastKey && lastKey === messageKey) {
      const lastDismissed = getLastDismissedTimestamp();
      if (lastDismissed > 0) {
        const timeSinceDismiss = Date.now() - lastDismissed;
        if (timeSinceDismiss < SEVEN_DAYS_MS) return;
      }
    }

    // Pick a random message
    const randomIndex = Math.floor(Math.random() * messages.length);
    const message = messages[randomIndex];

    setPassiveMessage(message);

    // Persist the message key
    try {
      localStorage.setItem(STORAGE_LAST_MESSAGE_KEY_KEY, messageKey);
    } catch {
      // ignore
    }
  }, []);

  return {
    passiveMessage,
    dismissPassiveNotification,
    triggerPassiveNotification,
  };
}

export default usePassiveNotification;
