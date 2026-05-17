import React, { useEffect, useState, useCallback } from 'react';
import './CelebrationNotification.css';

/**
 * CelebrationNotification — Parchment-style overlay displayed on floor completion.
 *
 * Displays the floor's unique celebration text (from the Tower 1 Design Spec)
 * on a parchment-style overlay with Georgia serif typography, golden glow,
 * and decorative accents.
 *
 * Per spec Appendix B: Georgia serif, 18px, #fff8e7 with golden glow.
 * Per spec section 9.2: Celebration notification type.
 *
 * The player can dismiss it at any time. It does not interrupt gameplay flow.
 *
 * Props:
 *   floorNumber: number — the floor that was just completed
 *   floorName: string — the name of the completed floor
 *   celebrationText: string — the verbatim celebration text for this floor
 *   onDismiss: function — called when the player dismisses the celebration
 */
export default function CelebrationNotification({
  floorNumber,
  floorName,
  celebrationText,
  onDismiss,
}) {
  const [phase, setPhase] = useState('enter'); // 'enter' | 'visible' | 'exit'

  const handleDismiss = useCallback(() => {
    setPhase('exit');
    setTimeout(() => {
      if (onDismiss) onDismiss();
    }, 350);
  }, [onDismiss]);

  // Keyboard support: Escape to dismiss
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && phase === 'visible') {
        handleDismiss();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase, handleDismiss]);

  if (phase === 'exit') {
    return (
      <div
        className="celebration-notification exiting"
        data-testid="celebration-notification"
        role="dialog"
        aria-modal="true"
        aria-label={`Floor ${floorNumber} completion celebration`}
      >
        <div className="celebration-overlay" />
        <div className="celebration-parchment">
          <div className="celebration-floor-number">Floor {floorNumber}</div>
          <p className="celebration-floor-name">{floorName}</p>
          <div className="celebration-divider" />
          <p className="celebration-text">{celebrationText}</p>
          <button
            className="celebration-dismiss"
            onClick={handleDismiss}
            data-testid="btn-dismiss-celebration"
            aria-label="Dismiss celebration"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="celebration-notification"
      data-testid="celebration-notification"
      role="dialog"
      aria-modal="true"
      aria-label={`Floor ${floorNumber} completion celebration`}
    >
      <div className="celebration-overlay" />
      <div className="celebration-parchment">
        <div className="celebration-floor-number">Floor {floorNumber}</div>
        <p className="celebration-floor-name">{floorName}</p>
        <div className="celebration-divider" />
        <p className="celebration-text">{celebrationText}</p>
        <button
          className="celebration-dismiss"
          onClick={handleDismiss}
          data-testid="btn-dismiss-celebration"
          aria-label="Dismiss celebration"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
