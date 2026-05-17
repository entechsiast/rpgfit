import React, { useState, useEffect, useCallback } from 'react';
import './CapMessage.css';

/**
 * CapMessage — Displays the anti-farming cap message with a dismiss button.
 *
 * Shows: "Daily reward cap reached — try again tomorrow!"
 * Auto-dismisses after 3 seconds or on manual dismiss.
 *
 * Props:
 *   onDismiss: function — called when dismissed
 */
export default function CapMessage({ onDismiss }) {
  const [phase, setPhase] = useState('enter'); // 'enter' | 'visible' | 'exit'

  const handleDismiss = useCallback(() => {
    setPhase('exit');
    setTimeout(() => {
      if (onDismiss) onDismiss();
    }, 350);
  }, [onDismiss]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPhase('exit');
      setTimeout(() => {
        if (onDismiss) onDismiss();
      }, 350);
    }, 3000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div
      className={`cap-message ${phase === 'exit' ? 'cap-message-exit' : ''}`}
      data-testid="cap-message"
      role="alert"
      aria-live="polite"
    >
      <div className="cap-message-icon">
        <span aria-hidden="true">🛡️</span>
      </div>
      <div className="cap-message-content">
        <h4 className="cap-message-title">Daily Reward Cap Reached</h4>
        <p className="cap-message-text">
          You've earned all today's rewards! Come back tomorrow for more.
        </p>
        <button
          className="cap-message-dismiss"
          onClick={handleDismiss}
          data-testid="btn-dismiss-cap"
          aria-label="Dismiss cap message"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
