import React from 'react';
import { useCharacter } from '../../contexts/CharacterContext';
import './GoldDisplay.css';

export default function GoldDisplay() {
  const character = useCharacter();

  return (
    <div className="gold-display" data-testid="gold-display">
      <span className="gold-icon">&#9830;</span>
      <span className="gold-amount">{character.gold.toLocaleString()}</span>
    </div>
  );
}
