import React, { useState, useCallback } from 'react';
import { useCharacter, useCharacterDispatch } from '../../contexts/CharacterContext';
import { CLASSES } from '../../data/classes';
import './ClassSelector.css';

function formatStatBonus(bonus) {
  return bonus >= 0 ? `+${bonus}` : `${bonus}`;
}

function ClassCard({ cls, isSelected, onSelect, expanded, onToggle }) {
  const hasDetails = (cls.startingSkills && cls.startingSkills.length > 0) ||
                     (cls.weaponProficiencies && cls.weaponProficiencies.length > 0) ||
                     (cls.armorProficiencies && cls.armorProficiencies.length > 0);

  return (
    <div
      className={`class-card ${isSelected ? 'selected' : ''}`}
      onClick={onSelect}
      data-testid={`class-card-${cls.id}`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(); } }}
    >
      {/* Core Info — always visible */}
      <div className="class-card-core">
        <div className="class-card-name">{cls.name}</div>
        <div className="class-card-desc">{cls.description}</div>
        <div className="class-card-stats" data-testid={`class-stats-${cls.id}`}>
          {Object.entries(cls.statBonuses).map(([stat, bonus]) => (
            <span key={stat} className="class-card-stat">
              {formatStatBonus(bonus)} {stat.toUpperCase()}
            </span>
          ))}
        </div>
      </div>

      {/* Expandable details */}
      {hasDetails && (
        <div className="class-card-details-wrapper">
          <button
            className="class-card-details-toggle"
            onClick={(e) => { e.stopPropagation(); onToggle(); }}
            aria-expanded={expanded}
            aria-controls={`class-details-${cls.id}`}
            data-testid={`class-details-toggle-${cls.id}`}
          >
            <span className="class-card-details-toggle-text">
              {expanded ? 'Show less' : 'Show details'}
            </span>
            <span className={`class-card-details-toggle-chevron ${expanded ? 'expanded' : ''}`} aria-hidden="true">
              ▼
            </span>
          </button>
          <div
            className={`class-card-details ${expanded ? 'expanded' : ''}`}
            id={`class-details-${cls.id}`}
            role="region"
          >
            {cls.startingSkills && cls.startingSkills.length > 0 && (
              <div className="class-card-section">
                <span className="class-card-section-label">Starting Skills</span>
                <div className="class-card-skills-list">
                  {cls.startingSkills.map((skill, idx) => (
                    <span key={skill} className="class-card-skill-tag">{skill}</span>
                  ))}
                </div>
              </div>
            )}
            {cls.weaponProficiencies && cls.weaponProficiencies.length > 0 && (
              <div className="class-card-section">
                <span className="class-card-section-label">Weapon Proficiencies</span>
                <div className="class-card-prof-list">
                  {cls.weaponProficiencies.map((prof, idx) => (
                    <span key={prof} className="class-card-prof-tag">{prof}</span>
                  ))}
                </div>
              </div>
            )}
            {cls.armorProficiencies && cls.armorProficiencies.length > 0 && (
              <div className="class-card-section">
                <span className="class-card-section-label">Armor Proficiencies</span>
                <div className="class-card-prof-list">
                  {cls.armorProficiencies.map((prof, idx) => (
                    <span key={prof} className="class-card-prof-tag">{prof}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ClassSelector() {
  const character = useCharacter();
  const dispatch = useCharacterDispatch();
  const [expandedClassId, setExpandedClassId] = useState(null);

  const handleSelect = useCallback((clsId) => {
    dispatch({ type: 'SET_CLASS', payload: clsId });
  }, [dispatch]);

  const handleToggleDetails = useCallback((clsId) => {
    setExpandedClassId(prev => prev === clsId ? null : clsId);
  }, []);

  return (
    <div className="class-selector">
      <h3>Choose Your Class</h3>
      <div className="class-grid">
        {CLASSES.map(cls => (
          <ClassCard
            key={cls.id}
            cls={cls}
            isSelected={character.class?.id === cls.id}
            onSelect={() => handleSelect(cls.id)}
            expanded={expandedClassId === cls.id}
            onToggle={() => handleToggleDetails(cls.id)}
          />
        ))}
      </div>
    </div>
  );
}
