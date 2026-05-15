import React from 'react';

export default function AvatarEyes({ color, race }) {
  const isElf = race === 'elf' || race === 'half_elf';
  const isOrc = race === 'orc';

  const leftEyeX = 82;
  const rightEyeX = 118;
  const eyeY = 95;

  const leftEyePath = () => {
    if (isOrc) {
      return `M${leftEyeX - 10} ${eyeY - 3} Q${leftEyeX} ${eyeY - 8} ${leftEyeX + 10} ${eyeY - 3} Q${leftEyeX} ${eyeY + 2} ${leftEyeX - 10} ${eyeY - 3} Z`;
    }
    if (isElf) {
      return `M${leftEyeX - 10} ${eyeY - 2} Q${leftEyeX} ${eyeY - 8} ${leftEyeX + 10} ${eyeY - 2} Q${leftEyeX} ${eyeY + 3} ${leftEyeX - 10} ${eyeY - 2} Z`;
    }
    return `M${leftEyeX - 9} ${eyeY - 3} Q${leftEyeX} ${eyeY - 7} ${leftEyeX + 9} ${eyeY - 3} Q${leftEyeX} ${eyeY + 3} ${leftEyeX - 9} ${eyeY - 3} Z`;
  };

  const rightEyePath = () => {
    if (isOrc) {
      return `M${rightEyeX - 10} ${eyeY - 3} Q${rightEyeX} ${eyeY - 8} ${rightEyeX + 10} ${eyeY - 3} Q${rightEyeX} ${eyeY + 2} ${rightEyeX - 10} ${eyeY - 3} Z`;
    }
    if (isElf) {
      return `M${rightEyeX - 10} ${eyeY - 2} Q${rightEyeX} ${eyeY - 8} ${rightEyeX + 10} ${eyeY - 2} Q${rightEyeX} ${eyeY + 3} ${rightEyeX - 10} ${eyeY - 2} Z`;
    }
    return `M${rightEyeX - 9} ${eyeY - 3} Q${rightEyeX} ${eyeY - 7} ${rightEyeX + 9} ${eyeY - 3} Q${rightEyeX} ${eyeY + 3} ${rightEyeX - 9} ${eyeY - 3} Z`;
  };

  const leftPupilX = leftEyeX;
  const rightPupilX = rightEyeX;

  return (
    <g className="avatar-eyes">
      {/* Left eye */}
      <path d={leftEyePath()} fill="#fff" />
      <circle cx={leftPupilX} cy={eyeY} r="3.5" fill={color} />
      <circle cx={leftPupilX} cy={eyeY} r="1.5" fill="#1a1a1a" />
      {/* Right eye */}
      <path d={rightEyePath()} fill="#fff" />
      <circle cx={rightPupilX} cy={eyeY} r="3.5" fill={color} />
      <circle cx={rightPupilX} cy={eyeY} r="1.5" fill="#1a1a1a" />
      {/* Eyebrows */}
      <line x1={leftEyeX - 12} y1={eyeY - 12} x2={leftEyeX + 12} y2={eyeY - 10} stroke={color} strokeWidth="2" strokeLinecap="round" />
      <line x1={rightEyeX - 12} y1={eyeY - 10} x2={rightEyeX + 12} y2={eyeY - 12} stroke={color} strokeWidth="2" strokeLinecap="round" />
    </g>
  );
}
