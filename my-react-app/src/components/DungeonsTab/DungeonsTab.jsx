import React from 'react';
import DungeonList from '../DungeonList/DungeonList';
import DungeonDetail from '../DungeonDetail/DungeonDetail';
import CombatSimulator from '../CombatSimulator/CombatSimulator';
import CombatResults from '../CombatResults/CombatResults';
import ConsumablesDisplay from '../ConsumablesDisplay/ConsumablesDisplay';
import { useCharacter } from '../../contexts/CharacterContext';
import './DungeonsTab.css';

export default function DungeonsTab() {
  const character = useCharacter();
  const hasClassAndRace = character.class && character.race;

  if (!hasClassAndRace) {
    return (
      <div className="dungeons-tab">
        <div className="dungeons-placeholder">
          <h3>Select a class and race to access dungeons</h3>
          <p>Dungeons require a fully created character.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dungeons-tab">
      <div className="dungeons-header">
        <h3>Dungeons</h3>
        <ConsumablesDisplay />
      </div>
      <div className="dungeons-content">
        {!character.combatState?.active && !character.currentDungeon ? (
          <DungeonList />
        ) : character.combatState?.active ? (
          <CombatSimulator />
        ) : (
          <DungeonDetail />
        )}
      </div>
      {character.combatState && !character.combatState.active && character.currentDungeon && (
        <CombatResults />
      )}
    </div>
  );
}
