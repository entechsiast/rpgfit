import React from 'react';
import { useCharacter } from '../../contexts/CharacterContext';
import './HpMpDisplay.css';

export default function HpMpDisplay() {
  const character = useCharacter();
  const hpPercentage = (character.currentHP / character.maxHP) * 100;
  const mpPercentage = (character.currentMP / character.maxMP) * 100;

  return (
    <div className="hpmp-display" data-testid="hpmp-display">
      <div className="hpmp-bar hp-bar">
        <div className="hpmp-label">
          <span>HP</span>
          <span>{character.currentHP}/{character.maxHP}</span>
        </div>
        <div className="hpmp-track">
          <div className="hpmp-fill hp-fill" style={{ width: `${hpPercentage}%`, background: hpPercentage > 50 ? '#22c55e' : hpPercentage > 25 ? '#eab308' : '#ef4444' }} />
        </div>
      </div>
      <div className="hpmp-bar mp-bar">
        <div className="hpmp-label">
          <span>MP</span>
          <span>{character.currentMP}/{character.maxMP}</span>
        </div>
        <div className="hpmp-track">
          <div className="hpmp-fill mp-fill" style={{ width: `${mpPercentage}%`, background: '#3b82f6' }} />
        </div>
      </div>
    </div>
  );
}
