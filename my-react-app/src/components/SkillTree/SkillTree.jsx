import React from 'react';
import { useCharacter, useCharacterDispatch } from '../../contexts/CharacterContext';
import { getSkillsByCategory, getSkillsForClassAndRace } from '../../data/skills';
import { STATS } from '../../data/stats';
import { getXpProgress } from '../../data/xp';
import './SkillTree.css';

export default function SkillTree() {
  const character = useCharacter();
  const dispatch = useCharacterDispatch();

  const availableSkills = getSkillsForClassAndRace(character.class?.id, character.race?.id);
  const categories = getSkillsByCategory();

  const xpProgress = getXpProgress(character.level, character.xp);

  const getStatName = statId => {
    const stat = STATS.find(s => s.id === statId);
    return stat ? stat.abbreviation : '';
  };

  return (
    <div className="skill-tree">
      <div className="skill-tree-header">
        <h3>Skills</h3>
        <div className="skill-tree-level-xp">
          <span className="level-badge" data-testid="skill-tree-level">
            Level {character.level}
          </span>
          <div className="xp-bar-container" data-testid="skill-tree-xp-bar">
            <div
              className="xp-bar-fill"
              style={{ width: `${xpProgress.percentage}%` }}
            />
            <span className="xp-bar-text">
              {xpProgress.current}/{xpProgress.needed} XP
            </span>
          </div>
        </div>
      </div>
      {Object.entries(categories).map(([category, skills]) => (
        <div className="skill-category" key={category}>
          <div className="skill-category-title">{category}</div>
          <div className="skill-list">
            {skills.map(skill => {
              const isAvailable = availableSkills.some(s => s.id === skill.id);
              const isSelected = character.selectedSkillIds.has(skill.id);
              return (
                <div
                  key={skill.id}
                  className={`skill-item ${isSelected ? 'selected' : ''} ${!isAvailable ? 'unavailable' : ''}`}
                  onClick={() => isAvailable && dispatch({ type: 'TOGGLE_SKILL', payload: skill.id })}
                  data-testid={`skill-${skill.id}`}
                >
                  <div className="skill-checkbox">
                    {isSelected && <span className="skill-checkbox-icon">&#10003;</span>}
                  </div>
                  <div className="skill-info">
                    <div className="skill-name">{skill.name}</div>
                    <div className="skill-desc">{skill.description}</div>
                  </div>
                  <span className="skill-stat">{getStatName(skill.stat)}</span>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
