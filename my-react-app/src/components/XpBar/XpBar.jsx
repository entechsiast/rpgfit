import React from 'react';
import { useCharacter } from '../../contexts/CharacterContext';
import { getXpProgress } from '../../data/xp';
import './XpBar.css';

export default function XpBar() {
  const character = useCharacter();
  const { current, needed, percentage } = getXpProgress(character.level, character.xp);

  return (
    <div className="xp-bar" data-testid="xp-bar">
      <div className="xp-bar-label">
        <span>Level {character.level}</span>
        <span>{current}/{needed} XP</span>
      </div>
      <div className="xp-bar-track">
        <div className="xp-bar-fill" style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}
