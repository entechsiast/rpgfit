import React from 'react';
import AvatarHead from '../AvatarHead/AvatarHead';
import AvatarEyes from '../AvatarEyes/AvatarEyes';
import AvatarFeatures from '../AvatarFeatures/AvatarFeatures';
import AvatarHair from '../AvatarHair/AvatarHair';
import AvatarBody from '../AvatarBody/AvatarBody';
import AvatarArmor from '../AvatarArmor/AvatarArmor';
import { useCharacter } from '../../contexts/CharacterContext';
import { RACES } from '../../data/races';
import { APPEARANCE_OPTIONS } from '../../data/appearanceOptions';
import './CharacterAvatar.css';

export default function CharacterAvatar() {
  const character = useCharacter();
  const race = RACES.find(r => r.id === character.race?.id);

  const skinHex = APPEARANCE_OPTIONS.skinTone.find(o => o.id === character.appearance.skinTone)?.hex || '#e8c9a0';
  const hairHex = APPEARANCE_OPTIONS.hairColor.find(o => o.id === character.appearance.hairColor)?.hex || '#5c3a1e';
  const eyeHex = APPEARANCE_OPTIONS.eyeColor.find(o => o.id === character.appearance.eyeColor)?.hex || '#4a3728';
  const hasRace = character.race && character.class;

  if (!hasRace) {
    return (
      <div className="avatar-placeholder" data-testid="character-avatar">
        <svg viewBox="0 0 200 300" className="avatar-svg">
          <circle cx="100" cy="120" r="45" fill="#d1d5db" />
          <rect x="70" y="165" width="60" height="100" rx="10" fill="#d1d5db" />
          <text x="100" y="290" textAnchor="middle" fill="#9ca3af" fontSize="12" fontFamily="sans-serif">
            Select a race to begin
          </text>
        </svg>
      </div>
    );
  }

  const isElf = race?.id === 'elf' || race?.id === 'half_elf';
  const isDwarf = race?.id === 'dwarf';
  const isOrc = race?.id === 'orc';
  const isHalfling = race?.id === 'halfling';

  return (
    <div className="avatar-container" data-testid="character-avatar">
      <svg viewBox="0 0 200 300" className="avatar-svg" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <clipPath id="bodyClip">
            <rect x="50" y="160" width="100" height="120" rx="15" />
          </clipPath>
        </defs>

        <AvatarBody build={character.appearance.build} skinColor={skinHex} classId={character.class?.id} />

        <AvatarHead
          race={race?.id}
          skinColor={skinHex}
          faceShape={isOrc ? 'broad' : isDwarf ? 'round' : isHalfling ? 'small' : isElf ? 'narrow' : 'normal'}
        />

        <AvatarEyes color={eyeHex} race={race?.id} />

        <AvatarFeatures race={race?.id} skinColor={skinHex} />

        <AvatarHair
          style={character.appearance.hairStyle}
          color={hairHex}
          race={race?.id}
        />

        <AvatarArmor classId={character.class?.id} skinColor={skinHex} />
      </svg>
    </div>
  );
}
