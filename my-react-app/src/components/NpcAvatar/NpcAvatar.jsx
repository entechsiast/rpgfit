/**
 * NpcAvatar — SVG visual component for NPCs
 *
 * Renders a manhwa-styled NPC avatar with distinctive visual elements
 * for each NPC type (Merchant, Guide, Wanderer).
 *
 * Visual Design (Solo Leveling / Tower of God inspired):
 *   - Traveling Merchant: Patched cloak, cart silhouette, shadowed face
 *   - Tower Guide: Uniform with tower insignia, glowing lantern
 *   - Shadow Wanderer: Dark cloak, glowing eyes, shadow aura
 */

import React, { useMemo } from 'react';
import { NPC_ID, NPC_APPEARANCES } from '../../data/npcDialogues';
import './NpcAvatar.css';

// ─── SVG Visual Builders ───────────────────────────────────────────────────

/**
 * Build the SVG content for a given NPC type.
 * @param {string} npcId
 * @returns {string} SVG markup
 */
function buildNpcSvg(npcId) {
  switch (npcId) {
    case NPC_ID.MERCHANT:
      return buildMerchantSvg();
    case NPC_ID.GUIDE:
      return buildGuideSvg();
    case NPC_ID.WANDERER:
      return buildWandererSvg();
    default:
      return buildDefaultSvg();
  }
}

/**
 * Traveling Merchant — patched cloak, cart, shadowed face
 */
function buildMerchantSvg() {
  const { primaryColor, secondaryColor, glowColor } = NPC_APPEARANCES[NPC_ID.MERCHANT];
  return `
    <svg viewBox="0 0 120 160" xmlns="http://www.w3.org/2000/svg" class="npc-avatar-svg">
      <defs>
        <radialGradient id="merchantGlow" cx="50%" cy="40%" r="50%">
          <stop offset="0%" stop-color="${glowColor}" stop-opacity="0.3"/>
          <stop offset="100%" stop-color="${glowColor}" stop-opacity="0"/>
        </radialGradient>
        <linearGradient id="cloakGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${primaryColor}" stop-opacity="0.9"/>
          <stop offset="100%" stop-color="#5a4a10" stop-opacity="0.95"/>
        </linearGradient>
      </defs>
      <!-- Aura glow -->
      <circle cx="60" cy="80" r="55" fill="url(#merchantGlow)"/>
      <!-- Cart (behind) -->
      <rect x="15" y="110" width="90" height="35" rx="4" fill="#6b5a30" opacity="0.6"/>
      <rect x="20" y="105" width="80" height="10" rx="2" fill="#8b7d6b" opacity="0.5"/>
      <circle cx="30" cy="145" r="8" fill="#4a3a20" opacity="0.5"/>
      <circle cx="90" cy="145" r="8" fill="#4a3a20" opacity="0.5"/>
      <!-- Cloak body -->
      <path d="M35,50 Q30,80 25,140 L95,140 Q90,80 85,50 Z" fill="url(#cloakGrad)" stroke="${secondaryColor}" stroke-width="1" opacity="0.9"/>
      <!-- Patch on cloak -->
      <rect x="40" y="80" width="15" height="12" rx="2" fill="#7a6a20" opacity="0.7" transform="rotate(-5 47 86)"/>
      <rect x="65" y="100" width="12" height="10" rx="2" fill="#6b5a30" opacity="0.6" transform="rotate(3 71 105)"/>
      <!-- Pockets -->
      <rect x="30" y="115" width="14" height="10" rx="3" fill="#5a4a10" opacity="0.5" stroke="${secondaryColor}" stroke-width="0.5" stroke-opacity="0.4"/>
      <rect x="76" y="110" width="14" height="10" rx="3" fill="#5a4a10" opacity="0.5" stroke="${secondaryColor}" stroke-width="0.5" stroke-opacity="0.4"/>
      <!-- Hood -->
      <path d="M40,35 Q40,20 60,18 Q80,20 80,35 L80,50 Q70,45 60,45 Q50,45 40,50 Z" fill="#5a4a10" opacity="0.8"/>
      <!-- Face (shadowed) -->
      <ellipse cx="60" cy="48" rx="12" ry="14" fill="#3a3020" opacity="0.85"/>
      <!-- Eyes (subtle gleam) -->
      <ellipse cx="55" cy="46" rx="2" ry="1.5" fill="${glowColor}" opacity="0.5"/>
      <ellipse cx="65" cy="46" rx="2" ry="1.5" fill="${glowColor}" opacity="0.5"/>
      <!-- Scarf -->
      <path d="M45,60 Q60,65 75,60 L78,72 Q60,78 42,72 Z" fill="${secondaryColor}" opacity="0.6"/>
    </svg>
  `;
}

/**
 * Tower Guide — uniform, tower insignia, glowing lantern
 */
function buildGuideSvg() {
  const { primaryColor, secondaryColor, glowColor } = NPC_APPEARANCES[NPC_ID.GUIDE];
  return `
    <svg viewBox="0 0 120 160" xmlns="http://www.w3.org/2000/svg" class="npc-avatar-svg">
      <defs>
        <radialGradient id="guideGlow" cx="50%" cy="35%" r="50%">
          <stop offset="0%" stop-color="${glowColor}" stop-opacity="0.25"/>
          <stop offset="100%" stop-color="${glowColor}" stop-opacity="0"/>
        </radialGradient>
        <filter id="lanternGlow">
          <feGaussianBlur stdDeviation="3" result="blur"/>
          <feMerge>
            <feMergeNode in="blur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <!-- Aura glow -->
      <circle cx="60" cy="80" r="55" fill="url(#guideGlow)"/>
      <!-- Uniform body -->
      <path d="M38,45 Q35,70 32,140 L88,140 Q85,70 82,45 Z" fill="${primaryColor}" opacity="0.85" stroke="${secondaryColor}" stroke-width="0.5"/>
      <!-- Uniform collar -->
      <path d="M48,45 L60,55 L72,45 L68,42 L60,48 L52,42 Z" fill="${secondaryColor}" opacity="0.7"/>
      <!-- Tower insignia (small tower shape) -->
      <rect x="56" y="58" width="8" height="14" fill="${glowColor}" opacity="0.6"/>
      <rect x="54" y="56" width="12" height="3" rx="1" fill="${glowColor}" opacity="0.6"/>
      <polygon points="60,52 55,56 65,56" fill="${glowColor}" opacity="0.5"/>
      <!-- Face -->
      <ellipse cx="60" cy="40" rx="14" ry="15" fill="#e8d5b8" opacity="0.9"/>
      <!-- Eyes (warm, clear) -->
      <ellipse cx="54" cy="38" rx="2.5" ry="2" fill="#2d1b4e"/>
      <ellipse cx="66" cy="38" rx="2.5" ry="2" fill="#2d1b4e"/>
      <circle cx="55" cy="37.5" r="0.8" fill="#fff" opacity="0.7"/>
      <circle cx="67" cy="37.5" r="0.8" fill="#fff" opacity="0.7"/>
      <!-- Gentle smile -->
      <path d="M54,46 Q60,50 66,46" fill="none" stroke="#c4a882" stroke-width="1.2" opacity="0.6"/>
      <!-- Hat (tower guide cap) -->
      <path d="M42,30 Q42,15 60,12 Q78,15 78,30 L75,33 Q60,28 45,33 Z" fill="${primaryColor}" opacity="0.9" stroke="${secondaryColor}" stroke-width="0.5"/>
      <!-- Lantern (in right hand area) -->
      <rect x="88" y="70" width="16" height="22" rx="3" fill="#f5a623" opacity="0.7" filter="url(#lanternGlow)"/>
      <rect x="90" y="68" width="12" height="4" rx="1" fill="#d4a017" opacity="0.8"/>
      <line x1="96" y1="68" x2="96" y2="60" stroke="#d4a017" stroke-width="1.5" opacity="0.7"/>
      <!-- Light rays from lantern -->
      <line x1="96" y1="75" x2="105" y2="70" stroke="${glowColor}" stroke-width="0.5" opacity="0.3"/>
      <line x1="96" y1="80" x2="108" y2="82" stroke="${glowColor}" stroke-width="0.5" opacity="0.2"/>
      <line x1="96" y1="85" x2="105" y2="92" stroke="${glowColor}" stroke-width="0.5" opacity="0.15"/>
    </svg>
  `;
}

/**
 * Shadow Wanderer — dark cloak, glowing eyes, shadow aura
 */
function buildWandererSvg() {
  const { primaryColor, secondaryColor, glowColor } = NPC_APPEARANCES[NPC_ID.WANDERER];
  return `
    <svg viewBox="0 0 120 160" xmlns="http://www.w3.org/2000/svg" class="npc-avatar-svg">
      <defs>
        <radialGradient id="wandererGlow" cx="50%" cy="30%" r="60%">
          <stop offset="0%" stop-color="${glowColor}" stop-opacity="0.15"/>
          <stop offset="60%" stop-color="${primaryColor}" stop-opacity="0.1"/>
          <stop offset="100%" stop-color="${primaryColor}" stop-opacity="0"/>
        </radialGradient>
        <filter id="eyeGlow">
          <feGaussianBlur stdDeviation="2" result="blur"/>
          <feMerge>
            <feMergeNode in="blur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <!-- Outer shadow aura -->
      <circle cx="60" cy="85" r="58" fill="url(#wandererGlow)"/>
      <!-- Cloak body (dark, flowing) -->
      <path d="M30,40 Q25,70 20,145 L100,145 Q95,70 90,40 Q80,30 60,28 Q40,30 30,40 Z"
            fill="${primaryColor}" stroke="${secondaryColor}" stroke-width="0.5" opacity="0.95"/>
      <!-- Cloak inner shadow -->
      <path d="M40,45 Q38,70 35,140 L85,140 Q82,70 80,45 Q72,38 60,36 Q48,38 40,45 Z"
            fill="#0d0d1a" opacity="0.5"/>
      <!-- Hood (deep shadow) -->
      <path d="M38,35 Q38,18 60,15 Q82,18 82,35 L82,48 Q72,42 60,42 Q48,42 38,48 Z"
            fill="#050510" opacity="0.9"/>
      <!-- Face (barely visible in shadow) -->
      <ellipse cx="60" cy="42" rx="13" ry="14" fill="#1a1a2e" opacity="0.8"/>
      <!-- Glowing eyes -->
      <ellipse cx="54" cy="40" rx="2.5" ry="2" fill="${glowColor}" opacity="0.9" filter="url(#eyeGlow)"/>
      <ellipse cx="66" cy="40" rx="2.5" ry="2" fill="${glowColor}" opacity="0.9" filter="url(#eyeGlow)"/>
      <circle cx="54" cy="40" r="1" fill="#fff" opacity="0.6"/>
      <circle cx="66" cy="40" r="1" fill="#fff" opacity="0.6"/>
      <!-- Shadow tendrils at base -->
      <path d="M20,145 Q25,152 30,148 Q35,155 40,148 Q50,158 60,150 Q70,158 80,148 Q85,155 90,148 Q95,152 100,145"
            fill="none" stroke="${glowColor}" stroke-width="0.8" opacity="0.2"/>
      <!-- Floating shadow particles -->
      <circle cx="45" cy="120" r="1.5" fill="${glowColor}" opacity="0.15"/>
      <circle cx="75" cy="130" r="1" fill="${glowColor}" opacity="0.1"/>
      <circle cx="55" cy="135" r="2" fill="${glowColor}" opacity="0.08"/>
      <circle cx="80" cy="115" r="1.2" fill="${glowColor}" opacity="0.12"/>
    </svg>
  `;
}

/**
 * Default fallback avatar.
 */
function buildDefaultSvg() {
  return `
    <svg viewBox="0 0 120 160" xmlns="http://www.w3.org/2000/svg" class="npc-avatar-svg">
      <circle cx="60" cy="85" r="55" fill="#2d1b4e" opacity="0.3"/>
      <ellipse cx="60" cy="40" rx="14" ry="15" fill="#4a3a20" opacity="0.8"/>
      <ellipse cx="60" cy="100" rx="25" ry="45" fill="#3a3020" opacity="0.8"/>
      <circle cx="55" cy="38" r="2" fill="#f0c040" opacity="0.4"/>
      <circle cx="65" cy="38" r="2" fill="#f0c040" opacity="0.4"/>
    </svg>
  `;
}

// ─── Component ─────────────────────────────────────────────────────────────

/**
 * @typedef {Object} NpcAvatarProps
 * @property {string} npcId - NPC ID (NPC_ID.MERCHANT, NPC_ID.GUIDE, or NPC_ID.WANDERER)
 * @property {() => void} [onClick] - Click handler
 * @property {boolean} [pulse] - Whether to pulse the glow animation
 * @property {boolean} [isActive] - Whether this NPC's dialogue is currently active
 * @property {string} [className] - Additional CSS class
 */

/**
 * Renders an NPC avatar with manhwa-styled SVG visuals.
 * @param {NpcAvatarProps} props
 */
const NpcAvatar = React.memo(function NpcAvatar({
  npcId,
  onClick,
  pulse = false,
  isActive = false,
  className = '',
}) {
  const svgContent = useMemo(() => buildNpcSvg(npcId), [npcId]);
  const appearance = NPC_APPEARANCES[npcId] || NPC_APPEARANCES[NPC_ID.MERCHANT];

  return (
    <div
      className={`npc-avatar${pulse ? ' npc-avatar--pulse' : ''}${isActive ? ' npc-avatar--active' : ''} ${className}`.trim()}
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={`${appearance?.description || 'NPC'} — click to see dialogue`}
      style={{
        '--npc-primary': appearance.primaryColor,
        '--npc-secondary': appearance.secondaryColor,
        '--npc-glow': appearance.glowColor,
      }}
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  );
});

export default NpcAvatar;
export { NPC_ID };
