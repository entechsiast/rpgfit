import React, { useState } from 'react';
import { useCharacter, useCharacterDispatch } from '../../contexts/CharacterContext';
import { SLOT_ORDER, getAllItems } from '../../data/equipment';
import EquipmentSlot from '../EquipmentSlot/EquipmentSlot';
import EquipmentItemCard from '../EquipmentItemCard/EquipmentItemCard';
import './EquipmentGrid.css';

const FILTER_OPTIONS = [
  { id: 'all', label: 'All' },
  { id: 'head', label: 'Head' },
  { id: 'chest', label: 'Chest' },
  { id: 'pants', label: 'Pants' },
  { id: 'boots', label: 'Boots' },
  { id: 'rightHand', label: 'Weapons' },
  { id: 'leftHand', label: 'Left Hand' },
  { id: 'accessory1', label: 'Accessories' },
];

export default function EquipmentGrid() {
  const character = useCharacter();
  const dispatch = useCharacterDispatch();
  const [filter, setFilter] = useState('all');
  const [rarityFilter, setRarityFilter] = useState('all');

  const handleEquip = (item) => {
    const currentEquipped = character.equipment[item.slot];
    if (currentEquipped) {
      dispatch({ type: 'UNEQUIP_ITEM', payload: item.slot });
    }
    dispatch({ type: 'EQUIP_ITEM', payload: { slot: item.slot, item } });
  };

  const handleUnequip = (slot) => {
    dispatch({ type: 'UNEQUIP_ITEM', payload: slot });
  };

  const getFilteredItems = () => {
    let items = getAllItems();
    if (filter !== 'all') {
      items = items.filter(i => i.slot === filter);
    }
    if (rarityFilter !== 'all') {
      items = items.filter(i => i.rarity === rarityFilter);
    }
    return items;
  };

  const availableItems = getFilteredItems();

  return (
    <div className="equipment-grid">
      <div className="equipment-left">
        <div className="equipment-filters">
          <div className="filter-group">
            <span className="filter-label">Slot:</span>
            <div className="filter-buttons">
              {FILTER_OPTIONS.map(opt => (
                <button
                  key={opt.id}
                  className={`filter-btn ${filter === opt.id ? 'active' : ''}`}
                  onClick={() => setFilter(opt.id)}
                  data-testid={`filter-slot-${opt.id}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div className="filter-group">
            <span className="filter-label">Rarity:</span>
            <select
              className="rarity-select"
              value={rarityFilter}
              onChange={e => setRarityFilter(e.target.value)}
              data-testid="filter-rarity"
            >
              <option value="all">All</option>
              <option value="common">Common</option>
              <option value="uncommon">Uncommon</option>
              <option value="rare">Rare</option>
              <option value="epic">Epic</option>
            </select>
          </div>
        </div>

        <div className="available-items">
          {availableItems.length === 0 && (
            <div className="no-items">No items match this filter</div>
          )}
          {availableItems.map(item => (
            <EquipmentItemCard key={item.id} item={item} onEquip={handleEquip} data-testid={`equipment-item-${item.id}`} />
          ))}
        </div>
      </div>

      <div className="equipment-right">
        <h3 className="equipped-title">Equipped</h3>
        <div className="equipped-grid">
          {SLOT_ORDER.map(slot => (
            <EquipmentSlot
              key={slot}
              slotId={slot}
              item={character.equipment[slot]}
              onUnequip={handleUnequip}
              data-testid={`equipment-slot-${slot}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
