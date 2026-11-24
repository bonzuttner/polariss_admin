import React from 'react';
import clsx from 'clsx';
import { FaTachometerAlt } from 'react-icons/fa';
import { headingToCompass } from '../utils/motionUtils.js';

function HeadingArrow({ degrees, className }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={13}
      height={13}
      className={className}
      style={{ transform: `rotate(${degrees}deg)` }}
      aria-hidden="true"
    >
      <path d="M12 2 L18 20 L12 16 L6 20 Z" fill="currentColor" />
    </svg>
  );
}

export function SpeedHeadingIndicator({ speedKmph, headingDeg, className }) {
  const hasSpeed = typeof speedKmph === 'number' && Number.isFinite(speedKmph);
  const hasHeading = typeof headingDeg === 'number' && Number.isFinite(headingDeg);

  if (!hasSpeed && !hasHeading) {
    return <span className={clsx('text-text-faint', className)}>-</span>;
  }

  return (
    <span className={clsx('inline-flex items-center gap-3', className)}>
      {hasSpeed && (
        <span className="inline-flex items-center gap-1.5 text-text">
          <FaTachometerAlt className="text-text-faint" size={13} />
          {Math.round(speedKmph)} km/h
        </span>
      )}
      {hasHeading && (
        <span className="inline-flex items-center gap-1.5 text-text">
          <HeadingArrow degrees={headingDeg} className="text-text-faint" />
          {headingToCompass(headingDeg)}
        </span>
      )}
    </span>
  );
}

export default SpeedHeadingIndicator;
