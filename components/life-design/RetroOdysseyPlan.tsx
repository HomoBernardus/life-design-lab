"use client";

import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { RetroLayout } from "./RetroLayout";
import { CanvasComponent } from "./CanvasComponent";
import {
  IconMap,
  IconCompass,
  IconHeart,
  IconZap,
  IconTarget,
  IconChevronRight,
  IconMail,
  IconBookOpen,
  IconCrown,
  IconLock,
  IconSparkles,
  IconBack,
} from "./RetroIcons";

/* ────────────────────────────────────────────
   Types
   ──────────────────────────────────────────── */

type PlanType = "A" | "B" | "C";
type ViewMode = "five-year" | "ten-year";

interface TextBox {
  id: string;
  x: number;
  y: number;
  text: string;
  column: number;
  color?: string;
  fontSize?: number;
}

interface PlanQuestions {
  resources: string;
  excitement: string;
  prototype: string;
}

interface PlanData {
  title: string;
  canvasData: string;
  textBoxes: TextBox[];
  scores: { resources: number; likability: number; confidence: number; coherence: number };
  letter: string;
  questions?: PlanQuestions;
}

interface OdysseyData {
  A: PlanData;
  B: PlanData;
  C: PlanData;
  tenYearPlan: PlanType | null;
}

const defaultPlanData: PlanData = {
  title: "我的人生计划",
  canvasData: "",
  textBoxes: [],
  scores: { resources: 50, likability: 50, confidence: 50, coherence: 50 },
  letter: "",
};

const planLabels: Record<PlanType, { name: string; subtitle: string }> = {
  A: { name: "Plan A", subtitle: "当前路径" },
  B: { name: "Plan B", subtitle: "备选方案" },
  C: { name: "Plan C", subtitle: "不计成本的狂想" },
};

const scoreDefinitions = {
  resources: { label: "资源", icon: IconCompass, desc: "你是否拥有实现这个计划所需的时间、金钱、技能和人脉？" },
  likability: { label: "喜爱度", icon: IconHeart, desc: "这个计划让你感到多么兴奋？你有多想要这样的生活？" },
  confidence: { label: "自信度", icon: IconZap, desc: "你对实现这个计划有多大的信心？你相信自己能做到吗？" },
  coherence: { label: "知行合一", icon: IconTarget, desc: "这个计划与你的人生观、工作观是否一致？" },
};

/* ────────────────────────────────────────────
   Retro UI Primitives (inline to avoid extra files)
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
  value, onChange, placeholder, className = "", maxLength,
}: {
  value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string; className?: string; maxLength?: number;
}) {
  return (
    <input
      type="text" value={value} onChange={onChange} placeholder={placeholder} maxLength={maxLength}
      className={`w-full px-3 py-2 border-2 border-[#1a1a1a] bg-white text-[#1a1a1a] placeholder-[#999] outline-none focus:ring-2 focus:ring-[#555] ${className}`}
      style={{ fontFamily: "'VT323', 'Courier New', monospace", boxShadow: "inset 1px 1px 0 #ccc, inset -1px -1px 0 #fff" }}
    />
  );
}

function Textarea({
  value, onChange, placeholder, className = "",
}: {
  value: string; onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string; className?: string;
}) {
  return (
    <textarea
      value={value} onChange={onChange} placeholder={placeholder}
      className={`w-full px-3 py-2 border-2 border-[#1a1a1a] bg-white text-[#1a1a1a] placeholder-[#999] outline-none focus:ring-2 focus:ring-[#555] resize-none ${className}`}
      style={{ fontFamily: "'VT323', 'Courier New', monospace", boxShadow: "inset 1px 1px 0 #ccc, inset -1px -1px 0 #fff" }}
    />
  );
}

function Btn({
  children, onClick, disabled, className = "", variant = "default",
}: {
  children: React.ReactNode; onClick?: () => void; disabled?: boolean;
  className?: string; variant?: "default" | "ghost";
}) {
  return (
    <button
      onClick={onClick} disabled={disabled}
      className={`relative px-4 py-2 text-sm font-bold tracking-[0.08em] border-2 border-[#1a1a1a] transition-all duration-100 active:translate-x-[2px] active:translate-y-[2px] disabled:opacity-40 disabled:cursor-not-allowed disabled:active:translate-x-0 disabled:active:translate-y-0 ${
        variant === "ghost" ? "bg-transparent text-[#555] hover:bg-[#ddd]" : "bg-[#ddd] text-[#1a1a1a]"
      } ${className}`}
      style={{
        fontFamily: "'VT323', 'Courier New', monospace",
        boxShadow: variant === "ghost" ? "none" : "3px 3px 0 rgba(0,0,0,0.3)",
      }}
      onMouseEnter={(e) => { if (disabled) return; if (variant !== "ghost") { e.currentTarget.style.backgroundColor = "#1a1a1a"; e.currentTarget.style.color = "#ddd"; } }}
      onMouseLeave={(e) => { if (disabled) return; if (variant !== "ghost") { e.currentTarget.style.backgroundColor = "#ddd"; e.currentTarget.style.color = "#1a1a1a"; } }}
    >
      {children}
    </button>
  );
}

function Tabs({ options, active, onChange }: { options: { key: string; label: string; extra?: string }[]; active: string; onChange: (key: string) => void }) {
  return (
    <div className="inline-flex border-2 border-[#1a1a1a] bg-[#ddd]">
      {options.map((opt, i) => (
        <button
          key={opt.key}
          onClick={() => onChange(opt.key)}
          suppressHydrationWarning
          className={`px-4 py-1.5 text-sm font-bold tracking-[0.06em] transition-colors ${
            i > 0 ? "border-l-2 border-[#1a1a1a]" : ""
          } ${
            active === opt.key
              ? "bg-[#1a1a1a] text-[#ddd]"
              : "bg-[#ddd] text-[#1a1a1a] hover:bg-[#ccc]"
          }`}
          style={{ fontFamily: "'VT323', 'Courier New', monospace" }}
        >
          {opt.label}
          {opt.extra && <span className="ml-1 opacity-60 hidden sm:inline">{opt.extra}</span>}
        </button>
      ))}
    </div>
  );
}

/* ────────────────────────────────────────────
   Main Component
   ──────────────────────────────────────────── */

export function RetroOdysseyPlan() {
  const [activePlan, setActivePlan] = useState<PlanType>("A");
  const [viewMode, setViewMode] = useState<ViewMode>("five-year");
  const [showLetter, setShowLetter] = useState(false);
  const [letterSent, setLetterSent] = useState(false);

  const [odysseyData, setOdysseyData] = useState<OdysseyData>(() => {
    try {
      const saved = localStorage.getItem("odysseyData");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (!("tenYearPlan" in parsed)) parsed.tenYearPlan = null;
        (["A", "B", "C"] as PlanType[]).forEach((plan) => {
          if (parsed[plan]) {
            if (typeof parsed[plan].canvasData === "object") parsed[plan].canvasData = "";
            if (!Array.isArray(parsed[plan].textBoxes)) parsed[plan].textBoxes = [];
            parsed[plan].textBoxes = parsed[plan].textBoxes.map((tb: any) => ({ ...tb, fontSize: tb.fontSize ?? 18 }));
          }
        });
        if (parsed.tenYearPlan?.textBoxes) {
          parsed.tenYearPlan.textBoxes = parsed.tenYearPlan.textBoxes.map((tb: any) => ({ ...tb, fontSize: tb.fontSize ?? 18 }));
        }
        return parsed;
      }
    } catch { /* ignore */ }
    return { A: { ...defaultPlanData }, B: { ...defaultPlanData }, C: { ...defaultPlanData }, tenYearPlan: null };
  });

  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    try { localStorage.setItem("odysseyData", JSON.stringify(odysseyData)); } catch { /* ignore */ }
  }, [odysseyData]);

  const updatePlanData = (plan: PlanType, field: keyof PlanData, value: PlanData[keyof PlanData]) => {
    setOdysseyData((prev) => ({ ...prev, [plan]: { ...prev[plan], [field]: value } }));
  };

  const updateScore = (plan: PlanType, scoreKey: keyof PlanData["scores"], value: number) => {
    setOdysseyData((prev) => ({
      ...prev, [plan]: { ...prev[plan], scores: { ...prev[plan].scores, [scoreKey]: value } },
    }));
  };

  const updateQuestions = (plan: PlanType, key: keyof PlanQuestions, value: string) => {
    setOdysseyData((prev) => ({
      ...prev, [plan]: { ...prev[plan], questions: { ...prev[plan].questions, [key]: value } },
    }));
  };

  const setTenYearPlan = (plan: PlanType) => {
    setOdysseyData((prev) => ({ ...prev, tenYearPlan: plan }));
    setViewMode("ten-year");
  };

  const clearTenYearPlan = () => {
    setOdysseyData((prev) => ({ ...prev, tenYearPlan: null }));
    setViewMode("five-year");
  };

  const sendLetter = () => { setLetterSent(true); setTimeout(() => { setShowLetter(false); setLetterSent(false); }, 2500); };

  const currentPlan = odysseyData[activePlan];
  const tenYearPlan = odysseyData.tenYearPlan;
  const tenYearPlanData = tenYearPlan ? odysseyData[tenYearPlan] : null;

  return (
    <RetroLayout title="Odyssey Plan" backHref="/" scrollable>
      <div style={{ fontFamily: "'VT323', 'Courier New', monospace" }}>
        {/* ── Header ── */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 border-2 border-[#1a1a1a] bg-[#e0e0d8]">
            <IconMap className="text-[#95a9bb]" size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-[0.06em] text-[#1a1a1a]">奥德赛计划</h1>
            <p className="text-sm text-[#777] tracking-wider">Odyssey Plan</p>
          </div>
        </div>

        {/* ── Design Tip ── */}
        <Card className="mb-6">
          <p className="text-xs text-[#777] mb-1">[ 设计提示 ]</p>
          <p className="text-[#333] italic text-sm leading-relaxed">
            &ldquo;不要在尝试之前就扼杀你的创意。三个计划都是平行宇宙中的你，每一个都值得被认真对待。&rdquo;
          </p>
        </Card>

        {/* ── View Mode Tabs ── */}
        <div className="mb-6">
          <Tabs
            options={[
              { key: "five-year", label: "五年蓝图" },
              { key: "ten-year", label: tenYearPlan ? "十年蓝图" : "🔒 十年蓝图", extra: tenYearPlan ? `Plan ${tenYearPlan}` : undefined },
            ]}
            active={viewMode}
            onChange={(key) => {
              if (key === "ten-year" && !tenYearPlan) return;
              setViewMode(key as ViewMode);
            }}
          />
        </div>

        <AnimatePresence mode="wait">
          {/* ═══════ FIVE YEAR VIEW ═══════ */}
          {viewMode === "five-year" ? (
            <motion.div key="five-year" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
              {/* Plan Tabs */}
              <div className="mb-6">
                <Tabs
                  options={(["A", "B", "C"] as PlanType[]).map((p) => ({
                    key: p,
                    label: `${planLabels[p].name}`,
                    extra: planLabels[p].subtitle,
                  }))}
                  active={activePlan}
                  onChange={(key) => setActivePlan(key as PlanType)}
                />
                {tenYearPlan && (
                  <span className="inline-flex items-center gap-1 ml-3 text-xs text-[#777]">
                    <IconCrown size={14} /> Plan {tenYearPlan} 已扩展为十年蓝图
                  </span>
                )}
              </div>

              <AnimatePresence mode="wait">
                <motion.div key={activePlan} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.15 }}>
                  {/* Plan Title */}
                  <div className="mb-6">
                    <label className="block text-xs text-[#777] mb-1.5 tracking-wider">计划标题（6字以内）</label>
                    <Input
                      value={currentPlan.title}
                      onChange={(e) => updatePlanData(activePlan, "title", e.target.value.slice(0, 6))}
                      placeholder="我的计划"
                      maxLength={6}
                      className="max-w-xs"
                    />
                  </div>

                  {/* Five Year Canvas */}
                  <div className="mb-6">
                    <h2 className="text-lg font-bold text-[#1a1a1a] mb-3 tracking-wider">[ 五年蓝图 ]</h2>
                    <Card>
                      <CanvasComponent
                        planId={activePlan}
                        canvasData={currentPlan.canvasData}
                        textBoxes={currentPlan.textBoxes}
                        onCanvasChange={(data) => updatePlanData(activePlan, "canvasData", data)}
                        onTextBoxesChange={(textBoxes) => updatePlanData(activePlan, "textBoxes", textBoxes)}
                      />
                    </Card>
                  </div>

                  {/* Expand to 10-year */}
                  <div className="mb-8">
                    {tenYearPlan === activePlan ? (
                      <Card>
                        <div className="flex items-center gap-3">
                          <IconCrown size={24} className="text-[#1a1a1a]" />
                          <div className="flex-1">
                            <h3 className="font-bold text-[#1a1a1a] tracking-wider">已选为十年蓝图</h3>
                            <p className="text-xs text-[#777]">这个计划已被扩展为十年蓝图，点击上方标签页查看</p>
                          </div>
                          <Btn variant="ghost" onClick={clearTenYearPlan}>取消选择</Btn>
                        </div>
                      </Card>
                    ) : tenYearPlan ? (
                      <Card className="opacity-60">
                        <div className="flex items-center gap-3">
                          <IconLock size={24} className="text-[#777]" />
                          <div>
                            <h3 className="font-bold text-[#777] tracking-wider">无法扩展</h3>
                            <p className="text-xs text-[#999]">Plan {tenYearPlan} 已被选为十年蓝图，每次只能选择一个计划进行深化设计</p>
                          </div>
                        </div>
                      </Card>
                    ) : (
                      <button
                        onClick={() => setTenYearPlan(activePlan)}
                        className="flex items-center gap-3 w-full text-left border-2 border-[#1a1a1a] bg-[#f0f0e8] p-4 hover:bg-[#ddd] transition-colors"
                        style={{ boxShadow: "3px 3px 0 rgba(0,0,0,0.25)" }}
                      >
                        <div className="p-2 border-2 border-[#1a1a1a] bg-[#e0e0d8]">
                          <IconSparkles size={22} className="text-[#1a1a1a]" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-[#1a1a1a] tracking-wider">深化设计 → 十年蓝图</h3>
                          <p className="text-xs text-[#777]">选择这个计划进行更长远的规划，探索第6-10年的人生设计</p>
                        </div>
                        <IconChevronRight size={20} className="text-[#777]" />
                      </button>
                    )}
                  </div>

                  {/* Three Questions */}
                  <div className="mb-8">
                    <div className="flex items-center gap-2 mb-4">
                      <IconBookOpen size={20} className="text-[#1a1a1a]" />
                      <h2 className="text-lg font-bold text-[#1a1a1a] tracking-wider">[ 问自己的三个问题 ]</h2>
                    </div>

                    <div className="space-y-4">
                      {[
                        { key: "resources" as const, num: 1, title: "这个计划需要哪些资源？", desc: "时间、金钱、技能、人脉...你目前拥有多少？还需要获取什么？" },
                        { key: "excitement" as const, num: 2, title: "这个计划让你多么兴奋？", desc: "当你想象自己活在这个版本的人生中，你的内心感受如何？" },
                        { key: "prototype" as const, num: 3, title: "如何进行原型测试？", desc: "你可以做什么小实验来验证这个计划？可以找谁聊聊？" },
                      ].map((q) => (
                        <Card key={q.key}>
                          <div className="flex items-start gap-3 mb-3">
                            <span className="w-7 h-7 border-2 border-[#1a1a1a] bg-[#1a1a1a] text-[#ddd] flex items-center justify-center text-sm font-bold shrink-0">
                              {q.num}
                            </span>
                            <div>
                              <h3 className="font-bold text-[#1a1a1a] tracking-wider">{q.title}</h3>
                              <p className="text-xs text-[#777] mt-0.5">{q.desc}</p>
                            </div>
                          </div>
                          <Textarea
                            value={currentPlan.questions?.[q.key] || ""}
                            onChange={(e) => updateQuestions(activePlan, q.key, e.target.value)}
                            placeholder="写下你的思考..."
                            className="h-24"
                          />
                        </Card>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          ) : (
            /* ═══════ TEN YEAR VIEW ═══════ */
            <motion.div key="ten-year" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.2 }}>
              {/* Ten Year Header */}
              <div className="flex items-center gap-4 mb-6">
                <Btn variant="ghost" onClick={() => setViewMode("five-year")}>
                  <IconBack size={18} />
                </Btn>
                <div className="flex items-center gap-3">
                  <div className="p-2 border-2 border-[#1a1a1a] bg-[#1a1a1a]">
                    <IconCrown size={20} className="text-[#ddd]" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-[#1a1a1a] tracking-wider">十年蓝图 - Plan {tenYearPlan}</h2>
                    <p className="text-sm text-[#777]">{tenYearPlanData?.title}</p>
                  </div>
                </div>
              </div>

              {/* Ten Year Canvas */}
              <div className="mb-8">
                <h2 className="text-lg font-bold text-[#1a1a1a] mb-3 tracking-wider">[ 十年蓝图 ]</h2>
                <Card>
                  <CanvasComponent
                    planId={tenYearPlan!}
                    canvasData={tenYearPlanData?.canvasData || ""}
                    textBoxes={tenYearPlanData?.textBoxes || []}
                    onCanvasChange={(data) => updatePlanData(tenYearPlan!, "canvasData", data)}
                    onTextBoxesChange={(textBoxes) => updatePlanData(tenYearPlan!, "textBoxes", textBoxes)}
                    isTenYear
                  />
                </Card>
              </div>

              {/* Ten Year Scores */}
              <div className="mb-8">
                <h2 className="text-lg font-bold text-[#1a1a1a] mb-4 tracking-wider">[ 十年计划评分 ]</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(Object.entries(scoreDefinitions) as [keyof typeof scoreDefinitions, (typeof scoreDefinitions)[keyof typeof scoreDefinitions]][]).map(([key, def]) => (
                    <Card key={key}>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 border-2 border-[#1a1a1a] bg-[#e0e0d8]">
                          <def.icon size={18} className="text-[#1a1a1a]" />
                        </div>
                        <div>
                          <h3 className="font-bold text-[#1a1a1a] tracking-wider">{def.label}</h3>
                          <p className="text-xs text-[#777]">{def.desc}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <input
                          type="range" min="0" max="100"
                          value={tenYearPlanData?.scores[key] || 50}
                          onChange={(e) => updateScore(tenYearPlan!, key, parseInt(e.target.value))}
                          className="flex-1 h-2 appearance-none cursor-pointer"
                          style={{
                            background: `linear-gradient(to right, #1a1a1a 0%, #1a1a1a ${tenYearPlanData?.scores[key] || 50}%, #ddd ${tenYearPlanData?.scores[key] || 50}%, #ddd 100%)`,
                            accentColor: "#1a1a1a",
                          }}
                        />
                        <span className="w-12 text-right text-sm font-bold text-[#1a1a1a] tabular-nums">
                          {tenYearPlanData?.scores[key] || 50}%
                        </span>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Time Letter */}
              <div className="mb-8">
                <button
                  onClick={() => setShowLetter(true)}
                  className="flex items-center gap-3 w-full text-left border-2 border-[#1a1a1a] bg-[#f0f0e8] p-4 hover:bg-[#ddd] transition-colors"
                  style={{ boxShadow: "3px 3px 0 rgba(0,0,0,0.25)" }}
                >
                  <div className="p-2 border-2 border-[#1a1a1a] bg-[#e0e0d8]">
                    <IconMail size={22} className="text-[#1a1a1a]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-[#1a1a1a] tracking-wider">十年时光信件</h3>
                    <p className="text-xs text-[#777]">以十年后的自己的口吻，给现在的自己写一封感谢信</p>
                  </div>
                  <IconChevronRight size={20} className="text-[#777]" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ═══════ LETTER MODAL ═══════ */}
        <AnimatePresence>
          {showLetter && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => !letterSent && setShowLetter(false)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-lg border-2 border-[#111] bg-[#e0e0e0]"
                style={{ boxShadow: "inset 2px 2px 0 #fff, inset -2px -2px 0 #888, 8px 8px 0 rgba(0,0,0,0.4)" }}
              >
                {/* Modal Title Bar */}
                <div className="bg-[#2a2a2a] text-[#ccc] px-3 py-1.5 flex items-center justify-between border-b-2 border-[#111]">
                  <div className="flex items-center gap-2">
                    <IconBookOpen size={16} />
                    <span className="text-sm tracking-[0.12em]">时光信件</span>
                  </div>
                  <div className="flex gap-1.5">
                    <span className="block w-3.5 h-3.5 bg-[#555] border border-[#3a3a3a]" />
                    <span className="block w-3.5 h-3.5 bg-[#555] border border-[#3a3a3a]" />
                    <span className="block w-3.5 h-3.5 bg-[#555] border border-[#3a3a3a]" />
                  </div>
                </div>

                {letterSent ? (
                  <div className="p-10 text-center bg-[#f5f5f0]">
                    <motion.div initial={{ y: 0 }} animate={{ y: -200, opacity: 0 }} transition={{ duration: 1.5, delay: 0.3 }}>
                      <IconMail size={64} className="mx-auto text-[#1a1a1a] mb-4" />
                    </motion.div>
                    <h3 className="text-xl font-bold text-[#1a1a1a] tracking-wider mb-2">信件已封口寄出</h3>
                    <p className="text-[#777] text-sm">你的未来正在路上...</p>
                  </div>
                ) : (
                  <div className="bg-[#f5f5f0]">
                    <div className="p-6 border-b-2 border-[#ccc]">
                      <p className="text-sm text-[#777] italic">
                        &ldquo;亲爱的自己，{viewMode === "ten-year" ? "十" : "五"}年过去了，我想感谢你当初的勇气...&rdquo;
                      </p>
                    </div>
                    <div className="p-6">
                      <Textarea
                        value={viewMode === "ten-year" ? tenYearPlanData?.letter || "" : currentPlan.letter}
                        onChange={(e) => updatePlanData(viewMode === "ten-year" ? tenYearPlan! : activePlan, "letter", e.target.value)}
                        placeholder="开始写下你的感谢信..."
                        className="h-64"
                      />
                    </div>
                    <div className="p-6 pt-0 flex gap-3">
                      <Btn variant="ghost" onClick={() => setShowLetter(false)} className="flex-1">稍后再写</Btn>
                      <Btn
                        onClick={sendLetter}
                        disabled={!(viewMode === "ten-year" ? tenYearPlanData?.letter?.trim() : currentPlan.letter.trim())}
                        className="flex-1 flex items-center justify-center gap-2"
                      >
                        <IconMail size={16} /> 封口寄出
                      </Btn>
                    </div>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </RetroLayout>
  );
}
