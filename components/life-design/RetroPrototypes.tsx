"use client";

import { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { RetroLayout } from "./RetroLayout";
import { IconFlask, IconPlus, IconTrash, IconCalendar } from "./RetroIcons";

/* ────────────────────────────────────────────
   Types
   ──────────────────────────────────────────── */

type ProtoStatus = "planned" | "in_progress" | "completed";

interface Prototype {
  id: string;
  title: string;
  content: string;
  time: string;
  notes: string;
  status: ProtoStatus;
  createdAt: string;
}

const STATUS_LABELS: Record<ProtoStatus, string> = {
  planned: "计划中",
  in_progress: "进行中",
  completed: "已完成",
};

const STATUS_PATTERNS: Record<ProtoStatus, string> = {
  planned: "",
  in_progress: "repeating-linear-gradient(-45deg, transparent, transparent 3px, #f5f5f0 3px, #f5f5f0 6px)",
  completed: "",
};

const defaultForm = {
  title: "",
  content: "",
  time: "",
  notes: "",
};

/* ────────────────────────────────────────────
   Retro UI Primitives
   ──────────────────────────────────────────── */

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`border-2 border-[#1a1a1a] bg-[#f0f0e8] p-4 ${className}`}
      style={{ boxShadow: "3px 3px 0 rgba(0,0,0,0.25)" }}
    >
      {children}
    </div>
  );
}

function Input({
  value, onChange, placeholder, className = "",
}: {
  value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string; className?: string;
}) {
  return (
    <input
      type="text" value={value} onChange={onChange} placeholder={placeholder}
      className={`w-full px-3 py-2 border-2 border-[#1a1a1a] bg-white text-[#1a1a1a] placeholder-[#999] outline-none focus:ring-2 focus:ring-[#555] ${className}`}
      style={{ fontFamily: "'VT323', 'Courier New', monospace", boxShadow: "inset 1px 1px 0 #ccc, inset -1px -1px 0 #fff" }}
    />
  );
}

function Textarea({
  value, onChange, placeholder, rows = 3,
}: {
  value: string; onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string; rows?: number;
}) {
  return (
    <textarea
      value={value} onChange={onChange} placeholder={placeholder} rows={rows}
      className="w-full px-3 py-2 border-2 border-[#1a1a1a] bg-white text-[#1a1a1a] placeholder-[#999] outline-none focus:ring-2 focus:ring-[#555] resize-none"
      style={{ fontFamily: "'VT323', 'Courier New', monospace", boxShadow: "inset 1px 1px 0 #ccc, inset -1px -1px 0 #fff" }}
    />
  );
}

function Btn({
  children, onClick, disabled, className = "", variant = "default", small,
}: {
  children: React.ReactNode; onClick?: () => void; disabled?: boolean;
  className?: string; variant?: "default" | "ghost" | "danger"; small?: boolean;
}) {
  return (
    <button
      onClick={onClick} disabled={disabled}
      className={`relative font-bold tracking-[0.06em] border-2 border-[#1a1a1a] transition-all duration-100 active:translate-x-[1px] active:translate-y-[1px] disabled:opacity-40 disabled:cursor-not-allowed disabled:active:translate-x-0 disabled:active:translate-y-0 ${
        variant === "ghost" ? "bg-transparent text-[#555] hover:bg-[#ddd]" :
        variant === "danger" ? "bg-[#ddd] text-[#b33] hover:bg-[#fcc] hover:text-[#d33]" :
        "bg-[#ddd] text-[#1a1a1a]"
      } ${small ? "px-2 py-1 text-xs" : "px-4 py-2 text-sm"} ${className}`}
      style={{
        fontFamily: "'VT323', 'Courier New', monospace",
        boxShadow: variant === "ghost" ? "none" : "2px 2px 0 rgba(0,0,0,0.25)",
      }}
      onMouseEnter={(e) => { if (disabled) return; if (variant === "default") { e.currentTarget.style.backgroundColor = "#1a1a1a"; e.currentTarget.style.color = "#ddd"; } }}
      onMouseLeave={(e) => { if (disabled) return; if (variant === "default") { e.currentTarget.style.backgroundColor = "#ddd"; e.currentTarget.style.color = "#1a1a1a"; } }}
    >
      {children}
    </button>
  );
}

function StatusBadge({ status, onChange }: { status: ProtoStatus; onChange: (s: ProtoStatus) => void }) {
  const cycle = (): ProtoStatus => {
    if (status === "planned") return "in_progress";
    if (status === "in_progress") return "completed";
    return "planned";
  };
  const next = cycle();

  return (
    <button
      onClick={() => onChange(next)}
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-bold tracking-wider transition-colors ${
        status === "completed"
          ? "bg-[#1a1a1a] text-[#ddd] border-2 border-[#1a1a1a]"
          : status === "in_progress"
          ? "bg-[#555] text-[#ddd] border-2 border-[#555]"
          : "bg-[#e8e8e0] text-[#777] border-2 border-[#999] hover:border-[#1a1a1a]"
      }`}
      style={{
        fontFamily: "'VT323', 'Courier New', monospace",
        backgroundImage: status === "in_progress" ? STATUS_PATTERNS.in_progress : undefined,
      }}
      title={`Click to mark as ${STATUS_LABELS[next]}`}
    >
      {status === "completed" ? "✓ " : status === "in_progress" ? "→ " : "○ "}
      {STATUS_LABELS[status]}
    </button>
  );
}

/* ────────────────────────────────────────────
   Main Component
   ──────────────────────────────────────────── */

export function RetroPrototypes() {
  const [prototypes, setPrototypes] = useState<Prototype[]>(() => {
    try {
      const saved = localStorage.getItem("prototypes");
      if (saved) return JSON.parse(saved);
    } catch { /* ignore */ }
    return [];
  });

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(defaultForm);

  const saveData = useCallback((data: Prototype[]) => {
    localStorage.setItem("prototypes", JSON.stringify(data));
  }, []);

  const resetForm = () => {
    setForm(defaultForm);
    setIsAdding(false);
    setEditingId(null);
  };

  const openEdit = (p: Prototype) => {
    setForm({ title: p.title, content: p.content, time: p.time, notes: p.notes });
    setEditingId(p.id);
    setIsAdding(true);
  };

  const handleSave = () => {
    if (!form.title.trim()) return;

    if (editingId) {
      setPrototypes((prev) => {
        const next = prev.map((p) =>
          p.id === editingId ? { ...p, ...form } : p
        );
        saveData(next);
        return next;
      });
    } else {
      const entry: Prototype = {
        id: `proto-${Date.now()}`,
        ...form,
        status: "planned" as ProtoStatus,
        createdAt: new Date().toISOString().split("T")[0],
      };
      setPrototypes((prev) => {
        const next = [entry, ...prev];
        saveData(next);
        return next;
      });
    }
    resetForm();
  };

  const handleDelete = (id: string) => {
    setPrototypes((prev) => {
      const next = prev.filter((p) => p.id !== id);
      saveData(next);
      return next;
    });
  };

  const handleStatus = (id: string, status: ProtoStatus) => {
    setPrototypes((prev) => {
      const next = prev.map((p) => (p.id === id ? { ...p, status } : p));
      saveData(next);
      return next;
    });
  };

  // Sort: in_progress first, then planned, then completed
  const sorted = [...prototypes].sort((a, b) => {
    const order: Record<ProtoStatus, number> = { in_progress: 0, planned: 1, completed: 2 };
    return order[a.status] - order[b.status];
  });

  return (
    <RetroLayout title="Prototypes" backHref="/" scrollable>
      <div style={{ fontFamily: "'VT323', 'Courier New', monospace" }}>
        {/* ── Header ── */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 border-2 border-[#1a1a1a] bg-[#e0e0d8]">
            <IconFlask size={22} className="text-[#8f9e7a]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-[0.06em] text-[#1a1a1a]">原型测试</h1>
            <p className="text-sm text-[#777] tracking-wider">Prototypes</p>
          </div>
        </div>

        {/* ── Design Tip ── */}
        <Card className="mb-6">
          <p className="text-xs text-[#777] mb-1">[ 设计提示 ]</p>
          <p className="text-[#333] italic text-sm leading-relaxed">
            &ldquo;原型测试不是一次性的验证，而是一种低成本的探索方式。用小实验去触碰你的人生可能性，观察、学习、迭代。&rdquo;
          </p>
        </Card>

        {/* ── Add Button ── */}
        {!isAdding && (
          <Btn onClick={() => { resetForm(); setIsAdding(true); }} className="w-full mb-6 flex items-center justify-center gap-2">
            <IconPlus size={18} />
            添加原型测试
          </Btn>
        )}

        {/* ── Add / Edit Form ── */}
        <AnimatePresence>
          {isAdding && (
            <motion.div
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-6"
            >
              <Card>
                <h3 className="text-lg font-bold text-[#1a1a1a] mb-4 tracking-wider">
                  [ {editingId ? "编辑原型" : "新增原型"} ]
                </h3>

                {/* Title */}
                <label className="block text-xs text-[#777] mb-1.5 tracking-wider">原型标题 *</label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="例如：尝试一周自由职业作息"
                />

                {/* Content */}
                <div className="mt-4">
                  <label className="block text-xs text-[#777] mb-1.5 tracking-wider">测试内容</label>
                  <Textarea
                    value={form.content}
                    onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))}
                    placeholder="具体要测试什么？怎么做？需要什么准备？"
                    rows={3}
                  />
                </div>

                {/* Time */}
                <div className="mt-4">
                  <label className="block text-xs text-[#777] mb-1.5 tracking-wider">测试时间</label>
                  <Input
                    value={form.time}
                    onChange={(e) => setForm((prev) => ({ ...prev, time: e.target.value }))}
                    placeholder="例如：2026年5月10日 - 5月16日"
                  />
                </div>

                {/* Notes */}
                <div className="mt-4 mb-5">
                  <label className="block text-xs text-[#777] mb-1.5 tracking-wider">备注</label>
                  <Textarea
                    value={form.notes}
                    onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                    placeholder="其他想法或提醒..."
                    rows={2}
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Btn variant="ghost" onClick={resetForm} className="flex-1">取消</Btn>
                  <Btn onClick={handleSave} disabled={!form.title.trim()} className="flex-1">
                    {editingId ? "更新" : "保存"}
                  </Btn>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Prototypes List ── */}
        <div className="space-y-3">
          {sorted.length === 0 && !isAdding ? (
            <div className="text-center py-12">
              <IconFlask size={48} className="mx-auto text-[#ccc] mb-3" />
              <p className="text-[#999] tracking-wider">还没有原型测试计划</p>
              <p className="text-xs text-[#bbb] mt-1">用小实验探索你的人生可能性</p>
            </div>
          ) : (
            sorted.map((p) => (
              <Card key={p.id}>
                {/* Top row: title + status + actions */}
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1 min-w-0">
                    <h3
                      className={`font-bold tracking-wider truncate ${
                        p.status === "completed" ? "text-[#999] line-through" : "text-[#1a1a1a]"
                      }`}
                    >
                      {p.title}
                    </h3>
                    {p.time && (
                      <p className="text-xs text-[#999] flex items-center gap-1 mt-0.5">
                        <IconCalendar size={12} />
                        {p.time}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <StatusBadge
                      status={p.status}
                      onChange={(s) => handleStatus(p.id, s)}
                    />
                    <Btn small variant="ghost" onClick={() => openEdit(p)}>编辑</Btn>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="p-1 hover:bg-[#ddd] transition-colors"
                      title="删除"
                    >
                      <IconTrash size={16} className="text-[#777]" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                {p.content && (
                  <p className={`text-sm mb-2 ${p.status === "completed" ? "text-[#bbb]" : "text-[#555]"}`}>
                    {p.content}
                  </p>
                )}

                {/* Notes */}
                {p.notes && (
                  <p className="text-xs text-[#999] italic border-t-2 border-[#ddd] pt-2 mt-1">
                    {p.notes}
                  </p>
                )}
              </Card>
            ))
          )}
        </div>
      </div>
    </RetroLayout>
  );
}
