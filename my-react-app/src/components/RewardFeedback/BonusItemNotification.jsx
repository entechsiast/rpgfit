import React, { useState, useEffect, useCallback } from 'react';
import { getAllItems } from '../../data/equipment';
import { CONSUMABLES } from '../../data/consumables';
import './BonusItemNotification.css';

/**
 * BonusItemNotification — Displays a bonus reward notification with item icon and name.
 *
 * Handles three bonus types:
 * - 'gold': Shows a gold amount with a coin icon
 * - 'equipment': Looks up the equipment item by ID and shows name + icon/rarity
 * - 'consumable': Looks up the consumable by ID and shows name + icon
 *
 * Auto-dismisses after 3 seconds or on manual dismiss.
 *
 * Props:
 *   bonusType: string — 'gold', 'equipment', or 'consumable'
 *   item: string — item ID (for equipment/consumable)
 *   amount: number — gold amount (for gold bonus)
 *   animationEnabled: boolean
 *   onDismiss: function
 */
export default function BonusItemNotification({
  bonusType,
  item = null,
  amount = null,
  animationEnabled = true,
  onDismiss,
}) {
  const [phase, setPhase] = useState('enter'); // 'enter' | 'visible' | 'exit'

  const handleDismiss = useCallback(() => {
    setPhase('exit');
    setTimeout(() => {
      if (onDismiss) onDismiss();
    }, 350);
  }, [onDismiss]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPhase('exit');
      setTimeout(() => {
        if (onDismiss) onDismiss();
      }, 350);
    }, 3000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const displayData = getDisplayData(bonusType, item, amount);

  return (
    <div
      className={`bonus-item-notification ${phase === 'exit' ? 'bonus-item-exit' : ''}`}
      data-testid={`bonus-item-notification-${bonusType}`}
      role="alert"
      aria-live="polite"
    >
      {animationEnabled && <BonusGlowEffect />}
      <div className="bonus-item-content">
        <div className="bonus-item-icon" data-testid="bonus-item-icon">
          {displayData.icon}
        </div>
        <div className="bonus-item-details">
          <span className="bonus-item-label">Bonus Reward!</span>
          <span
            className="bonus-item-name"
            data-testid="bonus-item-name"
          >
            {displayData.name}
          </span>
          {displayData.subtext && (
            <span className="bonus-item-subtext">{displayData.subtext}</span>
          )}
        </div>
      </div>
      <button
        className="bonus-item-dismiss"
        onClick={handleDismiss}
        data-testid="btn-dismiss-bonus"
        aria-label="Dismiss bonus notification"
      >
        ✕
      </button>
    </div>
  );
}

/**
 * Resolve item/consumable ID to display data (icon, name, subtext).
 */
function getDisplayData(bonusType, item, amount) {
  switch (bonusType) {
    case 'gold':
      return {
        icon: '💰',
        name: `+${amount?.toLocaleString() || 0} Gold`,
        subtext: null,
      };

    case 'equipment': {
      const equipItem = getAllItems().find(i => i.id === item);
      if (equipItem) {
        return {
          icon: getRarityIcon(equipItem.rarity),
          name: equipItem.name,
          subtext: `${equipItem.rarity} · ${equipItem.type}`,
        };
      }
      return {
        icon: '⚔️',
        name: 'Unknown Equipment',
        subtext: null,
      };
    }

    case 'consumable': {
      const consumable = CONSUMABLES.find(c => c.id === item);
      if (consumable) {
        return {
          icon: getConsumableIcon(consumable),
          name: consumable.name,
          subtext: consumable.description || null,
        };
      }
      return {
        icon: '🧪',
        name: 'Unknown Consumable',
        subtext: null,
      };
    }

    default:
      return {
        icon: '⭐',
        name: 'Bonus Reward!',
        subtext: null,
      };
  }
}

function getRarityIcon(rarity) {
  switch (rarity) {
    case 'common':
      return '⚪';
    case 'uncommon':
      return '🟢';
    case 'rare':
      return '🔵';
    case 'epic':
      return '🟣';
    case 'legendary':
      return '🟡';
    default:
      return '⚔️';
  }
}

function getConsumableIcon(consumable) {
  const effectType = consumable.effect?.type;
  switch (effectType) {
    case 'heal':
      return '❤️';
    case 'mana':
      return '💙';
    case 'buff':
      return '💪';
    case 'buff_multi':
      return '✨';
    default:
      return '🧪';
  }
}

/**
 * Bonus glow background effect (animated).
 */
function BonusGlowEffect() {
  return (
    <div className="bonus-glow-bg" aria-hidden="true">
      <div className="bonus-glow-core" />
      <div className="bonus-glow-ring" />
      <div className="bonus-glow-ring bonus-glow-ring-reverse" />
      <div className="bonus-glow-sparkle" />
      <div className="bonus-glow-sparkle" style={{ animationDelay: '0.3s' }} />
      <div className="bonus-glow-sparkle" style={{ animationDelay: '0.6s' }} />
    </div>
  );
}
