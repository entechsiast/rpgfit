import React from 'react';
import { useCharacter, useCharacterDispatch } from '../../contexts/CharacterContext';
import { getDungeonById, getMonstersByDungeon } from '../../data/dungeons';
import { getBossByDungeon } from '../../data/monsters';
import './DungeonDetail.css';

export default function DungeonDetail() {
  const character = useCharacter();
  const dispatch = useCharacterDispatch();
  const dungeon = getDungeonById(character.currentDungeon);
  if (!dungeon) return null;

  const monsters = getMonstersByDungeon(character.currentDungeon);
  const boss = getBossByDungeon(character.currentDungeon);

  const handleLeave = () => {
    dispatch({ type: 'SET_CURRENT_DUNGEON', payload: null });
    dispatch({ type: 'CLEAR_COMBAT_LOG' });
  };

  return (
    <div className="dungeon-detail" style={{ flex: 1, minWidth: 0 }}>
      <div className="dungeon-detail-header">
        <h4 className="dungeon-detail-name">{dungeon.name}</h4>
        <span className="dungeon-detail-difficulty" style={{ color: getDifficultyColor(dungeon.difficulty) }}>
          {dungeon.difficulty}
        </span>
      </div>
      <p className="dungeon-detail-desc">{dungeon.description}</p>

      <div className="dungeon-detail-section">
        <h5>Monsters ({monsters.length})</h5>
        <div className="monster-list">
          {monsters.map(m => (
            <div key={m.id} className="monster-item">
              <span className="monster-name">{m.name}</span>
              <span className="monster-level">Lv.{m.level}</span>
              <span className="monster-hp">HP: {m.hp}</span>
              <span className="monster-atk">ATK: {m.attack}</span>
              <span className="monster-def">DEF: {m.defense}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="dungeon-detail-section">
        <h5>Boss</h5>
        <div className="monster-item boss-item">
          <span className="monster-name">{boss.name}</span>
          <span className="monster-level">Lv.{boss.level}</span>
          <span className="monster-hp">HP: {boss.hp}</span>
          <span className="monster-atk">ATK: {boss.attack}</span>
          <span className="monster-def">DEF: {boss.defense}</span>
        </div>
      </div>

      <div className="dungeon-detail-section">
        <h5>Completion Rewards</h5>
        <div className="reward-list">
          <span className="reward-item">+{dungeon.completionReward.xp} XP</span>
          <span className="reward-item">{dungeon.completionReward.gold[0]}-{dungeon.completionReward.gold[1]} Gold</span>
        </div>
      </div>

      <button className="dungeon-leave-btn" onClick={handleLeave}>
        Leave Dungeon
      </button>
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
