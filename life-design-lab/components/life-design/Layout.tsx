"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Dashboard } from "./Dashboard";
import { OdysseyModule } from "./OdysseyModule";
import { GoodTimeJournal } from "./GoodTimeJournal";
import { motion, AnimatePresence } from "framer-motion";

type ViewType = "dashboard" | "odyssey" | "journal";

export function Layout() {
  const [currentView, setCurrentView] = useState<ViewType>("dashboard");

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar currentView={currentView} onViewChange={setCurrentView} />
      
      <main className="flex-1 lg:ml-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="min-h-screen"
          >
            {currentView === "dashboard" && <Dashboard />}
            {currentView === "odyssey" && <OdysseyModule />}
            {currentView === "journal" && <GoodTimeJournal />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
