import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useCharacter, useCharacterDispatch } from '../../contexts/CharacterContext';
import { STATS, BASE_STAT, MAX_STAT, TOTAL_POINTS } from '../../data/stats';
import './StatAllocator.css';

function getModifier(value) {
  return Math.floor((value - BASE_STAT) / 2);
}

function StatRow({ stat, value, modifier, onIncrement, onDecrement, flashDirection }) {
  const flashClass = flashDirection ? `flash-${flashDirection}` : '';

  return (
    <div className="stat-row" data-testid={`stat-${stat.id}`}>
      <span className="stat-name">{stat.name}</span>
      <div className="stat-controls">
        <button
          className="stat-btn"
          disabled={value <= BASE_STAT}
          onClick={onDecrement}
          data-testid="stat-decrement"
          aria-label={`Decrease ${stat.name} from ${value}`}
        >
          −
        </button>
        <span className={`stat-value ${flashClass}`} data-testid={`stat-value-${stat.id}`}>
          {value}
        </span>
        <button
          className="stat-btn"
          disabled={value >= MAX_STAT}
          onClick={onIncrement}
          data-testid="stat-increment"
          aria-label={`Increase ${stat.name} from ${value}`}
        >
          +
        </button>
      </div>
      <span className="stat-bonus">
        {modifier >= 0 ? '+' : ''}
        {modifier}
      </span>
    </div>
  );
}

export default function StatAllocator() {
  const character = useCharacter();
  const dispatch = useCharacterDispatch();

  const totalUsed = TOTAL_POINTS - character.pointsRemaining;

  // Track flash direction per stat (increase or decrease)
  const [flashMap, setFlashMap] = useState({});
  const timeoutsRef = useRef({});

  // Clear flash after animation duration (300ms)
  const scheduleClearFlash = useCallback((statId) => {
    if (timeoutsRef.current[statId]) {
      clearTimeout(timeoutsRef.current[statId]);
    }
    timeoutsRef.current[statId] = setTimeout(() => {
      setFlashMap(prev => {
        const next = { ...prev };
        delete next[statId];
        return next;
      });
      delete timeoutsRef.current[statId];
    }, 300);
  }, []);

  const handleIncrement = useCallback((statId) => {
    dispatch({ type: 'INCREMENT_STAT', payload: statId });
    setFlashMap(prev => ({ ...prev, [statId]: 'increase' }));
    scheduleClearFlash(statId);
  }, [dispatch, scheduleClearFlash]);

  const handleDecrement = useCallback((statId) => {
    dispatch({ type: 'DECREMENT_STAT', payload: statId });
    setFlashMap(prev => ({ ...prev, [statId]: 'decrease' }));
    scheduleClearFlash(statId);
  }, [dispatch, scheduleClearFlash]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      Object.values(timeoutsRef.current).forEach(t => clearTimeout(t));
    };
  }, []);

  return (
    <div className="stat-allocator">
      <h3>Distribute Stats</h3>
      <div className={`points-remaining ${character.pointsRemaining === 0 ? 'empty' : ''}`} data-testid="points-remaining">
        {character.pointsRemaining} points remaining ({totalUsed} used of {TOTAL_POINTS})
      </div>
      {STATS.map(stat => (
        <StatRow
          key={stat.id}
          stat={stat}
          value={character.stats[stat.id]}
          modifier={getModifier(character.stats[stat.id])}
          onIncrement={() => handleIncrement(stat.id)}
          onDecrement={() => handleDecrement(stat.id)}
          flashDirection={flashMap[stat.id]}
        />
      ))}
    </div>
  );
}
