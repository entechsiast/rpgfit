import React from 'react';
import { useCharacter } from '../../contexts/CharacterContext';
import './AvatarArmor.css';

const CLASS_DEFAULTS = {
  warrior: '<g className="armor-default-warrior"><path d="M60 165 L75 155 L85 165 L80 180 L65 175 Z" fill="#6b7280"/><path d="M140 165 L125 155 L115 165 L120 180 L135 175 Z" fill="#6b7280"/><path d="M75 180 L125 180 L130 230 L70 230 Z" fill="#9ca3af"/><path d="M80 185 L120 185 L125 225 L75 225 Z" fill="#d1d5db"/><line x1="145" y1="170" x2="160" y2="120" stroke="#d1d5db" strokeWidth="3" strokeLinecap="round"/><line x1="140" y1="175" x2="155" y2="180" stroke="#92400e" strokeWidth="4" strokeLinecap="round"/></g>',
  mage: '<g className="armor-default-mage"><path d="M70 175 L130 175 L138 260 L62 260 Z" fill="#4f46e5"/><path d="M80 175 L120 175 L125 260 L75 260 Z" fill="#6366f1"/><line x1="100" y1="175" x2="100" y2="260" stroke="#4f46e5" strokeWidth="1"/><line x1="155" y1="140" x2="155" y2="270" stroke="#92400e" strokeWidth="3" strokeLinecap="round"/><circle cx="155" cy="138" r="8" fill="#818cf8" opacity="0.8"/><circle cx="155" cy="138" r="4" fill="#c7d2fe"/></g>',
  rogue: '<g className="armor-default-rogue"><path d="M65 170 L135 170 L140 260 L60 260 Z" fill="#1f2937"/><path d="M75 180 L125 180 L128 230 L72 230 Z" fill="#374151"/><rect x="72" y="225" width="56" height="6" fill="#92400e" rx="1"/><rect x="68" y="210" width="4" height="25" fill="#d1d5db" rx="1"/><rect x="128" y="210" width="4" height="25" fill="#d1d5db" rx="1"/></g>',
  cleric: '<g className="armor-default-cleric"><path d="M70 175 L130 175 L135 260 L65 260 Z" fill="#fef3c7"/><path d="M80 180 L120 180 L122 220 L78 220 Z" fill="#d4d4d8"/><line x1="100" y1="185" x2="100" y2="210" stroke="#f59e0b" strokeWidth="2"/><line x1="94" y1="193" x2="106" y2="193" stroke="#f59e0b" strokeWidth="2"/><line x1="150" y1="150" x2="150" y2="270" stroke="#92400e" strokeWidth="3" strokeLinecap="round"/><circle cx="150" cy="148" r="6" fill="#fbbf24" opacity="0.7"/></g>',
  ranger: '<g className="armor-default-ranger"><path d="M65 170 L135 170 L140 260 L60 260 Z" fill="#166534"/><path d="M75 180 L125 180 L128 230 L72 230 Z" fill="#92400e"/><path d="M55 180 Q40 200 55 230" stroke="#92400e" strokeWidth="3" fill="none"/><line x1="55" y1="180" x2="55" y2="230" stroke="#d4d4d8" strokeWidth="1"/><path d="M85 190 Q90 185 95 190 Q90 195 85 190 Z" fill="#22c55e"/><path d="M105 200 Q110 195 115 200 Q110 205 105 200 Z" fill="#22c55e"/></g>',
  paladin: '<g className="armor-default-paladin"><path d="M85 55 Q100 45 115 55 L118 75 L82 75 Z" fill="#9ca3af"/><path d="M90 65 L110 65" stroke="#6b7280" strokeWidth="1"/><path d="M65 165 L135 165 L138 260 L62 260 Z" fill="#d4d4d8"/><path d="M75 175 L125 175 L127 225 L73 225 Z" fill="#e5e7eb"/><path d="M50 190 L60 185 L65 195 L60 220 L50 215 Z" fill="#3b82f6"/><circle cx="57" cy="200" r="4" fill="#fbbf24"/><line x1="100" y1="185" x2="100" y2="210" stroke="#f59e0b" strokeWidth="2"/><line x1="94" y1="193" x2="106" y2="193" stroke="#f59e0b" strokeWidth="2"/></g>',
};

export default function AvatarArmor() {
  const character = useCharacter();
  const { equipment, class: characterClass } = character;

  const renderItemPaths = (item) => {
    if (!item || !item.svgPaths) return null;
    return item.svgPaths.map((p, i) => {
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
    });
  };

  const renderDefaultArmor = () => {
    const classId = characterClass?.id;
    const defaultPaths = CLASS_DEFAULTS[classId];
    if (!defaultPaths) return null;
    return <g className="armor-default" dangerouslySetInnerHTML={{ __html: defaultPaths }} />;
  };

  const renderEquipped = () => {
    const slots = [];

    // Head
    if (equipment.head) {
      slots.push(<g key="head" className="armor-head">{renderItemPaths(equipment.head)}</g>);
    }

    // Chest
    if (equipment.chest) {
      slots.push(<g key="chest" className="armor-chest">{renderItemPaths(equipment.chest)}</g>);
    }

    // Pants
    if (equipment.pants) {
      slots.push(<g key="pants" className="armor-pants">{renderItemPaths(equipment.pants)}</g>);
    }

    // Boots
    if (equipment.boots) {
      slots.push(<g key="boots" className="armor-boots">{renderItemPaths(equipment.boots)}</g>);
    }

    // Right Hand
    if (equipment.rightHand) {
      slots.push(<g key="rightHand" className="armor-right-hand">{renderItemPaths(equipment.rightHand)}</g>);
    }

    // Left Hand
    if (equipment.leftHand) {
      slots.push(<g key="leftHand" className="armor-left-hand">{renderItemPaths(equipment.leftHand)}</g>);
    }

    // Accessories
    ['accessory1', 'accessory2', 'accessory3'].forEach(slot => {
      if (equipment[slot]) {
        slots.push(<g key={slot} className={`armor-${slot}`}>{renderItemPaths(equipment[slot])}</g>);
      }
    });

    return slots;
  };

  return (
    <g className="avatar-armor-group">
      {renderDefaultArmor()}
      {renderEquipped()}
    </g>
  );
}
