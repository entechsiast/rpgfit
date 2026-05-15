import React, { useState } from 'react';
import { useCharacter, useCharacterDispatch } from '../../contexts/CharacterContext';
import { STATS } from '../../data/stats';
import './LevelUpModal.css';

export default function LevelUpModal() {
  const character = useCharacter();
  const dispatch = useCharacterDispatch();
  const [selectedStat, setSelectedStat] = useState('str');
  const [allocAmount, setAllocAmount] = useState(1);
  const [show, setShow] = useState(true);

  if (!show || character.statPointsToSpend <= 0) return null;

  const handleAllocate = () => {
    dispatch({ type: 'DISTRIBUTE_STAT', payload: { statId: selectedStat, value: allocAmount } });
    setShow(false);
  };

  const handleAuto = () => {
    const primaryStat = character.class?.primaryStat || 'str';
    dispatch({ type: 'DISTRIBUTE_STAT', payload: { statId: primaryStat, value: character.statPointsToSpend } });
    setShow(false);
  };

  return (
    <div className="level-up-modal" data-testid="level-up-modal">
      <div className="level-up-card">
        <div className="level-up-header">
          <h3>&#9733; Level Up! &#9733;</h3>
          <span className="level-up-level">Level {character.level}</span>
        </div>
        <p className="level-up-text">You have <strong>{character.statPointsToSpend}</strong> stat point(s) to distribute.</p>

        <div className="level-up-stats">
          {STATS.map(stat => (
            <div
              key={stat.id}
              className={`level-up-stat ${selectedStat === stat.id ? 'selected' : ''}`}
              onClick={() => setSelectedStat(stat.id)}
              data-testid={`stat-select-${stat.id}`}
            >
              <span className="stat-abb">{stat.abbreviation}</span>
              <span className="stat-name">{stat.name}</span>
              <span className="stat-value">{character.stats[stat.id]}</span>
            </div>
          ))}
        </div>

        <div className="level-up-alloc">
          <label>Allocate points:</label>
          <input
            type="number"
            min={1}
            max={character.statPointsToSpend}
            value={allocAmount}
            onChange={e => setAllocAmount(Math.min(character.statPointsToSpend, Math.max(1, parseInt(e.target.value) || 1)))}
            data-testid="level-up-alloc-input"
          />
        </div>

        <div className="level-up-actions">
          <button className="level-up-auto" onClick={handleAuto}>
            Auto (Primary Stat)
          </button>
          <button className="level-up-allocate" onClick={handleAllocate}>
            Allocate
          </button>
        </div>

        <div className="level-up-info">
          <p>HP Gain: <strong>+{Math.floor(character.class?.hitDie === 'd12' ? 6 : character.class?.hitDie === 'd10' ? 5 : character.class?.hitDie === 'd8' ? 4 : character.class?.hitDie === 'd6' ? 3 : 2)}</strong></p>
          <p>MP Gain: <strong>+2</strong></p>
        </div>
      </div>
    </div>
  );
}
