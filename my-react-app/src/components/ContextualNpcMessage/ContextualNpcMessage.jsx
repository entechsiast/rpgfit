/**
 * ContextualNpcMessage — Floating contextual NPC message component
 *
 * Displays a brief, in-the-moment comment from an NPC near the NPC avatar.
 * Uses Georgia serif typography at 14px with white text and subtle glow,
 * matching the spec Appendix B typography guidelines.
 *
 * Per spec section 9.1: Messages must not interrupt active gameplay —
 * they appear as a subtle floating notification.
 *
 * Per spec section 9.2: Contextual message type for gameplay triggers.
 *
 * Props:
 *   message: { text: string, trigger: string } — The message to display
 *   onDismiss: function — Called when the message is dismissed/times out
 */

import React, { useEffect, useState, useCallback } from 'react';
import './ContextualNpcMessage.css';

const MESSAGE_DISPLAY_MS = 4000; // 4 seconds display time

/**
 * @typedef {Object} ContextualNpcMessageProps
 * @property {{ text: string, trigger: string }} message - The message object
 * @property {() => void} [onDismiss] - Callback when message is dismissed
 */

/**
 * Displays a contextual NPC message as floating text near the NPC.
 * @param {ContextualNpcMessageProps} props
 */
export default function ContextualNpcMessage({ message, onDismiss }) {
  const [phase, setPhase] = useState('enter'); // 'enter' | 'visible' | 'exit'

  const handleDismiss = useCallback(() => {
    setPhase('exit');
    setTimeout(() => {
      onDismiss?.();
    }, 400);
  }, [onDismiss]);

  // Auto-dismiss after display duration
  useEffect(() => {
    if (phase === 'exit') return;
    const timer = setTimeout(() => {
      setPhase('exit');
      setTimeout(() => {
        onDismiss?.();
      }, 400);
    }, MESSAGE_DISPLAY_MS);
    return () => clearTimeout(timer);
  }, [phase, onDismiss]);

  if (phase === 'exit') return null;

  const triggerLabel = {
    FLOOR_ENTRY: 'Floor Entry',
    COMBAT_START: 'Combat',
    FLOOR_COMPLETE: 'Floor Complete',
    DEATH: 'Death',
  }[message.trigger] || 'NPC';

  return (
    <div
      className={`contextual-npc-message contextual-npc-message--${phase}`}
      data-testid="contextual-npc-message"
      data-trigger={message.trigger}
      role="status"
      aria-live="polite"
      aria-label={`${triggerLabel}: ${message.text}`}
    >
      <div className="contextual-npc-message__badge">
        {triggerLabel}
      </div>
      <div className="contextual-npc-message__bubble">
        <p className="contextual-npc-message__text">
          {message.text}
        </p>
      </div>
      <button
        className="contextual-npc-message__dismiss"
        onClick={handleDismiss}
        aria-label="Dismiss message"
        title="Dismiss"
        data-testid="btn-dismiss-contextual-message"
      >
        ✕
      </button>
    </div>
  );
}
