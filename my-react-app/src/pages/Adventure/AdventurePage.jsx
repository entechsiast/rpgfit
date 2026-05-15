import React, { useState, useEffect, useCallback } from 'react';
import { useCharacter, useCharacterDispatch } from '../../contexts/CharacterContext';
import { getXpProgress } from '../../data/xp';
import { CONSUMABLES } from '../../data/consumables';
import DungeonList from '../../components/DungeonList/DungeonList';
import DungeonDetail from '../../components/DungeonDetail/DungeonDetail';
import CombatSimulator from '../../components/CombatSimulator/CombatSimulator';
import CombatResults from '../../components/CombatResults/CombatResults';
import EquipmentGrid from '../../components/EquipmentGrid/EquipmentGrid';
import LevelUpModal from '../../components/LevelUpModal/LevelUpModal';
import HpMpDisplay from '../../components/HpMpDisplay/HpMpDisplay';
import GoldDisplay from '../../components/GoldDisplay/GoldDisplay';
import XpBar from '../../components/XpBar/XpBar';
import CharacterAvatar from '../../components/CharacterAvatar/CharacterAvatar';
import './AdventurePage.css';

const TABS = [
  { id: 'adventure', label: '\u2694\uFE0F Adventure' },
  { id: 'character', label: '\uD83D\uDC64 Character' },
  { id: 'inventory', label: '\uD83C\uDF81 Inventory' },
];

const SHOP_TABS = ['all', 'potions', 'elixirs', 'scrolls'];

export default function AdventurePage() {
  const character = useCharacter();
  const dispatch = useCharacterDispatch();
  const [activeTab, setActiveTab] = useState('adventure');
  const [showLevelUp, setShowLevelUp] = useState(false);

  // Check for level up after XP changes
  useEffect(() => {
    if (character.xp > 0) {
      const xpNeeded = getXpProgress(character.xp, character.level);
      if (xpNeeded >= 100 && character.statPointsToSpend > 0) {
        setShowLevelUp(true);
      }
    }
  }, [character.xp, character.level, character.statPointsToSpend]);

  const handleDeath = useCallback(() => {
    const goldLost = Math.floor(character.gold * 0.1);
    dispatch({ type: 'ADD_GOLD', payload: -goldLost });
    dispatch({
      type: 'REST',
    });
    // REST action already handles gold cost and full heal
    // But for death, we want no gold cost and a warning
    alert(`You have fallen in battle! Lost ${goldLost} gold as a memento.`);
  }, [character.gold, dispatch]);

  // Check for death
  useEffect(() => {
    if (character.currentHP <= 0 && !character.combatState?.active) {
      handleDeath();
    }
  }, [character.currentHP, character.combatState?.active, handleDeath]);

  const handleLevelUpConfirm = (statId) => {
    if (statId) {
      dispatch({ type: 'DISTRIBUTE_STAT', payload: { statId, value: 1 } });
    }
    dispatch({ type: 'LEVEL_UP' });
    setShowLevelUp(false);
  };

  const handleLevelUpSkip = () => {
    dispatch({ type: 'LEVEL_UP' });
    setShowLevelUp(false);
  };

  // Check if character exists
  if (!character.class || !character.race) {
    return (
      <div className="adventure-page">
        <div className="adventure-empty">
          <h2>No Character Found</h2>
          <p>Create a character first to begin your adventure.</p>
          <a href="/creator" className="adventure-create-btn">
            Create Character
          </a>
        </div>
      </div>
    );
  }

  const xpProgress = getXpProgress(character.xp, character.level);

  return (
    <div className="adventure-page">
      {/* Top Bar */}
      <div className="adventure-topbar">
        <div className="topbar-left">
          <div className="topbar-avatar">
            <CharacterAvatar />
          </div>
          <div className="topbar-info">
            <h3 className="topbar-name">{character.name || 'Unnamed Hero'}</h3>
            <span className="topbar-title">
              {character.race?.name} {character.class?.name}
            </span>
            <span className="topbar-level">Level {character.level}</span>
          </div>
        </div>

        <div className="topbar-center">
          <HpMpDisplay compact />
          <XpBar compact progress={xpProgress} />
          <GoldDisplay compact />
        </div>

        <div className="topbar-right">
          <a href="/creator" className="topbar-link">
            \u270E\uFE0F Edit Character
          </a>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="adventure-tabs">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`adventure-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            data-testid={`adventure-tab-${tab.id}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="adventure-content">
        {activeTab === 'adventure' && (
          <div className="adventure-tab-content">
            {!character.combatState?.active && !character.currentDungeon ? (
              <DungeonList />
            ) : character.combatState?.active ? (
              <CombatSimulator />
            ) : (
              <DungeonDetail />
            )}
            {character.combatState && !character.combatState.active && character.currentDungeon && (
              <CombatResults />
            )}
          </div>
        )}

        {activeTab === 'character' && (
          <div className="character-sheet">
            <div className="sheet-header">
              <div className="sheet-avatar">
                <CharacterAvatar />
              </div>
              <div className="sheet-info">
                <h3>{character.name || 'Unnamed Hero'}</h3>
                <p className="sheet-title">
                  {character.race?.name} {character.class?.name}
                </p>
              </div>
              <div className="sheet-level-badge">
                <span className="level-number">{character.level}</span>
                <span className="level-label">LEVEL</span>
              </div>
            </div>

            <div className="sheet-body">
              {/* Core Stats */}
              <div className="sheet-section">
                <h4 className="sheet-section-title">Core Stats</h4>
                <div className="stats-grid">
                  {Object.entries(character.stats).map(([statId, value]) => {
                    const bonus = character.equippedBonuses?.[statId] || 0;
                    const total = value + bonus;
                    return (
                      <div key={statId} className="stat-card">
                        <span className="stat-icon">{statId.charAt(0).toUpperCase()}</span>
                        <span className="stat-name">{statId.toUpperCase()}</span>
                        <span className="stat-value">{total}</span>
                        {bonus !== 0 && (
                          <span className="stat-bonus">{bonus > 0 ? '+' : ''}{bonus}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Combat Stats */}
              <div className="sheet-section">
                <h4 className="sheet-section-title">Combat Stats</h4>
                <div className="combat-stats-grid">
                  <div className="combat-stat-row">
                    <span>Max HP:</span>
                    <span>{character.maxHP}</span>
                  </div>
                  <div className="combat-stat-row">
                    <span>Max MP:</span>
                    <span>{character.maxMP}</span>
                  </div>
                  <div className="combat-stat-row">
                    <span>Hit Die:</span>
                    <span>{character.class?.hitDie || 'd6'}</span>
                  </div>
                  <div className="combat-stat-row">
                    <span>Primary Stat:</span>
                    <span>{character.class?.primaryStat?.toUpperCase()}</span>
                  </div>
                </div>
              </div>

              {/* Skills */}
              <div className="sheet-section">
                <h4 className="sheet-section-title">Skills</h4>
                <div className="skills-list">
                  {Array.from(character.selectedSkillIds).map(id => (
                    <span key={id} className="skill-tag">{id.replace(/_/g, ' ')}</span>
                  ))}
                  {character.selectedSkillIds.size === 0 && (
                    <span className="no-skills">No skills selected</span>
                  )}
                </div>
              </div>

              {/* Level Progress */}
              <div className="sheet-section">
                <h4 className="sheet-section-title">Progression</h4>
                <div className="progression-grid">
                  <div className="progress-item">
                    <span className="progress-label">XP to Next</span>
                    <span className="progress-value">{getXpProgress(character.xp, character.level).toFixed(1)}%</span>
                  </div>
                  <div className="progress-item">
                    <span className="progress-label">Gold</span>
                    <span className="progress-value gold-value">{character.gold.toLocaleString()}</span>
                  </div>
                  {character.statPointsToSpend > 0 && (
                    <div className="progress-item highlight">
                      <span className="progress-label">Stat Points</span>
                      <span className="progress-value">{character.statPointsToSpend}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Completed Dungeons */}
              <div className="sheet-section">
                <h4 className="sheet-section-title">Completed Dungeons</h4>
                <div className="completed-dungeons">
                  {character.completedDungeons.length === 0 ? (
                    <span className="no-dungeons">No dungeons completed yet</span>
                  ) : (
                    character.completedDungeons.map(dungeonId => (
                      <span key={dungeonId} className="dungeon-badge">{dungeonId.replace(/_/g, ' ')}</span>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="inventory-tab">
            <div className="inventory-layout">
              <div className="inventory-section">
                <h3 className="inventory-section-title">Equipment</h3>
                <EquipmentGrid compact />
              </div>
              <div className="inventory-section">
                <h3 className="inventory-section-title">Consumables</h3>
                <ConsumablesPanel />
              </div>
              <div className="inventory-section">
                <h3 className="inventory-section-title">Shop</h3>
                <ShopPanel />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Level Up Modal */}
      {showLevelUp && (
        <LevelUpModal
          level={character.level + 1}
          hitDie={character.class?.hitDie || 'd6'}
          onConfirm={handleLevelUpConfirm}
          onSkip={handleLevelUpSkip}
        />
      )}
    </div>
  );
}

function ConsumablesPanel() {
  const character = useCharacter();
  const dispatch = useCharacterDispatch();

  const consumableList = Object.entries(character.consumables || {}).filter(([_, count]) => count > 0);

  if (consumableList.length === 0) {
    return <div className="empty-inventory">No consumables. Visit the shop!</div>;
  }

  return (
    <div className="consumables-panel">
      {consumableList.map(([itemId, count]) => {
        const item = CONSUMABLES.find(c => c.id === itemId);
        if (!item) return null;
        return (
          <div key={itemId} className="consumable-row" data-testid={`consumable-inventory-${itemId}`}>
            <div className="consumable-info">
              <span className="consumable-name">{item.name}</span>
              <span className="consumable-count">x{count}</span>
              <span className="consumable-desc">{item.description}</span>
            </div>
            <button
              className="btn-use-consumable"
              onClick={() => dispatch({ type: 'USE_CONSUMABLE', payload: itemId })}
              data-testid={`btn-use-${itemId}`}
            >
              Use
            </button>
          </div>
        );
      })}
    </div>
  );
}

function ShopPanel() {
  const character = useCharacter();
  const dispatch = useCharacterDispatch();
  const [shopTab, setShopTab] = useState('all');

  const filterShopItems = () => {
    return CONSUMABLES.filter(item => {
      if (shopTab === 'all') return true;
      if (shopTab === 'potions') return item.effect?.type === 'heal' || item.effect?.type === 'mana';
      if (shopTab === 'elixirs') return item.effect?.type === 'buff' || item.effect?.type === 'buff_multi';
      if (shopTab === 'scrolls') return item.name.toLowerCase().includes('scroll');
      return true;
    });
  };

  const handleBuy = (itemId) => {
    dispatch({ type: 'BUY_ITEM', payload: { itemId } });
  };

  const shopItems = filterShopItems();

  return (
    <div className="shop-panel">
      <div className="shop-tabs">
        {SHOP_TABS.map(tab => (
          <button
            key={tab}
            className={`shop-tab-btn ${shopTab === tab ? 'active' : ''}`}
            onClick={() => setShopTab(tab)}
            data-testid={`shop-tab-${tab}`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>
      <div className="shop-items">
        {shopItems.length === 0 ? (
          <div className="empty-shop">No items in this category</div>
        ) : (
          shopItems.map(item => (
            <div key={item.id} className="shop-item" data-testid={`shop-item-${item.id}`}>
              <div className="shop-item-info">
                <span className="shop-item-name">{item.name}</span>
                <span className="shop-item-desc">{item.description}</span>
                <span className={`shop-item-rarity rarity-${item.rarity}`}>{item.rarity}</span>
              </div>
              <button
                className={`btn-buy ${character.gold < item.price ? 'disabled' : ''}`}
                onClick={() => handleBuy(item.id)}
                disabled={character.gold < item.price}
                data-testid={`btn-buy-${item.id}`}
              >
                {item.price} Gold
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
