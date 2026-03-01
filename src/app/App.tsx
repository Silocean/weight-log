import { useState, useEffect } from "react";
import { LayoutDashboard, PlusCircle, ClipboardList, Settings } from "lucide-react";
import { WeightProvider } from "./context/WeightContext";
import { DashboardPage } from "./components/DashboardPage";
import { LogPage } from "./components/LogPage";
import { HistoryPage } from "./components/HistoryPage";
import { SettingsPage } from "./components/SettingsPage";
import { motion, AnimatePresence } from "motion/react";

type Tab = "dashboard" | "log" | "history" | "settings";

const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "dashboard", label: "概览", icon: LayoutDashboard },
  { id: "log", label: "记录", icon: PlusCircle },
  { id: "history", label: "历史", icon: ClipboardList },
  { id: "settings", label: "设置", icon: Settings },
];

function WeightApp() {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");

  const renderPage = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardPage />;
      case "log":
        return <LogPage />;
      case "history":
        return <HistoryPage />;
      case "settings":
        return <SettingsPage />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center">
      <div className="w-full max-w-md flex flex-col min-h-screen relative">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-gray-50/90 backdrop-blur-md px-5 pt-5 pb-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                体重记录
              </h1>
              <p className="text-xs text-gray-400">
                {new Date().toLocaleDateString("zh-CN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  weekday: "long",
                })}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold shadow-md">
              ⚖️
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto px-5 pb-24">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-30">
          <div className="mx-3 mb-3 bg-white rounded-2xl shadow-xl border border-gray-100 px-2 py-2">
            <div className="flex items-center justify-around">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${
                      isActive ? "bg-indigo-50" : "hover:bg-gray-50"
                    }`}
                  >
                    <div
                      className={`transition-all ${
                        isActive ? "text-indigo-600 scale-110" : "text-gray-400"
                      }`}
                    >
                      {tab.id === "log" ? (
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                            isActive
                              ? "bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg shadow-indigo-300"
                              : "bg-gray-100"
                          }`}
                        >
                          <Icon
                            className={`w-5 h-5 ${isActive ? "text-white" : "text-gray-400"}`}
                          />
                        </div>
                      ) : (
                        <Icon className="w-5 h-5" />
                      )}
                    </div>
                    {tab.id !== "log" && (
                      <span
                        className={`text-xs font-medium ${
                          isActive ? "text-indigo-600" : "text-gray-400"
                        }`}
                      >
                        {tab.label}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  useEffect(() => {
    document.getElementById("app-loading")?.remove();
  }, []);
  return (
    <WeightProvider>
      <WeightApp />
    </WeightProvider>
  );
}
