import { useState } from 'react';
import { X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { WeightEntry, UserSettings } from './types';

interface AddWeightModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (entry: Omit<WeightEntry, 'id'>) => void;
  settings: UserSettings;
  latestEntry: WeightEntry | undefined;
}

export function AddWeightModal({ open, onClose, onAdd, settings, latestEntry }: AddWeightModalProps) {
  const today = format(new Date(), 'yyyy-MM-dd');
  const [weight, setWeight] = useState(latestEntry ? String(latestEntry.weight) : '');
  const [date, setDate] = useState(today);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    const w = parseFloat(weight);
    if (isNaN(w) || w <= 0 || w > 500) {
      setError('请输入有效的体重（1-500）');
      return;
    }
    onAdd({ weight: w, date, note: note.trim() || undefined });
    onClose();
    setWeight('');
    setNote('');
    setDate(today);
    setError('');
  };

  const handleClose = () => {
    onClose();
    setError('');
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            onClick={handleClose}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl p-6 max-w-lg mx-auto shadow-2xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-gray-900 font-bold text-lg">记录体重</h2>
              <button
                onClick={handleClose}
                className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center"
              >
                <X size={16} className="text-gray-600" />
              </button>
            </div>

            {/* Weight Input */}
            <div className="mb-5">
              <label className="text-gray-500 text-sm block mb-2">体重（{settings.unit}）</label>
              <div className="flex items-center bg-gray-50 rounded-2xl border-2 border-transparent focus-within:border-violet-400 transition-colors">
                <input
                  type="number"
                  value={weight}
                  onChange={e => { setWeight(e.target.value); setError(''); }}
                  placeholder={`例如：${latestEntry ? latestEntry.weight : '70.0'}`}
                  step="0.1"
                  min="1"
                  max="500"
                  className="flex-1 bg-transparent px-4 py-4 text-2xl font-bold text-gray-900 outline-none placeholder:text-gray-300"
                  autoFocus
                />
                <span className="text-gray-400 pr-4 text-lg">{settings.unit}</span>
              </div>
              {error && <p className="text-red-500 text-xs mt-1.5 ml-1">{error}</p>}
            </div>

            {/* Quick select buttons */}
            {latestEntry && (
              <div className="flex gap-2 mb-5 flex-wrap">
                {[-1, -0.5, 0, 0.5, 1].map(diff => {
                  const val = (latestEntry.weight + diff).toFixed(1);
                  return (
                    <button
                      key={diff}
                      onClick={() => setWeight(val)}
                      className={`px-3 py-1.5 rounded-xl text-sm transition-colors ${weight === val
                        ? 'bg-violet-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                      {diff > 0 ? `+${diff}` : diff === 0 ? '同上' : diff} ({val})
                    </button>
                  );
                })}
              </div>
            )}

            {/* Date Input */}
            <div className="mb-5">
              <label className="text-gray-500 text-sm block mb-2">日期</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                max={today}
                className="w-full bg-gray-50 rounded-2xl px-4 py-3 text-gray-900 outline-none border-2 border-transparent focus:border-violet-400 transition-colors"
              />
            </div>

            {/* Note Input */}
            <div className="mb-6">
              <label className="text-gray-500 text-sm block mb-2">备注（可选）</label>
              <input
                type="text"
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="今天感觉怎么样？"
                maxLength={50}
                className="w-full bg-gray-50 rounded-2xl px-4 py-3 text-gray-900 outline-none border-2 border-transparent focus:border-violet-400 transition-colors placeholder:text-gray-300"
              />
            </div>

            <button
              onClick={handleSubmit}
              className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-2xl py-4 font-semibold flex items-center justify-center gap-2 shadow-lg shadow-violet-200 active:scale-98 transition-transform"
            >
              <Check size={18} />
              保存记录
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
