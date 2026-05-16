import React from 'react';
import { useCharacter, useCharacterDispatch } from '../../contexts/CharacterContext';
import { getItemById } from '../../data/equipment';
import { RARITY_COLORS, SLOT_ORDER } from '../../data/equipment';
import './EquipmentInventoryPanel.css';

export default function EquipmentInventoryPanel() {
  const character = useCharacter();
  const dispatch = useCharacterDispatch();

  const { ownedEquipment, equipment } = character;
  const ownedIds = Array.isArray(ownedEquipment) ? ownedEquipment : [];

  // Build a map of slot -> items (both owned and equipped)
  const slotItems = {};
  SLOT_ORDER.forEach(slot => {
    slotItems[slot] = { equipped: null, owned: [] };
  });

  // Add equipped items
  SLOT_ORDER.forEach(slot => {
    const eqItem = equipment[slot];
    if (eqItem) {
      slotItems[slot].equipped = eqItem;
    }
  });

  // Add owned items
  ownedIds.forEach(itemId => {
    const item = getItemById(itemId);
    if (item) {
      slotItems[item.slot].owned.push(item);
    }
  });

  const handleEquip = (item) => {
    const currentEquipped = equipment[item.slot];
    if (currentEquipped) {
      dispatch({ type: 'UNEQUIP_ITEM', payload: item.slot });
    }
    dispatch({ type: 'EQUIP_ITEM', payload: { slot: item.slot, item } });
  };

  const handleUnequip = (slot) => {
    dispatch({ type: 'UNEQUIP_ITEM', payload: slot });
  };

  return (
    <div className="equipment-inventory" data-testid="equipment-inventory">
      {SLOT_ORDER.map(slot => {
        const items = slotItems[slot];
        const allItems = [];

        // Add equipped item first if exists
        if (items.equipped) {
          allItems.push({ ...items.equipped, _equipped: true });
        }

        // Add owned unequipped items
        items.owned.forEach(item => {
          allItems.push({ ...item, _equipped: false });
        });

        return (
          <div key={slot} className="inventory-slot-group">
            <h4 className="inventory-slot-title">{slot.replace(/([A-Z])/g, ' $1').replace(/^ /, '')}</h4>
            <div className="inventory-slot-items">
              {allItems.length === 0 ? (
                <div className="empty-slot-placeholder">
                  <span className="empty-slot-icon">&#128065;</span>
                  <span className="empty-slot-text">No items</span>
                </div>
              ) : (
                allItems.map((item, idx) => {
                  const itemId = item.id;
                  const rarityColor = RARITY_COLORS[item.rarity] || '#9ca3af';
                  const isEquipped = item._equipped;

                  return (
                    <div
                      key={`${itemId}-${idx}`}
                      className={`inventory-item-card ${isEquipped ? 'equipped' : ''}`}
                      style={{ '--rarity': rarityColor, '--equipped-color': '#22c55e' }}
                      data-testid={`owned-item-${itemId}`}
                    >
                      <div className="inventory-item-header">
                        <span className="inventory-item-name">{item.name}</span>
                        <span className="inventory-item-rarity" style={{ color: rarityColor }}>{item.rarity}</span>
                      </div>
                      <div className="inventory-item-meta">
                        <span className="inventory-item-slot">{item.slot}</span>
                        {item.statBonuses && Object.keys(item.statBonuses).length > 0 && (
                          <span className="inventory-item-stats">
                            {Object.entries(item.statBonuses).map(([stat, val]) => (
                              <span key={stat} className="inventory-stat">+{val} {stat.toUpperCase()}</span>
                            ))}
                          </span>
                        )}
                      </div>
                      <div className="inventory-item-actions">
                        {isEquipped ? (
                          <span className="equipped-badge" data-testid={`btn-unequip-${slot}`}>
                            Equipped
                          </span>
                        ) : (
                          <button
                            className="btn-equip-item"
                            onClick={() => handleEquip(item)}
                            data-testid={`btn-equip-${itemId}`}
                          >
                            Equip
                          </button>
                        )}
                        {isEquipped && (
                          <button
                            className="btn-unequip-item"
                            onClick={() => handleUnequip(slot)}
                            data-testid={`btn-unequip-${slot}`}
                          >
                            Unequip
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
