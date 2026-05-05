"use client";

import { LayoutDashboard, Map, Sun, Moon, Menu, X } from "lucide-react";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";

type ViewType = "dashboard" | "odyssey" | "journal";

interface SidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

const navItems = [
  {
    id: "dashboard" as ViewType,
    label: "仪表盘",
    sublabel: "Life Dashboard",
    icon: LayoutDashboard,
  },
  {
    id: "odyssey" as ViewType,
    label: "奥德赛计划",
    sublabel: "Odyssey Plan",
    icon: Map,
  },
  {
    id: "journal" as ViewType,
    label: "美好时光日志",
    sublabel: "Good Time Journal",
    icon: Sun,
  },
];

export function Sidebar({ currentView, onViewChange }: SidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-card shadow-sm lg:hidden"
        aria-label={isMobileOpen ? "关闭菜单" : "打开菜单"}
      >
        {isMobileOpen ? <X size={20} className="text-foreground" /> : <Menu size={20} className="text-foreground" />}
      </button>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-foreground/10 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-[260px] bg-background z-40 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full pl-8 pr-6 py-8">
          {/* Logo */}
          <div className="mb-14">
            <h1 className="text-lg font-semibold text-foreground tracking-tight font-[family-name:var(--font-display)]">
              Life Design Lab
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              斯坦福人生设计课
            </p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onViewChange(item.id);
                    setIsMobileOpen(false);
                  }}
                  className={`relative w-full flex items-center gap-3 px-0 py-3 text-left transition-colors group ${
                    isActive
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {/* Left accent bar — visible on active */}
                  <span
                    className={`absolute left-[-2rem] top-1/2 -translate-y-1/2 w-[3px] rounded-full transition-all duration-200 ${
                      isActive
                        ? "h-8 bg-primary"
                        : "h-0 bg-primary/0 group-hover:h-4 group-hover:bg-muted-foreground/30"
                    }`}
                  />
                  <item.icon
                    size={18}
                    className={`shrink-0 transition-colors ${
                      isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                    }`}
                  />
                  <div className="min-w-0">
                    <span className={`block text-sm font-medium leading-tight ${
                      isActive ? "text-foreground" : ""
                    }`}>
                      {item.label}
                    </span>
                    <span className="block text-[11px] text-muted-foreground leading-tight mt-0.5">
                      {item.sublabel}
                    </span>
                  </div>
                </button>
              );
            })}
          </nav>

          {/* Bottom section */}
          <div className="flex flex-col gap-3">
            {/* Theme toggle */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="flex items-center gap-3 py-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {mounted && theme === "dark" ? (
                <Sun size={16} />
              ) : (
                <Moon size={16} />
              )}
              <span className="text-xs">
                {mounted ? (theme === "dark" ? "浅色模式" : "深色模式") : "切换主题"}
              </span>
            </button>

            {/* Footer quote */}
            <div>
              <p className="text-[11px] text-muted-foreground italic leading-relaxed">
                &quot;接受你此刻的位置，并从那里开始前进。&quot;
              </p>
              <p className="text-[10px] text-muted-foreground/60 mt-1">
                — 《斯坦福人生设计课》
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
