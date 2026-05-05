"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Map,
  Compass,
  Heart,
  Zap,
  Target,
  ChevronRight,
  Mail,
  Sparkles,
  BookOpen,
  ArrowLeft,
  Crown,
  Lock,
  HelpCircle,
} from "lucide-react";
import { CanvasComponent } from "./CanvasComponent";

type PlanType = "A" | "B" | "C";
type ViewMode = "five-year" | "ten-year";

interface TextBox {
  id: string;
  x: number;
  y: number;
  text: string;
  column: number; // 1-5 for five-year, 1-10 for ten-year
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
  scores: {
    resources: number;
    likability: number;
    confidence: number;
    coherence: number;
  };
  letter: string;
  questions?: PlanQuestions;
}

interface OdysseyData {
  A: PlanData;
  B: PlanData;
  C: PlanData;
  tenYearPlan: PlanType | null; // Only one plan can be expanded to 10-year
}

const defaultPlanData: PlanData = {
  title: "我的人生计划",
  canvasData: "",
  textBoxes: [],
  scores: {
    resources: 50,
    likability: 50,
    confidence: 50,
    coherence: 50,
  },
  letter: "",
};

const planLabels = {
  A: { name: "Plan A", subtitle: "当前路径", color: "bg-primary" },
  B: { name: "Plan B", subtitle: "备选方案", color: "bg-secondary" },
  C: { name: "Plan C", subtitle: "不计成本的狂想", color: "bg-chart-3" },
};

const scoreDefinitions = {
  resources: {
    label: "资源",
    icon: Compass,
    description: "你是否拥有实现这个计划所需的时间、金钱、技能和人脉？",
  },
  likability: {
    label: "喜爱度",
    icon: Heart,
    description: "这个计划让你感到多么兴奋？你有多想要这样的生活？",
  },
  confidence: {
    label: "自信度",
    icon: Zap,
    description: "你对实现这个计划有多大的信心？你相信自己能做到吗？",
  },
  coherence: {
    label: "知行合一",
    icon: Target,
    description: "这个计划与你的人生观、工作观是否一致？",
  },
};

export function OdysseyModule() {
  const [activePlan, setActivePlan] = useState<PlanType>("A");
  const [viewMode, setViewMode] = useState<ViewMode>("five-year");
  const [showLetter, setShowLetter] = useState(false);
  const [letterSent, setLetterSent] = useState(false);
  // Load initial data from localStorage (lazy initializer — runs once, no race)
  const [odysseyData, setOdysseyData] = useState<OdysseyData>(() => {
    try {
      const saved = localStorage.getItem("odysseyData");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (!("tenYearPlan" in parsed)) {
          parsed.tenYearPlan = null;
        }
        (["A", "B", "C"] as PlanType[]).forEach((plan) => {
          if (parsed[plan]) {
            if (typeof parsed[plan].canvasData === "object") {
              parsed[plan].canvasData = "";
            }
            if (!Array.isArray(parsed[plan].textBoxes)) {
              parsed[plan].textBoxes = [];
            }
          }
        });
        return parsed;
      }
    } catch {
      console.error("Failed to parse odyssey data");
    }
    return {
      A: { ...defaultPlanData },
      B: { ...defaultPlanData },
      C: { ...defaultPlanData },
      tenYearPlan: null,
    };
  });

  // Save to localStorage whenever odysseyData changes
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    try {
      localStorage.setItem("odysseyData", JSON.stringify(odysseyData));
    } catch (e) {
      console.error("Failed to save odyssey data:", e);
    }
  }, [odysseyData]);

  const updatePlanData = (
    plan: PlanType,
    field: keyof PlanData,
    value: PlanData[keyof PlanData]
  ) => {
    setOdysseyData((prev) => ({
      ...prev,
      [plan]: {
        ...prev[plan],
        [field]: value,
      },
    }));
  };

  const updateScore = (
    plan: PlanType,
    scoreKey: keyof PlanData["scores"],
    value: number
  ) => {
    setOdysseyData((prev) => ({
      ...prev,
      [plan]: {
        ...prev[plan],
        scores: {
          ...prev[plan].scores,
          [scoreKey]: value,
        },
      },
    }));
  };

  const updateCanvasData = (plan: PlanType, data: string) => {
    setOdysseyData((prev) => ({
      ...prev,
      [plan]: {
        ...prev[plan],
        canvasData: data,
      },
    }));
  };

  const updateTextBoxes = (plan: PlanType, textBoxes: TextBox[]) => {
    updatePlanData(plan, "textBoxes", textBoxes);
  };

  const updateQuestions = (
    plan: PlanType,
    questionKey: keyof PlanQuestions,
    value: string
  ) => {
    setOdysseyData((prev) => ({
      ...prev,
      [plan]: {
        ...prev[plan],
        questions: {
          ...prev[plan].questions,
          [questionKey]: value,
        },
      },
    }));
  };

  const setTenYearPlan = (plan: PlanType) => {
    setOdysseyData((prev) => ({
      ...prev,
      tenYearPlan: plan,
    }));
    setViewMode("ten-year");
  };

  const clearTenYearPlan = () => {
    setOdysseyData((prev) => ({
      ...prev,
      tenYearPlan: null,
    }));
    setViewMode("five-year");
  };

  const sendLetter = () => {
    setLetterSent(true);
    setTimeout(() => {
      setShowLetter(false);
      setLetterSent(false);
    }, 2500);
  };

  const currentPlan = odysseyData[activePlan];
  const tenYearPlan = odysseyData.tenYearPlan;
  const tenYearPlanData = tenYearPlan ? odysseyData[tenYearPlan] : null;

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-4"
        >
          <div className="p-2 rounded-xl bg-primary/10">
            <Map className="text-primary" size={24} />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-semibold text-foreground font-[family-name:var(--font-display)]">
              奥德赛计划
            </h1>
            <p className="text-muted-foreground">Odyssey Plan</p>
          </div>
        </motion.div>

        {/* Design Tip */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card border border-border rounded-2xl p-5 shadow-sm mb-6"
        >
          <p className="text-sm text-muted-foreground mb-1">设计提示</p>
          <p className="text-foreground italic">
            &quot;不要在尝试之前就扼杀你的创意。三个计划都是平行宇宙中的你，每一个都值得被认真对待。&quot;
          </p>
        </motion.div>

        {/* View Mode Tabs */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center gap-1 bg-muted p-1 rounded-xl">
            <button
              onClick={() => setViewMode("five-year")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === "five-year"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              五年蓝图
            </button>
            <button
              onClick={() => tenYearPlan && setViewMode("ten-year")}
              disabled={!tenYearPlan}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                viewMode === "ten-year"
                  ? "bg-card text-foreground shadow-sm"
                  : tenYearPlan
                  ? "text-muted-foreground hover:text-foreground"
                  : "text-muted-foreground/50 cursor-not-allowed"
              }`}
            >
              {!tenYearPlan && <Lock size={14} />}
              十年蓝图
              {tenYearPlan && (
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                  Plan {tenYearPlan}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {viewMode === "five-year" ? (
          <motion.div
            key="five-year"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {/* Plan Tabs */}
            <div className="flex items-center gap-2 bg-muted p-1 rounded-2xl w-fit mb-6">
              {(["A", "B", "C"] as PlanType[]).map((plan) => (
                <motion.button
                  key={plan}
                  onClick={() => setActivePlan(plan)}
                  className={`relative px-6 py-3 rounded-xl text-sm font-medium transition-colors ${
                    activePlan === plan
                      ? "text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  whileTap={{ scale: 0.98 }}
                >
                  {activePlan === plan && (
                    <motion.div
                      layoutId="activePlanBg"
                      className={`absolute inset-0 ${planLabels[plan].color} rounded-xl`}
                      initial={false}
                      transition={{ type: "spring", stiffness: 500, damping: 35 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    {tenYearPlan === plan && (
                      <Crown size={14} className="text-amber-300" />
                    )}
                    {planLabels[plan].name}
                    <span className="hidden sm:inline opacity-70">
                      {planLabels[plan].subtitle}
                    </span>
                  </span>
                </motion.button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activePlan}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
              >
                {/* Plan Title */}
                <div className="mb-6">
                  <label className="block text-sm text-muted-foreground mb-2">
                    计划标题（6字以内）
                  </label>
                  <input
                    type="text"
                    value={currentPlan.title}
                    onChange={(e) =>
                      updatePlanData(activePlan, "title", e.target.value.slice(0, 6))
                    }
                    className="px-4 py-3 text-xl font-medium bg-card border border-border rounded-xl w-full max-w-xs focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="我的计划"
                  />
                </div>

                {/* Five Year Unified Canvas */}
                <div className="mb-6">
                  <h2 className="text-lg font-medium text-foreground mb-4">
                    五年蓝图
                  </h2>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-card border border-border rounded-2xl p-5 shadow-sm"
                  >
                    <CanvasComponent
                      planId={activePlan}
                      canvasData={currentPlan.canvasData}
                      textBoxes={currentPlan.textBoxes}
                      onCanvasChange={(data) =>
                        updateCanvasData(activePlan, data)
                      }
                      onTextBoxesChange={(textBoxes) =>
                        updateTextBoxes(activePlan, textBoxes)
                      }
                    />
                  </motion.div>
                </div>

                {/* Expand to Ten Year - Only show if this plan is not already the ten year plan */}
                <div className="mb-10">
                  {tenYearPlan === activePlan ? (
                    <div className="flex items-center gap-3 px-6 py-4 bg-primary/5 border border-primary/20 rounded-2xl">
                      <Crown size={24} className="text-primary" />
                      <div className="flex-1">
                        <h3 className="font-medium text-foreground">
                          已选为十年蓝图
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          这个计划已被扩展为十年蓝图，点击上方标签页查看
                        </p>
                      </div>
                      <button
                        onClick={clearTenYearPlan}
                        className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground border border-border rounded-xl hover:bg-muted transition-colors"
                      >
                        取消选择
                      </button>
                    </div>
                  ) : tenYearPlan ? (
                    <div className="flex items-center gap-3 px-6 py-4 bg-muted/50 border border-border rounded-2xl">
                      <Lock size={24} className="text-muted-foreground" />
                      <div className="flex-1">
                        <h3 className="font-medium text-muted-foreground">
                          无法扩展
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Plan {tenYearPlan} 已被选为十年蓝图，每次只能选择一个计划进行深化设计
                        </p>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setTenYearPlan(activePlan)}
                      className="flex items-center gap-3 px-6 py-4 bg-card border border-border rounded-2xl hover:bg-muted transition-colors w-full text-left group"
                    >
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <Sparkles size={24} className="text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-foreground">
                          深化设计 → 十年蓝图
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          选择这个计划进行更长远的规划，探索第6-10年的人生设计
                        </p>
                      </div>
                      <ChevronRight className="text-muted-foreground group-hover:text-foreground transition-colors" />
                    </button>
                  )}
                </div>

                {/* Three Questions */}
                <div className="mb-10">
                  <div className="flex items-center gap-2 mb-6">
                    <BookOpen size={20} className="text-primary" />
                    <h2 className="text-lg font-medium text-foreground">
                      问自己的三个问题
                    </h2>
                  </div>

                  <div className="space-y-6">
                    {/* Question 1 */}
                    <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
                      <div className="flex items-start gap-4 mb-4">
                        <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold shrink-0">
                          1
                        </span>
                        <div>
                          <h3 className="font-medium text-foreground mb-1">
                            这个计划需要哪些资源？
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            时间、金钱、技能、人脉...你目前拥有多少？还需要获取什么？
                          </p>
                        </div>
                      </div>
                      <textarea
                        value={currentPlan.questions?.resources || ""}
                        onChange={(e) =>
                          updateQuestions(activePlan, "resources", e.target.value)
                        }
                        placeholder="写下你的思考..."
                        className="w-full h-24 p-4 bg-muted/50 border border-border rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground text-sm"
                      />
                    </div>

                    {/* Question 2 */}
                    <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
                      <div className="flex items-start gap-4 mb-4">
                        <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold shrink-0">
                          2
                        </span>
                        <div>
                          <h3 className="font-medium text-foreground mb-1">
                            这个计划让你多么兴奋？
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            当你想象自己活在这个版本的人生中，你的内心感受如何？
                          </p>
                        </div>
                      </div>
                      <textarea
                        value={currentPlan.questions?.excitement || ""}
                        onChange={(e) =>
                          updateQuestions(activePlan, "excitement", e.target.value)
                        }
                        placeholder="写下你的思考..."
                        className="w-full h-24 p-4 bg-muted/50 border border-border rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground text-sm"
                      />
                    </div>

                    {/* Question 3 */}
                    <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
                      <div className="flex items-start gap-4 mb-4">
                        <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold shrink-0">
                          3
                        </span>
                        <div>
                          <h3 className="font-medium text-foreground mb-1">
                            如何进行原型测试？
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            你可以做什么小实验来验证这个计划？可以找谁聊聊？
                          </p>
                        </div>
                      </div>
                      <textarea
                        value={currentPlan.questions?.prototype || ""}
                        onChange={(e) =>
                          updateQuestions(activePlan, "prototype", e.target.value)
                        }
                        placeholder="写下你的思考..."
                        className="w-full h-24 p-4 bg-muted/50 border border-border rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground text-sm"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            key="ten-year"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
            {/* Ten Year View Header */}
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={() => setViewMode("five-year")}
                className="p-2 rounded-xl border border-border hover:bg-muted transition-colors"
              >
                <ArrowLeft size={20} className="text-foreground" />
              </button>
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl ${
                    planLabels[tenYearPlan!].color
                  } flex items-center justify-center`}
                >
                  <Crown size={20} className="text-primary-foreground" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-foreground">
                    十年蓝图 - Plan {tenYearPlan}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {tenYearPlanData?.title}
                  </p>
                </div>
              </div>
            </div>

            {/* Ten Year Unified Canvas */}
            <div className="mb-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card border border-border rounded-2xl p-5 shadow-sm"
              >
                <CanvasComponent
                  planId={tenYearPlan!}
                  canvasData={tenYearPlanData?.canvasData || ""}
                  textBoxes={tenYearPlanData?.textBoxes || []}
                  onCanvasChange={(data) =>
                    updateCanvasData(tenYearPlan!, data)
                  }
                  onTextBoxesChange={(textBoxes) =>
                    updateTextBoxes(tenYearPlan!, textBoxes)
                  }
                  isTenYear
                />
              </motion.div>
            </div>

            {/* Ten Year Scores */}
            <div className="mb-10">
              <div className="flex items-center gap-2 mb-6">
                <Target size={20} className="text-primary" />
                <h2 className="text-lg font-medium text-foreground">
                  十年计划评分
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(
                  Object.entries(scoreDefinitions) as [
                    keyof typeof scoreDefinitions,
                    (typeof scoreDefinitions)[keyof typeof scoreDefinitions]
                  ][]
                ).map(([key, def]) => (
                  <div
                    key={key}
                    className="bg-card border border-border rounded-2xl p-5 shadow-sm"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <def.icon size={20} className="text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground">
                          {def.label}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {def.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={tenYearPlanData?.scores[key] || 50}
                        onChange={(e) =>
                          updateScore(tenYearPlan!, key, parseInt(e.target.value))
                        }
                        className="flex-1 h-2 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
                      />
                      <span className="w-12 text-right text-sm font-medium text-foreground">
                        {tenYearPlanData?.scores[key] || 50}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Time Letter for Ten Year */}
            <div className="mb-10">
              <button
                onClick={() => setShowLetter(true)}
                className="flex items-center gap-3 px-6 py-4 bg-card border border-border rounded-2xl hover:bg-muted transition-colors w-full text-left"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Mail size={24} className="text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-foreground">十年时光信件</h3>
                  <p className="text-sm text-muted-foreground">
                    以十年后的自己的口吻，给现在的自己写一封感谢信
                  </p>
                </div>
                <ChevronRight className="text-muted-foreground" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Letter Modal */}
      <AnimatePresence>
        {showLetter && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/30 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => !letterSent && setShowLetter(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
            >
              {letterSent ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-10 text-center"
                >
                  <motion.div
                    initial={{ y: 0 }}
                    animate={{ y: -200, opacity: 0 }}
                    transition={{ duration: 1.5, delay: 0.3 }}
                  >
                    <Mail size={64} className="mx-auto text-primary mb-4" />
                  </motion.div>
                  <h3 className="text-xl font-medium text-foreground mb-2">
                    信件已封口寄出
                  </h3>
                  <p className="text-muted-foreground">你的未来正在路上...</p>
                </motion.div>
              ) : (
                <>
                  <div className="p-6 border-b border-border">
                    <div className="flex items-center gap-3">
                      <BookOpen size={24} className="text-primary" />
                      <div>
                        <h3 className="font-semibold text-foreground">
                          来自{viewMode === "ten-year" ? "十" : "五"}年后的信
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Plan {viewMode === "ten-year" ? tenYearPlan : activePlan} -{" "}
                          {viewMode === "ten-year"
                            ? tenYearPlanData?.title
                            : currentPlan.title}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <p className="text-sm text-muted-foreground mb-3 italic">
                      &quot;亲爱的自己，{viewMode === "ten-year" ? "十" : "五"}
                      年过去了，我想感谢你当初的勇气...&quot;
                    </p>
                    <textarea
                      value={
                        viewMode === "ten-year"
                          ? tenYearPlanData?.letter || ""
                          : currentPlan.letter
                      }
                      onChange={(e) =>
                        updatePlanData(
                          viewMode === "ten-year" ? tenYearPlan! : activePlan,
                          "letter",
                          e.target.value
                        )
                      }
                      placeholder="开始写下你的感谢信..."
                      className="w-full h-64 p-4 bg-muted/50 border border-border rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                    />
                  </div>

                  <div className="p-6 pt-0 flex gap-3">
                    <button
                      onClick={() => setShowLetter(false)}
                      className="flex-1 px-4 py-3 border border-border rounded-xl text-muted-foreground hover:bg-muted transition-colors"
                    >
                      稍后再写
                    </button>
                    <button
                      onClick={sendLetter}
                      disabled={
                        !(viewMode === "ten-year"
                          ? tenYearPlanData?.letter?.trim()
                          : currentPlan.letter.trim())
                      }
                      className="flex-1 px-4 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <Mail size={18} />
                      封口寄出
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
