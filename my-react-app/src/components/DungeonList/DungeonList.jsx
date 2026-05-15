import React from 'react';
import { useCharacter, useCharacterDispatch } from '../../contexts/CharacterContext';
import { getDungeonsForLevel, getDungeonById } from '../../data/dungeons';
import './DungeonList.css';

export default function DungeonList() {
  const character = useCharacter();
  const dispatch = useCharacterDispatch();
  const availableDungeons = getDungeonsForLevel(character.level);

  const handleEnter = (dungeonId) => {
    dispatch({ type: 'SET_CURRENT_DUNGEON', payload: dungeonId });
    dispatch({ type: 'START_COMBAT', payload: dungeonId });
  };

  return (
    <div className="dungeon-list" style={{ flex: 1 }}>
      <h4 className="dungeon-list-title">Available Dungeons</h4>
      <div className="dungeon-grid">
        {availableDungeons.map(dungeon => {
          const [minLvl, maxLvl] = dungeon.levelRange;
          const isCompleted = character.completedDungeons.includes(dungeon.id);
          const canEnter = character.level >= minLvl - 2 && character.level <= maxLvl + 2;
          return (
            <div
              key={dungeon.id}
              className={`dungeon-card ${isCompleted ? 'completed' : ''} ${!canEnter ? 'locked' : ''}`}
              onClick={() => canEnter && handleEnter(dungeon.id)}
              data-testid={`dungeon-card-${dungeon.id}`}
            >
              {isCompleted && <span className="dungeon-completed-badge">&#10003;</span>}
              <div className="dungeon-name">{dungeon.name}</div>
              <div className="dungeon-difficulty" style={{ color: getDifficultyColor(dungeon.difficulty) }}>
                {dungeon.difficulty}
              </div>
              <div className="dungeon-level">
                Level {minLvl} - {maxLvl}
              </div>
              <div className="dungeon-desc">{dungeon.description}</div>
              {!canEnter && <div className="dungeon-locked-msg">Requires level {minLvl - 2} - {maxLvl + 2}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function getDifficultyColor(difficulty) {
  const colors = {
    'Easy': '#22c55e',
    'Medium': '#eab308',
    'Hard': '#f97316',
    'Very Hard': '#ef4444',
    'Extreme': '#a855f7',
  };
  return colors[difficulty] || '#6b7280';
}
