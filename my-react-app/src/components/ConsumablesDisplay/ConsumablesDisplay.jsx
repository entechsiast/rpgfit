import React from 'react';
import { CONSUMABLES } from '../../data/consumables';
import './ConsumablesDisplay.css';

export default function ConsumablesDisplay() {
  return (
    <div className="consumables-display" data-testid="consumables-display">
      <h4 className="consumables-title">Consumables</h4>
      <div className="consumables-list">
        {CONSUMABLES.map(item => (
          <div key={item.id} className="consumable-item" data-testid={`consumable-${item.id}`}>
            <span className="consumable-name">{item.name}</span>
            <span className="consumable-desc">{item.description}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
