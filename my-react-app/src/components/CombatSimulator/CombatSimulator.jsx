import React, { useEffect, useRef } from 'react';
import { useCharacter, useCharacterDispatch } from '../../contexts/CharacterContext';
import './CombatSimulator.css';

export default function CombatSimulator() {
  const character = useCharacter();
  const dispatch = useCharacterDispatch();
  const cs = character.combatState;
  const logEndRef = useRef(null);

  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [character.combatLog]);

  useEffect(() => {
    if (!cs || !cs.active) return;
    if (cs.currentMonsterIndex >= cs.monsters.length && cs.bossDefeated) {
      return;
    }
    const timer = setTimeout(() => {
      dispatch({ type: 'RESOLVE_COMBAT' });
    }, 800);
    return () => clearTimeout(timer);
  }, [cs, cs?.currentMonsterIndex, cs?.bossDefeated]);

  if (!cs || !cs.active) return null;

  const currentMonster = cs.monsters[cs.currentMonsterIndex] || cs.boss;
  if (!currentMonster) return null;

  const isMonster = cs.currentMonsterIndex < cs.monsters.length;

  return (
    <div className="combat-simulator" style={{ flex: 1, minWidth: 0 }}>
      <div className="combat-header">
        <span className="combat-status">
          {isMonster ? `Fighting: ${currentMonster.name}` : `BOSS: ${currentMonster.name}`}
        </span>
        <span className="combat-progress">
          {cs.monstersDefeated}/{cs.monsters.length} monsters
        </span>
      </div>

      <div className="combat-monster-card">
        <div className="combat-monster-name">{currentMonster.name}</div>
        <div className="combat-monster-level">Level {currentMonster.level}</div>
        <div className="combat-hp-bar">
          <div className="combat-hp-fill" style={{ width: `${(currentMonster.currentHp / currentMonster.hp) * 100}%` }} />
        </div>
        <div className="combat-hp-text">HP: {Math.max(0, currentMonster.currentHp)}/{currentMonster.hp}</div>
      </div>

      <div className="combat-log" data-testid="combat-log">
        {character.combatLog.filter(l => l.type === 'combat_round').map((log, i) => (
          <div key={i} className="combat-log-entry">
            <span className="log-monster">{log.monster}</span>
            <span className="log-damage">You deal {log.playerDamage} dmg | Take {log.monsterDamage} dmg</span>
            <span className="log-hp">HP: {log.playerHpRemaining}</span>
          </div>
        ))}
        <div ref={logEndRef} />
      </div>

      <div className="combat-player-stats">
        <span>HP: {character.currentHP}/{character.maxHP}</span>
        <span>MP: {character.currentMP}/{character.maxMP}</span>
        <span>+{cs.totalXp} XP</span>
        <span>+{cs.totalGold} Gold</span>
      </div>
    </div>
  );
}
