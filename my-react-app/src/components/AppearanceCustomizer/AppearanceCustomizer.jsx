import React from 'react';
import { useCharacter, useCharacterDispatch } from '../../contexts/CharacterContext';
import { APPEARANCE_OPTIONS } from '../../data/appearanceOptions';
import './AppearanceCustomizer.css';

export default function AppearanceCustomizer() {
  const character = useCharacter();
  const dispatch = useCharacterDispatch();

  const renderColorOptions = (key, options) => (
    <div className="appearance-option" key={key}>
      <label>{key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}</label>
      <div className="appearance-options-row">
        {options.map(opt => (
          <button
            key={opt.id}
            className={`appearance-option-btn color-btn ${character.appearance[key] === opt.id ? 'appearance-option--selected' : ''}`}
            style={{ '--option-color': opt.hex }}
            onClick={() => dispatch({ type: 'SET_APPEARANCE', payload: { key, value: opt.id } })}
            title={opt.name}
            data-testid={`${key}-${opt.id}`}
          />
        ))}
      </div>
    </div>
  );

  const renderTextOptions = (key, options) => (
    <div className="appearance-option" key={key}>
      <label>{key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}</label>
      <div className="appearance-options-row">
        {options.map(opt => (
          <button
            key={opt.id}
            className={`appearance-option-btn text-btn ${character.appearance[key] === opt.id ? 'appearance-option--selected' : ''}`}
            onClick={() => dispatch({ type: 'SET_APPEARANCE', payload: { key, value: opt.id } })}
            data-testid={`${key}-${opt.id}`}
          >
            {opt.name}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="appearance-customizer">
      <h3>Customize Appearance</h3>
      {renderColorOptions('hairColor', APPEARANCE_OPTIONS.hairColor)}
      {renderColorOptions('skinTone', APPEARANCE_OPTIONS.skinTone)}
      {renderColorOptions('eyeColor', APPEARANCE_OPTIONS.eyeColor)}
      {renderTextOptions('hairStyle', APPEARANCE_OPTIONS.hairStyle)}
      {renderTextOptions('build', APPEARANCE_OPTIONS.build)}
    </div>
  );
}
