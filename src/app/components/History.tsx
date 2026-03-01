import { useState } from 'react';
import { Trash2, MessageSquare, TrendingDown, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format, parseISO } from 'date-fns';
import { WeightEntry, UserSettings } from './types';

interface HistoryProps {
  entries: WeightEntry[];
  settings: UserSettings;
  onDelete: (id: string) => void;
}

export function History({ entries, settings, onDelete }: HistoryProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const reversed = [...entries].reverse();

  const getDiff = (entry: WeightEntry, idx: number) => {
    const prevEntry = reversed[idx + 1];
    if (!prevEntry) return null;
    return entry.weight - prevEntry.weight;
  };

  return (
    <div className="flex flex-col gap-4 pb-6">
      <div className="flex justify-between items-center">
        <h2 className="text-gray-900 font-bold text-lg">历史记录</h2>
        <span className="text-gray-400 text-sm">{entries.length} 条</span>
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-3">📊</div>
          <p>还没有任何记录</p>
          <p className="text-sm mt-1">点击底部 + 开始记录</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <AnimatePresence>
            {reversed.map((entry, idx) => {
              const diff = getDiff(entry, idx);
              return (
                <motion.div
                  key={entry.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                >
                  <div className="flex items-center justify-between px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      {/* Date badge */}
                      <div className="bg-violet-50 rounded-xl px-2.5 py-2 text-center min-w-[44px]">
                        <p className="text-violet-600 text-xs">{format(parseISO(entry.date), 'M月')}</p>
                        <p className="text-violet-800 font-bold text-base leading-tight">{format(parseISO(entry.date), 'd')}</p>
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-gray-900 font-bold">{entry.weight}</span>
                          <span className="text-gray-400 text-sm">{settings.unit}</span>
                          {diff !== null && Math.abs(diff) > 0.009 && (
                            <div className={`flex items-center gap-0.5 text-xs px-1.5 py-0.5 rounded-full ${diff < 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                              {diff < 0 ? <TrendingDown size={10} /> : <TrendingUp size={10} />}
                              {diff < 0 ? '' : '+'}{diff.toFixed(1)}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1 mt-0.5">
                          <p className="text-gray-400 text-xs">{format(parseISO(entry.date), 'yyyy年')}</p>
                          {entry.note && (
                            <>
                              <span className="text-gray-300">·</span>
                              <MessageSquare size={10} className="text-gray-300" />
                              <p className="text-gray-400 text-xs truncate max-w-[120px]">{entry.note}</p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {deleteId === entry.id ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => setDeleteId(null)}
                          className="text-gray-400 text-xs px-3 py-1.5 rounded-xl bg-gray-100"
                        >
                          取消
                        </button>
                        <button
                          onClick={() => { onDelete(entry.id); setDeleteId(null); }}
                          className="text-white text-xs px-3 py-1.5 rounded-xl bg-red-500"
                        >
                          确认删除
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteId(entry.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
