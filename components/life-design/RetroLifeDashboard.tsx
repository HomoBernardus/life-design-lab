"use client";

import { useState, useEffect, useCallback, useRef, type MouseEvent as ReactMouseEvent } from "react";
import { RetroLayout } from "./RetroLayout";
import { IconWork, IconHealth, IconPlay, IconHeart } from "./RetroIcons";

/* ────────────────────────────────────────────
   Types & Constants
   ──────────────────────────────────────────── */

interface DashboardData {
  work: number;
  health: number;
  play: number;
  love: number;
}

const defaultData: DashboardData = { work: 5, health: 5, play: 5, love: 5 };

const GAUGES = [
  { key: "work" as const, label: "工作", icon: IconWork, color: "#95a9bb" },
  { key: "health" as const, label: "健康", icon: IconHealth, color: "#8f9e7a" },
  { key: "play" as const, label: "娱乐", icon: IconPlay, color: "#d4c99a" },
  { key: "love" as const, label: "爱", icon: IconHeart, color: "#c9a0a0" },
];

/* ────────────────────────────────────────────
   Retro UI Primitive
   ──────────────────────────────────────────── */

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`border-2 border-[#1a1a1a] bg-[#f0f0e8] ${className}`}
      style={{ boxShadow: "3px 3px 0 rgba(0,0,0,0.25)" }}
    >
      {children}
    </div>
  );
}

/* ────────────────────────────────────────────
   Semicircular Gauge — SVG dial with drag
   ──────────────────────────────────────────── */

// SVG coordinate helpers for bottom semicircle
const GAUGE_CX = 110;
const GAUGE_CY = 115;
const GAUGE_R = 88; // outer arc radius
const GAUGE_W = 220;
const GAUGE_H = 140;

function roundCoord(n: number): number {
  return Math.round(n * 1e6) / 1e6;
}

function gaugeAngle(value: number): number {
  // arc runs from π (left) to 2π (right) along the bottom
  return Math.PI + (value / 10) * Math.PI;
}

function gaugePoint(value: number): { x: number; y: number } {
  const a = gaugeAngle(value);
  return {
    x: roundCoord(GAUGE_CX + GAUGE_R * Math.cos(a)),
    y: roundCoord(GAUGE_CY + GAUGE_R * Math.sin(a)),
  };
}

function valueFromPoint(svgX: number, svgY: number): number | null {
  const dx = svgX - GAUGE_CX;
  const dy = svgY - GAUGE_CY;
  const dist = Math.sqrt(dx * dx + dy * dy);
  // Only respond to clicks within reasonable distance of the arc
  if (dist < 30 || dist > GAUGE_R + 20) return null;

  let angle = Math.atan2(dy, dx); // [-π, π]
  if (angle < 0) angle += 2 * Math.PI; // [0, 2π]

  // Valid zone: π (left) to 2π (right)
  if (angle < Math.PI - 0.2 && angle > 0.2) return null;

  let a = angle;
  if (a < Math.PI) a = Math.PI; // clamp left edge
  if (a > 2 * Math.PI) a = 2 * Math.PI;

  return Math.round(((a - Math.PI) / Math.PI) * 10);
}

function SemicircularGauge({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const dragging = useRef(false);

  const updateFromEvent = useCallback(
    (e: MouseEvent | globalThis.MouseEvent) => {
      const el = svgRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const sx = ((e.clientX - rect.left) / rect.width) * GAUGE_W;
      const sy = ((e.clientY - rect.top) / rect.height) * GAUGE_H;
      const v = valueFromPoint(sx, sy);
      if (v !== null) onChange(v);
    },
    [onChange]
  );

  const onMouseDown = (e: ReactMouseEvent) => {
    dragging.current = true;
    updateFromEvent(e.nativeEvent);
  };

  useEffect(() => {
    const onMove = (e: globalThis.MouseEvent) => {
      if (!dragging.current) return;
      updateFromEvent(e);
    };
    const onUp = () => {
      dragging.current = false;
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [updateFromEvent]);

  const endPt = gaugePoint(value);
  const filledArc = `M ${GAUGE_CX - GAUGE_R} ${GAUGE_CY} A ${GAUGE_R} ${GAUGE_R} 0 0 1 ${endPt.x} ${endPt.y}`;
  const trackArc = `M ${GAUGE_CX - GAUGE_R} ${GAUGE_CY} A ${GAUGE_R} ${GAUGE_R} 0 0 1 ${GAUGE_CX + GAUGE_R} ${GAUGE_CY}`;

  // Needle: thick line from center to arc point
  const nLen = GAUGE_R - 10;
  const needleAngle = gaugeAngle(value);
  const needleX = roundCoord(GAUGE_CX + nLen * Math.cos(needleAngle));
  const needleY = roundCoord(GAUGE_CY + nLen * Math.sin(needleAngle));

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${GAUGE_W} ${GAUGE_H}`}
      className="w-full max-w-[220px] h-auto mx-auto block cursor-pointer select-none"
      onMouseDown={onMouseDown}
      aria-label={`Gauge value ${value} out of 10`}
      role="slider"
    >
      {/* Track arc (background) */}
      <path
        d={trackArc}
        fill="none"
        stroke="#ddd"
        strokeWidth={12}
        strokeLinecap="round"
      />

      {/* Filled arc */}
      {value > 0 && (
        <path
          d={filledArc}
          fill="none"
          stroke="#1a1a1a"
          strokeWidth={12}
          strokeLinecap={value === 10 ? "round" : "butt"}
        />
      )}

      {/* Tick marks */}
      {Array.from({ length: 11 }, (_, i) => {
        const a = gaugeAngle(i);
        const major = i % 5 === 0;
        const innerR = GAUGE_R - (major ? 18 : 12);
        const x1 = roundCoord(GAUGE_CX + innerR * Math.cos(a));
        const y1 = roundCoord(GAUGE_CY + innerR * Math.sin(a));
        const x2 = roundCoord(GAUGE_CX + (GAUGE_R + 1) * Math.cos(a));
        const y2 = roundCoord(GAUGE_CY + (GAUGE_R + 1) * Math.sin(a));
        return (
          <line
            key={i}
            x1={x1} y1={y1} x2={x2} y2={y2}
            stroke="#1a1a1a"
            strokeWidth={major ? 2 : 1}
          />
        );
      })}

      {/* Tick labels */}
      {[0, 2, 4, 6, 8, 10].map((i) => {
        const a = gaugeAngle(i);
        const lx = roundCoord(GAUGE_CX + (GAUGE_R + 20) * Math.cos(a));
        const ly = roundCoord(GAUGE_CY + (GAUGE_R + 20) * Math.sin(a));
        return (
          <text
            key={i}
            x={lx} y={ly}
            textAnchor="middle" dominantBaseline="middle"
            className="fill-[#1a1a1a]"
            style={{ fontFamily: "'VT323', 'Courier New', monospace", fontSize: "12px", fontWeight: "bold" }}
          >
            {i}
          </text>
        );
      })}

      {/* Needle line */}
      <line
        x1={GAUGE_CX} y1={GAUGE_CY}
        x2={needleX} y2={needleY}
        stroke="#1a1a1a"
        strokeWidth={4}
        strokeLinecap="round"
      />

      {/* Needle tip dot */}
      <rect
        x={needleX - 4} y={needleY - 4}
        width={8} height={8}
        fill="#1a1a1a"
      />

      {/* Center pivot */}
      <rect
        x={GAUGE_CX - 6} y={GAUGE_CY - 6}
        width={12} height={12}
        fill="#1a1a1a"
      />
      <rect
        x={GAUGE_CX - 2} y={GAUGE_CY - 2}
        width={4} height={4}
        fill="#f5f5f0"
      />

      {/* Center value display */}
      <text
        x={GAUGE_CX} y={GAUGE_CY - 22}
        textAnchor="middle" dominantBaseline="middle"
        className="fill-[#1a1a1a]"
        style={{ fontFamily: "'VT323', 'Courier New', monospace", fontSize: "22px", fontWeight: "bold" }}
      >
        {value}/10
      </text>
    </svg>
  );
}

/* ────────────────────────────────────────────
   Radar Chart
   ──────────────────────────────────────────── */

const RADAR_CX = 120;
const RADAR_CY = 120;
const RADAR_R = 90;

const AXES = [
  { key: "work", angle: -Math.PI / 2, label: "工作", lx: RADAR_CX, ly: RADAR_CY - RADAR_R - 12 },
  { key: "health", angle: 0, label: "健康", lx: RADAR_CX + RADAR_R + 12, ly: RADAR_CY },
  { key: "love", angle: Math.PI / 2, label: "爱", lx: RADAR_CX, ly: RADAR_CY + RADAR_R + 12 },
  { key: "play", angle: Math.PI, label: "娱乐", lx: RADAR_CX - RADAR_R - 12, ly: RADAR_CY },
];

function getRadarPoint(angle: number, level: number) {
  const r = (RADAR_R * level) / 10;
  return { x: roundCoord(RADAR_CX + r * Math.cos(angle)), y: roundCoord(RADAR_CY + r * Math.sin(angle)) };
}

function RadarChart({ data }: { data: DashboardData }) {
  const levels = [2, 4, 6, 8, 10];
  const dataPoints = AXES.map((a) => getRadarPoint(a.angle, data[a.key as keyof DashboardData]));
  const dataPolygon = dataPoints.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <svg
      viewBox="0 0 240 240"
      className="w-full max-w-[320px] h-auto mx-auto block"
      aria-label="Life balance radar chart"
      role="img"
    >
      {levels.map((level) => {
        const pts = AXES.map((a) => getRadarPoint(a.angle, level))
          .map((p) => `${p.x},${p.y}`)
          .join(" ");
        return (
          <polygon
            key={level}
            points={pts}
            fill="none"
            stroke={level === 10 ? "#1a1a1a" : "#bbb"}
            strokeWidth={level === 10 ? 2 : 1}
            strokeDasharray={level === 10 ? "none" : "3 3"}
          />
        );
      })}

      {AXES.map((a) => (
        <line
          key={a.key}
          x1={RADAR_CX} y1={RADAR_CY}
          x2={getRadarPoint(a.angle, 10).x}
          y2={getRadarPoint(a.angle, 10).y}
          stroke="#999" strokeWidth={1} strokeDasharray="2 3"
        />
      ))}

      {AXES.map((a) =>
        levels.map((level) => {
          const p = getRadarPoint(a.angle, level);
          return <rect key={`${a.key}-${level}`} x={p.x - 2} y={p.y - 2} width={4} height={4} fill="#ccc" />;
        })
      )}

      <polygon points={dataPolygon} fill="#1a1a1a" fillOpacity={0.12} stroke="#1a1a1a" strokeWidth={2} />

      {dataPoints.map((p, i) => (
        <rect key={i} x={p.x - 4} y={p.y - 4} width={8} height={8} fill="#1a1a1a" />
      ))}

      {AXES.map((a) => (
        <text
          key={a.key} x={a.lx} y={a.ly}
          textAnchor="middle" dominantBaseline="middle"
          className="fill-[#1a1a1a] font-bold"
          style={{ fontFamily: "'VT323', 'Courier New', monospace", fontSize: "13px" }}
        >
          {a.label}
        </text>
      ))}

      <rect x={RADAR_CX - 3} y={RADAR_CY - 3} width={6} height={6} fill="#1a1a1a" />
    </svg>
  );
}

/* ────────────────────────────────────────────
   Main Component
   ──────────────────────────────────────────── */

export function RetroLifeDashboard() {
  const [data, setData] = useState<DashboardData>(() => {
    try {
      const saved = localStorage.getItem("lifeDashboard");
      if (saved) return JSON.parse(saved);
    } catch { /* ignore */ }
    return defaultData;
  });

  const saveData = useCallback((d: DashboardData) => {
    localStorage.setItem("lifeDashboard", JSON.stringify(d));
  }, []);

  const updateGauge = (key: keyof DashboardData, value: number) => {
    setData((prev) => {
      const next = { ...prev, [key]: value };
      saveData(next);
      return next;
    });
  };

  return (
    <RetroLayout title="Life Dashboard" backHref="/" scrollable>
      <div style={{ fontFamily: "'VT323', 'Courier New', monospace" }}>
        {/* ── Header ── */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 border-2 border-[#1a1a1a] bg-[#e0e0d8]">
            <div className="flex gap-0.5">
              <div className="w-2 h-5 bg-[#1a1a1a]" />
              <div className="w-2 h-3 bg-[#1a1a1a] mt-2" />
              <div className="w-2 h-4 bg-[#1a1a1a] mt-1" />
              <div className="w-2 h-5 bg-[#1a1a1a]" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-[0.06em] text-[#1a1a1a]">人生仪表盘</h1>
            <p className="text-sm text-[#777] tracking-wider">Life Dashboard</p>
          </div>
        </div>

        {/* ── Design Tip ── */}
        <Card className="mb-6 p-4">
          <p className="text-xs text-[#777] mb-1">[ 设计提示 ]</p>
          <p className="text-[#333] italic text-sm leading-relaxed">
            &ldquo;人生需要在工作、健康、娱乐和爱之间找到平衡。拖动仪表盘指针或点击弧线，检视你的四个维度。&rdquo;
          </p>
        </Card>

        {/* ── Radar Chart ── */}
        <Card className="mb-6 p-3 flex justify-center">
          <RadarChart data={data} />
        </Card>

        {/* ── Gauges Grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {GAUGES.map((gauge) => (
            <Card key={gauge.key} className="p-4">
              {/* Label row */}
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 border-2 border-[#1a1a1a] bg-[#e0e0d8]">
                    <span style={{ color: gauge.color }}><gauge.icon size={18} /></span>
                  </div>
                  <span className="font-bold text-[#1a1a1a] tracking-wider text-base">
                    {gauge.label}
                  </span>
                </div>
              </div>

              {/* Gauge dial */}
              <SemicircularGauge
                value={data[gauge.key]}
                onChange={(v) => updateGauge(gauge.key, v)}
              />

              {/* +/- Buttons */}
              <div className="flex items-center justify-center gap-4 -mt-2">
                <button
                  onClick={() => updateGauge(gauge.key, Math.max(0, data[gauge.key] - 1))}
                  disabled={data[gauge.key] <= 0}
                  className="w-8 h-8 border-2 border-[#1a1a1a] bg-[#ddd] flex items-center justify-center text-lg font-bold text-[#1a1a1a] hover:bg-[#ccc] active:translate-x-[1px] active:translate-y-[1px] disabled:opacity-30 disabled:cursor-not-allowed disabled:active:translate-x-0 disabled:active:translate-y-0 transition-all"
                  style={{ fontFamily: "'VT323', 'Courier New', monospace" }}
                  aria-label={`Decrease ${gauge.label}`}
                >
                  −
                </button>
                <button
                  onClick={() => updateGauge(gauge.key, Math.min(10, data[gauge.key] + 1))}
                  disabled={data[gauge.key] >= 10}
                  className="w-8 h-8 border-2 border-[#1a1a1a] bg-[#ddd] flex items-center justify-center text-lg font-bold text-[#1a1a1a] hover:bg-[#ccc] active:translate-x-[1px] active:translate-y-[1px] disabled:opacity-30 disabled:cursor-not-allowed disabled:active:translate-x-0 disabled:active:translate-y-0 transition-all"
                  style={{ fontFamily: "'VT323', 'Courier New', monospace" }}
                  aria-label={`Increase ${gauge.label}`}
                >
                  +
                </button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </RetroLayout>
  );
}
