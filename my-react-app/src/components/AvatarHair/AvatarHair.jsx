import React from 'react';

export default function AvatarHair({ style, color, race }) {
    const getHairPath = () => {
    switch (style) {
      case 'short':
        return 'M100 38 C125 38 140 50 142 70 C143 85 138 95 135 100 L130 95 C132 85 130 70 125 55 C118 42 108 38 100 38 C92 38 82 42 75 55 C70 70 68 85 70 95 L65 100 C62 95 57 85 58 70 C60 50 75 38 100 38 Z';
      case 'medium':
        return 'M100 38 C125 38 140 50 142 70 C143 85 140 100 138 110 L135 105 C137 95 138 85 135 70 C130 55 118 42 100 38 C82 42 70 55 65 70 C62 85 63 95 65 105 L62 110 C60 100 57 85 58 70 C60 50 75 38 100 38 Z';
      case 'long':
        return 'M100 38 C125 38 140 50 142 70 C143 85 140 110 138 130 L135 125 C137 110 138 95 135 70 C130 55 118 42 100 38 C82 42 70 55 65 70 C62 95 63 110 65 125 L62 130 C60 110 57 85 58 70 C60 50 75 38 100 38 Z';
      case 'braided':
        return (
          <g>
            <path d="M100 38 C125 38 140 50 142 70 C143 85 138 100 135 110 L132 105 C135 95 136 85 133 70 C128 55 118 42 100 38 C82 42 70 55 65 70 C62 85 63 95 65 105 L62 110 C60 100 57 85 58 70 C60 50 75 38 100 38 Z" fill={color} />
            <path d="M85 95 Q80 120 75 140" stroke={color} strokeWidth="4" fill="none" strokeLinecap="round" />
            <path d="M100 95 Q95 125 92 145" stroke={color} strokeWidth="4" fill="none" strokeLinecap="round" />
            <path d="M115 95 Q120 120 125 140" stroke={color} strokeWidth="4" fill="none" strokeLinecap="round" />
          </g>
        );
      case 'bald':
        return null;
      case 'ponytail':
        return (
          <g>
            <path d="M100 38 C125 38 140 50 142 70 C143 85 138 95 135 100 L130 95 C132 85 130 70 125 55 C118 42 108 38 100 38 C92 38 82 42 75 55 C70 70 68 85 70 95 L65 100 C62 95 57 85 58 70 C60 50 75 38 100 38 Z" fill={color} />
            <path d="M100 40 Q105 60 108 80 Q110 100 105 120" stroke={color} strokeWidth="8" fill="none" strokeLinecap="round" />
          </g>
        );
      default:
        return 'M100 38 C125 38 140 50 142 70 C143 85 138 95 135 100 L130 95 C132 85 130 70 125 55 C118 42 108 38 100 38 C92 38 82 42 75 55 C70 70 68 85 70 95 L65 100 C62 95 57 85 58 70 C60 50 75 38 100 38 Z';
    }
  };

  if (style === 'bald') return null;

  return (
    <g className="avatar-hair">
      {getHairPath()}
    </g>
  );
}
