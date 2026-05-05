"use client";

import { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { RetroLayout } from "./RetroLayout";
import {
  IconSun,
  IconPlus,
  IconTrash,
  IconBattery,
  IconFlame,
  IconCalendar,
  IconTag,
  IconSparkles,
} from "./RetroIcons";

/* ────────────────────────────────────────────
   Types & Constants
   ──────────────────────────────────────────── */

interface JournalEntry {
  id: string;
  date: string;
  activity: string;
  energy: number;
  engagement: number;
  keywords: string[];
  notes: string;
}

const energyLevels = [
  { value: -3, label: "精疲力竭", emoji: "😫" },
  { value: -2, label: "疲惫", emoji: "😓" },
  { value: -1, label: "有点累", emoji: "😕" },
  { value: 0, label: "中立", emoji: "😐" },
  { value: 1, label: "还不错", emoji: "🙂" },
  { value: 2, label: "充满活力", emoji: "😊" },
  { value: 3, label: "能量爆棚", emoji: "🤩" },
];

const engagementLevels = [
  { value: 1, label: "完全分心" },
  { value: 2, label: "勉强专注" },
  { value: 3, label: "一般投入" },
  { value: 4, label: "高度投入" },
  { value: 5, label: "心流状态" },
];

/* ────────────────────────────────────────────
   Retro-styled sub-components
   ──────────────────────────────────────────── */

function RetroCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`border-2 border-[#1a1a1a] bg-[#f0f0e8] p-4 ${className}`}
      style={{ boxShadow: "3px 3px 0 rgba(0,0,0,0.25)" }}
    >
      {children}
    </div>
  );
}

function RetroInput({
  value,
  onChange,
  placeholder,
  className = "",
  onKeyDown,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
  onKeyDown?: (e: React.KeyboardEvent) => void;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      className={`w-full px-3 py-2 border-2 border-[#1a1a1a] bg-white text-[#1a1a1a] placeholder-[#999] outline-none focus:ring-2 focus:ring-[#555] ${className}`}
      style={{
        fontFamily: "'VT323', 'Courier New', monospace",
        boxShadow: "inset 1px 1px 0 #ccc, inset -1px -1px 0 #fff",
      }}
    />
  );
}

function RetroTextarea({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
}) {
  return (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full px-3 py-2 border-2 border-[#1a1a1a] bg-white text-[#1a1a1a] placeholder-[#999] outline-none focus:ring-2 focus:ring-[#555] resize-none h-24"
      style={{
        fontFamily: "'VT323', 'Courier New', monospace",
        boxShadow: "inset 1px 1px 0 #ccc, inset -1px -1px 0 #fff",
      }}
    />
  );
}

function RetroBtn({
  children,
  onClick,
  disabled,
  className = "",
  variant = "default",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  variant?: "default" | "ghost";
}) {
  const base =
    "relative px-4 py-2 text-sm font-bold tracking-[0.08em] border-2 border-[#1a1a1a] transition-all duration-100 active:translate-x-[2px] active:translate-y-[2px] disabled:opacity-40 disabled:cursor-not-allowed disabled:active:translate-x-0 disabled:active:translate-y-0";
  const styles =
    variant === "ghost"
      ? "bg-transparent text-[#555] hover:bg-[#ddd]"
      : "bg-[#ddd] text-[#1a1a1a]";
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${styles} ${className}`}
      style={{
        fontFamily: "'VT323', 'Courier New', monospace",
        boxShadow: variant === "ghost" ? "none" : "3px 3px 0 rgba(0,0,0,0.3)",
      }}
      onMouseEnter={(e) => {
        if (disabled) return;
        if (variant !== "ghost") {
          e.currentTarget.style.backgroundColor = "#1a1a1a";
          e.currentTarget.style.color = "#ddd";
        }
      }}
      onMouseLeave={(e) => {
        if (disabled) return;
        if (variant !== "ghost") {
          e.currentTarget.style.backgroundColor = "#ddd";
          e.currentTarget.style.color = "#1a1a1a";
        }
      }}
    >
      {children}
    </button>
  );
}

function RetroChip({
  children,
  onRemove,
  active = false,
  onClick,
}: {
  children: React.ReactNode;
  onRemove?: () => void;
  active?: boolean;
  onClick?: () => void;
}) {
  const El = onClick ? "button" : "span";
  return (
    <El
      onClick={onClick}
      className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs border-2 transition-colors ${
        active
          ? "bg-[#1a1a1a] text-[#ddd] border-[#1a1a1a]"
          : "bg-[#e8e8e0] text-[#1a1a1a] border-[#999] hover:border-[#1a1a1a]"
      }`}
      style={{ fontFamily: "'VT323', 'Courier New', monospace" }}
    >
      {children}
      {onRemove && (
        <span
          className="ml-1 cursor-pointer hover:text-red-500"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
        >
          ×
        </span>
      )}
    </El>
  );
}

/* ────────────────────────────────────────────
   Main Component
   ──────────────────────────────────────────── */

export function RetroGoodTimeJournal() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newEntry, setNewEntry] = useState<Partial<JournalEntry>>({
    activity: "",
    energy: 0,
    engagement: 3,
    keywords: [],
    notes: "",
  });
  const [newKeyword, setNewKeyword] = useState("");

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("goodTimeJournal");
    if (saved) {
      try {
        setEntries(JSON.parse(saved));
      } catch {
        console.error("Failed to parse journal data");
      }
    }
  }, []);

  const saveEntries = useCallback((data: JournalEntry[]) => {
    localStorage.setItem("goodTimeJournal", JSON.stringify(data));
  }, []);

  const addEntry = () => {
    if (!newEntry.activity?.trim()) return;
    const entry: JournalEntry = {
      id: `entry-${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      activity: newEntry.activity || "",
      energy: newEntry.energy || 0,
      engagement: newEntry.engagement || 3,
      keywords: newEntry.keywords || [],
      notes: newEntry.notes || "",
    };
    const updated = [entry, ...entries];
    setEntries(updated);
    saveEntries(updated);
    setNewEntry({ activity: "", energy: 0, engagement: 3, keywords: [], notes: "" });
    setIsAdding(false);
  };

  const deleteEntry = (id: string) => {
    const updated = entries.filter((e) => e.id !== id);
    setEntries(updated);
    saveEntries(updated);
  };

  const addKeyword = () => {
    if (!newKeyword.trim()) return;
    setNewEntry((prev) => ({
      ...prev,
      keywords: [...(prev.keywords || []), newKeyword.trim()],
    }));
    setNewKeyword("");
  };

  const removeKeyword = (keyword: string) => {
    setNewEntry((prev) => ({
      ...prev,
      keywords: (prev.keywords || []).filter((k) => k !== keyword),
    }));
  };

  // Stats
  const allKeywords = entries.reduce<Record<string, number>>((acc, entry) => {
    entry.keywords.forEach((k) => {
      acc[k] = (acc[k] || 0) + 1;
    });
    return acc;
  }, {});

  const topKeywords = Object.entries(allKeywords)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const averageEnergy =
    entries.length > 0
      ? entries.reduce((sum, e) => sum + e.energy, 0) / entries.length
      : 0;

  const averageEngagement =
    entries.length > 0
      ? entries.reduce((sum, e) => sum + e.engagement, 0) / entries.length
      : 0;

  return (
    <RetroLayout title="Good Time Journal" backHref="/" scrollable>
      <div style={{ fontFamily: "'VT323', 'Courier New', monospace" }}>
        {/* ── Header ── */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 border-2 border-[#1a1a1a] bg-[#e0e0d8]">
            <IconSun className="text-[#d4c99a]" size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-[0.06em] text-[#1a1a1a]">
              美好时光日志
            </h1>
            <p className="text-sm text-[#777] tracking-wider">Good Time Journal</p>
          </div>
        </div>

        {/* ── Design Tip ── */}
        <RetroCard className="mb-6">
          <p className="text-xs text-[#777] mb-1">[ 设计提示 ]</p>
          <p className="text-[#333] italic text-sm leading-relaxed">
            &ldquo;追踪你的能量和投入度，不是为了评判自己，而是为了发现那些让你进入心流状态的活动。&rdquo;
          </p>
        </RetroCard>

        {/* ── Stats Overview ── */}
        {entries.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            <RetroCard>
              <div className="flex items-center gap-2 mb-2">
                <IconBattery
                  size={18}
                  className={averageEnergy >= 0 ? "text-[#1a1a1a]" : "text-[#555]"}
                  level={Math.abs(averageEnergy) / 3}
                />
                <span className="text-xs text-[#777] tracking-wider">平均能量</span>
              </div>
              <p className="text-xl font-bold text-[#1a1a1a]">
                {averageEnergy > 0 ? "+" : ""}
                {averageEnergy.toFixed(1)}
              </p>
              <p className="text-xs text-[#999] mt-0.5">
                {averageEnergy >= 1 ? "整体状态积极" : averageEnergy >= 0 ? "能量中等" : "需要关注休息"}
              </p>
            </RetroCard>

            <RetroCard>
              <div className="flex items-center gap-2 mb-2">
                <IconFlame size={18} className="text-[#c9ab8f]" />
                <span className="text-xs text-[#777] tracking-wider">平均投入度</span>
              </div>
              <p className="text-xl font-bold text-[#1a1a1a]">
                {averageEngagement.toFixed(1)}/5
              </p>
              <p className="text-xs text-[#999] mt-0.5">
                {averageEngagement >= 4
                  ? "经常进入心流"
                  : averageEngagement >= 3
                  ? "投入度中等"
                  : "可能需要调整方向"}
              </p>
            </RetroCard>

            <RetroCard>
              <div className="flex items-center gap-2 mb-2">
                <IconSparkles size={18} className="text-[#d4c99a]" />
                <span className="text-xs text-[#777] tracking-wider">热门关键词</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {topKeywords.length > 0 ? (
                  topKeywords.map(([keyword, count]) => (
                    <RetroChip key={keyword}>
                      {keyword} ({count})
                    </RetroChip>
                  ))
                ) : (
                  <p className="text-xs text-[#999]">暂无关键词</p>
                )}
              </div>
            </RetroCard>
          </div>
        )}

        {/* ── Add Entry Button ── */}
        {!isAdding && (
          <RetroBtn onClick={() => setIsAdding(true)} className="w-full mb-6 flex items-center justify-center gap-2">
            <IconPlus size={18} />
            记录美好时光
          </RetroBtn>
        )}

        {/* ── Add Entry Form ── */}
        <AnimatePresence>
          {isAdding && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-6"
            >
              <RetroCard>
                <h3 className="text-lg font-bold text-[#1a1a1a] mb-4 tracking-wider">
                  [ 新增记录 ]
                </h3>

                {/* Activity */}
                <label className="block text-xs text-[#777] mb-1.5 tracking-wider">
                  活动名称 *
                </label>
                <RetroInput
                  value={newEntry.activity || ""}
                  onChange={(e) => setNewEntry((prev) => ({ ...prev, activity: e.target.value }))}
                  placeholder="例如：和朋友头脑风暴、写代码、阅读..."
                />

                {/* Energy Level */}
                <div className="mt-4 mb-2">
                  <label className="block text-xs text-[#777] mb-1.5 tracking-wider">
                    能量水平 ({newEntry.energy! > 0 ? "+" : ""}
                    {newEntry.energy})
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {energyLevels.map((level) => (
                      <RetroChip
                        key={level.value}
                        active={newEntry.energy === level.value}
                        onClick={() => setNewEntry((prev) => ({ ...prev, energy: level.value }))}
                      >
                        <span className="text-base">{level.emoji}</span> {level.label}
                      </RetroChip>
                    ))}
                  </div>
                </div>

                {/* Engagement Level */}
                <div className="mt-4 mb-2">
                  <label className="block text-xs text-[#777] mb-1.5 tracking-wider">
                    投入度 ({newEntry.engagement}/5)
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {engagementLevels.map((level) => (
                      <RetroChip
                        key={level.value}
                        active={newEntry.engagement === level.value}
                        onClick={() =>
                          setNewEntry((prev) => ({ ...prev, engagement: level.value }))
                        }
                      >
                        <span className="flex gap-0.5">
                          {[...Array(level.value)].map((_, i) => (
                            <IconFlame key={i} size={12} />
                          ))}
                        </span>{" "}
                        {level.label}
                      </RetroChip>
                    ))}
                  </div>
                </div>

                {/* Keywords */}
                <div className="mt-4 mb-2">
                  <label className="block text-xs text-[#777] mb-1.5 tracking-wider">
                    关键词标签
                  </label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {(newEntry.keywords || []).map((keyword) => (
                      <RetroChip key={keyword} onRemove={() => removeKeyword(keyword)}>
                        <IconTag size={12} /> {keyword}
                      </RetroChip>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <RetroInput
                      value={newKeyword}
                      onChange={(e) => setNewKeyword(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addKeyword()}
                      placeholder="输入关键词后回车添加..."
                      className="flex-1"
                    />
                    <RetroBtn onClick={addKeyword}>
                      <IconPlus size={16} />
                    </RetroBtn>
                  </div>
                </div>

                {/* Notes */}
                <div className="mt-4 mb-5">
                  <label className="block text-xs text-[#777] mb-1.5 tracking-wider">备注</label>
                  <RetroTextarea
                    value={newEntry.notes || ""}
                    onChange={(e) => setNewEntry((prev) => ({ ...prev, notes: e.target.value }))}
                    placeholder="记录一些想法或感受..."
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <RetroBtn variant="ghost" onClick={() => setIsAdding(false)} className="flex-1">
                    取消
                  </RetroBtn>
                  <RetroBtn
                    onClick={addEntry}
                    disabled={!newEntry.activity?.trim()}
                    className="flex-1"
                  >
                    保存
                  </RetroBtn>
                </div>
              </RetroCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Entries List ── */}
        <div className="space-y-3">
          {entries.length === 0 && !isAdding ? (
            <div className="text-center py-12">
              <IconSun size={48} className="mx-auto text-[#ccc] mb-3" />
              <p className="text-[#999] tracking-wider">还没有记录</p>
              <p className="text-xs text-[#bbb] mt-1">开始记录你的美好时光吧</p>
            </div>
          ) : (
            entries.map((entry) => (
              <RetroCard key={entry.id}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-bold text-[#1a1a1a] tracking-wider">{entry.activity}</h3>
                    <p className="text-xs text-[#999] flex items-center gap-1 mt-0.5">
                      <IconCalendar size={12} />
                      {new Date(entry.date).toLocaleDateString("zh-CN", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteEntry(entry.id)}
                    className="p-1.5 hover:bg-[#ddd] transition-colors"
                    title="删除"
                  >
                    <IconTrash size={16} className="text-[#777]" />
                  </button>
                </div>

                <div className="flex items-center gap-4 mb-2">
                  <span className="flex items-center gap-1 text-xs text-[#555]">
                    <IconBattery
                      size={14}
                      className={entry.energy >= 0 ? "text-[#1a1a1a]" : "text-[#777]"}
                      level={Math.abs(entry.energy) / 3}
                    />
                    能量: {entry.energy > 0 ? "+" : ""}
                    {entry.energy}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-[#555]">
                    <IconFlame size={14} className="text-[#1a1a1a]" />
                    投入: {entry.engagement}/5
                  </span>
                </div>

                {entry.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {entry.keywords.map((keyword) => (
                      <RetroChip key={keyword}>{keyword}</RetroChip>
                    ))}
                  </div>
                )}

                {entry.notes && <p className="text-sm text-[#777]">{entry.notes}</p>}
              </RetroCard>
            ))
          )}
        </div>
      </div>
    </RetroLayout>
  );
}
