import React from 'react';
import './dropFeedbackStyles.css';

/**
 * BonusGlow — Elaborate glow animation for bonus rewards.
 * Manhwa-style: pulsing core + spinning rings + sparkle particles.
 * Duration: ~1.5s, more visually rich than guaranteed burst.
 */
export default function BonusGlow() {
  // Sparkle positions around the center
  const sparkles = [
    { cx: '100', cy: '30' },
    { cx: '170', cy: '60' },
    { cx: '170', cy: '140' },
    { cx: '100', cy: '170' },
    { cx: '30', cy: '140' },
    { cx: '30', cy: '60' },
  ];

  return (
    <div className="bonus-glow" data-testid="bonus-glow">
      <svg viewBox="0 0 280 280" className="bonus-glow">
        {/* Flash layer */}
        <rect
          x="0" y="0" width="280" height="280"
          fill="#a855f7"
          className="glow-flash"
        />

        {/* Spinning rings */}
        <circle
          cx="140" cy="140" r="40"
          fill="none"
          stroke="#a855f7"
          strokeWidth="2"
          strokeDasharray="8 6"
          className="glow-ring"
        />
        <circle
          cx="140" cy="140" r="40"
          fill="none"
          stroke="#c084fc"
          strokeWidth="1.5"
          strokeDasharray="12 8"
          className="glow-ring"
        />
        <circle
          cx="140" cy="140" r="40"
          fill="none"
          stroke="#e9d5ff"
          strokeWidth="1"
          strokeDasharray="4 10"
          className="glow-ring"
        />

        {/* Pulsing core */}
        <circle
          cx="140" cy="140" r="25"
          fill="url(#bonusGradient)"
          className="glow-core"
        />

        {/* Glow gradient definition */}
        <defs>
          <radialGradient id="bonusGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#e9d5ff" />
            <stop offset="50%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#7e22ce" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Sparkle particles */}
        {sparkles.map((pos, i) => (
          <circle
            key={i}
            cx={pos.cx}
            cy={pos.cy}
            r={3 + (i % 2)}
            fill="#e9d5ff"
            className="glow-sparkle"
          />
        ))}

        {/* Inner sparkle */}
        <circle cx="140" cy="140" r="8" fill="#fff" className="glow-sparkle" />
      </svg>
    </div>
  );
}
