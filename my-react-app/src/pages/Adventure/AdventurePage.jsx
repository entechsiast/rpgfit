/* eslint-disable max-lines */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useCharacter, useCharacterDispatch } from '../../contexts/CharacterContext';
import { getXpProgress } from '../../data/xp';
import { getFloorRequirements } from '../../data/floors';
import { CONSUMABLES } from '../../data/consumables';
import ActivityLogger from '../../components/ActivityLogger/ActivityLogger';
import DungeonList from '../../components/DungeonList/DungeonList';
import DungeonDetail from '../../components/DungeonDetail/DungeonDetail';
import CombatSimulator from '../../components/CombatSimulator/CombatSimulator';
import CombatResults from '../../components/CombatResults/CombatResults';
import EquipmentInventoryPanel from '../../components/EquipmentInventoryPanel/EquipmentInventoryPanel';
import LevelUpModal from '../../components/LevelUpModal/LevelUpModal';
import HpMpDisplay from '../../components/HpMpDisplay/HpMpDisplay';
import GoldDisplay from '../../components/GoldDisplay/GoldDisplay';
import XpBar from '../../components/XpBar/XpBar';
import CharacterAvatar from '../../components/CharacterAvatar/CharacterAvatar';
import DropFeedback from '../../components/DropFeedback/DropFeedback';
import CelebrationNotification from '../../components/CelebrationNotification/CelebrationNotification';
import ContextualNpcMessage from '../../components/ContextualNpcMessage/ContextualNpcMessage';
import NpcDialogue from '../../components/NpcDialogue/NpcDialogue';
import { useDialogue } from '../../hooks/useDialogue';
import useContextualMessages from '../../hooks/useContextualMessages';
import './AdventurePage.css';

const TABS = [
  { id: 'adventure', label: '\u2694\uFE0F Adventure' },
  { id: 'character', label: '\uD83D\uDC64 Character' },
  { id: 'inventory', label: '\uD83C\uDF81 Inventory' },
];

const SHOP_TABS = ['all', 'potions', 'elixirs', 'scrolls'];

// eslint-disable-next-line complexity, max-lines
export default function AdventurePage() {
  const character = useCharacter();
  const dispatch = useCharacterDispatch();
  const [activeTab, setActiveTab] = useState('adventure');
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [activeRewards, setActiveRewards] = useState([]);
  const rewardTimersRef = useRef({});

  // ─── Celebration Notification State ──────────────────────────────────────
  const [activeCelebration, setActiveCelebration] = useState(null); // { floorNumber, floorName, celebrationText }

  // ─── Contextual NPC Messages ─────────────────────────────────────────────

  const currentFloor = character.currentFloor || 1;
  const animationEnabled = character.animationEnabled !== false;
  const { message: contextualMessage, triggerMessage, clearMessage } = useContextualMessages(animationEnabled);

  // Floor entry trigger — fires when currentFloor changes
  useEffect(() => {
    if (currentFloor > 0) {
      triggerMessage('FLOOR_ENTRY', currentFloor);
    }
  }, [currentFloor, triggerMessage]);

  // Combat start trigger — fires when combat becomes active
  const wasCombatActive = useRef(false);
  useEffect(() => {
    if (character.combatState?.active && !wasCombatActive.current) {
      triggerMessage('COMBAT_START');
    }
    if (character.combatState?.active) {
      wasCombatActive.current = true;
    } else {
      wasCombatActive.current = false;
    }
  }, [character.combatState?.active, triggerMessage]);

  // Floor completion trigger — fires when a milestone celebration appears
  useEffect(() => {
    if (activeCelebration) {
      triggerMessage('FLOOR_COMPLETE');
    }
  }, [activeCelebration, triggerMessage]);

  // Death trigger — fires when player dies (HP <= 0 and not in combat)
  const wasAlive = useRef(true);
  useEffect(() => {
    if (character.currentHP <= 0 && !character.combatState?.active && wasAlive.current) {
      triggerMessage('DEATH');
    }
    if (character.currentHP > 0) {
      wasAlive.current = true;
    }
  }, [character.currentHP, character.combatState?.active, triggerMessage]);

  // Watch for milestone rewards and trigger the celebration overlay
  useEffect(() => {
    const log = character.rewardLog || [];
    if (log.length > 0) {
      const last = log[log.length - 1];
      if (last.type === 'milestone' && last.floor) {
        // Only show celebration if not already showing one
        if (!activeCelebration) {
          setActiveCelebration({
            floorNumber: last.floor,
            floorName: last.floorName || `Floor ${last.floor}`,
            celebrationText: last.celebrationText || '',
          });
        }
      }
    }
  }, [character.rewardLog, activeCelebration]);

  // ─── Dialogue State ──────────────────────────────────────────────────────

  const completedFloors = character.completedFloors || [];
  const discoveredLoreFragments = character.discoveredLoreFragments || 0;
  const tower1Completed = character.tower1Completed || false;

  const {
    availableDialogues,
    showNextDialogue,
    npcPresence,
    hasDialogues,
    npcsOnFloor,
  } = useDialogue(
    currentFloor,
    completedFloors,
    discoveredLoreFragments,
    tower1Completed
  );

  const [activeDialogueNpcId, setActiveDialogueNpcId] = useState(null);

  // Check for new dialogues on floor change
  useEffect(() => {
    // If no dialogue is active and there are available dialogues, auto-show first
    if (!activeDialogueNpcId) {
      for (const npc of npcsOnFloor) {
        if (hasDialogues[npc.id]) {
          return; // Don't auto-show, wait for player interaction
        }
      }
    }
  }, [currentFloor, activeDialogueNpcId, npcsOnFloor, hasDialogues]);

  const handleShowNext = useCallback((npcId) => {
    const result = showNextDialogue(npcId);
    if (result?.success) {
      setActiveDialogueNpcId(npcId);
    }
  }, [showNextDialogue]);

  const handleDismissDialogue = useCallback((_npcId) => {
    setActiveDialogueNpcId(null);
  }, []);

  const handleContinueDialogue = useCallback((npcId) => {
    const result = showNextDialogue(npcId);
    if (result?.success) {
      // Stay on same NPC to show next dialogue
    } else {
      // No more dialogues, close the bubble
      setActiveDialogueNpcId(null);
    }
  }, [showNextDialogue]);

  // Simulate active dialogue ID for the component
  const getActiveDialogueIdForNpc = (npcId) => {
    if (activeDialogueNpcId === npcId) {
      // Find the most recent met dialogue for this NPC
      const dialogues = availableDialogues[npcId];
      if (dialogues && dialogues.length > 0) {
        return dialogues[0].dialogue.id;
      }
    }
    return null;
  };

  const getHasMoreDialogues = (npcId) => {
    const dialogues = availableDialogues[npcId];
    if (!dialogues || dialogues.length <= 1) return false;
    // Count unmet dialogues
    const unmet = dialogues.filter(d => !d.met).length;
    return unmet > 0;
  };

  // Watch for new rewards and trigger DropFeedback animations
  useEffect(() => {
    const timers = rewardTimersRef.current;
    const log = character.rewardLog || [];
    if (log.length > 0) {
      // Find the latest reward not yet in activeRewards
      const activeTimestamps = activeRewards.map(r => r.timestamp);
      const last = log[log.length - 1];
      if (last.timestamp > 0 && !activeTimestamps.includes(last.timestamp)) {
        setActiveRewards(prev => [...prev, last]);
      }
    }
    return () => {
      Object.values(timers).forEach(clearTimeout);
    };
  }, [character.rewardLog, activeRewards]);

  // Clean up rewards after animation completes
  const handleRewardComplete = useCallback((rewardTimestamp) => {
    setActiveRewards(prev => prev.filter(r => r.timestamp !== rewardTimestamp));
  }, []);

  // Dismiss the celebration notification
  const handleDismissCelebration = useCallback(() => {
    setActiveCelebration(null);
  }, []);

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
          <FloorDisplay />
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
            <ActivityLogger />

            {/* NPC Dialogues — rendered inline with the floor content */}
            {npcPresence && npcsOnFloor.map(npc => {
              if (!npcPresence[npc.id]) return null;
              const dialogues = availableDialogues[npc.id];
              const isActive = activeDialogueNpcId === npc.id;
              const hasMore = getHasMoreDialogues(npc.id);
              const activeId = getActiveDialogueIdForNpc(npc.id);

              return (
                <NpcDialogue
                  key={npc.id}
                  npcId={npc.id}
                  dialogues={dialogues}
                  activeDialogueId={activeId}
                  showAvatar
                  typewriter={false}
                  autoDismiss={0}
                  isActive={isActive}
                  hasMoreDialogues={hasMore}
                  onShowNext={() => handleShowNext(npc.id)}
                  onDismiss={() => handleDismissDialogue(npc.id)}
                  onContinue={() => handleContinueDialogue(npc.id)}
                />
              );
            })}

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
                <EquipmentInventoryPanel />
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

      {/* Drop Feedback Animations — one per active reward */}
      {activeRewards.map(reward => (
        <DropFeedback
          key={reward.timestamp}
          reward={reward}
          animationEnabled={character.animationEnabled !== false}
          duration={reward.type === 'milestone' ? 2000 : 1500}
          onComplete={() => handleRewardComplete(reward.timestamp)}
        />
      ))}

      {/* Celebration Notification — parchment overlay on floor completion */}
      {activeCelebration && (
        <CelebrationNotification
          floorNumber={activeCelebration.floorNumber}
          floorName={activeCelebration.floorName}
          celebrationText={activeCelebration.celebrationText}
          onDismiss={handleDismissCelebration}
        />
      )}

      {/* Contextual NPC Message — floating text near NPC */}
      {contextualMessage && (
        <ContextualNpcMessage
          message={contextualMessage}
          onDismiss={clearMessage}
        />
      )}

      {/* Settings Toggle */}
      <SettingsToggle />
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

function FloorDisplay() {
  const character = useCharacter();
  const currentFloor = character.currentFloor || 1;
  const currentProgress = character.currentFloorProgress || 0;
  const floorReq = getFloorRequirements(currentFloor);
  const sessionsNeeded = floorReq.sessionsRequired;
  const progressPercent = sessionsNeeded > 0 ? (currentProgress / sessionsNeeded) * 100 : 0;

  return (
    <div className="topbar-floor" data-testid="current-floor">
      <span className="floor-label">
        Floor {currentFloor} — {floorReq.name}
      </span>
      <div className="floor-progress-bar" data-testid="floor-progress-bar">
        <div
          className="floor-progress-fill"
          style={{ width: `${Math.min(progressPercent, 100)}%` }}
        />
      </div>
      <span className="floor-progress-text">
        {currentProgress} / {sessionsNeeded}
      </span>
    </div>
  );
}

/**
 * SettingsToggle — Floating toggle to enable/disable drop feedback animations.
 * Provides accessibility control for players who prefer no animations.
 */
function SettingsToggle() {
  const character = useCharacter();
  const dispatch = useCharacterDispatch();
  const [open, setOpen] = useState(false);
  const animationEnabled = character.animationEnabled !== false;

  const toggleAnimations = () => {
    dispatch({
      type: 'TOGGLE_ANIMATION',
      payload: !animationEnabled,
    });
  };

  return (
    <div className="settings-toggle">
      <button
        className="settings-toggle-btn"
        onClick={() => setOpen(!open)}
        data-testid="settings-toggle-btn"
        aria-label="Toggle animation settings"
        title="Animation Settings"
      >
        ⚙️
      </button>

      {open && (
        <div className="settings-panel" data-testid="settings-panel">
          <h4 className="settings-title">Settings</h4>

          <div className="settings-option">
            <label className="settings-label">
              <input
                type="checkbox"
                checked={animationEnabled}
                onChange={toggleAnimations}
                data-testid="animation-toggle"
              />
              <span className="settings-option-text">
                Drop Feedback Animations
              </span>
            </label>
            <span className="settings-status">
              {animationEnabled ? 'ON' : 'OFF'}
            </span>
          </div>

          <div className="settings-hint">
            Disable for reduced motion preference
          </div>
        </div>
      )}
    </div>
  );
}
