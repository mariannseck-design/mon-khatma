import React from 'react';

interface ChapeletIconProps {
  size?: number;
  className?: string;
  color?: string;
}

export const ChapeletIcon: React.FC<ChapeletIconProps> = ({ size = 24, className, color = 'currentColor' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* String/thread arc */}
    <path d="M12 3C7.5 3 4 7 4 12c0 3 1.5 5.5 3.5 7" />
    {/* Beads along the arc */}
    <circle cx="12" cy="3.5" r="1.5" fill={color} stroke="none" />
    <circle cx="8" cy="5" r="1.5" fill={color} stroke="none" />
    <circle cx="5.2" cy="8" r="1.5" fill={color} stroke="none" />
    <circle cx="4.2" cy="11.5" r="1.5" fill={color} stroke="none" />
    <circle cx="5" cy="15" r="1.5" fill={color} stroke="none" />
    <circle cx="7" cy="18" r="1.5" fill={color} stroke="none" />
    {/* Tassel / pendant */}
    <line x1="7" y1="18" x2="7" y2="22" />
    <circle cx="7" cy="22.5" r="1" fill={color} stroke="none" />
  </svg>
);
