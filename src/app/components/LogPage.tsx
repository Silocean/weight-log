import { useState } from "react";
import { CheckCircle, ChevronDown, ChevronUp } from "lucide-react";
import { useWeight } from "../context/WeightContext";
import { motion, AnimatePresence } from "motion/react";

const QUICK_NOTES = ["运动后", "早晨空腹", "睡前", "午餐后", "状态很好", "有点疲劳"];

export function LogPage() {
  const { settings, addEntry, latestWeight } = useWeight();
  const today = new Date().toISOString().split("T")[0];

  const [weight, setWeight] = useState(latestWeight?.toString() ?? "");
  const [date, setDate] = useState(today);
  const [note, setNote] = useState("");
  const [showNote, setShowNote] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = () => {
    const w = parseFloat(weight);
    if (!weight || isNaN(w) || w <= 0 || w > 500) {
      setError("请输入有效的体重（0 - 500）");
      return;
    }
    if (!date) {
      setError("请选择日期");
      return;
    }
    setError("");
    addEntry({ weight: w, date, note: note || undefined });
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 2000);
    setNote("");
  };

  const adjustWeight = (delta: number) => {
    const current = parseFloat(weight) || 0;
    const next = Math.round((current + delta) * 10) / 10;
    if (next > 0 && next <= 500) setWeight(next.toString());
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="text-center pt-2">
        <h2 className="text-lg font-bold text-gray-800">记录体重</h2>
        <p className="text-xs text-gray-400 mt-1">保持记录，见证变化</p>
      </div>

      {/* Weight Input */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <p className="text-xs text-gray-500 text-center mb-4">输入今日体重</p>
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => adjustWeight(-0.1)}
            className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 active:scale-95 transition-transform text-xl font-light"
          >
            −
          </button>
          <div className="relative flex items-end gap-2">
            <input
              type="number"
              value={weight}
              onChange={(e) => {
                setWeight(e.target.value);
                setError("");
              }}
              placeholder="0.0"
              step="0.1"
              min="1"
              max="500"
              className="w-32 text-center text-5xl font-bold text-gray-800 outline-none border-b-2 border-indigo-300 focus:border-indigo-500 bg-transparent pb-1 transition-colors"
              style={{ MozAppearance: "textfield" } as any}
            />
            <span className="text-lg text-gray-400 mb-1">{settings.unit}</span>
          </div>
          <button
            onClick={() => adjustWeight(0.1)}
            className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 active:scale-95 transition-transform text-xl font-light"
          >
            +
          </button>
        </div>
        {error && <p className="text-xs text-red-400 text-center mt-3">{error}</p>}
      </div>

      {/* Quick Adjust */}
      <div className="flex gap-2 justify-center flex-wrap">
        {[-1, -0.5, -0.1, +0.1, +0.5, +1].map((d) => (
          <button
            key={d}
            onClick={() => adjustWeight(d)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all active:scale-95 ${
              d < 0
                ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                : "bg-rose-50 text-rose-600 border border-rose-200"
            }`}
          >
            {d > 0 ? `+${d}` : d}
          </button>
        ))}
      </div>

      {/* Date Picker */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <label className="text-xs text-gray-500 block mb-2">记录日期</label>
        <input
          type="date"
          value={date}
          max={today}
          onChange={(e) => setDate(e.target.value)}
          className="w-full text-sm text-gray-700 border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-indigo-400 transition-colors bg-gray-50"
        />
      </div>

      {/* Note Toggle */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <button
          onClick={() => setShowNote(!showNote)}
          className="w-full flex items-center justify-between px-4 py-3.5 text-sm text-gray-600"
        >
          <span>添加备注（可选）</span>
          {showNote ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </button>
        <AnimatePresence>
          {showNote && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4">
                <div className="flex flex-wrap gap-2 mb-3">
                  {QUICK_NOTES.map((n) => (
                    <button
                      key={n}
                      onClick={() => setNote(note === n ? "" : n)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                        note === n
                          ? "bg-indigo-500 text-white border-indigo-500"
                          : "bg-gray-50 text-gray-500 border-gray-200"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="写下今天的感受..."
                  rows={2}
                  className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-indigo-400 resize-none bg-gray-50 text-gray-700"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold shadow-lg shadow-indigo-200 active:scale-98 transition-all"
      >
        {submitted ? (
          <span className="flex items-center justify-center gap-2">
            <CheckCircle className="w-5 h-5" /> 记录成功！
          </span>
        ) : (
          "保存记录"
        )}
      </button>
    </div>
  );
}
