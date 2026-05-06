"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { RetroLayout } from "./RetroLayout";
import { IconSparkles } from "./RetroIcons";

const BUTTONS = [
  { label: "Life Dashboard", href: "/dashboard", color: "#95a9bb" },
  { label: "Odyssey Plan", href: "/odyssey", color: "#a9a0b9" },
  { label: "Goodtime Journal", href: "/journal", color: "#8f9e7a" },
  { label: "Prototypes", href: "/prototypes", color: "#c9ab8f" },
];

/* ────────────────────────────────────────────
   Flower types for visual variety
   ──────────────────────────────────────────── */

type FlowerType = "crown" | "round" | "tulip" | "daisy" | "double" | "sunflower";

interface FlowerDef {
  x: number;
  type: FlowerType;
  baseH: number;    // max stem height at stage 3
  bloomS: number;   // bloom size multiplier (0.7–1.3)
  leafW: number;    // leaf width multiplier
}

const FLOWERS: FlowerDef[] = [
  { x: 25, type: "crown", baseH: 44, bloomS: 1.2, leafW: 1.1 },
  { x: 65, type: "tulip", baseH: 30, bloomS: 0.8, leafW: 0.9 },
  { x: 105, type: "daisy", baseH: 40, bloomS: 1.0, leafW: 1.0 },
  { x: 145, type: "round", baseH: 34, bloomS: 0.9, leafW: 0.8 },
  { x: 185, type: "sunflower", baseH: 52, bloomS: 1.25, leafW: 1.3 },
];

const GROUND_Y = 132;
const MAX_STAGE = 3;

const BLOOM_COLORS: Record<FlowerType, string> = {
  crown: "#a9a0b9",
  tulip: "#c9ab8f",
  daisy: "#d4c99a",
  round: "#c9a0a0",
  double: "#95a9bb",
  sunflower: "#8f9e7a",
};

/* ────────────────────────────────────────────
   Pixel-art flower renderer by growth stage
   ──────────────────────────────────────────── */

function FlowerStage({ flower, stage, swayKey }: { flower: FlowerDef; stage: number; swayKey: number }) {
  const { x, type, baseH, bloomS, leafW } = flower;
  const baseY = GROUND_Y;

  // Stage heights as fractions of baseH
  const stageFractions = [0, 0.28, 0.6, 1.0];
  const h = Math.round(baseH * stageFractions[stage]);
  const stemTop = baseY - h;

  // Sway animation — uses swayKey to restart, staggered delay per flower x position
  const swayStyle = swayKey > 0 && stage === MAX_STAGE
    ? {
        animation: `flower-sway 1.8s ease-in-out`,
        animationDelay: `${(x * 0.008).toFixed(2)}s`,
        transformOrigin: `${x}px ${baseY}px`,
      }
    : { transformOrigin: `${x}px ${baseY}px` };

  const elements: React.ReactNode[] = [];

  // Stem — thickness varies slightly with height
  const stemW = baseH > 40 ? 3.5 : baseH > 34 ? 3 : 2.5;
  if (h > 0) {
    elements.push(
      <rect key="stem" x={x - stemW / 2} y={stemTop} width={stemW} height={h} fill="#2d2d2d" rx="1" />
    );
  }

  // Leaves (stage >= 1) — each flower type has unique leaf shape
  if (stage >= 1) {
    if (type === "crown") {
      // Broad fleshy leaves arching outward from base
      const lw = Math.round(11 * leafW);
      const lh = 3;
      const ly = stemTop + h * 0.35;
      elements.push(
        <rect key="leaf-l" x={x - lw - 2} y={ly} width={lw} height={lh} fill="#2d2d2d" rx="1" />,
        <rect key="leaf-r" x={x + 2} y={ly + 4} width={lw} height={lh} fill="#2d2d2d" rx="1" />,
      );
    } else if (type === "tulip") {
      // Sword-like narrow leaves standing upright along stem (iris style)
      const sl = Math.round(10 * leafW);
      const sw = 2;
      const ly = stemTop + h * 0.3;
      elements.push(
        <rect key="leaf-l" x={x - 3} y={ly} width={sw} height={sl} fill="#2d2d2d" rx="1" />,
        <rect key="leaf-r" x={x + 2} y={ly} width={sw} height={sl} fill="#2d2d2d" rx="1" />,
      );
    } else if (type === "daisy") {
      // Stair-step diagonal leaves (same style as sunflower)
      const ss = Math.round(2.5 * leafW);
      const by = stemTop + h * 0.35;
      // Left leaf — diagonal up-left (3 steps)
      elements.push(
        <rect key="leaf-l1" x={x - 4} y={by - 3} width={ss} height={ss} fill="#2d2d2d" rx="0.5" />,
        <rect key="leaf-l2" x={x - 7} y={by - 6} width={ss} height={ss} fill="#2d2d2d" rx="0.5" />,
        <rect key="leaf-l3" x={x - 10} y={by - 9} width={ss} height={ss} fill="#2d2d2d" rx="0.5" />,
      );
      // Right leaf — diagonal up-right (3 steps)
      elements.push(
        <rect key="leaf-r1" x={x + 2} y={by - 3} width={ss} height={ss} fill="#2d2d2d" rx="0.5" />,
        <rect key="leaf-r2" x={x + 5} y={by - 6} width={ss} height={ss} fill="#2d2d2d" rx="0.5" />,
        <rect key="leaf-r3" x={x + 8} y={by - 9} width={ss} height={ss} fill="#2d2d2d" rx="0.5" />,
      );
    } else if (type === "round") {
      // Heart-shaped leaves: wider inner + narrower outer piece
      const lw = Math.round(5 * leafW);
      const lh = 2.5;
      const innerOff = 2;
      const outerOff = innerOff + lw;
      const ly = stemTop + h * 0.45;
      elements.push(
        <rect key="leaf-l-inner" x={x - innerOff - lw} y={ly - 1} width={lw} height={lh} fill="#2d2d2d" rx="1" />,
        <rect key="leaf-l-outer" x={x - outerOff - 2} y={ly} width={2} height={lh - 0.5} fill="#2d2d2d" rx="0.5" />,
        <rect key="leaf-r-inner" x={x + innerOff} y={ly - 1} width={lw} height={lh} fill="#2d2d2d" rx="1" />,
        <rect key="leaf-r-outer" x={x + outerOff} y={ly} width={2} height={lh - 0.5} fill="#2d2d2d" rx="0.5" />,
      );
    } else if (type === "sunflower") {
      // Stair-step diagonal leaves pointing up and outward
      const ss = Math.round(2.5 * leafW);
      const by = stemTop + h * 0.35;
      // Left leaf — diagonal up-left (3 steps)
      elements.push(
        <rect key="leaf-l1" x={x - 4} y={by - 3} width={ss} height={ss} fill="#2d2d2d" rx="0.5" />,
        <rect key="leaf-l2" x={x - 7} y={by - 6} width={ss} height={ss} fill="#2d2d2d" rx="0.5" />,
        <rect key="leaf-l3" x={x - 10} y={by - 9} width={ss} height={ss} fill="#2d2d2d" rx="0.5" />,
      );
      // Right leaf — diagonal up-right (3 steps)
      elements.push(
        <rect key="leaf-r1" x={x + 2} y={by - 3} width={ss} height={ss} fill="#2d2d2d" rx="0.5" />,
        <rect key="leaf-r2" x={x + 5} y={by - 6} width={ss} height={ss} fill="#2d2d2d" rx="0.5" />,
        <rect key="leaf-r3" x={x + 8} y={by - 9} width={ss} height={ss} fill="#2d2d2d" rx="0.5" />,
      );
    } else {
      // double — angled diagonal leaves
      const lw = Math.round(8 * leafW);
      const lh = 2.5;
      const ly = stemTop + h * 0.5;
      elements.push(
        <rect key="leaf-l" x={x - lw - 2} y={ly - 2} width={lw} height={lh} fill="#2d2d2d" rx="1" />,
        <rect key="leaf-r" x={x + 2} y={ly + 2} width={lw} height={lh} fill="#2d2d2d" rx="1" />,
      );
    }
  }

  // Bud (stage 2)
  if (stage === 2) {
    const bs = Math.round(6 * bloomS);
    const budY = stemTop - bs;
    elements.push(
      <rect key="bud" x={x - bs / 2} y={budY} width={bs} height={bs} fill="#1a1a1a" rx="2" />,
    );
  }

  // Bloom (stage 3)
  if (stage === 3) {
    const bloomCY = stemTop - Math.round(6 * bloomS);
    const ps = Math.round(6 * bloomS);        // petal size
    const cs = Math.round(5 * bloomS);        // center size
    const gap = Math.round(1 * bloomS);
    const bloomColor = BLOOM_COLORS[type];

    if (type === "crown") {
      // Crown — 3 tall upright petals like iris/fleur-de-lis
      const cpw = Math.round(4 * bloomS);          // petal width
      const cph = Math.round(11 * bloomS);         // center petal height
      const csh = Math.round(8 * bloomS);          // side petal height
      const cso = Math.round(3.5 * bloomS);        // side petal horizontal offset
      const cc = Math.round(4 * bloomS);           // center dot
      // Center petal (tallest, upright)
      elements.push(
        <rect key="cr-c" x={x - cpw / 2} y={bloomCY - cph} width={cpw} height={cph} fill={bloomColor} rx="1" />,
      );
      // Side petals (angled out and up)
      elements.push(
        <rect key="cr-l" x={x - cpw - cso} y={bloomCY - csh} width={cpw} height={csh} fill={bloomColor} rx="1" />,
        <rect key="cr-r" x={x + cso} y={bloomCY - csh} width={cpw} height={csh} fill={bloomColor} rx="1" />,
      );
      // Small center dot at bloom center
      elements.push(
        <rect key="cr-ctr" x={x - cc / 2} y={bloomCY - cc / 2} width={cc} height={cc} fill="#f5f5f0" rx="1" />,
      );
    } else if (type === "round") {
      elements.push(
        <rect key="petal-t" x={x - ps / 2} y={bloomCY - ps - gap} width={ps} height={ps} fill={bloomColor} rx="1" />,
        <rect key="petal-b" x={x - ps / 2} y={bloomCY + gap} width={ps} height={ps} fill={bloomColor} rx="1" />,
        <rect key="petal-l" x={x - ps - gap - ps / 2} y={bloomCY - ps / 2} width={ps} height={ps} fill={bloomColor} rx="1" />,
        <rect key="petal-r" x={x + gap + ps / 2} y={bloomCY - ps / 2} width={ps} height={ps} fill={bloomColor} rx="1" />,
        <rect key="center" x={x - cs / 2} y={bloomCY - cs / 2} width={cs} height={cs} fill="#f5f5f0" rx="1" />,
      );
    } else if (type === "tulip") {
      const cw = Math.round(10 * bloomS);
      const ch = Math.round(10 * bloomS);
      elements.push(
        <rect key="cup" x={x - cw / 2} y={bloomCY - ch / 2} width={cw} height={ch} fill={bloomColor} rx="2" />,
        <rect key="cup-inner" x={x - Math.round(2 * bloomS)} y={bloomCY - Math.round(4 * bloomS)} width={Math.round(4 * bloomS)} height={Math.round(7 * bloomS)} fill="#f5f5f0" rx="1" opacity="0.3" />,
      );
    } else if (type === "double") {
      // Double — 8 petals: 4 cardinal + 4 diagonal (slightly smaller)
      const dps = Math.round(5 * bloomS);         // diagonal petal size (slightly smaller)
      const dc = Math.round(4 * bloomS);          // center size
      const dd = Math.round((ps + gap) * 0.75);   // diagonal offset
      // Cardinal petals
      elements.push(
        <rect key="cl-t" x={x - ps / 2} y={bloomCY - ps - gap} width={ps} height={ps} fill={bloomColor} rx="1" />,
        <rect key="cl-b" x={x - ps / 2} y={bloomCY + gap} width={ps} height={ps} fill={bloomColor} rx="1" />,
        <rect key="cl-l" x={x - ps - gap - ps / 2} y={bloomCY - ps / 2} width={ps} height={ps} fill={bloomColor} rx="1" />,
        <rect key="cl-r" x={x + gap + ps / 2} y={bloomCY - ps / 2} width={ps} height={ps} fill={bloomColor} rx="1" />,
      );
      // Diagonal petals
      elements.push(
        <rect key="d-tr" x={x + dd} y={bloomCY - dd - dps} width={dps} height={dps} fill={bloomColor} rx="1" />,
        <rect key="d-br" x={x + dd} y={bloomCY + dd} width={dps} height={dps} fill={bloomColor} rx="1" />,
        <rect key="d-bl" x={x - dd - dps} y={bloomCY + dd} width={dps} height={dps} fill={bloomColor} rx="1" />,
        <rect key="d-tl" x={x - dd - dps} y={bloomCY - dd - dps} width={dps} height={dps} fill={bloomColor} rx="1" />,
      );
      elements.push(
        <rect key="center" x={x - dc / 2} y={bloomCY - dc / 2} width={dc} height={dc} fill="#f5f5f0" rx="1" />,
      );
    } else if (type === "sunflower") {
      // Sunflower — ring of small petals + large textured center
      const sr = Math.round(7 * bloomS);          // petal ring radius
      const sp = Math.round(4 * bloomS);          // petal size
      const sc = Math.round(9 * bloomS);          // large center
      const q = Math.round(sr * 0.707);           // diagonal offset (sr * cos45° ≈ sr * 0.707)
      // Cardinal petals
      elements.push(
        <rect key="sp-t" x={x - sp / 2} y={bloomCY - sr - sp / 2} width={sp} height={sp} fill={bloomColor} rx="1" />,
        <rect key="sp-r" x={x + sr - sp / 2} y={bloomCY - sp / 2} width={sp} height={sp} fill={bloomColor} rx="1" />,
        <rect key="sp-b" x={x - sp / 2} y={bloomCY + sr - sp / 2} width={sp} height={sp} fill={bloomColor} rx="1" />,
        <rect key="sp-l" x={x - sr - sp / 2} y={bloomCY - sp / 2} width={sp} height={sp} fill={bloomColor} rx="1" />,
      );
      // Diagonal petals
      elements.push(
        <rect key="sp-tr" x={x + q - sp / 2} y={bloomCY - q - sp / 2} width={sp} height={sp} fill={bloomColor} rx="1" />,
        <rect key="sp-br" x={x + q - sp / 2} y={bloomCY + q - sp / 2} width={sp} height={sp} fill={bloomColor} rx="1" />,
        <rect key="sp-bl" x={x - q - sp / 2} y={bloomCY + q - sp / 2} width={sp} height={sp} fill={bloomColor} rx="1" />,
        <rect key="sp-tl" x={x - q - sp / 2} y={bloomCY - q - sp / 2} width={sp} height={sp} fill={bloomColor} rx="1" />,
      );
      // Large center with seed texture
      elements.push(
        <rect key="sc-outer" x={x - sc / 2} y={bloomCY - sc / 2} width={sc} height={sc} fill="#1a1a1a" rx="1" />,
        <rect key="sc-inner" x={x - sc / 2 + 2} y={bloomCY - sc / 2 + 2} width={sc - 4} height={sc - 4} fill="#333" rx="1" />,
        <rect key="sc-d1" x={x - 2} y={bloomCY - 3} width={1.5} height={2} fill="#555" />,
        <rect key="sc-d2" x={x + 1} y={bloomCY - 2} width={1.5} height={1.5} fill="#555" />,
        <rect key="sc-d3" x={x - 3} y={bloomCY} width={1.5} height={1.5} fill="#555" />,
        <rect key="sc-d4" x={x + 2} y={bloomCY + 1} width={1.5} height={1.5} fill="#555" />,
        <rect key="sc-d5" x={x - 1} y={bloomCY + 2} width={1.5} height={1.5} fill="#555" />,
        <rect key="sc-d6" x={x} y={bloomCY - 1} width={1.5} height={1.5} fill="#555" />,
      );
    } else {
      // Daisy — all petal positions scale with bloomS
      const d = Math.round(4 * bloomS);
      const r = Math.round(6 * bloomS);
      elements.push(
        <rect key="d1" x={x - d / 2} y={bloomCY - r} width={d} height={d} fill={bloomColor} rx="1" />,
        <rect key="d2" x={x + r - d / 2} y={bloomCY - d / 2} width={d} height={d} fill={bloomColor} rx="1" />,
        <rect key="d3" x={x - d / 2} y={bloomCY + r - d} width={d} height={d} fill={bloomColor} rx="1" />,
        <rect key="d4" x={x - r - d / 2} y={bloomCY - d / 2} width={d} height={d} fill={bloomColor} rx="1" />,
        <rect key="d5" x={x + r / 2 - d / 2} y={bloomCY - r} width={d} height={d} fill={bloomColor} rx="1" />,
        <rect key="d6" x={x - r / 2 - d / 2} y={bloomCY - r} width={d} height={d} fill={bloomColor} rx="1" />,
        <rect key="d-center" x={x - cs / 2} y={bloomCY - cs / 2} width={cs} height={cs} fill="#f5f5f0" rx="1" />,
      );
    }
  }

  // Seed dot for stage 0
  if (stage === 0) {
    const sd = baseH > 40 ? 4 : 3;
    elements.push(
      <rect key="seed" x={x - sd / 2} y={baseY - sd} width={sd} height={sd} fill="#555" rx="1" />,
    );
  }

  return <g key={`flower-${swayKey}`} style={swayStyle}>{elements}</g>;
}

/* ────────────────────────────────────────────

/* ────────────────────────────────────────────
   Pixel butterfly
   ──────────────────────────────────────────── */

function Butterfly({ bx, by, flip }: { bx: number; by: number; flip: boolean }) {
  const s = flip ? -1 : 1;
  return (
    <g transform={`translate(${bx},${by}) scale(${s},1)`}>
      {/* Upper wings */}
      <rect x={0} y={-5} width={5} height={4} fill="#1a1a1a" rx={1} />
      <rect x={-3} y={-4} width={4} height={3} fill="#1a1a1a" rx={1} />
      {/* Lower wings */}
      <rect x={1} y={1} width={4} height={3} fill="#1a1a1a" rx={1} />
      <rect x={-2} y={2} width={3} height={2} fill="#1a1a1a" rx={1} />
      {/* Body */}
      <rect x={0} y={-2} width={2} height={5} fill="#1a1a1a" rx={1} />
      {/* Head */}
      <rect x={1} y={-4} width={2} height={2} fill="#1a1a1a" rx={1} />
      {/* Antenna */}
      <rect x={2} y={-6} width={1} height={2} fill="#1a1a1a" />
    </g>
  );
}

/* ────────────────────────────────────────────
   Interactive Flower Garden
   ──────────────────────────────────────────── */

function FlowerGarden() {
  const [stages, setStages] = useState<number[]>([0, 0, 1, 0, 0]);
  const [sparkles, setSparkles] = useState<{ id: number; x: number; y: number }[]>([]);
  const [swayKey, setSwayKey] = useState(0);
  const [showClickMe, setShowClickMe] = useState(true);
  const sparkleId = useRef(0);

  // Butterfly animation state
  const [b1, setB1] = useState({ x: 10, y: 70, flip: false });
  const [b2, setB2] = useState({ x: 180, y: 50, flip: true });
  const animRef = useRef<number>(0);
  const tRef = useRef(0);

  useEffect(() => {
    const tick = () => {
      tRef.current += 0.016;
      const t = tRef.current;

      const b1x = 30 + 140 * (0.5 + 0.5 * Math.sin(t * 0.7));
      const b1y = 40 + 45 * Math.sin(t * 1.1) * Math.cos(t * 0.5);
      const b1Flip = Math.sin(t * 0.7) > 0.1;

      const b2x = 40 + 130 * (0.5 + 0.5 * Math.cos(t * 0.55 + 1.2));
      const b2y = 50 + 35 * Math.sin(t * 0.9 + 2) * Math.cos(t * 0.4);
      const b2Flip = Math.cos(t * 0.55 + 1.2) < -0.1;

      setB1({ x: b1x, y: b1y, flip: b1Flip });
      setB2({ x: b2x, y: b2y, flip: b2Flip });

      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  const handleClick = useCallback(() => {
    if (showClickMe) {
      setShowClickMe(false);
    }

    const allGrownNow = stages.every((s) => s >= MAX_STAGE);

    if (allGrownNow) {
      // All flowers grown — trigger sway
      setSwayKey((k) => k + 1);
      return;
    }

    // Grow a random non-maxed flower
    const available = stages
      .map((s, i) => (s < MAX_STAGE ? i : -1))
      .filter((i) => i >= 0);
    if (available.length === 0) return;

    const idx = available[Math.floor(Math.random() * available.length)];
    setStages((prev) => prev.map((s, i) => (i === idx ? s + 1 : s)));

    // Spawn sparkle at the grown flower's bloom position
    const flower = FLOWERS[idx];
    const fx = flower.x;
    const fy = GROUND_Y - flower.baseH - 10;
    const id = sparkleId.current++;
    setSparkles((prev) => [...prev, { id, x: fx, y: fy }]);
    setTimeout(() => {
      setSparkles((prev) => prev.filter((s) => s.id !== id));
    }, 600);
  }, [stages, showClickMe]);

  return (
    <div className="relative cursor-pointer select-none" onClick={handleClick} title="点击让花朵生长">
      {showClickMe && (
        <div
          className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none"
          style={{ fontFamily: "'VT323', 'Courier New', monospace" }}
        >
          <span className="text-[#1a1a1a] text-lg sm:text-xl font-bold bg-[#f5f5f0]/80 px-3 py-1 border-2 border-dashed border-[#1a1a1a] rounded animate-pulse">
            click me
          </span>
        </div>
      )}
      <svg
        viewBox="0 0 220 150"
        className="w-full max-w-[240px] h-auto"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Sky hint — faint gradient band */}
        <rect x="0" y="0" width="220" height={GROUND_Y - 4} fill="#f5f5f0" opacity="0.2" />

        {/* Ground */}
        <line x1="5" y1={GROUND_Y} x2="215" y2={GROUND_Y} stroke="#1a1a1a" strokeWidth="2" />

        {/* Ground texture */}
        {[15, 40, 55, 80, 95, 120, 135, 160, 175, 200].map((gx, i) => (
          <rect key={i} x={gx} y={GROUND_Y - 2} width={3} height={2 + (i % 3)} fill="#1a1a1a" opacity={0.25 + (i % 3) * 0.1} />
        ))}

        {/* Small grass tufts */}
        {[18, 48, 78, 108, 138, 168, 198].map((gx, i) => (
          <g key={`grass-${i}`}>
            <rect x={gx - 1} y={GROUND_Y - 5 - (i % 3) * 2} width={1.5} height={5 + (i % 3) * 2} fill="#1a1a1a" opacity="0.35" rx="1" />
            <rect x={gx + 2} y={GROUND_Y - 4 - (i % 2) * 2} width={1.5} height={4 + (i % 2) * 2} fill="#1a1a1a" opacity="0.3" rx="1" />
          </g>
        ))}

        {/* Flowers */}
        {FLOWERS.map((f, i) => (
          <FlowerStage key={i} flower={f} stage={stages[i]} swayKey={swayKey} />
        ))}

        {/* Sparkle effects */}
        {sparkles.map((s) => (
          <g key={s.id}>
            <rect x={s.x - 3} y={s.y - 3} width={6} height={6} fill="#1a1a1a" opacity="0.6" />
            <rect x={s.x - 6} y={s.y - 1} width={3} height={2} fill="#1a1a1a" opacity="0.4" />
            <rect x={s.x + 3} y={s.y - 1} width={3} height={2} fill="#1a1a1a" opacity="0.4" />
            <rect x={s.x - 1} y={s.y - 6} width={2} height={3} fill="#1a1a1a" opacity="0.4" />
            <rect x={s.x - 1} y={s.y + 3} width={2} height={3} fill="#1a1a1a" opacity="0.4" />
          </g>
        ))}

        {/* Butterflies (animated positions updated via rAF) */}
        <Butterfly bx={b1.x} by={b1.y} flip={b1.flip} />
        <Butterfly bx={b2.x} by={b2.y} flip={b2.flip} />
      </svg>

    </div>
  );
}

/* ────────────────────────────────────────────
   Homepage
   ──────────────────────────────────────────── */

export function RetroHomepage() {
  return (
    <RetroLayout title="Life Blueprint">
      {/* ── Title ── */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 sm:gap-4 mb-3">
          <IconSparkles className="text-[#d4c99a] w-5 h-5 sm:w-7 sm:h-7 shrink-0" />
          <h1
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-[0.08em] text-[#1a1a1a] leading-tight"
            style={{ fontFamily: "'VT323', 'Courier New', monospace" }}
          >
            LIFE DESIGN LAB
          </h1>
          <IconSparkles className="text-[#d4c99a] w-5 h-5 sm:w-7 sm:h-7 shrink-0" />
        </div>
        <p
          className="text-base sm:text-lg md:text-xl text-[#555] tracking-wider"
          style={{ fontFamily: "'VT323', 'Courier New', monospace" }}
        >
          Co-create your life with adventure and ease.
        </p>
      </div>

      {/* ── Interactive Flower Garden ── */}
      <div className="flex justify-center mb-6">
        <FlowerGarden />
      </div>

      {/* ── Buttons ── */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {BUTTONS.map((btn) => (
          <Link
            key={btn.label}
            href={btn.href}
            className="relative block text-center px-3 py-3 sm:py-4 text-sm sm:text-lg font-bold tracking-[0.1em] border-2 border-[#1a1a1a] bg-[#ddd] text-[#1a1a1a] transition-all duration-100 active:translate-x-[2px] active:translate-y-[2px]"
            style={{
              fontFamily: "'VT323', 'Courier New', monospace",
              boxShadow: "3px 3px 0 rgba(0,0,0,0.35)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = btn.color;
              e.currentTarget.style.color = "#f5f5f0";
              e.currentTarget.style.borderColor = btn.color;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#ddd";
              e.currentTarget.style.color = "#1a1a1a";
              e.currentTarget.style.borderColor = "#1a1a1a";
            }}
          >
            {btn.label}
          </Link>
        ))}
      </div>
    </RetroLayout>
  );
}
