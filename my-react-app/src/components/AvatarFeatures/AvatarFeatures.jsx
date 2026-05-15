import React from 'react';

export default function AvatarFeatures({ race, skinColor }) {
  const isOrc = race === 'orc';
  const isDwarf = race === 'dwarf';
  const isHalfling = race === 'halfling';

  const renderNose = () => {
    if (isOrc) {
      return (
        <g className="avatar-nose">
          <path d="M97 105 L100 115 L103 105 Z" fill={skinColor} stroke={skinColor} strokeWidth="1" />
          <circle cx="96" cy="112" r="2" fill={skinColor} />
          <circle cx="104" cy="112" r="2" fill={skinColor} />
        </g>
      );
    }
    if (isDwarf) {
      return (
        <g className="avatar-nose">
          <ellipse cx="100" cy="108" rx="6" ry="4" fill={skinColor} />
        </g>
      );
    }
    if (isHalfling) {
      return (
        <g className="avatar-nose">
          <circle cx="100" cy="107" r="3" fill={skinColor} />
        </g>
      );
    }
    return (
      <g className="avatar-nose">
        <path d="M98 103 L100 110 L102 103 Z" fill={skinColor} />
      </g>
    );
  };

  const renderTusks = () => {
    if (!isOrc) return null;
    return (
      <g className="avatar-tusks">
        <path d="M90 118 Q88 128 85 132 Q89 128 92 120 Z" fill="#f5f0e8" />
        <path d="M110 118 Q112 128 115 132 Q111 128 108 120 Z" fill="#f5f0e8" />
      </g>
    );
  };

  const renderBeard = () => {
    if (!isDwarf) return null;
    return (
      <g className="avatar-beard">
        <path d="M82 115 Q85 145 100 155 Q115 145 118 115 Q110 125 100 122 Q90 125 82 115 Z" fill="#5c3a1e" />
      </g>
    );
  };

  return (
    <g className="avatar-features">
      {renderNose()}
      {renderTusks()}
      {renderBeard()}
    </g>
  );
}
