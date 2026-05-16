import React from 'react';
import { RARITY_COLORS } from '../../data/equipment';
import './EquipmentSlot.css';

const SLOT_ICONS = {
  head: 'M70 40 Q100 25 130 40 L135 65 L65 65 Z',
  chest: 'M75 75 L125 75 L130 130 L70 130 Z',
  pants: 'M78 135 L88 135 L85 170 L75 170 Z M112 135 L122 135 L125 170 L115 170 Z',
  boots: 'M75 175 L88 175 L88 190 L73 190 Z M112 175 L125 175 L127 190 L112 190 Z',
  rightHand: 'M135 80 L145 80 L145 140 L135 140 Z',
  leftHand: 'M55 80 L65 80 L65 140 L55 140 Z',
  accessory1: 'M95 65 Q100 60 105 65 Q105 72 100 72 Q95 72 95 65 Z',
  accessory2: 'M70 125 L130 125 L130 132 L70 132 Z',
  accessory3: 'M95 65 L105 65 L105 75 L95 75 Z',
};

export default function EquipmentSlot({ slotId, item, onUnequip }) {
  const rarityColor = item ? RARITY_COLORS[item.rarity] : '#d1d5db';

  return (
    <div className="equipment-slot" style={{ '--slot-border': rarityColor }} data-testid={`equipment-slot-${slotId}`}>
      <div className="slot-icon">
        <svg viewBox="0 0 200 300" className="slot-icon-svg">
          <path d={SLOT_ICONS[slotId] || ''} fill="none" stroke={rarityColor} strokeWidth="2" />
        </svg>
      </div>
      {item ? (
        <div className="slot-equipped">
          <div className="slot-item-preview">
            <svg viewBox="0 0 200 300" className="slot-item-svg">
              {item.svgPaths.map((p, i) => {
                if (p.cx !== undefined) {
                  return <circle key={i} cx={p.cx} cy={p.cy} r={p.r} fill={p.fill} />;
                }
                return (
                  <path
                    key={i}
                    d={p.d}
                    fill={p.fill || 'none'}
                    stroke={p.stroke || 'none'}
                    strokeWidth={p.strokeWidth || 1}
                    strokeLinecap={p.lineCap || 'butt'}
                    strokeLinejoin={p.lineJoin || 'miter'}
                  />
                );
              })}
            </svg>
          </div>
          <div className="slot-item-info">
            <div className="slot-item-name" style={{ color: rarityColor }}>{item.name}</div>
            <button className="slot-unequip-btn" onClick={() => onUnequip(slotId)} data-testid={`unequip-${slotId}`}>Unequip</button>
          </div>
        </div>
      ) : (
        <div className="slot-empty">Empty</div>
      )}
    </div>
  );
}
