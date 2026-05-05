/** Pixel-art SVG icons for the retro theme. Each icon is hand-drawn with rects on a 24x24 grid. */

type IconProps = { className?: string; size?: number };

export function IconSun({ className, size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      {/* Center */}
      <rect x="8" y="8" width="8" height="8" fill="currentColor" />
      {/* Rays — cardinal */}
      <rect x="10" y="0" width="4" height="6" fill="currentColor" />
      <rect x="10" y="18" width="4" height="6" fill="currentColor" />
      <rect x="0" y="10" width="6" height="4" fill="currentColor" />
      <rect x="18" y="10" width="6" height="4" fill="currentColor" />
      {/* Rays — diagonal */}
      <rect x="3" y="3" width="4" height="4" fill="currentColor" />
      <rect x="17" y="3" width="4" height="4" fill="currentColor" />
      <rect x="3" y="17" width="4" height="4" fill="currentColor" />
      <rect x="17" y="17" width="4" height="4" fill="currentColor" />
    </svg>
  );
}

export function IconPlus({ className, size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="10" y="2" width="4" height="20" rx="1" fill="currentColor" />
      <rect x="2" y="10" width="20" height="4" rx="1" fill="currentColor" />
    </svg>
  );
}

export function IconTrash({ className, size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      {/* Lid */}
      <rect x="4" y="3" width="16" height="4" rx="1" fill="currentColor" />
      {/* Handle */}
      <rect x="8" y="0" width="8" height="4" rx="1" fill="currentColor" />
      {/* Can body */}
      <rect x="6" y="7" width="12" height="14" rx="1" fill="currentColor" />
      {/* Inner lines */}
      <rect x="9" y="10" width="6" height="2" rx="1" fill="#f5f5f0" opacity="0.4" />
      <rect x="9" y="14" width="6" height="2" rx="1" fill="#f5f5f0" opacity="0.4" />
      <rect x="9" y="18" width="4" height="2" rx="1" fill="#f5f5f0" opacity="0.4" />
    </svg>
  );
}

export function IconBattery({ className, size = 24, level = 0.5 }: IconProps & { level?: number }) {
  const fillWidth = Math.round(10 * Math.max(0, Math.min(1, level)));
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      {/* Terminal */}
      <rect x="20" y="7" width="3" height="10" rx="1" fill="currentColor" />
      {/* Body outline */}
      <rect x="2" y="4" width="18" height="16" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
      {/* Fill */}
      {fillWidth > 0 && (
        <rect x="4" y="6" width={fillWidth} height="12" fill="currentColor" />
      )}
    </svg>
  );
}

export function IconFlame({ className, size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      {/* Outer flame */}
      <rect x="10" y="0" width="4" height="4" fill="currentColor" />
      <rect x="8" y="4" width="8" height="4" fill="currentColor" />
      <rect x="6" y="8" width="12" height="4" fill="currentColor" />
      <rect x="4" y="12" width="16" height="4" fill="currentColor" />
      <rect x="6" y="16" width="12" height="4" fill="currentColor" />
      <rect x="8" y="20" width="8" height="4" fill="currentColor" />
      {/* Inner flame */}
      <rect x="10" y="8" width="4" height="4" fill="#f5f5f0" opacity="0.5" />
      <rect x="8" y="12" width="8" height="4" fill="#f5f5f0" opacity="0.4" />
      <rect x="10" y="16" width="4" height="4" fill="#f5f5f0" opacity="0.3" />
    </svg>
  );
}

export function IconCalendar({ className, size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      {/* Top binding */}
      <rect x="4" y="0" width="16" height="4" rx="1" fill="currentColor" />
      <rect x="6" y="4" width="4" height="2" fill="currentColor" />
      <rect x="14" y="4" width="4" height="2" fill="currentColor" />
      {/* Page body */}
      <rect x="4" y="6" width="16" height="16" rx="1" fill="none" stroke="currentColor" strokeWidth="2" />
      {/* Date rows */}
      <rect x="8" y="9" width="8" height="2" rx="1" fill="currentColor" opacity="0.5" />
      <rect x="8" y="13" width="8" height="2" rx="1" fill="currentColor" opacity="0.5" />
      <rect x="8" y="17" width="6" height="2" rx="1" fill="currentColor" opacity="0.3" />
    </svg>
  );
}

export function IconTag({ className, size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      {/* Tag body */}
      <rect x="10" y="2" width="12" height="20" rx="2" fill="currentColor" />
      {/* Tag point */}
      <rect x="2" y="12" width="8" height="4" fill="currentColor" />
      <rect x="4" y="10" width="6" height="2" fill="currentColor" />
      <rect x="4" y="14" width="6" height="2" fill="currentColor" />
      <rect x="6" y="8" width="4" height="2" fill="currentColor" />
      <rect x="6" y="16" width="4" height="2" fill="currentColor" />
      {/* Hole */}
      <rect x="6" y="12" width="4" height="4" rx="1" fill="#f5f5f0" />
      {/* Inner hole */}
      <rect x="8" y="13" width="2" height="2" fill="currentColor" />
    </svg>
  );
}

export function IconSparkles({ className, size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      {/* Center star */}
      <rect x="10" y="2" width="4" height="6" fill="currentColor" />
      <rect x="10" y="16" width="4" height="6" fill="currentColor" />
      <rect x="2" y="10" width="6" height="4" fill="currentColor" />
      <rect x="16" y="10" width="6" height="4" fill="currentColor" />
      <rect x="4" y="4" width="4" height="4" fill="currentColor" />
      <rect x="16" y="4" width="4" height="4" fill="currentColor" />
      <rect x="4" y="16" width="4" height="4" fill="currentColor" />
      <rect x="16" y="16" width="4" height="4" fill="currentColor" />
    </svg>
  );
}

export function IconChevronDown({ className, size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="4" y="8" width="4" height="4" fill="currentColor" />
      <rect x="16" y="8" width="4" height="4" fill="currentColor" />
      <rect x="8" y="12" width="8" height="4" fill="currentColor" />
    </svg>
  );
}

export function IconBack({ className, size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      {/* Arrow shaft */}
      <rect x="6" y="10" width="16" height="4" fill="currentColor" />
      {/* Arrow head — stepped left-pointing triangle */}
      <rect x="2" y="8" width="4" height="8" fill="currentColor" />
      <rect x="6" y="6" width="4" height="4" fill="currentColor" />
      <rect x="6" y="14" width="4" height="4" fill="currentColor" />
    </svg>
  );
}

export function IconMap({ className, size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="2" y="2" width="20" height="16" rx="1" fill="none" stroke="currentColor" strokeWidth="2" />
      {/* Fold lines */}
      <rect x="8" y="2" width="2" height="16" fill="currentColor" opacity="0.3" />
      <rect x="16" y="2" width="2" height="16" fill="currentColor" opacity="0.3" />
      {/* Map details */}
      <rect x="3" y="4" width="4" height="3" rx="0.5" fill="currentColor" opacity="0.4" />
      <rect x="11" y="10" width="4" height="3" rx="0.5" fill="currentColor" opacity="0.4" />
      <rect x="19" y="6" width="3" height="3" rx="0.5" fill="currentColor" opacity="0.4" />
    </svg>
  );
}

export function IconHeart({ className, size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="6" y="4" width="4" height="4" fill="currentColor" />
      <rect x="14" y="4" width="4" height="4" fill="currentColor" />
      <rect x="4" y="8" width="4" height="4" fill="currentColor" />
      <rect x="16" y="8" width="4" height="4" fill="currentColor" />
      <rect x="2" y="12" width="4" height="4" fill="currentColor" />
      <rect x="18" y="12" width="4" height="4" fill="currentColor" />
      <rect x="4" y="16" width="4" height="4" fill="currentColor" />
      <rect x="16" y="16" width="4" height="4" fill="currentColor" />
      <rect x="6" y="20" width="4" height="2" fill="currentColor" />
      <rect x="14" y="20" width="4" height="2" fill="currentColor" />
      <rect x="8" y="20" width="8" height="2" fill="currentColor" />
    </svg>
  );
}

export function IconCompass({ className, size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="10" fill="none" stroke="currentColor" strokeWidth="2" />
      {/* N/S/E/W markers */}
      <rect x="10" y="0" width="4" height="4" fill="currentColor" />
      <rect x="10" y="20" width="4" height="4" fill="currentColor" />
      <rect x="0" y="10" width="4" height="4" fill="currentColor" />
      <rect x="20" y="10" width="4" height="4" fill="currentColor" />
      {/* Needle */}
      <rect x="10" y="4" width="4" height="8" fill="currentColor" />
      <rect x="10" y="12" width="4" height="8" fill="currentColor" opacity="0.4" />
    </svg>
  );
}

export function IconZap({ className, size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="12" y="0" width="4" height="6" fill="currentColor" />
      <rect x="8" y="6" width="4" height="6" fill="currentColor" />
      <rect x="10" y="10" width="4" height="4" fill="currentColor" />
      <rect x="14" y="12" width="4" height="6" fill="currentColor" />
      <rect x="10" y="18" width="4" height="6" fill="currentColor" />
    </svg>
  );
}

export function IconTarget({ className, size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="10" fill="none" stroke="currentColor" strokeWidth="2" />
      <rect x="6" y="6" width="12" height="12" rx="6" fill="none" stroke="currentColor" strokeWidth="2" />
      <rect x="10" y="10" width="4" height="4" rx="2" fill="currentColor" />
      {/* Crosshair */}
      <rect x="11" y="0" width="2" height="6" fill="currentColor" />
      <rect x="11" y="18" width="2" height="6" fill="currentColor" />
      <rect x="0" y="11" width="6" height="2" fill="currentColor" />
      <rect x="18" y="11" width="6" height="2" fill="currentColor" />
    </svg>
  );
}

export function IconChevronRight({ className, size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="8" y="4" width="4" height="4" fill="currentColor" />
      <rect x="12" y="8" width="4" height="8" fill="currentColor" />
      <rect x="8" y="16" width="4" height="4" fill="currentColor" />
    </svg>
  );
}

export function IconMail({ className, size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="2" y="4" width="20" height="16" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
      {/* Envelope flap */}
      <rect x="4" y="6" width="4" height="4" fill="currentColor" opacity="0.5" />
      <rect x="16" y="6" width="4" height="4" fill="currentColor" opacity="0.5" />
      <rect x="8" y="8" width="8" height="2" fill="currentColor" opacity="0.3" />
      {/* Letter inside */}
      <rect x="6" y="10" width="12" height="2" rx="0.5" fill="currentColor" opacity="0.3" />
      <rect x="6" y="14" width="8" height="2" rx="0.5" fill="currentColor" opacity="0.2" />
    </svg>
  );
}

export function IconBookOpen({ className, size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      {/* Left page */}
      <rect x="2" y="4" width="8" height="16" rx="1" fill="none" stroke="currentColor" strokeWidth="2" />
      {/* Right page */}
      <rect x="14" y="4" width="8" height="16" rx="1" fill="none" stroke="currentColor" strokeWidth="2" />
      {/* Spine */}
      <rect x="10" y="4" width="4" height="16" fill="currentColor" opacity="0.3" />
      {/* Text lines left */}
      <rect x="4" y="7" width="4" height="2" rx="1" fill="currentColor" opacity="0.4" />
      <rect x="4" y="11" width="4" height="2" rx="1" fill="currentColor" opacity="0.4" />
      <rect x="4" y="15" width="3" height="2" rx="1" fill="currentColor" opacity="0.3" />
      {/* Text lines right */}
      <rect x="16" y="7" width="4" height="2" rx="1" fill="currentColor" opacity="0.4" />
      <rect x="16" y="11" width="4" height="2" rx="1" fill="currentColor" opacity="0.4" />
      <rect x="16" y="15" width="3" height="2" rx="1" fill="currentColor" opacity="0.3" />
    </svg>
  );
}

export function IconCrown({ className, size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      {/* Base */}
      <rect x="2" y="18" width="20" height="4" fill="currentColor" />
      {/* Left peak */}
      <rect x="2" y="8" width="4" height="12" fill="currentColor" />
      {/* Left inner pillar */}
      <rect x="6" y="12" width="4" height="8" fill="currentColor" />
      {/* Center peak */}
      <rect x="10" y="4" width="4" height="16" fill="currentColor" />
      {/* Right inner pillar */}
      <rect x="14" y="12" width="4" height="8" fill="currentColor" />
      {/* Right peak */}
      <rect x="18" y="8" width="4" height="12" fill="currentColor" />
      {/* Jewels */}
      <rect x="11" y="2" width="2" height="2" fill="#f5f5f0" />
      <rect x="3" y="9" width="2" height="2" fill="#f5f5f0" />
      <rect x="19" y="9" width="2" height="2" fill="#f5f5f0" />
      <rect x="5" y="14" width="2" height="2" fill="#f5f5f0" />
      <rect x="17" y="14" width="2" height="2" fill="#f5f5f0" />
    </svg>
  );
}

export function IconLock({ className, size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      {/* Shackle */}
      <rect x="8" y="2" width="8" height="4" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
      <rect x="6" y="4" width="4" height="6" rx="1" fill="none" stroke="currentColor" strokeWidth="2" />
      <rect x="14" y="4" width="4" height="6" rx="1" fill="none" stroke="currentColor" strokeWidth="2" />
      {/* Body */}
      <rect x="4" y="10" width="16" height="13" rx="2" fill="currentColor" />
      {/* Keyhole */}
      <rect x="10" y="14" width="4" height="4" rx="2" fill="#f5f5f0" />
      <rect x="11" y="16" width="2" height="4" fill="#f5f5f0" />
    </svg>
  );
}

export function IconWork({ className, size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      {/* Handle */}
      <rect x="8" y="2" width="8" height="4" rx="1" fill="none" stroke="currentColor" strokeWidth="2" />
      {/* Body */}
      <rect x="2" y="6" width="20" height="16" rx="2" fill="currentColor" />
      {/* Pocket */}
      <rect x="6" y="10" width="12" height="6" rx="1" fill="#f5f5f0" opacity="0.3" />
      {/* Pocket divider */}
      <rect x="11" y="10" width="2" height="6" fill="currentColor" />
    </svg>
  );
}

export function IconHealth({ className, size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      {/* Vertical bar */}
      <rect x="10" y="4" width="4" height="16" rx="1" fill="currentColor" />
      {/* Horizontal bar */}
      <rect x="4" y="10" width="16" height="4" rx="1" fill="currentColor" />
    </svg>
  );
}

export function IconPlay({ className, size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      {/* D-pad up */}
      <rect x="8" y="2" width="8" height="4" rx="1" fill="currentColor" />
      {/* D-pad center */}
      <rect x="2" y="6" width="8" height="4" rx="1" fill="currentColor" />
      <rect x="10" y="6" width="4" height="4" rx="1" fill="currentColor" />
      <rect x="14" y="6" width="8" height="4" rx="1" fill="currentColor" />
      {/* D-pad down */}
      <rect x="8" y="10" width="8" height="4" rx="1" fill="currentColor" />
      {/* Action buttons */}
      <rect x="18" y="14" width="4" height="4" rx="1" fill="currentColor" opacity="0.5" />
      <rect x="14" y="18" width="4" height="4" rx="1" fill="currentColor" opacity="0.3" />
    </svg>
  );
}

export function IconFlask({ className, size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      {/* Flask neck */}
      <rect x="9" y="2" width="6" height="4" rx="1" fill="none" stroke="currentColor" strokeWidth="2" />
      {/* Flask body top */}
      <rect x="6" y="6" width={12} height={4} rx="0" fill="none" stroke="currentColor" strokeWidth="2" />
      <rect x="6" y="6" width={2} height={4} fill="currentColor" />
      <rect x={16} y="6" width={2} height={4} fill="currentColor" />
      {/* Flask body */}
      <rect x="4" y="10" width={16} height={6} rx="1" fill="currentColor" />
      <rect x="2" y="14" width={20} height={8} rx="3" fill="currentColor" />
      {/* Liquid */}
      <rect x="4" y="16" width={16} height={5} rx="2" fill="#f5f5f0" opacity="0.35" />
      {/* Bubble */}
      <rect x="8" y="17" width={3} height={3} rx="1" fill="#f5f5f0" opacity="0.5" />
      <rect x={13} y="18" width={2} height={2} rx="1" fill="#f5f5f0" opacity="0.4" />
    </svg>
  );
}

export function IconPixelClose({ className, size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="4" y="6" width="4" height="4" fill="currentColor" />
      <rect x="8" y="10" width="4" height="4" fill="currentColor" />
      <rect x="12" y="14" width="4" height="4" fill="currentColor" />
      <rect x="8" y="6" width="4" height="4" fill="currentColor" />
      <rect x="4" y="10" width="4" height="4" fill="currentColor" />
      <rect x="16" y="6" width="4" height="4" fill="currentColor" />
      <rect x="12" y="10" width="4" height="4" fill="currentColor" />
      <rect x="8" y="14" width="4" height="4" fill="currentColor" />
      <rect x="16" y="10" width="4" height="4" fill="currentColor" />
      <rect x="12" y="6" width="4" height="4" fill="currentColor" />
      <rect x="16" y="14" width="4" height="4" fill="currentColor" />
      <rect x="4" y="14" width="4" height="4" fill="currentColor" />
    </svg>
  );
}

export function IconPixelUndo({ className, size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="4" y="10" width="4" height="4" fill="currentColor" />
      <rect x="8" y="10" width="4" height="4" fill="currentColor" />
      <rect x="12" y="10" width="4" height="4" fill="currentColor" />
      <rect x="16" y="10" width="4" height="4" fill="currentColor" />
      <rect x="4" y="6" width="4" height="4" fill="currentColor" />
      <rect x="4" y="14" width="4" height="4" fill="currentColor" />
      <rect x="8" y="14" width="4" height="4" fill="currentColor" />
    </svg>
  );
}
