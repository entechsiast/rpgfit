import React, { useState, useEffect } from 'react';
import { useCharacter, useCharacterDispatch } from '../../contexts/CharacterContext';
import { api } from '../../services/api';
import ClassSelector from '../../components/ClassSelector/ClassSelector';
import RaceSelector from '../../components/RaceSelector/RaceSelector';
import StatAllocator from '../../components/StatAllocator/StatAllocator';
import AppearanceCustomizer from '../../components/AppearanceCustomizer/AppearanceCustomizer';
import SkillTree from '../../components/SkillTree/SkillTree';
import EquipmentGrid from '../../components/EquipmentGrid/EquipmentGrid';
import CharacterPreview from '../../components/CharacterPreview/CharacterPreview';
import './RPGCharacterCreator.css';

const TABS = [
  { id: 'class', label: 'Class' },
  { id: 'race', label: 'Race' },
  { id: 'stats', label: 'Stats' },
  { id: 'appearance', label: 'Appearance' },
  { id: 'skills', label: 'Skills' },
  { id: 'equipment', label: 'Equipment' },
];

export default function RPGCharacterCreator() {
  const character = useCharacter();
  const dispatch = useCharacterDispatch();
  const [activeTab, setActiveTab] = useState('class');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.loadCharacter().then(data => {
      if (data) {
        dispatch({ type: 'LOAD_CHARACTER', payload: data });
      }
    });
  }, [dispatch]);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    await api.saveCharacter(character);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    dispatch({ type: 'RESET' });
    api.clearCharacter();
  };

  const renderTab = () => {
    switch (activeTab) {
      case 'class':
        return <ClassSelector />;
      case 'race':
        return <RaceSelector />;
      case 'stats':
        return <StatAllocator />;
      case 'appearance':
        return <AppearanceCustomizer />;
      case 'skills':
        return <SkillTree />;
      case 'equipment':
        return <EquipmentGrid />;
      default:
        return <ClassSelector />;
    }
  };

  return (
    <div className="creator">
      <div className="creator-left">
        <div className="creator-header">
          <h1 className="creator-title">Character Creator</h1>
          <div className="creator-actions">
            <button className="btn-reset" onClick={handleReset} data-testid="btn-reset">
              Reset
            </button>
            <button
              className="btn-save"
              onClick={handleSave}
              disabled={saving}
              data-testid="btn-save"
            >
              {saving ? 'Saving...' : saved ? 'Saved!' : 'Save'}
            </button>
          </div>
        </div>

        <div className="creator-tabs">
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
              data-testid={`tab-${tab.id}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="creator-content">
          {renderTab()}
        </div>
      </div>

      <div className="creator-right">
        <CharacterPreview />
      </div>
    </div>
  );
}
