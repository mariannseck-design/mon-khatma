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
    <path d="M12 2.5C7.5 2.5 4 6.5 4 11c0 2.8 1.4 5.2 3.3 6.5" />
    {/* Beads along the arc */}
    <circle cx="12" cy="3" r="1.5" fill={color} stroke="none" />
    <circle cx="8" cy="4.5" r="1.5" fill={color} stroke="none" />
    <circle cx="5.2" cy="7.5" r="1.5" fill={color} stroke="none" />
    <circle cx="4.2" cy="11" r="1.5" fill={color} stroke="none" />
    <circle cx="5" cy="14.5" r="1.5" fill={color} stroke="none" />
    <circle cx="7" cy="17" r="1.5" fill={color} stroke="none" />
    {/* Tassel / pendant */}
    <line x1="7" y1="17" x2="7" y2="21" />
    <circle cx="7" cy="22" r="1" fill={color} stroke="none" />
  </svg>
);
