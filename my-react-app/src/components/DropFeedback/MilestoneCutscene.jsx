import React from 'react';
import './dropFeedbackStyles.css';

/**
 * MilestoneCutscene — Full-screen mini cutscene for milestone rewards.
 * Manhwa-style: dramatic entrance with light flash, floating particles,
 * layered text reveals, and reward display.
 * Duration: ~2s, most elaborate animation.
 */
function MilestoneCutscene({ gold, itemName }) {
  return (
    <div className="milestone-cutscene" data-testid="milestone-cutscene">
      {/* Dark background with gradient */}
      <div
        className="cutscene-bg"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(30, 0, 60, 0.95) 0%, rgba(10, 0, 30, 0.98) 100%)',
        }}
      />

      {/* Light flash */}
      <div
        className="cutscene-light"
        style={{
          background: 'radial-gradient(circle, rgba(234, 179, 8, 0.6) 0%, transparent 70%)',
        }}
      />

      {/* Floating particles */}
      <div className="cutscene-particles">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="cutscene-particle" />
        ))}
      </div>

      {/* Content */}
      <div className="cutscene-content">
        {/* Crown/star icon */}
        <div className="cutscene-icon">
          <svg width="80" height="80" viewBox="0 0 80 80">
            <defs>
              <linearGradient id="milestoneGold" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fde68a" />
                <stop offset="50%" stopColor="#eab308" />
                <stop offset="100%" stopColor="#a16207" />
              </linearGradient>
            </defs>
            <polygon
              points="40,5 48,28 72,28 52,42 60,65 40,52 20,65 28,42 8,28 32,28"
              fill="url(#milestoneGold)"
              stroke="#fde68a"
              strokeWidth="1"
            />
          </svg>
        </div>

        {/* Title */}
        <h2 className="cutscene-title" style={{ color: '#eab308' }}>
          FLOOR COMPLETE
        </h2>

        {/* Subtitle */}
        <p className="cutscene-subtitle" style={{ color: '#d4d4d8' }}>
          The path grows stronger...
        </p>

        {/* Rewards */}
        <div className="cutscene-rewards">
          <div className="cutscene-reward-item" style={{ borderColor: '#eab308' }}>
            <span style={{ color: '#eab308' }}>+{gold?.toLocaleString() || 500}</span> Gold
          </div>
          {itemName && (
            <div className="cutscene-reward-item" style={{ borderColor: '#a855f7' }}>
              <span style={{ color: '#c084fc' }}>★</span> {itemName}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MilestoneCutscene;
