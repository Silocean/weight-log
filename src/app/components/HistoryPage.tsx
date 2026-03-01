import { useState, useMemo } from "react";
import { Trash2, TrendingDown, TrendingUp, Minus, StickyNote, Search, Filter } from "lucide-react";
import { useWeight, WeightEntry } from "../context/WeightContext";
import { format, parseISO } from "date-fns";
import { zhCN } from "date-fns/locale";
import { motion, AnimatePresence } from "motion/react";

type FilterType = "all" | "week" | "month";

export function HistoryPage() {
  const { entries, settings, deleteEntry } = useWeight();
  const [searchDate, setSearchDate] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const now = new Date();
    return entries.filter((e) => {
      if (searchDate && !e.date.includes(searchDate)) return false;
      if (filter === "week") {
        const diff = (now.getTime() - new Date(e.date).getTime()) / (1000 * 60 * 60 * 24);
        return diff <= 7;
      }
      if (filter === "month") {
        const diff = (now.getTime() - new Date(e.date).getTime()) / (1000 * 60 * 60 * 24);
        return diff <= 30;
      }
      return true;
    });
  }, [entries, searchDate, filter]);

  const getTrend = (entry: WeightEntry, index: number) => {
    const next = filtered[index + 1];
    if (!next) return null;
    return entry.weight - next.weight;
  };

  const confirmDelete = (id: string) => {
    deleteEntry(id);
    setDeleteId(null);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="搜索日期..."
            value={searchDate}
            onChange={(e) => setSearchDate(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-400 transition-colors"
          />
        </div>
        <div className="flex bg-white border border-gray-200 rounded-xl overflow-hidden">
          {(["all", "week", "month"] as FilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-2.5 text-xs font-medium transition-colors ${
                filter === f ? "bg-indigo-500 text-white" : "text-gray-500"
              }`}
            >
              {f === "all" ? "全部" : f === "week" ? "7天" : "30天"}
            </button>
          ))}
        </div>
      </div>

      <div className="text-xs text-gray-400 px-1">
        共 {filtered.length} 条记录
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
            <Filter className="w-7 h-7 text-gray-300" />
          </div>
          <p className="text-sm">暂无记录</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <AnimatePresence>
            {filtered.map((entry, index) => {
              const trend = getTrend(entry, index);
              const isDeleting = deleteId === entry.id;
              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.2, delay: Math.min(index * 0.03, 0.3) }}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
                >
                  {!isDeleting ? (
                    <div className="flex items-center px-4 py-3.5 gap-3">
                      {/* Date */}
                      <div className="flex flex-col items-center min-w-[40px]">
                        <span className="text-lg font-bold text-gray-800">
                          {format(parseISO(entry.date), "dd")}
                        </span>
                        <span className="text-xs text-gray-400">
                          {format(parseISO(entry.date), "MM月", { locale: zhCN })}
                        </span>
                        <span className="text-xs text-gray-300">
                          {format(parseISO(entry.date), "EEE", { locale: zhCN })}
                        </span>
                      </div>

                      <div className="w-px h-10 bg-gray-100" />

                      {/* Weight */}
                      <div className="flex-1">
                        <div className="flex items-end gap-1.5">
                          <span className="text-2xl font-bold text-gray-800">{entry.weight}</span>
                          <span className="text-sm text-gray-400 mb-0.5">{settings.unit}</span>
                          {trend !== null && (
                            <span
                              className={`text-xs font-medium mb-0.5 flex items-center gap-0.5 ${
                                trend > 0
                                  ? "text-rose-400"
                                  : trend < 0
                                  ? "text-emerald-400"
                                  : "text-gray-400"
                              }`}
                            >
                              {trend > 0 ? (
                                <TrendingUp className="w-3 h-3" />
                              ) : trend < 0 ? (
                                <TrendingDown className="w-3 h-3" />
                              ) : (
                                <Minus className="w-3 h-3" />
                              )}
                              {trend > 0 ? "+" : ""}
                              {Math.round(trend * 10) / 10}
                            </span>
                          )}
                        </div>
                        {entry.note && (
                          <div className="flex items-center gap-1 mt-0.5">
                            <StickyNote className="w-3 h-3 text-gray-300" />
                            <span className="text-xs text-gray-400 truncate max-w-[140px]">{entry.note}</span>
                          </div>
                        )}
                      </div>

                      {/* Delete */}
                      <button
                        onClick={() => setDeleteId(entry.id)}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-gray-300 hover:text-rose-400 hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center px-4 py-3.5 gap-3 bg-rose-50">
                      <p className="flex-1 text-sm text-rose-600">确认删除此记录？</p>
                      <button
                        onClick={() => setDeleteId(null)}
                        className="px-3 py-1.5 text-xs rounded-lg border border-gray-300 text-gray-500 bg-white"
                      >
                        取消
                      </button>
                      <button
                        onClick={() => confirmDelete(entry.id)}
                        className="px-3 py-1.5 text-xs rounded-lg bg-rose-500 text-white"
                      >
                        删除
                      </button>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
