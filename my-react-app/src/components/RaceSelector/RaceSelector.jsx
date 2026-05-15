import React from 'react';
import { useCharacter, useCharacterDispatch } from '../../contexts/CharacterContext';
import { RACES } from '../../data/races';
import './RaceSelector.css';

export default function RaceSelector() {
  const character = useCharacter();
  const dispatch = useCharacterDispatch();

  return (
    <div className="race-selector">
      <h3>Choose Your Race</h3>
      <div className="race-grid">
        {RACES.map(race => (
          <div
            key={race.id}
            className={`race-card ${character.race?.id === race.id ? 'selected' : ''}`}
            onClick={() => dispatch({ type: 'SET_RACE', payload: race.id })}
            data-testid={`race-card-${race.id}`}
          >
            <div className="race-card-name">{race.name}</div>
            <div className="race-card-desc">{race.description}</div>
            <div className="race-card-mods">
              {Object.entries(race.statModifiers).map(([stat, mod]) => {
                if (stat === 'oneOther') return null;
                return (
                  <span key={stat}>
                    {mod > 0 ? '+' : ''}{mod} {stat.toUpperCase()}{' '}
                  </span>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
