import { TrendingDown, TrendingUp, Target, Activity, Plus, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { WeightEntry, UserSettings } from './types';

interface DashboardProps {
  entries: WeightEntry[];
  settings: UserSettings;
  latestEntry: WeightEntry | undefined;
  bmi: number | null;
  weightToGoal: number | null;
  totalLost: number | null;
  onAddWeight: () => void;
  onViewHistory: () => void;
}

function getBMIStatus(bmi: number) {
  if (bmi < 18.5) return { label: '偏瘦', color: 'text-blue-500' };
  if (bmi < 24) return { label: '正常', color: 'text-green-500' };
  if (bmi < 28) return { label: '超重', color: 'text-yellow-500' };
  return { label: '肥胖', color: 'text-red-500' };
}

const CustomTooltip = ({ active, payload, label, unit }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 px-3 py-2">
        <p className="text-gray-500 text-xs">{label}</p>
        <p className="text-gray-900 font-semibold">{payload[0].value} {unit}</p>
      </div>
    );
  }
  return null;
};

export function Dashboard({
  entries,
  settings,
  latestEntry,
  bmi,
  weightToGoal,
  totalLost,
  onAddWeight,
  onViewHistory,
}: DashboardProps) {
  const chartData = entries.slice(-12).map(e => ({
    date: format(parseISO(e.date), 'M/d'),
    weight: e.weight,
    fullDate: e.date,
  }));

  const bmiStatus = bmi ? getBMIStatus(bmi) : null;
  const isLosing = weightToGoal !== null && weightToGoal > 0;
  const isAtGoal = weightToGoal !== null && Math.abs(weightToGoal) < 0.5;

  const minWeight = Math.min(...entries.map(e => e.weight), settings.goalWeight) - 1;
  const maxWeight = Math.max(...entries.map(e => e.weight)) + 1;

  return (
    <div className="flex flex-col gap-5 pb-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-violet-600 to-indigo-600 rounded-3xl p-5 text-white shadow-lg">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-violet-200 text-sm">你好，{settings.name} 👋</p>
            <p className="text-white/80 text-xs mt-0.5">{format(new Date(), 'yyyy年M月d日')}</p>
          </div>
          <button
            onClick={onAddWeight}
            className="bg-white/20 hover:bg-white/30 transition-colors rounded-xl p-2.5 backdrop-blur-sm"
          >
            <Plus size={20} className="text-white" />
          </button>
        </div>

        <div className="flex items-end gap-2">
          <span className="text-5xl font-bold">
            {latestEntry ? latestEntry.weight : '--'}
          </span>
          <span className="text-violet-200 mb-1.5">{settings.unit}</span>
          {totalLost !== null && totalLost !== 0 && (
            <div className={`flex items-center gap-1 mb-1.5 ml-1 px-2 py-0.5 rounded-full ${totalLost > 0 ? 'bg-green-400/20' : 'bg-red-400/20'}`}>
              {totalLost > 0 ? <TrendingDown size={14} className="text-green-300" /> : <TrendingUp size={14} className="text-red-300" />}
              <span className={`text-xs font-medium ${totalLost > 0 ? 'text-green-300' : 'text-red-300'}`}>
                {totalLost > 0 ? '-' : '+'}{Math.abs(totalLost).toFixed(1)} {settings.unit}
              </span>
            </div>
          )}
        </div>
        <p className="text-violet-200 text-sm mt-0.5">当前体重</p>

        {/* Goal Progress */}
        {weightToGoal !== null && (
          <div className="mt-4 bg-white/10 rounded-2xl p-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-white/80 text-xs">目标进度</span>
              <span className="text-white text-xs font-medium">
                {isAtGoal ? '已达目标! 🎉' : isLosing
                  ? `还需减 ${weightToGoal.toFixed(1)} ${settings.unit}`
                  : `已超目标 ${Math.abs(weightToGoal).toFixed(1)} ${settings.unit}`}
              </span>
            </div>
            {!isAtGoal && (
              <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                {(() => {
                  const first = entries[0]?.weight ?? latestEntry?.weight ?? settings.goalWeight;
                  const total = Math.abs(first - settings.goalWeight);
                  const done = total > 0 ? Math.min(Math.abs(first - (latestEntry?.weight ?? first)) / total, 1) : 1;
                  return (
                    <motion.div
                      className="h-full bg-white rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${done * 100}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                    />
                  );
                })()}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-3.5 shadow-sm border border-gray-100 flex flex-col gap-1"
        >
          <div className="w-8 h-8 bg-purple-100 rounded-xl flex items-center justify-center">
            <Target size={16} className="text-purple-600" />
          </div>
          <p className="text-gray-500 text-xs mt-1">目标</p>
          <p className="text-gray-900 font-semibold">{settings.goalWeight} <span className="text-gray-400 text-xs font-normal">{settings.unit}</span></p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-2xl p-3.5 shadow-sm border border-gray-100 flex flex-col gap-1"
        >
          <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center">
            <Activity size={16} className="text-blue-600" />
          </div>
          <p className="text-gray-500 text-xs mt-1">BMI</p>
          <p className={`font-semibold ${bmiStatus?.color ?? 'text-gray-900'}`}>
            {bmi ? bmi.toFixed(1) : '--'}
          </p>
          {bmiStatus && <p className={`text-xs ${bmiStatus.color}`}>{bmiStatus.label}</p>}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-3.5 shadow-sm border border-gray-100 flex flex-col gap-1"
        >
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${totalLost !== null && totalLost > 0 ? 'bg-green-100' : 'bg-orange-100'}`}>
            {totalLost !== null && totalLost > 0
              ? <TrendingDown size={16} className="text-green-600" />
              : <TrendingUp size={16} className="text-orange-600" />}
          </div>
          <p className="text-gray-500 text-xs mt-1">总变化</p>
          <p className={`font-semibold ${totalLost !== null && totalLost > 0 ? 'text-green-600' : 'text-orange-600'}`}>
            {totalLost !== null ? `${totalLost > 0 ? '-' : '+'}${Math.abs(totalLost).toFixed(1)}` : '--'}
          </p>
          <p className="text-gray-400 text-xs">{settings.unit}</p>
        </motion.div>
      </div>

      {/* Chart */}
      {entries.length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-gray-900 font-semibold">体重趋势</h3>
            <span className="text-gray-400 text-xs">近12次</span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[minWeight, maxWeight]}
                tick={{ fontSize: 10, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip unit={settings.unit} />} />
              <ReferenceLine
                y={settings.goalWeight}
                stroke="#8b5cf6"
                strokeDasharray="4 4"
                strokeWidth={1.5}
              />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="#6366f1"
                strokeWidth={2.5}
                dot={{ fill: '#6366f1', r: 3, strokeWidth: 0 }}
                activeDot={{ r: 5, fill: '#6366f1', stroke: '#fff', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-1.5 mt-2">
            <div className="w-4 h-0.5 bg-violet-400 border-dashed border-t-2 border-violet-400" style={{ borderTopStyle: 'dashed' }}></div>
            <span className="text-gray-400 text-xs">目标体重 {settings.goalWeight} {settings.unit}</span>
          </div>
        </motion.div>
      )}

      {/* Recent entries */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
      >
        <div className="flex justify-between items-center p-4 pb-3">
          <h3 className="text-gray-900 font-semibold">最近记录</h3>
          <button
            onClick={onViewHistory}
            className="flex items-center gap-0.5 text-violet-600 text-sm"
          >
            全部 <ChevronRight size={14} />
          </button>
        </div>
        {entries.length === 0 ? (
          <div className="px-4 pb-4 text-center text-gray-400 text-sm py-6">
            还没有记录，点击 + 开始记录吧
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {[...entries].reverse().slice(0, 4).map((entry, idx) => {
              const prev = [...entries].reverse()[idx + 1];
              const diff = prev ? entry.weight - prev.weight : null;
              return (
                <div key={entry.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-gray-900 text-sm font-medium">
                      {format(parseISO(entry.date), 'M月d日')}
                    </p>
                    {entry.note && (
                      <p className="text-gray-400 text-xs mt-0.5">{entry.note}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {diff !== null && Math.abs(diff) > 0.01 && (
                      <span className={`text-xs ${diff < 0 ? 'text-green-500' : 'text-red-400'}`}>
                        {diff < 0 ? '▼' : '▲'} {Math.abs(diff).toFixed(1)}
                      </span>
                    )}
                    <span className="text-gray-900 font-semibold">{entry.weight}</span>
                    <span className="text-gray-400 text-xs">{settings.unit}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}
