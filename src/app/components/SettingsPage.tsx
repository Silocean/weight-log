import { useState } from "react";
import { User, Ruler, Target, Scale, RotateCcw, CheckCircle } from "lucide-react";
import { useWeight } from "../context/WeightContext";

export function SettingsPage() {
  const { settings, updateSettings, entries } = useWeight();
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    name: settings.name,
    height: settings.height?.toString() ?? "",
    goalWeight: settings.goalWeight?.toString() ?? "",
    unit: settings.unit,
  });

  const handleSave = () => {
    updateSettings({
      name: form.name || "我",
      height: form.height ? parseFloat(form.height) : null,
      goalWeight: form.goalWeight ? parseFloat(form.goalWeight) : null,
      unit: form.unit as "kg" | "lbs",
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    if (confirm("确认清空所有记录？此操作不可恢复。")) {
      localStorage.removeItem("weight-entries");
      localStorage.removeItem("weight-settings");
      window.location.reload();
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="text-center pt-2">
        <h2 className="text-lg font-bold text-gray-800">个人设置</h2>
        <p className="text-xs text-gray-400 mt-1">完善信息，获得更准确的分析</p>
      </div>

      {/* Profile Section */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col gap-4">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700 border-b border-gray-50 pb-2">
          <User className="w-4 h-4 text-indigo-500" />
          个人信息
        </div>

        <SettingRow
          label="昵称"
          icon={<User className="w-4 h-4 text-indigo-400" />}
        >
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="输入昵称"
            className="input-style"
          />
        </SettingRow>

        <SettingRow
          label="身高 (cm)"
          icon={<Ruler className="w-4 h-4 text-blue-400" />}
        >
          <input
            type="number"
            value={form.height}
            onChange={(e) => setForm({ ...form, height: e.target.value })}
            placeholder="如：170"
            min={100}
            max={250}
            className="input-style"
          />
        </SettingRow>
      </div>

      {/* Goal Section */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col gap-4">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700 border-b border-gray-50 pb-2">
          <Target className="w-4 h-4 text-purple-500" />
          目标设定
        </div>

        <SettingRow
          label="目标体重"
          icon={<Target className="w-4 h-4 text-purple-400" />}
        >
          <input
            type="number"
            value={form.goalWeight}
            onChange={(e) => setForm({ ...form, goalWeight: e.target.value })}
            placeholder={`如：65`}
            step="0.1"
            min={30}
            max={300}
            className="input-style"
          />
        </SettingRow>

        <SettingRow
          label="体重单位"
          icon={<Scale className="w-4 h-4 text-teal-400" />}
        >
          <div className="flex bg-gray-100 rounded-lg overflow-hidden">
            {(["kg", "lbs"] as const).map((u) => (
              <button
                key={u}
                onClick={() => setForm({ ...form, unit: u })}
                className={`flex-1 py-2 text-sm font-medium transition-all ${
                  form.unit === u
                    ? "bg-white text-indigo-600 shadow-sm rounded-lg"
                    : "text-gray-500"
                }`}
              >
                {u}
              </button>
            ))}
          </div>
        </SettingRow>
      </div>

      {/* Stats */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-4 border border-indigo-100">
        <p className="text-xs font-medium text-indigo-600 mb-3">数据统计</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-indigo-600">{entries.length}</p>
            <p className="text-xs text-gray-400">记录总数</p>
          </div>
          <div className="bg-white rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-purple-600">
              {entries.length > 0
                ? Math.round(
                    (new Date().getTime() - new Date(entries[entries.length - 1].date).getTime()) /
                      (1000 * 60 * 60 * 24)
                  )
                : 0}
            </p>
            <p className="text-xs text-gray-400">坚持天数</p>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold shadow-lg shadow-indigo-200 active:scale-98 transition-all"
      >
        {saved ? (
          <span className="flex items-center justify-center gap-2">
            <CheckCircle className="w-5 h-5" /> 保存成功！
          </span>
        ) : (
          "保存设置"
        )}
      </button>

      {/* Reset */}
      <button
        onClick={handleReset}
        className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl border border-red-200 text-red-400 text-sm"
      >
        <RotateCcw className="w-4 h-4" />
        清空所有数据
      </button>
    </div>
  );
}

function SettingRow({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 w-28">
        {icon}
        <span className="text-sm text-gray-600">{label}</span>
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
}

// Inject global style for inputs
const style = document.createElement("style");
style.textContent = `.input-style { width: 100%; padding: 8px 12px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; font-size: 14px; color: #374151; outline: none; transition: border-color 0.15s; } .input-style:focus { border-color: #818cf8; }`;
document.head.appendChild(style);
