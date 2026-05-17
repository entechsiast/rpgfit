/**
 * useContextualMessages — Hook for contextual NPC messages during gameplay
 *
 * Manages message pools, cooldowns, and trigger logic for contextual NPC
 * messages that appear at key gameplay moments.
 *
 * Features:
 *   - Rotates through message pools (2-3 messages per trigger type)
 *   - 30-second cooldown per message to prevent spam
 *   - Respects `animationEnabled` setting (disabled = no messages)
 *   - Tracks last message timestamp per trigger type
 *
 * Usage:
 *   const {
 *     message,          // Current active message object or null
 *     triggerMessage,   // Function to trigger a contextual message
 *     clearMessage,     // Function to dismiss the current message
 *   } = useContextualMessages(animationEnabled);
 *
 *   // Trigger on events:
 *   triggerMessage('FLOOR_ENTRY', currentFloor);
 *   triggerMessage('COMBAT_START');
 *   triggerMessage('FLOOR_COMPLETE');
 *   triggerMessage('DEATH');
 */

import { useState, useCallback, useRef } from 'react';
import { getMessagePool } from '../data/contextualMessages';

/**
 * @typedef {'FLOOR_ENTRY' | 'COMBAT_START' | 'FLOOR_COMPLETE' | 'DEATH'} ContextTrigger
 */

const MESSAGE_COOLDOWN_MS = 30000; // 30 seconds

/**
 * @typedef {Object} ContextualMessage
 * @property {string} text - The message text
 * @property {ContextTrigger} trigger - The trigger type
 * @property {number} timestamp - When the message was shown
 */

/**
 * Hook for contextual NPC messages.
 * @param {boolean} enabled - Whether contextual messages are enabled
 * @returns {{ message: ContextualMessage|null, triggerMessage: (trigger: ContextTrigger, floorNumber?: number) => void, clearMessage: () => void }}
 */
export default function useContextualMessages(enabled) {
  const [message, setMessage] = useState(null);
  const indexRef = useRef(0);
  const lastShownRef = useRef({});

  /**
   * Trigger a contextual message for the given event.
   * @param {ContextTrigger} trigger - The trigger type
   * @param {number} [floorNumber] - Floor number (for FLOOR_ENTRY)
   */
  const triggerMessage = useCallback(
    (trigger, floorNumber) => {
      if (!enabled) return;

      // Check cooldown
      const lastShown = lastShownRef.current[trigger];
      if (lastShown && Date.now() - lastShown < MESSAGE_COOLDOWN_MS) {
        return;
      }

      const pool = getMessagePool(trigger, floorNumber);
      if (!pool || pool.length === 0) return;

      // Rotate through messages using index to avoid repeated random picks
      const text = pool[indexRef.current % pool.length];
      indexRef.current += 1;

      const newMessage = { text, trigger, timestamp: Date.now() };
      setMessage(newMessage);
      lastShownRef.current[trigger] = Date.now();
    },
    [enabled]
  );

  /**
   * Clear the current contextual message.
   */
  const clearMessage = useCallback(() => {
    setMessage(null);
  }, []);

  return { message, triggerMessage, clearMessage };
}

export { MESSAGE_COOLDOWN_MS };
