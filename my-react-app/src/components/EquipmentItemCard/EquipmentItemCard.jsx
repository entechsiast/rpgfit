import React from 'react';
import { RARITY_COLORS } from '../../data/equipment';
import './EquipmentItemCard.css';

export default function EquipmentItemCard({ item, onEquip, 'data-testid': dataTestId }) {
  const rarityColor = RARITY_COLORS[item.rarity];
  const statEntries = Object.entries(item.statBonuses || {});

  return (
    <div className="equipment-item-card" style={{ '--rarity': rarityColor }} data-testid={dataTestId || `equipment-item-${item.id}`}>
      <div className="item-header">
        <span className="item-name">{item.name}</span>
        <span className="item-rarity" style={{ color: rarityColor }}>{item.rarity}</span>
      </div>
      <div className="item-details">
        <span className="item-slot">{item.slot}</span>
        <span className="item-type">{item.type}</span>
      </div>
      {statEntries.length > 0 && (
        <div className="item-stats">
          {statEntries.map(([stat, val]) => (
            <span key={stat} className="item-stat">+{val} {stat.toUpperCase()}</span>
          ))}
        </div>
      )}
      <button className="item-equip-btn" onClick={() => onEquip(item)}>
        Equip
      </button>
    </div>
  );
}
