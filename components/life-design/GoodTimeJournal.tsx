"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sun,
  Plus,
  Trash2,
  Battery,
  Flame,
  Calendar,
  Tag,
  ChevronDown,
  Sparkles,
} from "lucide-react";

interface JournalEntry {
  id: string;
  date: string;
  activity: string;
  energy: number; // -3 to +3
  engagement: number; // 1-5
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

export function GoodTimeJournal() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
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

  // Save to localStorage
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
    setNewEntry({
      activity: "",
      energy: 0,
      engagement: 3,
      keywords: [],
      notes: "",
    });
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

  // Get all unique keywords for insights
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
    <div className="p-6 lg:p-10 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-4"
        >
          <div className="p-2 rounded-xl bg-primary/10">
            <Sun className="text-primary" size={24} />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-semibold text-foreground font-[family-name:var(--font-display)]">
              美好时光日志
            </h1>
            <p className="text-muted-foreground">Good Time Journal</p>
          </div>
        </motion.div>

        {/* Design Tip */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card border border-border rounded-2xl p-5 shadow-sm mb-6"
        >
          <p className="text-sm text-muted-foreground mb-1">💡 设计提示</p>
          <p className="text-foreground italic">
            &quot;追踪你的能量和投入度，不是为了评判自己，而是为了发现那些让你进入心流状态的活动。&quot;
          </p>
        </motion.div>
      </div>

      {/* Stats Overview */}
      {entries.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
        >
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <Battery
                size={20}
                className={averageEnergy >= 0 ? "text-primary" : "text-destructive"}
              />
              <span className="text-sm text-muted-foreground">平均能量</span>
            </div>
            <p className="text-2xl font-semibold text-foreground">
              {averageEnergy > 0 ? "+" : ""}
              {averageEnergy.toFixed(1)}
            </p>
            <p className="text-xs text-muted-foreground">
              {averageEnergy >= 1
                ? "整体状态积极"
                : averageEnergy >= 0
                ? "能量中等"
                : "需要关注休息"}
            </p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <Flame size={20} className="text-primary" />
              <span className="text-sm text-muted-foreground">平均投入度</span>
            </div>
            <p className="text-2xl font-semibold text-foreground">
              {averageEngagement.toFixed(1)}/5
            </p>
            <p className="text-xs text-muted-foreground">
              {averageEngagement >= 4
                ? "经常进入心流"
                : averageEngagement >= 3
                ? "投入度中等"
                : "可能需要调整方向"}
            </p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <Sparkles size={20} className="text-primary" />
              <span className="text-sm text-muted-foreground">热门关键词</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {topKeywords.length > 0 ? (
                topKeywords.map(([keyword, count]) => (
                  <span
                    key={keyword}
                    className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full"
                  >
                    {keyword} ({count})
                  </span>
                ))
              ) : (
                <p className="text-xs text-muted-foreground">暂无关键词</p>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Add Entry Button */}
      <motion.button
        onClick={() => setIsAdding(true)}
        className="w-full mb-8 flex items-center justify-center gap-2 px-6 py-4 bg-primary text-primary-foreground rounded-2xl hover:bg-primary/90 transition-colors shadow-sm"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <Plus size={20} />
        记录美好时光
      </motion.button>

      {/* Add Entry Form */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-8"
          >
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
              <h3 className="font-medium text-foreground mb-4">新增记录</h3>

              {/* Activity */}
              <div className="mb-4">
                <label className="block text-sm text-muted-foreground mb-2">
                  活动名称 *
                </label>
                <input
                  type="text"
                  value={newEntry.activity}
                  onChange={(e) =>
                    setNewEntry((prev) => ({ ...prev, activity: e.target.value }))
                  }
                  className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="例如：和朋友头脑风暴、写代码、阅读..."
                />
              </div>

              {/* Energy Level */}
              <div className="mb-4">
                <label className="block text-sm text-muted-foreground mb-2">
                  能量水平 ({newEntry.energy! > 0 ? "+" : ""}
                  {newEntry.energy})
                </label>
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                  {energyLevels.map((level) => (
                    <button
                      key={level.value}
                      onClick={() =>
                        setNewEntry((prev) => ({ ...prev, energy: level.value }))
                      }
                      className={`flex flex-col items-center px-3 py-2 rounded-xl min-w-[70px] transition-colors ${
                        newEntry.energy === level.value
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted/50 hover:bg-muted"
                      }`}
                    >
                      <span className="text-xl">{level.emoji}</span>
                      <span className="text-xs mt-1">{level.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Engagement Level */}
              <div className="mb-4">
                <label className="block text-sm text-muted-foreground mb-2">
                  投入度 ({newEntry.engagement}/5)
                </label>
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                  {engagementLevels.map((level) => (
                    <button
                      key={level.value}
                      onClick={() =>
                        setNewEntry((prev) => ({
                          ...prev,
                          engagement: level.value,
                        }))
                      }
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-colors ${
                        newEntry.engagement === level.value
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted/50 hover:bg-muted"
                      }`}
                    >
                      <div className="flex">
                        {[...Array(level.value)].map((_, i) => (
                          <Flame key={i} size={14} />
                        ))}
                      </div>
                      <span className="text-xs">{level.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Keywords */}
              <div className="mb-4">
                <label className="block text-sm text-muted-foreground mb-2">
                  关键词标签
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {(newEntry.keywords || []).map((keyword) => (
                    <span
                      key={keyword}
                      className="flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                    >
                      <Tag size={12} />
                      {keyword}
                      <button
                        onClick={() => removeKeyword(keyword)}
                        className="ml-1 hover:text-destructive"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addKeyword()}
                    className="flex-1 px-4 py-2 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="输入关键词后回车添加..."
                  />
                  <button
                    onClick={addKeyword}
                    className="px-4 py-2 bg-muted rounded-xl hover:bg-muted/80 transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              {/* Notes */}
              <div className="mb-6">
                <label className="block text-sm text-muted-foreground mb-2">
                  备注
                </label>
                <textarea
                  value={newEntry.notes}
                  onChange={(e) =>
                    setNewEntry((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl resize-none h-24 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="记录一些想法或感受..."
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setIsAdding(false)}
                  className="flex-1 px-4 py-3 border border-border rounded-xl text-muted-foreground hover:bg-muted transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={addEntry}
                  disabled={!newEntry.activity?.trim()}
                  className="flex-1 px-4 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  保存
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Entries List */}
      <div className="space-y-4">
        {entries.length === 0 ? (
          <div className="text-center py-16">
            <Sun size={48} className="mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">还没有记录</p>
            <p className="text-sm text-muted-foreground">
              开始记录你的美好时光吧
            </p>
          </div>
        ) : (
          entries.map((entry, index) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-card border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-medium text-foreground">{entry.activity}</h3>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <Calendar size={12} />
                    {new Date(entry.date).toLocaleDateString("zh-CN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <button
                  onClick={() => deleteEntry(entry.id)}
                  className="p-2 hover:bg-destructive/10 hover:text-destructive rounded-lg transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="flex items-center gap-4 mb-3">
                <div className="flex items-center gap-2">
                  <Battery
                    size={16}
                    className={entry.energy >= 0 ? "text-primary" : "text-destructive"}
                  />
                  <span className="text-sm">
                    能量: {entry.energy > 0 ? "+" : ""}
                    {entry.energy}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Flame size={16} className="text-primary" />
                  <span className="text-sm">投入: {entry.engagement}/5</span>
                </div>
              </div>

              {entry.keywords.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {entry.keywords.map((keyword) => (
                    <span
                      key={keyword}
                      className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              )}

              {entry.notes && (
                <p className="text-sm text-muted-foreground">{entry.notes}</p>
              )}
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
