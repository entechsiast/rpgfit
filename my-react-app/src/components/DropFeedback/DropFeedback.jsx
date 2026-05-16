import React, { useEffect, useState, useCallback } from 'react';
import GuaranteedBurst from './GuaranteedBurst';
import BonusGlow from './BonusGlow';
import MilestoneCutscene from './MilestoneCutscene';
import './dropFeedbackStyles.css';

/**
 * DropFeedback — Orchestrates drop reward animations.
 * Shows the appropriate animation based on reward type.
 * Respects the `animationEnabled` setting for accessibility.
 *
 * Props:
 *   reward: { type: 'guaranteed' | 'bonus' | 'milestone', ...rewardData }
 *   animationEnabled: boolean — if false, shows a simple text flash instead
 *   onComplete: callback when animation finishes
 *   duration: animation duration in ms (default: 2000)
 */
export default function DropFeedback({ reward, animationEnabled = true, onComplete, duration = 2000 }) {
  const [phase, setPhase] = useState('enter'); // 'enter' | 'visible' | 'exit' | 'done'

  const triggerExit = useCallback(() => {
    setPhase('exit');
    setTimeout(() => {
      setPhase('done');
      if (onComplete) onComplete();
    }, 400);
  }, [onComplete]);

  useEffect(() => {
    if (!animationEnabled) return;
    // Animate in immediately, then after duration, animate out
    const timer = setTimeout(() => triggerExit(), duration);
    return () => clearTimeout(timer);
  }, [animationEnabled, duration, triggerExit]);

  if (phase === 'done') return null;

  // --- Disabled animation mode: simple text flash ---
  if (!animationEnabled) {
    return (
      <div
        className={`drop-feedback-overlay ${phase === 'exit' ? 'drop-feedback-exit' : ''}`}
        data-testid="drop-feedback-disabled"
      >
        <div
          style={{
            background: 'rgba(0,0,0,0.7)',
            border: '2px solid #22c55e',
            borderRadius: '12px',
            padding: '16px 24px',
            color: '#fff',
            fontWeight: '700',
            fontSize: '1.1rem',
            textAlign: 'center',
            animation: phase === 'enter' ? 'rewardSlideIn 0.3s ease-out' : phase === 'exit' ? 'rewardFadeOut 0.4s ease-in forwards' : 'none',
          }}
        >
          {getRewardText(reward)}
        </div>
      </div>
    );
  }

  // --- Animation mode: render appropriate animation ---
  return (
    <div
      className={`drop-feedback-overlay ${phase === 'exit' ? 'drop-feedback-exit' : ''}`}
      data-testid={`drop-feedback-${reward.type}`}
    >
      {reward.type === 'milestone' ? (
        <MilestoneCutscene gold={reward.gold} itemName={reward.itemName} />
      ) : (
        <>
          {reward.type === 'guaranteed' ? (
            <GuaranteedBurst />
          ) : (
            <BonusGlow />
          )}
          {/* Reward text overlay */}
          <div
            style={{
              position: 'absolute',
              bottom: '15%',
              textAlign: 'center',
              color: '#fff',
              fontWeight: '800',
              fontSize: '1.3rem',
              textShadow: '0 2px 12px rgba(0,0,0,0.8)',
            }}
          >
            {getRewardText(reward)}
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Extract readable text from a reward object.
 */
function getRewardText(reward) {
  switch (reward.type) {
    case 'guaranteed':
      return `+${reward.gold?.toLocaleString() || 0} Gold`;
    case 'bonus':
      if (reward.bonusType === 'gold') {
        return `Bonus! +${reward.amount?.toLocaleString() || 0} Gold`;
      }
      if (reward.bonusType === 'equipment') {
        return `Bonus: ${reward.itemName || 'Item'}!`;
      }
      if (reward.bonusType === 'consumable') {
        return `Bonus: ${reward.itemName || 'Item'}!`;
      }
      return 'Bonus Reward!';
    case 'milestone':
      return `Floor Complete! +${reward.gold?.toLocaleString() || 0} Gold`;
    default:
      return 'Reward!';
  }
}
