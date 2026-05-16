import React from 'react';
import { useCharacter, useCharacterDispatch } from '../../contexts/CharacterContext';
import { CLASSES } from '../../data/classes';
import './ClassSelector.css';

function formatStatBonus(bonus) {
  return bonus >= 0 ? `+${bonus}` : `${bonus}`;
}

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
                <span key={stat}>{formatStatBonus(bonus)} {stat.toUpperCase()} </span>
              ))}
            </div>
            {cls.startingSkills && cls.startingSkills.length > 0 && (
              <div className="class-card-skills">
                <span className="class-card-skills-label">Starting Skills:</span>
                <div className="class-card-skills-list">
                  {cls.startingSkills.map(skill => (
                    <span key={skill} className="class-card-skill-tag">{skill}</span>
                  ))}
                </div>
              </div>
            )}
            {cls.weaponProficiencies && cls.weaponProficiencies.length > 0 && (
              <div className="class-card-proficiencies">
                <span className="class-card-prof-label">Weapons:</span> {cls.weaponProficiencies.join(', ')}
              </div>
            )}
            {cls.armorProficiencies && cls.armorProficiencies.length > 0 && (
              <div className="class-card-proficiencies">
                <span className="class-card-prof-label">Armor:</span> {cls.armorProficiencies.join(', ')}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
