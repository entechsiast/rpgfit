import React from 'react';
import './dropFeedbackStyles.css';

/**
 * GuaranteedBurst — Simple particle burst for guaranteed rewards.
 * Manhwa-style: expanding rings + radiating dots + center pop.
 * Duration: ~1s, non-disruptive.
 */
export default function GuaranteedBurst() {
  // Dot directions for radiating particles
  const dotAngles = [
    { tx: '-60px', ty: '-60px' },
    { tx: '60px', ty: '-60px' },
    { tx: '-60px', ty: '60px' },
    { tx: '60px', ty: '60px' },
    { tx: '-90px', ty: '0px' },
    { tx: '90px', ty: '0px' },
    { tx: '0px', ty: '-90px' },
    { tx: '0px', ty: '90px' },
  ];

  return (
    <div className="guaranteed-burst" data-testid="guaranteed-burst">
      {/* Expanding rings */}
      <svg viewBox="0 0 200 200" className="guaranteed-burst">
        <circle
          cx="100" cy="100" r="30"
          fill="none"
          stroke="#22c55e"
          strokeWidth="3"
          className="burst-ring"
        />
        <circle
          cx="100" cy="100" r="30"
          fill="none"
          stroke="#4ade80"
          strokeWidth="2"
          className="burst-ring"
        />
        <circle
          cx="100" cy="100" r="30"
          fill="none"
          stroke="#86efac"
          strokeWidth="1.5"
          className="burst-ring"
        />
        {/* Radiating dots */}
        {dotAngles.map((angle, i) => (
          <circle
            key={i}
            cx="100" cy="100" r="4"
            fill="#22c55e"
            className="burst-dot"
            style={{
              '--tx': angle.tx,
              '--ty': angle.ty,
            }}
          />
        ))}
        {/* Center pop circle */}
        <circle
          cx="100" cy="100" r="20"
          fill="#22c55e"
          className="burst-center"
        />
      </svg>
    </div>
  );
}
