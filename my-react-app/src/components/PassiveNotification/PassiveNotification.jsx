import React, { useCallback } from 'react';
import './PassiveNotification.css';

/**
 * PassiveNotification — Subtle floating notification that displays
 * curiosity-driven messages about the tower during periods of inactivity.
 *
 * Per spec Appendix B: Georgia serif, 15px, #d4a017 on parchment.
 * Per spec section 9.2: Narrative passive notification type.
 *
 * The player can dismiss it at any time. It does not interrupt gameplay flow.
 *
 * Props:
 *   message: string — the passive narrative message to display
 *   onDismiss: function — called when the player dismisses the notification
 */
export default function PassiveNotification({ message, onDismiss }) {
  const handleDismiss = useCallback(() => {
    if (onDismiss) onDismiss();
  }, [onDismiss]);

  // Keyboard support: Escape to dismiss
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleDismiss();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleDismiss]);

  return (
    <div
      className="passive-notification"
      data-testid="passive-notification"
      role="status"
      aria-live="polite"
      aria-label="Tower observation"
    >
      <div className="passive-notification-inner">
        <span className="passive-notification-icon">◈</span>
        <p className="passive-notification-text">{message}</p>
        <button
          className="passive-notification-dismiss"
          onClick={handleDismiss}
          data-testid="btn-dismiss-passive"
          aria-label="Dismiss observation"
          title="Dismiss"
        >
          ×
        </button>
      </div>
    </div>
  );
}
