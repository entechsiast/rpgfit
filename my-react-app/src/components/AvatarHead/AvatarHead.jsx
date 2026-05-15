import React from 'react';

export default function AvatarHead({ race, skinColor, faceShape }) {
  const getFacePath = () => {
    switch (faceShape) {
      case 'broad':
        return 'M100 45 C130 45 145 65 145 95 C145 120 130 130 100 135 C70 130 55 120 55 95 C55 65 70 45 100 45 Z';
      case 'round':
        return 'M100 40 C130 40 148 60 148 95 C148 128 130 138 100 138 C70 138 52 128 52 95 C52 60 70 40 100 40 Z';
      case 'small':
        return 'M100 55 C120 55 132 70 132 95 C132 118 120 128 100 128 C80 128 68 118 68 95 C68 70 80 55 100 55 Z';
      case 'narrow':
        return 'M100 42 C128 42 140 60 140 90 C140 115 125 130 100 138 C75 130 60 115 60 90 C60 60 72 42 100 42 Z';
      default:
        return 'M100 45 C128 45 142 62 142 92 C142 118 128 132 100 135 C72 132 58 118 58 92 C58 62 72 45 100 45 Z';
    }
  };

  const earLeftPath = () => {
    if (race === 'elf' || race === 'half_elf') {
      return 'M60 80 L35 55 L50 90 Z';
    }
    if (race === 'dwarf') {
      return 'M58 85 C48 75 45 90 55 95 Z';
    }
    return 'M58 82 L52 78 L50 92 Z';
  };

  const earRightPath = () => {
    if (race === 'elf' || race === 'half_elf') {
      return 'M140 80 L165 55 L150 90 Z';
    }
    if (race === 'dwarf') {
      return 'M142 85 C152 75 155 90 145 95 Z';
    }
    return 'M142 82 L148 78 L150 92 Z';
  };

  return (
    <g className="avatar-head">
      {/* Ears (behind head) */}
      <path d={earLeftPath()} fill={skinColor} />
      <path d={earRightPath()} fill={skinColor} />
      {/* Face */}
      <path d={getFacePath()} fill={skinColor} />
    </g>
  );
}
