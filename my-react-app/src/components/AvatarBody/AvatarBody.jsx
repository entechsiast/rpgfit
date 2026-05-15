import React from 'react';

export default function AvatarBody({ build, skinColor, classId }) {
  const getWidth = () => {
    switch (build) {
      case 'slim': return '72 160 L128 160 L130 260 L70 260 Z';
      case 'average': return '68 160 L132 160 L135 260 L65 260 Z';
      case 'athletic': return '62 160 L138 160 L140 200 L135 260 L65 260 L60 200 Z';
      case 'muscular': return '55 160 L145 160 L148 200 L142 260 L58 260 L52 200 Z';
      case 'heavy': return '58 160 L142 160 L145 200 L145 260 L55 260 L55 200 Z';
      default: return '68 160 L132 160 L135 260 L65 260 Z';
    }
  };

  return (
    <g className="avatar-body">
      <path d={getWidth()} fill={skinColor} />
      {/* Neck */}
      <rect x="90" y="135" width="20" height="30" fill={skinColor} />
    </g>
  );
}
