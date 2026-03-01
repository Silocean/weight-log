import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingDown, TrendingUp, Minus, Target, Activity, Ruler } from "lucide-react";
import { useWeight } from "../context/WeightContext";
import { format, parseISO } from "date-fns";
import { zhCN } from "date-fns/locale";

const BMI_COLORS: Record<string, string> = {
  偏瘦: "#60a5fa",
  正常: "#34d399",
  超重: "#fbbf24",
  肥胖: "#f87171",
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white rounded-xl shadow-lg px-3 py-2 border border-gray-100">
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-semibold text-indigo-600">{payload[0].value} kg</p>
      </div>
    );
  }
  return null;
};

export function DashboardPage() {
  const { entries, settings, latestWeight, weightChange, bmi, bmiCategory, goalProgress } =
    useWeight();

  const chartData = useMemo(() => {
    const sorted = [...entries]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-30);
    return sorted.map((e) => ({
      date: format(parseISO(e.date), "MM/dd"),
      weight: e.weight,
    }));
  }, [entries]);

  const minWeight = useMemo(() => Math.min(...entries.map((e) => e.weight)), [entries]);
  const maxWeight = useMemo(() => Math.max(...entries.map((e) => e.weight)), [entries]);
  const avgWeight = useMemo(
    () =>
      entries.length
        ? Math.round((entries.reduce((sum, e) => sum + e.weight, 0) / entries.length) * 10) / 10
        : 0,
    [entries]
  );

  const totalLost = useMemo(() => {
    if (!settings.startWeight || !latestWeight) return null;
    return Math.round((settings.startWeight - latestWeight) * 10) / 10;
  }, [settings.startWeight, latestWeight]);

  const trendIcon =
    weightChange === null ? null : weightChange > 0 ? (
      <TrendingUp className="w-4 h-4 text-red-400" />
    ) : weightChange < 0 ? (
      <TrendingDown className="w-4 h-4 text-emerald-400" />
    ) : (
      <Minus className="w-4 h-4 text-gray-400" />
    );

  const trendColor =
    weightChange === null
      ? "text-gray-400"
      : weightChange > 0
      ? "text-red-400"
      : weightChange < 0
      ? "text-emerald-400"
      : "text-gray-400";

  return (
    <div className="flex flex-col gap-4 pb-4">
      {/* Header Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-6 text-white shadow-xl">
        <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/10" />
        <div className="absolute -bottom-10 -left-6 w-40 h-40 rounded-full bg-white/10" />
        <p className="text-sm opacity-80 mb-1">你好，{settings.name} 👋</p>
        <div className="flex items-end gap-3 mt-1">
          <div>
            <p className="text-xs opacity-70 mb-1">当前体重</p>
            <div className="flex items-end gap-2">
              <span className="text-5xl font-bold">
                {latestWeight ?? "--"}
              </span>
              <span className="text-xl opacity-80 mb-1">{settings.unit}</span>
            </div>
          </div>
          {weightChange !== null && (
            <div className="mb-1 flex items-center gap-1 bg-white/20 rounded-full px-3 py-1">
              {trendIcon}
              <span className="text-sm font-medium">
                {weightChange > 0 ? "+" : ""}{weightChange} {settings.unit}
              </span>
            </div>
          )}
        </div>
        {totalLost !== null && totalLost !== 0 && (
          <p className="text-xs opacity-75 mt-2">
            {totalLost > 0 ? `🎉 已减重 ${totalLost} ${settings.unit}` : `📈 已增重 ${Math.abs(totalLost)} ${settings.unit}`}
          </p>
        )}
        {entries[0]?.date && (
          <p className="text-xs opacity-60 mt-1">
            最近记录：{format(parseISO(entries[0].date), "MM月dd日", { locale: zhCN })}
          </p>
        )}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="最低" value={entries.length ? minWeight : "--"} unit={settings.unit} color="text-emerald-500" />
        <StatCard label="平均" value={entries.length ? avgWeight : "--"} unit={settings.unit} color="text-indigo-500" />
        <StatCard label="最高" value={entries.length ? maxWeight : "--"} unit={settings.unit} color="text-rose-500" />
      </div>

      {/* BMI Card */}
      {bmi && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-4 h-4 text-indigo-500" />
            <h3 className="text-sm font-semibold text-gray-700">BMI 指数</h3>
          </div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-gray-800">{bmi}</span>
              <span
                className="text-sm font-semibold mb-1 px-2 py-0.5 rounded-full text-white"
                style={{ backgroundColor: BMI_COLORS[bmiCategory] || "#94a3b8" }}
              >
                {bmiCategory}
              </span>
            </div>
            {settings.height && (
              <div className="flex items-center gap-1 text-gray-400 text-xs">
                <Ruler className="w-3 h-3" />
                <span>{settings.height} cm</span>
              </div>
            )}
          </div>
          <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
            <div className="h-full flex">
              <div className="bg-blue-400" style={{ width: "20%" }} />
              <div className="bg-emerald-400" style={{ width: "30%" }} />
              <div className="bg-yellow-400" style={{ width: "20%" }} />
              <div className="bg-red-400" style={{ width: "30%" }} />
            </div>
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>偏瘦</span>
            <span>正常 18.5~24</span>
            <span>超重</span>
            <span>肥胖</span>
          </div>
        </div>
      )}

      {/* Goal Progress */}
      {settings.goalWeight && latestWeight && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-4 h-4 text-purple-500" />
            <h3 className="text-sm font-semibold text-gray-700">目标进度</h3>
            <span className="ml-auto text-xs text-gray-400">目标：{settings.goalWeight} {settings.unit}</span>
          </div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl font-bold text-purple-600">{goalProgress}%</span>
            <span className="text-xs text-gray-400">
              还需{" "}
              <span className="font-semibold text-gray-600">
                {Math.max(0, Math.round((latestWeight - settings.goalWeight) * 10) / 10)}
              </span>{" "}
              {settings.unit}
            </span>
          </div>
          <div className="w-full h-3 rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-purple-400 to-pink-400 transition-all duration-500"
              style={{ width: `${goalProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Chart */}
      {chartData.length > 1 && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">近30天趋势</h3>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: "#9ca3af" }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                domain={["auto", "auto"]}
                tick={{ fontSize: 10, fill: "#9ca3af" }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="weight"
                stroke="#6366f1"
                strokeWidth={2}
                fill="url(#colorWeight)"
                dot={false}
                activeDot={{ r: 4, fill: "#6366f1" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  unit,
  color,
}: {
  label: string;
  value: number | string;
  unit: string;
  color: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 text-center">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className={`text-lg font-bold ${color}`}>{value}</p>
      <p className="text-xs text-gray-400">{unit}</p>
    </div>
  );
}
