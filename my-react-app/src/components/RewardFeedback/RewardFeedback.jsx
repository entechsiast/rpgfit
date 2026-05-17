import React, { useState, useEffect, useRef, useCallback } from 'react';
import DropFeedback from '../DropFeedback/DropFeedback';
import CelebrationNotification from '../CelebrationNotification/CelebrationNotification';
import CapMessage from './CapMessage';
import BonusItemNotification from './BonusItemNotification';
import './RewardFeedback.css';

/**
 * RewardFeedback — Watches character.rewardLog for new entries and renders
 * the appropriate visual feedback for each reward type.
 *
 * Handles:
 * - Gold reward animations (via DropFeedback)
 * - Bonus item notifications (via BonusItemNotification)
 * - Daily streak counter updates (via StreakUpdateIndicator)
 * - Anti-farming cap messages (via CapMessage)
 * - Floor advancement celebrations (via CelebrationNotification)
 *
 * All feedback auto-dismisses after 3 seconds (or on manual dismiss).
 *
 * Props:
 *   rewardLog: array — character.rewardLog from CharacterContext
 *   capReached: boolean — whether the daily cap was just reached
 *   animationEnabled: boolean — whether to show animations
 */
export default function RewardFeedback({
  rewardLog = [],
  capReached = false,
  animationEnabled = true,
}) {
  const [activeFeedback, setActiveFeedback] = useState(null);
  const prevLogLength = useRef(0);
  const capDismissed = useRef(false);

  // Watch for new reward log entries
  useEffect(() => {
    if (rewardLog.length > prevLogLength.current) {
      const lastEntry = rewardLog[rewardLog.length - 1];
      // Only process new entries that haven't been shown yet
      if (!activeFeedback || activeFeedback.timestamp !== lastEntry.timestamp) {
        setActiveFeedback({
          ...lastEntry,
          shownAt: Date.now(),
        });
      }
    }
    prevLogLength.current = rewardLog.length;
  }, [rewardLog, activeFeedback]);

  // Handle cap message separately (it doesn't come from rewardLog)
  useEffect(() => {
    if (capReached && !capDismissed.current) {
      capDismissed.current = true;
      setActiveFeedback({
        type: 'cap',
        timestamp: Date.now(),
        shownAt: Date.now(),
      });
      // Auto-dismiss after 3 seconds
      setTimeout(() => {
        setActiveFeedback(prev =>
          prev && prev.timestamp === Date.now() - 3000 ? null : prev
        );
      }, 3000);
    }
  }, [capReached]);

  // Auto-dismiss non-cap feedback after 3 seconds
  useEffect(() => {
    if (!activeFeedback || activeFeedback.type === 'cap') return;

    const timer = setTimeout(() => {
      setActiveFeedback(null);
      capDismissed.current = false; // Reset for next cap
    }, 3000);

    return () => clearTimeout(timer);
  }, [activeFeedback]);

  const handleDismiss = useCallback(() => {
    setActiveFeedback(null);
  }, []);

  const handleRewardComplete = useCallback(() => {
    // DropFeedback calls this when animation finishes
    // For non-milestone rewards, also auto-dismiss after animation
    if (activeFeedback?.type !== 'milestone') {
      setTimeout(() => {
        setActiveFeedback(null);
      }, 500);
    }
  }, [activeFeedback]);

  const handleDismissCelebration = useCallback(() => {
    setActiveFeedback(null);
  }, []);

  if (!activeFeedback) return null;

  // --- Cap message ---
  if (activeFeedback.type === 'cap') {
    return (
      <div
        className="reward-feedback-overlay"
        data-testid="reward-feedback-cap"
      >
        <CapMessage onDismiss={handleDismiss} />
      </div>
    );
  }

  // --- Milestone (floor advancement) ---
  if (activeFeedback.type === 'milestone') {
    return (
      <div data-testid="reward-feedback-milestone">
        <CelebrationNotification
          floorNumber={activeFeedback.floor || 0}
          floorName={activeFeedback.floorName || ''}
          celebrationText={activeFeedback.celebrationText || ''}
          onDismiss={handleDismissCelebration}
        />
      </div>
    );
  }

  // --- Bonus item notification ---
  if (activeFeedback.type === 'bonus') {
    return (
      <div
        className="reward-feedback-overlay"
        data-testid={`reward-feedback-bonus-${activeFeedback.bonusType}`}
      >
        <BonusItemNotification
          bonusType={activeFeedback.bonusType}
          item={activeFeedback.item || null}
          amount={activeFeedback.amount || null}
          animationEnabled={animationEnabled}
          onDismiss={handleDismiss}
        />
      </div>
    );
  }

  // --- Guaranteed gold reward (use DropFeedback pattern) ---
  return (
    <div
      className="reward-feedback-overlay"
      data-testid="reward-feedback-gold"
    >
      <DropFeedback
        reward={{
          type: 'guaranteed',
          gold: activeFeedback.gold || 0,
          timestamp: activeFeedback.timestamp,
        }}
        animationEnabled={animationEnabled}
        duration={1500}
        onComplete={handleRewardComplete}
      />
    </div>
  );
}
