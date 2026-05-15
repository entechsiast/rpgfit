import React, { useEffect, useState } from 'react';
import { useCharacter, useCharacterDispatch } from '../../contexts/CharacterContext';
import { getDungeonById } from '../../data/dungeons';
import { getItemById } from '../../data/loot';
import './CombatResults.css';

export default function CombatResults() {
  const character = useCharacter();
  const dispatch = useCharacterDispatch();
  const [show, setShow] = useState(true);
  const dungeon = getDungeonById(character.currentDungeon);
  const lastLog = character.combatLog.filter(l => l.type === 'dungeon_complete').pop();
  const guaranteedItem = lastLog ? getItemById(lastLog.guaranteedItem) : null;

  useEffect(() => {
    const timer = setTimeout(() => setShow(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  const handleBack = () => {
    dispatch({ type: 'SET_CURRENT_DUNGEON', payload: null });
    dispatch({ type: 'CLEAR_COMBAT_LOG' });
  };

  if (!show || !lastLog) return null;

  return (
    <div className="combat-results" data-testid="combat-results">
      <div className="results-card">
        <div className="results-header">
          <h4>Dungeon Complete!</h4>
          <span className="results-dungeon">{dungeon?.name}</span>
        </div>
        <div className="results-stats">
          <div className="result-stat">
            <span className="result-label">XP Earned</span>
            <span className="result-value xp">{lastLog.totalXp.toLocaleString()}</span>
          </div>
          <div className="result-stat">
            <span className="result-label">Gold Earned</span>
            <span className="result-value gold">{lastLog.totalGold.toLocaleString()}</span>
          </div>
          <div className="result-stat">
            <span className="result-label">Guaranteed Loot</span>
            <span className="result-value item">{guaranteedItem?.name || 'Unknown Item'}</span>
          </div>
        </div>
        <button className="results-btn" onClick={handleBack}>
          Back to Dungeons
        </button>
      </div>
    </div>
  );
}
