/**
 * NpcDialogue — Dialogue display component with manhwa-style speech bubble
 *
 * Features:
 *   - Speech bubble with NPC name and dialogue text
 *   - Click to cycle through available dialogues
 *   - "New" indicator for unmet dialogues
 *   - Manhwa-inspired styling (clean lines, subtle glow)
 *   - Auto-dismiss after timeout (configurable)
 *   - Typewriter text effect option
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { NPC_ID, NPC_APPEARANCES } from '../data/npcDialogues';
import NpcAvatar from '../NpcAvatar/NpcAvatar';
import './NpcDialogue.css';

// ─── Constants ─────────────────────────────────────────────────────────────

const AUTO_DISMISS_MS = 8000;
const TYPEWRITER_SPEED_MS = 30;

// ─── Component ─────────────────────────────────────────────────────────────

/**
 * @typedef {Object} NpcDialogueProps
 * @property {string} npcId - NPC ID
 * @property {Object[]|null} dialogues - Array of { dialogue, available, met } objects
 * @property {() => void} onShowNext - Callback to show next dialogue
 * @property {string} [activeDialogueId] - Currently shown dialogue ID
 * @property {boolean} [showAvatar] - Whether to show the NPC avatar
 * @property {boolean} [typewriter] - Whether to use typewriter text effect
 * @property {number} [autoDismiss] - Auto-dismiss timeout in ms (default: 8000)
 * @property {() => void} [onDismiss] - Callback when dialogue is dismissed
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
  autoDismiss = AUTO_DISMISS_MS,
  onDismiss,
}) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(autoDismiss);
  const timerRef = useRef(null);
  const typeRef = useRef(null);

  const activeDialogue = dialogues?.find(
    (d) => d.dialogue.id === activeDialogueId
  );

  const appearance = NPC_APPEARANCES[npcId] || NPC_APPEARANCES[NPC_ID.MERCHANT];

  // Reset timer when dialogue changes
  useEffect(() => {
    if (activeDialogueId) {
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

      // Auto-dismiss timer
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
    } else {
      setDisplayedText('');
      setIsTyping(false);
    }

    return () => {
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

  // Handle manual dismiss
  const handleDismiss = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    onDismiss?.();
  }, [onDismiss]);

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
      <div className="npc-dialogue npc-dialogue--inactive" data-npc-id={npcId}>
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
  const progressPercent = (timeRemaining / autoDismiss) * 100;

  return (
    <div
      className="npc-dialogue npc-dialogue--active"
      data-npc-id={npcId}
      data-new={isNew}
    >
      {/* Avatar */}
      {showAvatar && (
        <div className="npc-dialogue__avatar-wrapper">
          <NpcAvatar
            npcId={npcId}
            pulse={false}
            onClick={handleBubbleClick}
          />
          {hasUnmet && <span className="npc-dialogue__new-badge">!</span>}
        </div>
      )}

      {/* Dialogue bubble */}
      <div
        className="npc-dialogue__bubble"
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

        {/* Progress bar (auto-dismiss countdown) */}
        <div className="npc-dialogue__progress">
          <div
            className="npc-dialogue__progress-fill"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Dismiss button */}
        <button
          className="npc-dialogue__dismiss"
          onClick={handleDismiss}
          aria-label="Dismiss dialogue"
          title="Dismiss"
        >
          ✕
        </button>
      </div>
    </div>
  );
});

export default NpcDialogue;
