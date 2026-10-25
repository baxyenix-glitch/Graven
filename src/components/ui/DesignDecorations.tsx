import React from 'react';

/**
 * Inline SVG Starburst Sticker (straight edges, 3px Midnight Ink outline)
 * Used in CTA cells, badges, and empty states.
 */
export function StarburstSticker({
  className = 'w-16 h-16',
  fillColor = '#E4FF6B', // Electric Lime or Cyan
  strokeColor = '#0A0F2E',
  strokeWidth = 3,
}: {
  className?: string;
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} pointer-events-none select-none`}
      aria-hidden="true"
    >
      <path
        d="M50 0L59.8 24.3L85.4 14.6L75.7 40.2L100 50L75.7 59.8L85.4 85.4L59.8 75.7L50 100L40.2 75.7L14.6 85.4L24.3 59.8L0 50L24.3 40.2L14.6 14.6L40.2 24.3L50 0Z"
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * 4-Point Sparkle decoration (clean geometric cross-star)
 */
export function SparkleDecoration({
  className = 'w-6 h-6',
  color = '#5CE1FF',
}: {
  className?: string;
  color?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={color}
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} pointer-events-none select-none`}
      aria-hidden="true"
    >
      <path d="M12 0C12 6.627 6.627 12 0 12C6.627 12 12 17.373 12 24C12 17.373 17.373 12 24 12C17.373 12 12 6.627 12 0Z" />
    </svg>
  );
}
