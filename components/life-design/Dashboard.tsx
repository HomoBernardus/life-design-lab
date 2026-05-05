"use client";

import { motion } from "framer-motion";
import {
  Sparkles,
  Target,
  Calendar,
  Heart,
  Lightbulb,
  ArrowRight,
  TrendingUp,
  PenLine,
  Compass,
} from "lucide-react";
import { useState, useEffect } from "react";

const designTips = [
  "接受你现在所处的位置，并从那里开始前进。",
  "你可以同时拥有多种人生方案——这是一种富足心态。",
  "好奇心是人生设计的引擎，让它带领你前进。",
  "重构问题，才能找到真正的解决方案。",
];

const recentActivities = [
  { action: "更新了 Plan A 的五年蓝图", time: "2 小时前", icon: Target },
  { action: "添加了美好时光日志条目", time: "昨天", icon: Heart },
  { action: "完成了四维评分更新", time: "3 天前", icon: TrendingUp },
];

export function Dashboard() {
  const [tipIndex, setTipIndex] = useState(0);
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    setTipIndex(Math.floor(Math.random() * designTips.length));
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("早上好");
    else if (hour < 18) setGreeting("下午好");
    else setGreeting("晚上好");
  }, []);

  return (
    <div className="p-6 lg:p-10 max-w-6xl mx-auto">
      {/* ===== Hero Header ===== */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground">
            Life Design Lab
          </p>
          <p className="text-xs text-muted-foreground">
            {new Date().toLocaleDateString("zh-CN", {
              year: "numeric",
              month: "long",
              day: "numeric",
              weekday: "long",
            })}
          </p>
        </div>
        <h1 className="text-4xl lg:text-5xl font-semibold text-foreground font-[family-name:var(--font-display)] leading-tight">
          {greeting}
          <span className="text-muted-foreground font-normal">，欢迎回来</span>
        </h1>
        <p className="text-muted-foreground mt-2 text-base">
          你的人生设计之旅，从这里继续
        </p>
      </motion.div>

      {/* ===== Design Tip Banner ===== */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative mb-10 bg-card rounded-xl p-5 flex items-start gap-4"
      >
        <div className="p-2.5 rounded-lg bg-primary/10 shrink-0">
          <Lightbulb className="text-primary" size={18} />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-1">
            今日设计思维
          </p>
          <p className="text-foreground/80 text-sm leading-relaxed font-[family-name:var(--font-display)]">
            &ldquo;{designTips[tipIndex]}&rdquo;
          </p>
        </div>
      </motion.div>

      {/* ===== Stats Grid ===== */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="mb-10"
      >
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
            总览
          </h2>
          <span className="h-px flex-1 bg-border/50" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { title: "奥德赛计划", value: "3", subtitle: "个平行人生", icon: Compass, color: "text-primary", bg: "bg-primary/10" },
            { title: "美好时光", value: "12", subtitle: "条能量记录", icon: Heart, color: "text-accent", bg: "bg-accent/10" },
            { title: "设计迭代", value: "5", subtitle: "次原型测试", icon: PenLine, color: "text-chart-4", bg: "bg-chart-4/10" },
            { title: "洞察发现", value: "8", subtitle: "个关键发现", icon: Sparkles, color: "text-primary", bg: "bg-primary/10" },
          ].map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.05 }}
              className="bg-card rounded-xl p-5 flex flex-col gap-3 group cursor-pointer"
            >
              <div className={`w-9 h-9 rounded-lg ${card.bg} ${card.color} flex items-center justify-center`}>
                <card.icon size={18} />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground font-[family-name:var(--font-display)] leading-none mb-1">
                  {card.value}
                </p>
                <p className="text-sm font-medium text-foreground">{card.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{card.subtitle}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ===== Two Columns: Actions + Activity ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-10">
        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-3"
        >
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
              快速开始
            </h2>
            <span className="h-px flex-1 bg-border/50" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-card rounded-xl p-5 group cursor-pointer">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Compass className="text-primary" size={20} />
                </div>
                <ArrowRight className="text-primary opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all mt-1" size={18} />
              </div>
              <h3 className="text-sm font-semibold text-foreground mb-1">奥德赛计划</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                设计三个平行的人生版本，探索未来的不同可能性
              </p>
            </div>

            <div className="bg-card rounded-xl p-5 group cursor-pointer">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 rounded-lg bg-accent/10">
                  <Heart className="text-accent" size={20} />
                </div>
                <ArrowRight className="text-accent opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all mt-1" size={18} />
              </div>
              <h3 className="text-sm font-semibold text-foreground mb-1">美好时光日志</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                追踪能量与投入度，发现让你进入心流的事
              </p>
            </div>

            <div className="bg-card rounded-xl p-5 group cursor-pointer sm:col-span-2">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 rounded-lg bg-chart-4/10">
                  <Target className="text-chart-4" size={20} />
                </div>
                <ArrowRight className="text-chart-4 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all mt-1" size={18} />
              </div>
              <h3 className="text-sm font-semibold text-foreground mb-1">四维评分</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                从工作、健康、爱与娱乐四个维度评估你当前的人生平衡状态
              </p>
            </div>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="lg:col-span-2"
        >
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
              最近活动
            </h2>
            <span className="h-px flex-1 bg-border/50" />
          </div>
          <div className="bg-card rounded-xl overflow-hidden">
            {recentActivities.map((activity, index) => (
              <div
                key={index}
                className="flex items-center gap-3 px-4 py-3 border-b border-border/50 last:border-b-0"
              >
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <activity.icon size={15} className="text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground truncate">{activity.action}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Calendar size={10} />
                    {activity.time}
                  </p>
                </div>
              </div>
            ))}
            <div className="px-4 py-2.5 text-center">
              <button className="text-xs text-primary hover:text-primary/80 transition-colors font-medium">
                查看全部活动 →
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ===== Quote Footer ===== */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.45 }}
        className="text-center py-6"
      >
        <p className="text-xs text-muted-foreground/70 font-[family-name:var(--font-display)]">
          &ldquo;设计你的人生，而不是被人生设计。&rdquo;
        </p>
      </motion.div>
    </div>
  );
}
