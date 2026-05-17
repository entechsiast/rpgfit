/**
 * NpcDialogue — Dialogue display component with manhwa-style speech bubble
 *
 * Features:
 *   - Speech bubble with NPC name and dialogue text
 *   - "Continue" button to advance to next dialogue
 *   - "Dismiss" button to close the dialogue
 *   - "New" indicator for unmet dialogues
 *   - Manhwa-inspired styling (clean lines, subtle glow)
 *   - Typewriter text effect option
 *   - Smooth bubble entrance/exit animations
 *   - Optional auto-dismiss countdown (disabled by default)
 *   - NPC visual highlight when dialogue is active
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { NPC_ID, NPC_APPEARANCES } from '../../data/npcDialogues';
import NpcAvatar from '../NpcAvatar/NpcAvatar';
import './NpcDialogue.css';

// ─── Constants ─────────────────────────────────────────────────────────────

const AUTO_DISMISS_MS_DISABLED = 0;
const TYPEWRITER_SPEED_MS = 30;
const BUBBLE_ANIMATE_DELAY_MS = 50;

// ─── Component ─────────────────────────────────────────────────────────────

/**
 * @typedef {Object} NpcDialogueProps
 * @property {string} npcId - NPC ID
 * @property {Object[]|null} dialogues - Array of { dialogue, available, met } objects
 * @property {() => void} onShowNext - Callback to show next dialogue
 * @property {string} [activeDialogueId] - Currently shown dialogue ID
 * @property {boolean} [showAvatar] - Whether to show the NPC avatar
 * @property {boolean} [typewriter] - Whether to use typewriter text effect
 * @property {number} [autoDismiss] - Auto-dismiss timeout in ms (default: 0 = disabled)
 * @property {() => void} [onDismiss] - Callback when dialogue is dismissed
 * @property {boolean} [isActive] - Whether this NPC's dialogue is currently active
 * @property {boolean} [hasMoreDialogues] - Whether there are more dialogues to show
 * @property {() => void} [onContinue] - Callback for the Continue button
 */

/**
 * Displays an NPC dialogue in a manhwa-style speech bubble.
 * @param {NpcDialogueProps} props
 */
const NpcDialogue = React.memo(function NpcDialogue({
  npcId,
  dialogues,
  onShowNext,
  activeDialogueId,
  showAvatar = true,
  typewriter = false,
  autoDismiss = AUTO_DISMISS_MS_DISABLED,
  onDismiss,
  isActive = false,
  hasMoreDialogues = false,
  onContinue,
}) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(autoDismiss);
  const [isAnimating, setIsAnimating] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const timerRef = useRef(null);
  const typeRef = useRef(null);
  const animTimerRef = useRef(null);

  const activeDialogue = dialogues?.find(
    (d) => d.dialogue.id === activeDialogueId
  );

  const appearance = NPC_APPEARANCES[npcId] || NPC_APPEARANCES[NPC_ID.MERCHANT];

  // Reset timer when dialogue changes
  useEffect(() => {
    if (activeDialogueId) {
      // Trigger entrance animation
      setDismissed(false);
      animTimerRef.current = setTimeout(() => {
        setIsAnimating(true);
      }, BUBBLE_ANIMATE_DELAY_MS);

      setTimeRemaining(autoDismiss);

      // Handle typewriter effect
      if (typewriter && activeDialogue) {
        setIsTyping(true);
        setDisplayedText('');
        let charIndex = 0;
        const text = activeDialogue.dialogue.text;

        typeRef.current = setInterval(() => {
          if (charIndex < text.length) {
            setDisplayedText(text.slice(0, charIndex + 1));
            charIndex++;
          } else {
            setIsTyping(false);
            clearInterval(typeRef.current);
            typeRef.current = null;
          }
        }, TYPEWRITER_SPEED_MS);
      } else {
        setIsTyping(false);
        setDisplayedText(activeDialogue?.dialogue.text || '');
      }

      // Auto-dismiss timer (only if autoDismiss > 0)
      if (autoDismiss > 0) {
        timerRef.current = setInterval(() => {
          setTimeRemaining((prev) => {
            if (prev <= 1) {
              clearInterval(timerRef.current);
              timerRef.current = null;
              onDismiss?.();
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } else {
      setDisplayedText('');
      setIsTyping(false);
      setIsAnimating(false);
    }

    return () => {
      if (animTimerRef.current) {
        clearTimeout(animTimerRef.current);
        animTimerRef.current = null;
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (typeRef.current) {
        clearInterval(typeRef.current);
        typeRef.current = null;
      }
    };
  }, [activeDialogueId, activeDialogue, typewriter, autoDismiss, onDismiss]);

  // Start exit animation when dismissed
  useEffect(() => {
    if (dismissed) {
      const t = setTimeout(() => {
        onDismiss?.();
      }, 300);
      return () => clearTimeout(t);
    }
  }, [dismissed, onDismiss]);

  // Handle manual dismiss
  const handleDismiss = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setDismissed(true);
  }, []);

  // Handle Continue button (advance to next dialogue)
  const handleContinue = useCallback(() => {
    if (isTyping) return;
    onContinue?.();
  }, [onContinue, isTyping]);

  // Handle click on bubble (cycle to next)
  const handleBubbleClick = useCallback(() => {
    // Don't allow cycling while typing
    if (isTyping) return;
    onShowNext();
  }, [onShowNext, isTyping]);

  // Check if there are unmet dialogues available
  const hasUnmet = dialogues?.some((d) => d.available && !d.met);

  if (!activeDialogueId || !activeDialogue) {
    // No active dialogue — show NPC with "has dialogue" indicator
    return (
      <div
        className={`npc-dialogue npc-dialogue--inactive${isActive ? ' npc-dialogue--focused' : ''}`}
        data-npc-id={npcId}
      >
        {showAvatar && (
          <div className="npc-dialogue__avatar-wrapper">
            <NpcAvatar npcId={npcId} pulse={hasUnmet} />
            {hasUnmet && <span className="npc-dialogue__new-badge">!</span>}
          </div>
        )}
      </div>
    );
  }

  const isNew = !activeDialogue.met;
  const progressPercent = autoDismiss > 0 ? (timeRemaining / autoDismiss) * 100 : 0;
  const bubbleClass = [
    'npc-dialogue__bubble',
    isAnimating ? 'npc-dialogue__bubble--enter' : '',
    dismissed ? 'npc-dialogue__bubble--exit' : '',
  ].filter(Boolean).join(' ');

  return (
    <div
      className={`npc-dialogue npc-dialogue--active${isActive ? ' npc-dialogue--focused' : ''}`}
      data-npc-id={npcId}
      data-new={isNew}
    >
      {/* Avatar */}
      {showAvatar && (
        <div className="npc-dialogue__avatar-wrapper">
          <NpcAvatar
            npcId={npcId}
            pulse={false}
            isActive={isActive}
            onClick={handleBubbleClick}
          />
          {hasUnmet && <span className="npc-dialogue__new-badge">!</span>}
        </div>
      )}

      {/* Dialogue bubble */}
      <div
        className={bubbleClass}
        onClick={handleBubbleClick}
        role="button"
        tabIndex={0}
        aria-label={displayedText}
      >
        {/* NPC name */}
        <div
          className="npc-dialogue__name"
          style={{ '--npc-glow': appearance.glowColor }}
        >
          {activeDialogue.met ? '' : <span className="npc-dialogue__new-tag">NEW</span>}
          <span className="npc-dialogue__name-text">
            {activeDialogue.dialogue.id.replace('_d', ' — ')}
          </span>
        </div>

        {/* Dialogue text */}
        <div className="npc-dialogue__body">
          <p className="npc-dialogue__text">
            {displayedText}
            {isTyping && <span className="npc-dialogue__cursor">|</span>}
          </p>
        </div>

        {/* Progress bar (auto-dismiss countdown, only when enabled) */}
        {autoDismiss > 0 && (
          <div className="npc-dialogue__progress">
            <div
              className="npc-dialogue__progress-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}

        {/* Action buttons */}
        <div className="npc-dialogue__actions">
          {/* Continue button — shown when there are more dialogues */}
          {hasMoreDialogues && (
            <button
              className="npc-dialogue__continue"
              onClick={(e) => {
                e.stopPropagation();
                handleContinue();
              }}
              aria-label="Continue to next dialogue"
              title="Continue"
              data-testid="npc-dialogue-continue"
            >
              Continue ▸
            </button>
          )}

          {/* Dismiss button */}
          <button
            className="npc-dialogue__dismiss"
            onClick={(e) => {
              e.stopPropagation();
              handleDismiss();
            }}
            aria-label="Dismiss dialogue"
            title="Dismiss"
            data-testid="npc-dialogue-dismiss"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
});

export default NpcDialogue;
