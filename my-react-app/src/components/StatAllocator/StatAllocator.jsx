import React from 'react';
import { useCharacter, useCharacterDispatch } from '../../contexts/CharacterContext';
import { STATS, BASE_STAT, MAX_STAT, TOTAL_POINTS } from '../../data/stats';
import './StatAllocator.css';

function getModifier(value) {
  return Math.floor((value - BASE_STAT) / 2);
}

export default function StatAllocator() {
  const character = useCharacter();
  const dispatch = useCharacterDispatch();

  const totalUsed = TOTAL_POINTS - character.pointsRemaining;

  return (
    <div className="stat-allocator">
      <h3>Distribute Stats</h3>
      <div className={`points-remaining ${character.pointsRemaining === 0 ? 'empty' : ''}`} data-testid="points-remaining">
        {character.pointsRemaining} points remaining ({totalUsed} used of {TOTAL_POINTS})
      </div>
      {STATS.map(stat => (
        <div key={stat.id} className="stat-row" data-testid={`stat-${stat.id}`}>
          <span className="stat-name">{stat.name}</span>
          <div className="stat-controls">
            <button
              className="stat-btn"
              disabled={character.stats[stat.id] <= BASE_STAT}
              onClick={() => dispatch({ type: 'DECREMENT_STAT', payload: stat.id })}
              data-testid="stat-decrement"
            >
              -
            </button>
            <span className="stat-value">{character.stats[stat.id]}</span>
            <button
              className="stat-btn"
              disabled={character.stats[stat.id] >= MAX_STAT || character.pointsRemaining <= 0}
              onClick={() => dispatch({ type: 'INCREMENT_STAT', payload: stat.id })}
              data-testid="stat-increment"
            >
              +
            </button>
          </div>
          <span className="stat-bonus">
            {getModifier(character.stats[stat.id]) >= 0 ? '+' : ''}
            {getModifier(character.stats[stat.id])}
          </span>
        </div>
      ))}
    </div>
  );
}
