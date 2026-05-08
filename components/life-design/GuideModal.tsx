"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  IconQuestion,
  IconHealth,
  IconCompass,
  IconFlame,
  IconFlask,
} from "./RetroIcons";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

interface GuideModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TOOLS = [
  {
    label: "人生仪表盘",
    icon: IconHealth,
    color: "#95a9bb",
    desc: "评估你的生活在健康、工作、娱乐和爱四个维度的平衡状态。通过仪表盘评分，直观地看到哪里需要调整。",
  },
  {
    label: "奥德赛计划",
    icon: IconCompass,
    color: "#a9a0b9",
    desc: "设计三个平行人生计划：Plan A（你正在走的路）、Plan B（如果Plan A突然消失的备选）、Plan C（不受金钱和现实约束的狂想）。每个计划需要回答三个关键问题——需要哪些资源、让你多么兴奋、如何原型测试，然后从资源、喜爱度、自信度、知行合一四个维度打分。可以从中选择一个深化为十年蓝图，并以未来自己的口吻写一封'时光信件'。",
  },
  {
    label: "美好时光日志",
    icon: IconFlame,
    color: "#8f9e7a",
    desc: "记录日常活动，标注哪些让你充满能量、感到投入。通过反思发现你的'美好时光模式'，找到真正让你充实的事情。",
  },
  {
    label: "原型设计",
    icon: IconFlask,
    color: "#c9ab8f",
    desc: "为你的想法设计低成本的原型实验。在投入之前先测试和迭代，用小步验证的方式探索可能性。",
  },
];

const QA = [
  {
    q: "什么是人生设计？",
    a: "人生设计源自斯坦福大学 d.school 的设计思维方法论 (Designing Your Life)，由 Bill Burnett 和 Dave Evans 提出。它将设计师的思维方式 —— 好奇心、实验、重构问题、原型测试 —— 应用到人生规划中，帮助你'设计'而非'计划'你的人生。",
  },
  {
    q: "这和传统目标设定有什么不同？",
    a: "传统目标设定强调找到'唯一正确答案'并坚持执行。人生设计认为：你的人生不止一种正确的活法。我们通过探索多个可能性、原型测试来选择最适合当前阶段的路径，而不是过早锁定单一方向。",
  },
  {
    q: "我需要一次性填写所有内容吗？",
    a: "完全不需要！人生设计是一个迭代的过程。你可以先从人生仪表盘开始，了解当前状态，然后逐步探索奥德赛计划和美好时光日志。每次花 15-30 分钟即可，不需要一口气完成。",
  },
  {
    q: "我的数据会被保存吗？",
    a: "数据保存在你的浏览器本地存储 (localStorage) 中。这意味着不同浏览器、不同设备之间的数据不会同步。建议定期回顾记录。",
  },
  {
    q: "我应该多久更新一次计划？",
    a: "建议每季度回顾一次人生仪表盘，每半年或一年重新审视奥德赛计划。美好时光日志可以每周记录几次。原型设计则随时根据灵感进行。",
  },
  {
    q: "什么是'美好时光日志'的理念？",
    a: "通过记录日常活动并标注'投入度'和'能量感'，你可以发现什么样的活动让你进入心流状态。这些模式会揭示你真正热爱和擅长的事情，为你的人生选择提供关键线索。",
  },
];

export function GuideModal({ open, onOpenChange }: GuideModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => onOpenChange(false)}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg border-2 border-[#111] bg-[#e0e0e0]"
            style={{
              boxShadow:
                "inset 2px 2px 0 #fff, inset -2px -2px 0 #888, 8px 8px 0 rgba(0,0,0,0.4)",
            }}
          >
            {/* ── Title Bar ── */}
            <div className="bg-[#2a2a2a] text-[#ccc] px-3 py-1.5 flex items-center justify-between border-b-2 border-[#111]">
              <div className="flex items-center gap-2">
                <IconQuestion size={16} />
                <span className="text-sm tracking-[0.12em]">使用指南 & Q&A</span>
              </div>
              <div className="flex gap-1.5">
                <span className="block w-3.5 h-3.5 bg-[#555] border border-[#3a3a3a]" />
                <span className="block w-3.5 h-3.5 bg-[#555] border border-[#3a3a3a]" />
                <span className="block w-3.5 h-3.5 bg-[#555] border border-[#3a3a3a]" />
              </div>
            </div>

            {/* ── Body ── */}
            <div
              className="bg-[#f5f5f0] max-h-[75vh] overflow-y-auto"
              style={{
                fontFamily: "'VT323', 'Courier New', monospace",
                backgroundImage:
                  "linear-gradient(#e8e8e0 1px, transparent 1px), linear-gradient(90deg, #e8e8e0 1px, transparent 1px)",
                backgroundSize: "16px 16px",
                backgroundPosition: "center center",
              }}
            >
              {/* ═══════ Usage Guide ═══════ */}
              <div className="px-6 pt-5 pb-2">
                <h2 className="text-lg font-bold text-[#1a1a1a] tracking-wider mb-4">
                  [ 使用指南 ]
                </h2>
                <div className="space-y-3">
                  {TOOLS.map((tool) => (
                    <div
                      key={tool.label}
                      className="border-2 border-[#1a1a1a] bg-[#f0f0e8] p-3"
                      style={{ boxShadow: "2px 2px 0 rgba(0,0,0,0.2)" }}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <span style={{ color: tool.color }}>
                          <tool.icon size={18} />
                        </span>
                        <h3 className="font-bold text-[#1a1a1a] text-base tracking-wider">
                          {tool.label}
                        </h3>
                      </div>
                      <p className="text-sm text-[#555] leading-relaxed">
                        {tool.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* ═══════ Q&A ═══════ */}
              <div className="px-6 pt-2 pb-6">
                <h2 className="text-lg font-bold text-[#1a1a1a] tracking-wider mb-4">
                  [ 常见问题 ]
                </h2>
                <Accordion type="single" collapsible className="border-2 border-[#1a1a1a] bg-[#f0f0e8]">
                  {QA.map((item, i) => (
                    <AccordionItem
                      key={i}
                      value={`q-${i}`}
                      className="border-b border-[#1a1a1a]/30 last:border-b-0"
                    >
                      <AccordionTrigger
                        className="px-4 py-3 text-[#1a1a1a] font-bold tracking-wider text-sm hover:no-underline hover:bg-[#e8e8d8] [&[data-state=open]>svg]:rotate-180"
                        style={{ fontFamily: "'VT323', 'Courier New', monospace" }}
                      >
                        {item.q}
                      </AccordionTrigger>
                      <AccordionContent className="px-4 text-[#555] text-sm leading-relaxed">
                        <div style={{ fontFamily: "'VT323', 'Courier New', monospace" }}>
                          {item.a}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
