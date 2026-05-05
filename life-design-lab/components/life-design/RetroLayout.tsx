"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { IconBack } from "./RetroIcons";

interface RetroLayoutProps {
  children: React.ReactNode;
  title: string;
  backHref?: string;
  /** Show scrollable content area — set false for short pages that shouldn't scroll */
  scrollable?: boolean;
}

export function RetroLayout({ children, title, backHref, scrollable = false }: RetroLayoutProps) {
  const [time, setTime] = useState("");

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      const h = d.getHours().toString().padStart(2, "0");
      const m = d.getMinutes().toString().padStart(2, "0");
      setTime(`${h}:${m}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className="min-h-screen flex flex-col select-none"
      style={{
        fontFamily: "'VT323', 'Courier New', monospace",
        backgroundImage:
          "linear-gradient(45deg, #555 25%, transparent 25%), linear-gradient(-45deg, #555 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #555 75%), linear-gradient(-45deg, transparent 75%, #555 75%)",
        backgroundSize: "4px 4px",
        backgroundPosition: "0 0, 0 2px, 2px -2px, -2px 0px",
        backgroundColor: "#4a4a4a",
      }}
    >
      {/* ── System Bar ── */}
      <header className="bg-[#1e1e1e] text-[#bbb] px-4 py-1.5 flex items-center justify-between border-b-2 border-[#111] shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-[#8f9e7a] border border-[#6b7a5c]" />
          <span className="text-sm tracking-[0.15em] text-[#d4c99a]">Life Studio</span>
        </div>
        <span className="text-sm tracking-wider">{time}</span>
      </header>

      {/* ── Desktop Area ── */}
      <main className="flex-1 flex items-start justify-center p-4 sm:p-6 md:p-10">
        {/* ── Window ── */}
        <div
          className={`w-full max-w-2xl border-2 border-[#111] bg-[#e0e0e0] flex flex-col ${scrollable ? "max-h-[calc(100vh-6rem)]" : ""}`}
          style={{
            boxShadow:
              "inset 2px 2px 0 #fff, inset -2px -2px 0 #888, 6px 6px 0 rgba(0,0,0,0.35)",
          }}
        >
          {/* ── Title Bar ── */}
          <div className="bg-[#2a2a2a] text-[#ccc] px-3 py-1.5 flex items-center justify-between border-b-2 border-[#111] shrink-0">
            <div className="flex items-center gap-2">
              {backHref && (
                <Link href={backHref} className="hover:text-white transition-colors -ml-0.5">
                  <IconBack size={18} className="text-[#aaa]" />
                </Link>
              )}
              <span className="text-sm tracking-[0.12em]">{title}</span>
            </div>
            <div className="flex gap-1.5">
              <span className="block w-3.5 h-3.5 bg-[#555] border border-[#3a3a3a]" />
              <span className="block w-3.5 h-3.5 bg-[#555] border border-[#3a3a3a]" />
              <span className="block w-3.5 h-3.5 bg-[#555] border border-[#3a3a3a]" />
            </div>
          </div>

          {/* ── Content ── */}
          <div
            className={`p-6 sm:p-8 ${scrollable ? "overflow-y-auto flex-1" : ""}`}
            style={{
              backgroundImage:
                "linear-gradient(#e8e8e0 1px, transparent 1px), linear-gradient(90deg, #e8e8e0 1px, transparent 1px)",
              backgroundSize: "16px 16px",
              backgroundPosition: "center center",
              backgroundColor: "#f5f5f0",
            }}
          >
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
