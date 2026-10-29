import React from 'react';
import clsx from 'clsx';
import {
  FaBatteryFull,
  FaBatteryThreeQuarters,
  FaBatteryHalf,
  FaBatteryQuarter,
  FaBatteryEmpty,
} from 'react-icons/fa';

function parseBatteryPercent(bat) {
  if (bat === null || bat === undefined) return null;
  const match = String(bat).match(/-?\d+(\.\d+)?/);
  if (!match) return null;
  const value = parseFloat(match[0]);
  if (Number.isNaN(value)) return null;
  return Math.min(100, Math.max(0, value));
}

function getBatteryVisual(percent) {
  if (percent === null) return { Icon: FaBatteryHalf, tone: 'text-text-faint' };
  if (percent <= 15) return { Icon: FaBatteryEmpty, tone: 'text-danger' };
  if (percent <= 40) return { Icon: FaBatteryQuarter, tone: 'text-warning' };
  if (percent <= 65) return { Icon: FaBatteryHalf, tone: 'text-warning' };
  if (percent <= 90) return { Icon: FaBatteryThreeQuarters, tone: 'text-success' };
  return { Icon: FaBatteryFull, tone: 'text-success' };
}

export function BatteryIndicator({ value, className, showLabel = true }) {
  const percent = parseBatteryPercent(value);
  const { Icon, tone } = getBatteryVisual(percent);

  return (
    <span className={clsx('inline-flex items-center gap-1.5', tone, className)}>
      <Icon size={16} />
      {showLabel && <span className="text-text">{value ?? '-'}</span>}
    </span>
  );
}

export default BatteryIndicator;
