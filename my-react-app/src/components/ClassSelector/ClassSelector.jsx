import React from 'react';
import { useCharacter, useCharacterDispatch } from '../../contexts/CharacterContext';
import { CLASSES } from '../../data/classes';
import './ClassSelector.css';

export default function ClassSelector() {
  const character = useCharacter();
  const dispatch = useCharacterDispatch();

  return (
    <div className="class-selector">
      <h3>Choose Your Class</h3>
      <div className="class-grid">
        {CLASSES.map(cls => (
          <div
            key={cls.id}
            className={`class-card ${character.class?.id === cls.id ? 'selected' : ''}`}
            onClick={() => dispatch({ type: 'SET_CLASS', payload: cls.id })}
            data-testid={`class-card-${cls.id}`}
          >
            <div className="class-card-name">{cls.name}</div>
            <div className="class-card-desc">{cls.description}</div>
            <div className="class-card-stats">
              {Object.entries(cls.statBonuses).map(([stat, bonus]) => (
                <span key={stat}>+{bonus} {stat.toUpperCase()} </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
