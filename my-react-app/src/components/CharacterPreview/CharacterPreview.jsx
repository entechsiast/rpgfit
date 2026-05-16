import React, { useState, useRef, useEffect } from 'react';
import { useCharacter, useCharacterDispatch } from '../../contexts/CharacterContext';
import { CLASSES } from '../../data/classes';
import { RACES } from '../../data/races';
import { STATS } from '../../data/stats';
import { APPEARANCE_OPTIONS } from '../../data/appearanceOptions';
import CharacterAvatar from '../CharacterAvatar/CharacterAvatar';
import HpMpDisplay from '../HpMpDisplay/HpMpDisplay';
import XpBar from '../XpBar/XpBar';
import GoldDisplay from '../GoldDisplay/GoldDisplay';
import './CharacterPreview.css';

function getRaceFinalStats(character) {
  if (!character.race || !character.class) return character.stats;
  const base = character.stats;
  const modifiers = character.race.statModifiers;
  const result = { ...base };

  Object.entries(modifiers).forEach(([stat, mod]) => {
    if (stat === 'oneOther') return;
    result[stat] = (result[stat] || 0) + mod;
  });

  if (modifiers.oneOther && character.class) {
    const primary = character.class.primaryStat;
    result[primary] = (result[primary] || 0) + 1;
  }

  return result;
}

export default function CharacterPreview() {
  const character = useCharacter();
  const dispatch = useCharacterDispatch();
  const hasSelection = character.class && character.race;
  const finalStats = getRaceFinalStats(character);
  const equippedBonuses = character.equippedBonuses || {};
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(character.name);
  const inputRef = useRef(null);

  useEffect(() => {
    setEditValue(character.name);
  }, [character.name]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleSave = () => {
    dispatch({ type: 'SET_NAME', payload: editValue.trim() });
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    }
    if (e.key === 'Escape') {
      setEditValue(character.name);
      setIsEditing(false);
    }
  };

  if (!hasSelection) {
    return (
      <div className="character-preview">
        <div className="preview-card" data-testid="preview-card">
          <div className="preview-empty">
            Select a class and race to see your character preview
          </div>
        </div>
      </div>
    );
  }

  const className = CLASSES.find(c => c.id === character.class?.id)?.name || '';
  const raceName = RACES.find(r => r.id === character.race?.id)?.name || '';
  const hairColor = APPEARANCE_OPTIONS.hairColor.find(o => o.id === character.appearance.hairColor);
  const skinTone = APPEARANCE_OPTIONS.skinTone.find(o => o.id === character.appearance.skinTone);
  const eyeColor = APPEARANCE_OPTIONS.eyeColor.find(o => o.id === character.appearance.eyeColor);

  const displayName = editValue?.trim() || 'Unnamed Hero';

  return (
    <div className="character-preview">
      <div className="preview-card" data-testid="preview-card">
        <div className="preview-header">
          {isEditing ? (
            <div className="name-edit-group">
              <input
                ref={inputRef}
                type="text"
                className="preview-name-input"
                value={editValue}
                maxLength={30}
                onChange={e => setEditValue(e.target.value)}
                onBlur={handleSave}
                onKeyDown={handleKeyDown}
                placeholder="Enter hero name"
                data-testid="name-edit-input"
              />
              <button className="name-save-btn" onClick={handleSave} data-testid="name-save-btn">✓</button>
            </div>
          ) : (
            <div className="preview-name-group" onClick={() => setIsEditing(true)}>
              <h2 className="preview-name" data-testid="preview-name">{displayName}</h2>
              <span className="preview-level-badge" data-testid="preview-level">Lv.{character.level}</span>
              <span className="preview-name-edit-hint">✎</span>
            </div>
          )}
          <p className="preview-title">
            {raceName} {className}
          </p>
        </div>

        <div className="preview-avatar">
          <CharacterAvatar />
        </div>

        <div className="preview-stats-bar">
          <HpMpDisplay />
          <XpBar />
          <GoldDisplay />
        </div>

        <div className="preview-body">
          <div className="preview-section">
            <h3 className="preview-section-title">Stats</h3>
            <div className="preview-stats-grid">
              {STATS.map(stat => {
                const baseVal = finalStats[stat.id] || 0;
                const bonus = equippedBonuses[stat.id] || 0;
                const total = baseVal + bonus;
                return (
                  <div key={stat.id} className="preview-stat" data-testid={`stat-${stat.id}`}>
                    <div className="preview-stat-value">{total}</div>
                    <div className="preview-stat-label">{stat.abbreviation}</div>
                    {bonus !== 0 && (
                      <div className="preview-stat-bonus">
                        {bonus > 0 ? '+' : ''}{bonus}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="preview-section">
            <h3 className="preview-section-title">Appearance</h3>
            <div className="preview-appearance">
              <div className="preview-appearance-item">
                <span>Hair: </span>{hairColor?.name}
              </div>
              <div className="preview-appearance-item">
                <span>Skin: </span>{skinTone?.name}
              </div>
              <div className="preview-appearance-item">
                <span>Eyes: </span>{eyeColor?.name}
              </div>
              <div className="preview-appearance-item">
                <span>Build: </span>{character.appearance.build}
              </div>
            </div>
          </div>

          <div className="preview-section">
            <h3 className="preview-section-title">Skills</h3>
            <div className="preview-skills-list">
              {Array.from(character.selectedSkillIds).map(id => {
                const allSkills = [
                  ...CLASSES.find(c => c.id === character.class?.id)?.startingSkills || [],
                  ...(RACES.find(r => r.id === character.race?.id)?.bonusSkills || []),
                ];
                if (!allSkills.includes(id)) return null;
                return <span key={id} className="preview-skill-tag">{id.replace(/_/g, ' ')}</span>;
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
