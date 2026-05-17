import React from 'react';
import './DailyStreakIndicator.css';

/**
 * DailyStreakIndicator — Displays the daily streak and session progress.
 *
 * Shows:
 * - Current streak count with flame icon
 * - Today's session count (e.g., "1/2 sessions today")
 *
 * Props:
 *   streak: number — current rewardStreak from character state
 *   todayCount: number — todayRewardCount from character state
 *   maxSessions: number — maximum sessions allowed per day (default: 2)
 */
export default function DailyStreakIndicator({
  streak = 0,
  todayCount = 0,
  maxSessions = 2,
}) {
  const streakDisplay = streak > 0 ? streak : 0;
  const sessionDisplay = Math.min(todayCount, maxSessions);

  return (
    <div className="daily-streak-indicator" data-testid="daily-streak-indicator">
      {/* Streak display */}
      <div className="streak-display" data-testid="streak-display">
        <span className="streak-flame" aria-label="Streak">
          {streakDisplay > 0 ? '🔥' : '🔥'}
        </span>
        <span className="streak-count" data-testid="streak-count">
          {streakDisplay}
        </span>
        <span className="streak-label">streak</span>
      </div>

      {/* Session progress */}
      <div className="session-progress" data-testid="session-progress">
        <span className="session-icon">📋</span>
        <span className="session-text" data-testid="session-text">
          {sessionDisplay}/{maxSessions} sessions today
        </span>
      </div>
    </div>
  );
}
