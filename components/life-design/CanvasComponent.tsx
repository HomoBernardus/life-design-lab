"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pencil, Type, Eraser, Maximize, Minimize, Undo } from "lucide-react";
import { IconTrash } from "./RetroIcons";

type Tool = "pen" | "eraser" | "text" | "move";

const COLOR_PALETTE = [
  "#11142e", // dark ink
  "#fd005c", // red
  "#518cc7", // blue
  "#8f9e7a", // matcha green
  "#c9a0a0", // sakura pink
  "#d4c99a", // chamomile yellow
  "#95a9bb", // sky blue
  "#a9a0b9", // lavender
  "#c9ab8f", // peach
  "#e06b6b", // coral
  "#5a8a6a", // forest green
  "#555555", // gray
];


interface TextBox {
  id: string;
  x: number;
  y: number;
  text: string;
  column: number;
  color: string;
  fontSize: number;
}

interface UnifiedCanvasProps {
  planId: string;
  canvasData: string;
  textBoxes: TextBox[];
  onCanvasChange: (data: string) => void;
  onTextBoxesChange: (textBoxes: TextBox[]) => void;
  isTenYear?: boolean;
}

const CANVAS_WIDTH = 1200;
const FIVE_YEAR_HEIGHT = 500;
const TEN_YEAR_HEIGHT = 1000;

export function UnifiedCanvas({
  planId,
  canvasData,
  textBoxes,
  onCanvasChange,
  onTextBoxesChange,
  isTenYear = false,
}: UnifiedCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [localTextBoxes, setLocalTextBoxes] = useState<TextBox[]>(textBoxes);
  const textBoxesRef = useRef<TextBox[]>(textBoxes);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState<string>(COLOR_PALETTE[0]);
  const colorRef = useRef<string>(COLOR_PALETTE[0]);
  const [tool, setTool] = useState<Tool>("pen");
  const toolRef = useRef<Tool>("pen");
  const [brushSize, setBrushSize] = useState(3);
  const brushSizeRef = useRef(3);
  const [fontSize, setFontSize] = useState(18);
  const fontSizeRef = useRef(18);
  const [history, setHistory] = useState<string[]>([]);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [editingTextValue, setEditingTextValue] = useState<string>("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [fullscreenSize, setFullscreenSize] = useState<{ w: number; h: number } | null>(null);

  // 拖动相关状态
  const [draggingTextId, setDraggingTextId] = useState<string | null>(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });

  // Keep refs in sync
  // ESC to exit fullscreen
  useEffect(() => {
    if (!isFullscreen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsFullscreen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isFullscreen]);

  useEffect(() => {
    textBoxesRef.current = localTextBoxes;
  }, [localTextBoxes]);
  
  useEffect(() => {
    toolRef.current = tool;
  }, [tool]);
  
  useEffect(() => {
    colorRef.current = color;
  }, [color]);

  useEffect(() => {
    brushSizeRef.current = brushSize;
  }, [brushSize]);

  useEffect(() => {
    fontSizeRef.current = fontSize;
  }, [fontSize]);

  // Sync props → local
  useEffect(() => {
    if (JSON.stringify(textBoxes) !== JSON.stringify(localTextBoxes)) {
      setLocalTextBoxes(textBoxes);
      textBoxesRef.current = textBoxes;
    }
  }, [textBoxes]);

  const CANVAS_HEIGHT = isTenYear ? TEN_YEAR_HEIGHT : FIVE_YEAR_HEIGHT;
  const COLUMN_WIDTH = CANVAS_WIDTH / 5;

  // Compute optimal fullscreen canvas size (proportional scale, no stretch)
  useEffect(() => {
    if (!isFullscreen) { setFullscreenSize(null); return; }
    const compute = () => {
      const aspect = CANVAS_WIDTH / CANVAS_HEIGHT;
      const w = window.innerWidth - 32;
      const h = w / aspect;
      setFullscreenSize({ w: Math.floor(w), h: Math.floor(h) });
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, [isFullscreen, CANVAS_HEIGHT]);

  const drawGridLines = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      const halfHeight = CANVAS_HEIGHT / 2;

      ctx.strokeStyle = "#c8c8d4";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([]);

      for (let i = 1; i < 5; i++) {
        const x = i * COLUMN_WIDTH;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, CANVAS_HEIGHT);
        ctx.stroke();
      }

      if (isTenYear) {
        ctx.strokeStyle = "#6e6e88";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, halfHeight);
        ctx.lineTo(CANVAS_WIDTH, halfHeight);
        ctx.stroke();
      }

      ctx.strokeStyle = "#a0a0b8";
      ctx.lineWidth = 0.5;
      ctx.setLineDash([4, 8]);
      for (let i = 1; i < 4; i++) {
        const y = (CANVAS_HEIGHT / 4) * i;
        if (isTenYear && Math.abs(y - halfHeight) < 2) continue;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(CANVAS_WIDTH, y);
        ctx.stroke();
      }
      ctx.setLineDash([]);
    },
    [isTenYear, CANVAS_HEIGHT, COLUMN_WIDTH]
  );

  // Load canvas data
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGridLines(ctx);

    if (canvasData) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        drawGridLines(ctx);
      };
      img.src = canvasData;
    }
  }, [canvasData, planId, isTenYear, drawGridLines]);

  const saveToHistory = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setHistory((prev) => [...prev.slice(-9), canvas.toDataURL()]);
  }, []);

  const getCoordinates = useCallback((
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ("touches" in e) {
      const touch = e.touches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }, []);

  const getColumnFromCoords = useCallback((x: number, y: number): number => {
    const col = Math.min(Math.floor(x / COLUMN_WIDTH) + 1, 5);
    if (isTenYear && y > CANVAS_HEIGHT / 2) {
      return col + 5;
    }
    return col;
  }, [isTenYear, CANVAS_HEIGHT, COLUMN_WIDTH]);

  // 添加文字（双击时调用）
  const addTextBox = useCallback((x: number, y: number) => {
    const column = getColumnFromCoords(x, y);
    const newTextBox: TextBox = {
      id: `text-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
      x,
      y,
      text: "",
      column,
      color: colorRef.current,
      fontSize: fontSizeRef.current,
    };
    
    const updated = [...textBoxesRef.current, newTextBox];
    setLocalTextBoxes(updated);
    textBoxesRef.current = updated;
    onTextBoxesChange(updated);
    
    // 延迟设置编辑状态，确保 DOM 已渲染
    setTimeout(() => {
      setEditingTextId(newTextBox.id);
      setEditingTextValue("");
    }, 50);
    
    return newTextBox.id;
  }, [getColumnFromCoords, onTextBoxesChange]);

  // 更新文字位置（拖动时调用）
  const updateTextBoxPosition = useCallback((id: string, x: number, y: number) => {
    const updated = localTextBoxes.map((t) => 
      t.id === id ? { ...t, x, y, column: getColumnFromCoords(x, y) } : t
    );
    setLocalTextBoxes(updated);
    onTextBoxesChange(updated);
    textBoxesRef.current = updated;
  }, [localTextBoxes, onTextBoxesChange, getColumnFromCoords]);

  const startDrawing = useCallback((
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const { x, y } = getCoordinates(e);
    const currentTool = toolRef.current;

    // 文字工具在双击时处理，单击不做任何事
    if (currentTool === "text") {
      return;
    }

    // 处理绘图工具
    saveToHistory();
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(x, y);

    if (currentTool === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineWidth = brushSizeRef.current * 6;
    } else if (currentTool === "pen") {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = colorRef.current;
      ctx.lineWidth = brushSizeRef.current;
    }
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, [getCoordinates, saveToHistory]);

  const draw = useCallback((
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (!isDrawing || (toolRef.current !== "pen" && toolRef.current !== "eraser")) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;
    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  }, [isDrawing, getCoordinates]);

  const stopDrawing = useCallback(() => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.globalCompositeOperation = "source-over";
    drawGridLines(ctx);
    onCanvasChange(canvas.toDataURL());
  }, [isDrawing, drawGridLines, onCanvasChange, saveToHistory]);

  // 双击添加文字
  const handleDoubleClick = useCallback((
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (toolRef.current !== "text") return;
    const { x, y } = getCoordinates(e);
    addTextBox(x, y);
  }, [getCoordinates, addTextBox]);

  // 开始拖动文本框
  const startDragText = useCallback((e: React.MouseEvent | React.TouchEvent, id: string) => {
    e.stopPropagation();
    const textBox = localTextBoxes.find(t => t.id === id);
    if (!textBox) return;
    
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const canvasX = (clientX - rect.left) * scaleX;
    const canvasY = (clientY - rect.top) * scaleY;
    
    dragOffsetRef.current = {
      x: canvasX - textBox.x,
      y: canvasY - textBox.y
    };
    
    setDraggingTextId(id);
  }, [localTextBoxes]);

  // 拖动移动
  const onDragMove = useCallback((
    e: React.MouseEvent | React.TouchEvent
  ) => {
    if (!draggingTextId) return;
    
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    let newX = (clientX - rect.left) * scaleX - dragOffsetRef.current.x;
    let newY = (clientY - rect.top) * scaleY - dragOffsetRef.current.y;
    
    // 边界限制
    newX = Math.max(10, Math.min(CANVAS_WIDTH - 10, newX));
    newY = Math.max(10, Math.min(CANVAS_HEIGHT - 20, newY));
    
    updateTextBoxPosition(draggingTextId, newX, newY);
  }, [draggingTextId, updateTextBoxPosition, CANVAS_WIDTH, CANVAS_HEIGHT]);

  // 结束拖动
  const endDragText = useCallback(() => {
    setDraggingTextId(null);
  }, []);

  // 全局鼠标/触摸事件监听（用于拖动）
  useEffect(() => {
    if (!draggingTextId) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      
      let newX = (e.clientX - rect.left) * scaleX - dragOffsetRef.current.x;
      let newY = (e.clientY - rect.top) * scaleY - dragOffsetRef.current.y;
      
      newX = Math.max(10, Math.min(CANVAS_WIDTH - 10, newX));
      newY = Math.max(10, Math.min(CANVAS_HEIGHT - 20, newY));
      
      updateTextBoxPosition(draggingTextId, newX, newY);
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      if (!e.touches[0]) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      
      let newX = (e.touches[0].clientX - rect.left) * scaleX - dragOffsetRef.current.x;
      let newY = (e.touches[0].clientY - rect.top) * scaleY - dragOffsetRef.current.y;
      
      newX = Math.max(10, Math.min(CANVAS_WIDTH - 10, newX));
      newY = Math.max(10, Math.min(CANVAS_HEIGHT - 20, newY));
      
      updateTextBoxPosition(draggingTextId, newX, newY);
      e.preventDefault();
    };
    
    const handleMouseUp = () => endDragText();
    const handleTouchEnd = () => endDragText();
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [draggingTextId, updateTextBoxPosition, CANVAS_WIDTH, CANVAS_HEIGHT, endDragText]);

  const undo = useCallback(() => {
    if (history.length === 0) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;

    const lastState = history[history.length - 1];
    setHistory((prev) => prev.slice(0, -1));

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      drawGridLines(ctx);
      onCanvasChange(canvas.toDataURL());
    };
    img.src = lastState;
  }, [history, drawGridLines, onCanvasChange]);

  const clearCanvas = useCallback(() => {
    saveToHistory();
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGridLines(ctx);
    onCanvasChange("");
    onTextBoxesChange([]);
    setLocalTextBoxes([]);
    setEditingTextId(null);
    setEditingTextValue("");
    textBoxesRef.current = [];
  }, [saveToHistory, drawGridLines, onCanvasChange, onTextBoxesChange]);

  // 保存文字内容（确认编辑）
  const saveTextBoxContent = useCallback((id: string) => {
    const textBox = localTextBoxes.find(t => t.id === id);
    if (!textBox) return;
    
    if (!editingTextValue.trim()) {
      // 如果内容为空，删除文本框
      const updated = localTextBoxes.filter((t) => t.id !== id);
      setLocalTextBoxes(updated);
      onTextBoxesChange(updated);
      textBoxesRef.current = updated;
    } else {
      // 保存内容
      const updated = localTextBoxes.map((t) => 
        t.id === id ? { ...t, text: editingTextValue } : t
      );
      setLocalTextBoxes(updated);
      onTextBoxesChange(updated);
      textBoxesRef.current = updated;
    }
    setEditingTextId(null);
    setEditingTextValue("");
  }, [localTextBoxes, editingTextValue, onTextBoxesChange]);

  // 清空文字内容但保持编辑状态
  const clearTextContent = useCallback(() => {
    setEditingTextValue("");
    // 同时更新本地状态中的文字为空，但不关闭编辑状态
    if (editingTextId) {
      const updated = localTextBoxes.map((t) => 
        t.id === editingTextId ? { ...t, text: "" } : t
      );
      setLocalTextBoxes(updated);
      textBoxesRef.current = updated;
      // 注意：不调用 onTextBoxesChange 立即同步，等保存时才同步
    }
  }, [editingTextId, localTextBoxes]);

  // 删除整个文本框
  const deleteTextBox = useCallback((id: string) => {
    const updated = localTextBoxes.filter((t) => t.id !== id);
    setLocalTextBoxes(updated);
    onTextBoxesChange(updated);
    textBoxesRef.current = updated;
    if (editingTextId === id) {
      setEditingTextId(null);
      setEditingTextValue("");
    }
    if (draggingTextId === id) {
      setDraggingTextId(null);
    }
  }, [localTextBoxes, onTextBoxesChange, editingTextId, draggingTextId]);

  // 开始编辑文字
  const startEditing = useCallback((id: string, currentText: string) => {
    setEditingTextId(id);
    setEditingTextValue(currentText);
  }, []);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const [wrapperHeight, setWrapperHeight] = useState(0);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el || isFullscreen) return;
    const ro = new ResizeObserver(([entry]) => {
      setWrapperHeight(entry.contentRect.height);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [isFullscreen]);

  const canvasScale = isFullscreen && fullscreenSize
    ? fullscreenSize.h / CANVAS_HEIGHT
    : wrapperHeight > 0 ? wrapperHeight / CANVAS_HEIGHT : (isTenYear ? 600 : 300) / CANVAS_HEIGHT;

  return (
    <div className={isFullscreen ? "fixed inset-0 z-40 bg-[#f5f5f0] overflow-auto p-4" : "relative"}>
      {/* Fullscreen close bar */}
      {isFullscreen && (
        <div className="flex items-center justify-between mb-3 pb-2 border-b-2 border-[#1a1a1a]" style={{ fontFamily: "'VT323', 'Courier New', monospace" }}>
          <span className="text-xl font-bold tracking-wider text-[#1a1a1a]">画布全屏</span>
          <button
            onClick={() => setIsFullscreen(false)}
            className="px-4 py-1.5 border-2 border-[#1a1a1a] bg-[#ddd] text-[#1a1a1a] font-bold hover:bg-[#1a1a1a] hover:text-[#ddd] transition-colors"
            style={{ fontFamily: "'VT323', 'Courier New', monospace" }}
          >
            [ ESC 退出全屏 ]
          </button>
        </div>
      )}

      {/* Toolbar */}
      <div className="space-y-2 mb-3">
        {/* Row 1: tool buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Drawing tools */}
          <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
            <button
              onClick={() => setTool("pen")}
              className={`p-1.5 rounded-md transition-colors ${
                tool === "pen" ? "bg-card shadow-sm" : "hover:bg-card/50"
              }`}
              title="画笔"
            >
              <Pencil size={16} />
            </button>
            <button
              onClick={() => setTool("eraser")}
              className={`p-1.5 rounded-md transition-colors ${
                tool === "eraser" ? "bg-card shadow-sm" : "hover:bg-card/50"
              }`}
              title="橡皮擦"
            >
              <Eraser size={16} />
            </button>
            <button
              onClick={() => setTool("text")}
              className={`p-1.5 rounded-md transition-colors ${
                tool === "text" ? "bg-card shadow-sm" : "hover:bg-card/50"
              }`}
              title="添加文字（双击画布）"
            >
              <Type size={16} />
            </button>
          </div>

          <div className="flex-1" />

          <button
            onClick={undo}
            disabled={history.length === 0}
            className="w-8 h-8 border-2 border-[#1a1a1a] bg-[#ddd] flex items-center justify-center hover:bg-[#2a2a2a] hover:text-[#ddd] disabled:opacity-30 disabled:hover:bg-[#ddd] disabled:hover:text-inherit transition-colors"
            title="撤销"
            style={{ boxShadow: "inset 1px 1px 0 #fff, inset -1px -1px 0 #888" }}
          >
            <Undo size={16} />
          </button>
          <button
            onClick={() => setShowClearConfirm(true)}
            className="w-8 h-8 border-2 border-[#1a1a1a] bg-[#ddd] flex items-center justify-center hover:bg-[#2a2a2a] hover:text-[#ddd] transition-colors"
            title="清除全部"
            style={{ boxShadow: "inset 1px 1px 0 #fff, inset -1px -1px 0 #888" }}
          >
            <IconTrash size={16} />
          </button>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="w-8 h-8 border-2 border-[#1a1a1a] bg-[#ddd] flex items-center justify-center hover:bg-[#2a2a2a] hover:text-[#ddd] transition-colors"
            title={isFullscreen ? "退出全屏" : "全屏放大"}
            style={{ boxShadow: "inset 1px 1px 0 #fff, inset -1px -1px 0 #888" }}
          >
            {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
          </button>
        </div>

        {/* Row 2: size slider + color palette */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Brush size slider */}
          {(tool === "pen" || tool === "eraser") && (
            <div className="flex items-center gap-2 bg-muted rounded-lg px-2 py-1">
              <span className="text-xs text-muted-foreground whitespace-nowrap" style={{ fontFamily: "'VT323', 'Courier New', monospace" }}>
                画笔大小
              </span>
              <input
                type="range"
                min={1}
                max={12}
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                className="w-20 h-4 accent-foreground cursor-pointer"
              />
              <span className="text-xs text-muted-foreground w-8 text-right" style={{ fontFamily: "'VT323', 'Courier New', monospace" }}>
                {brushSize}
              </span>
            </div>
          )}

          {/* Text size slider */}
          {tool === "text" && (
            <div className="flex items-center gap-2 bg-muted rounded-lg px-2 py-1">
              <span className="text-xs text-muted-foreground whitespace-nowrap" style={{ fontFamily: "'VT323', 'Courier New', monospace" }}>
                文字大小
              </span>
              <input
                type="range"
                min={10}
                max={48}
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-20 h-4 accent-foreground cursor-pointer"
              />
              <span className="text-xs text-muted-foreground w-8 text-right" style={{ fontFamily: "'VT323', 'Courier New', monospace" }}>
                {fontSize}
              </span>
            </div>
          )}

          {/* Color palette */}
          <div className="flex items-center gap-1 bg-muted rounded-lg p-1 flex-wrap">
            {COLOR_PALETTE.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-5 h-5 rounded-full border-2 transition-transform ${
                  color === c ? "scale-125 border-foreground/60" : "border-transparent hover:scale-110"
                }`}
                style={{ backgroundColor: c }}
                title={c}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Column Headers */}
      <div className="flex border-b border-border mb-0">
        {[1, 2, 3, 4, 5].map((year) => (
          <div
            key={year}
            className="flex-1 text-center py-1.5 text-xs font-medium text-muted-foreground bg-muted/30"
          >
            第{year}年
          </div>
        ))}
      </div>

      {/* Canvas Container */}
      <div className={`bg-card border-x border-b border-border rounded-b-xl overflow-hidden ${isFullscreen ? "flex items-center justify-center" : ""}`}>
        {/* Inner wrapper — sized to exactly match canvas, text overlay positions relative to this */}
        <div
          ref={wrapperRef}
          className="relative"
          style={isFullscreen && fullscreenSize
            ? { width: `${fullscreenSize.w}px`, height: `${fullscreenSize.h}px` }
            : { width: "100%", aspectRatio: `${CANVAS_WIDTH}/${CANVAS_HEIGHT}` }
          }
        >
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className={`block touch-none w-full h-full ${
              tool === "eraser" ? "cursor-cell" : "cursor-crosshair"
            }`}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onDoubleClick={handleDoubleClick}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />

          {/* Text boxes overlay */}
          <AnimatePresence>
            {localTextBoxes.map((textBox) => {
              const leftPct = (textBox.x / CANVAS_WIDTH) * 100;
              const topPct = (textBox.y / CANVAS_HEIGHT) * 100;

              return (
                <motion.div
                  key={textBox.id}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="absolute group z-20"
                  style={{
                    left: `${leftPct}%`,
                    top: `${topPct}%`,
                    transform: "translate(-50%, -50%)",
                    cursor: draggingTextId === textBox.id ? "grabbing" : "grab"
                  }}
                onMouseDown={(e) => startDragText(e, textBox.id)}
                onTouchStart={(e) => startDragText(e, textBox.id)}
                onMouseMove={onDragMove}
                onTouchMove={onDragMove}
                onMouseUp={endDragText}
                onTouchEnd={endDragText}
              >
                {editingTextId === textBox.id ? (
                  <div
                    className="flex items-center gap-1"
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                  >
                    <input
                      data-text-id={textBox.id}
                      type="text"
                      value={editingTextValue}
                      onChange={(e) => setEditingTextValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          saveTextBoxContent(textBox.id);
                        }
                        if (e.key === "Escape") {
                          e.preventDefault();
                          deleteTextBox(textBox.id);
                        }
                      }}
                      onBlur={() => {
                        // 延迟保存，避免与其他事件冲突
                        setTimeout(() => {
                          if (editingTextId === textBox.id) {
                            saveTextBoxContent(textBox.id);
                          }
                        }, 200);
                      }}
                      autoFocus
                      className="px-2 py-1 bg-[#f5f5f0] border-2 border-[#1a1a1a] w-36 focus:outline-none"
                      style={{
                        fontFamily: "var(--font-handwrite), 'KaiTi', 'STKaiti', cursive",
                        fontSize: `${textBox.fontSize * canvasScale}px`,
                        color: textBox.color,
                        boxShadow: "inset 1px 1px 0 #888, inset -1px -1px 0 #fff",
                      }}
                      placeholder="输入文字..."
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        clearTextContent();
                      }}
                      className="w-6 h-6 bg-[#2a2a2a] border-2 border-[#1a1a1a] flex items-center justify-center hover:bg-[#b33] transition-colors shrink-0"
                      title="清空文字"
                      style={{ boxShadow: "inset 1px 1px 0 #555, inset -1px -1px 0 #111" }}
                    >
                      <span className="text-xs leading-none">✖️</span>
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        startEditing(textBox.id, textBox.text);
                      }}
                      className="px-2.5 py-1 whitespace-nowrap cursor-pointer border-2 border-[#1a1a1a] bg-[#f5f5f0] hover:bg-[#e8e8e0] transition-colors"
                      style={{
                        fontFamily: "var(--font-handwrite), 'KaiTi', 'STKaiti', cursive",
                        fontSize: `${textBox.fontSize * canvasScale}px`,
                        color: textBox.color,
                        boxShadow: "inset 1px 1px 0 #fff, inset -1px -1px 0 #aaa",
                      }}
                    >
                      {textBox.text || "双击画布添加文字"}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteTextBox(textBox.id);
                      }}
                      className="absolute -top-2.5 -right-2.5 w-5 h-5 bg-[#2a2a2a] border-2 border-[#1a1a1a] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:bg-[#b33]"
                      title="删除文字框"
                      style={{ boxShadow: "inset 1px 1px 0 #555, inset -1px -1px 0 #111" }}
                    >
                      <span className="text-xs leading-none">✖️</span>
                    </button>
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
        </div>

        {/* Ten-year bottom row highlight */}
        {isTenYear && (
          <div
            className="absolute left-0 right-0 bottom-0 pointer-events-none"
            style={{ height: "50%", background: "rgba(var(--primary), 0.03)" }}
          />
        )}
      </div>

      {/* Ten-year bottom column headers */}
      {isTenYear && (
        <div className="flex border-x border-b border-border rounded-b-xl overflow-hidden">
          {[6, 7, 8, 9, 10].map((year) => (
            <div
              key={year}
              className="flex-1 text-center py-1.5 text-xs font-medium text-primary bg-primary/5"
            >
              第{year}年
              <span className="ml-0.5 opacity-60">(深化)</span>
            </div>
          ))}
        </div>
      )}

      {/* Tool hint */}
      <div className="mt-1.5 text-xs text-muted-foreground text-center">
        {tool === "pen" && "✏️ 在画布上拖动鼠标绘制涂鸦"}
        {tool === "eraser" && "🧽 在画布上拖动鼠标擦除涂鸦"}
        {tool === "text" && "📝 双击画布添加文字 | 拖拽文字框移动位置"}
      </div>

      {/* Clear confirmation dialog */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowClearConfirm(false)}>
          <div
            className="border-2 border-[#1a1a1a] bg-[#e0e0e0] p-6 max-w-sm mx-4"
            style={{
              boxShadow: "inset 2px 2px 0 #fff, inset -2px -2px 0 #888, 6px 6px 0 rgba(0,0,0,0.35)",
              fontFamily: "'VT323', 'Courier New', monospace",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Title bar */}
            <div className="bg-[#2a2a2a] -mx-6 -mt-6 mb-4 px-3 py-1.5 flex items-center gap-2 border-b-2 border-[#111]">
              <IconTrash size={16} className="text-[#c9ab8f]" />
              <span className="text-sm tracking-[0.12em] text-[#ccc]">确认清空</span>
            </div>
            <p className="text-sm text-[#555] mb-5 tracking-wide">确定要清除画布上的所有涂鸦和文字吗？此操作不可撤销。</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 px-4 py-2 border-2 border-[#1a1a1a] bg-[#ddd] text-[#1a1a1a] font-bold text-sm hover:bg-[#2a2a2a] hover:text-[#ddd] transition-colors"
                style={{ boxShadow: "inset 1px 1px 0 #fff, inset -1px -1px 0 #888" }}
              >
                取消
              </button>
              <button
                onClick={() => { clearCanvas(); setShowClearConfirm(false); }}
                className="flex-1 px-4 py-2 border-2 border-[#b33] bg-[#e8c0c0] text-[#b33] font-bold text-sm hover:bg-[#b33] hover:text-[#f5f5f0] transition-colors"
                style={{ boxShadow: "inset 1px 1px 0 #fcc, inset -1px -1px 0 #a88" }}
              >
                确认清空
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// Keep backward-compatible export
export { UnifiedCanvas as CanvasComponent };