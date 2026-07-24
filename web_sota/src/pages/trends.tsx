import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  Loader2,
  RefreshCw,
} from "lucide-react";
import {
  type PlugDevice,
  type PlugStatus,
  type HistoryPoint,
  getPlugs,
  getPlugStatus,
  getPlugHistory,
} from "../common/api";
import { cn } from "../common/utils";

function formatTime(ts: string): string {
  try {
    const d = new Date(ts);
    return Number.isNaN(d.getTime()) ? ts : d.toLocaleTimeString("de-AT", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return ts;
  }
}

export function Trends() {
  const [plugs, setPlugs] = useState<PlugDevice[]>([]);
  const [selected, setSelected] = useState("");
  const [status, setStatus] = useState<PlugStatus | null>(null);
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [hours, setHours] = useState(24);
  const [loading, setLoading] = useState(true);

  const load = async (deviceId: string, h: number) => {
    setLoading(true);
    try {
      const [stat, hist] = await Promise.all([
        getPlugStatus(deviceId),
        getPlugHistory(deviceId, h),
      ]);
      setStatus(stat.device);
      setHistory(Array.isArray(hist.data_points) ? hist.data_points : []);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await getPlugs();
        setPlugs(res.devices);
        if (res.devices.length > 0) {
          setSelected(res.devices[0].device_id);
          await load(res.devices[0].device_id, 24);
        } else {
          setLoading(false);
        }
      } catch {
        setLoading(false);
      }
    })();
  }, []);

  const handleSelect = (id: string) => {
    setSelected(id);
    load(id, hours);
  };

  const handleHours = (h: number) => {
    setHours(h);
    if (selected) load(selected, h);
  };

  const chartData = history.map((p) => ({
    time: formatTime(p.timestamp),
    power_w: p.power_w ?? 0,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Energy Trends</h2>
          <p className="text-zinc-400">Power consumption over time</p>
        </div>
        <button
          onClick={() => selected && load(selected, hours)}
          className="text-zinc-400 hover:text-white transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {plugs.length > 0 && (
        <div className="flex gap-2 flex-wrap items-center">
          {plugs.map((p) => (
            <button
              key={p.device_id}
              onClick={() => handleSelect(p.device_id)}
              className={cn(
                "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                selected === p.device_id
                  ? "bg-emerald-600 text-white"
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700",
              )}
            >
              {p.device_name || p.device_id}
            </button>
          ))}
          <div className="ml-auto flex gap-1">
            {[12, 24, 72, 168].map((h) => (
              <button
                key={h}
                onClick={() => handleHours(h)}
                className={cn(
                  "px-2.5 py-1 rounded text-xs font-medium transition-colors",
                  hours === h
                    ? "bg-zinc-700 text-white"
                    : "bg-zinc-800/50 text-zinc-500 hover:text-zinc-300",
                )}
              >
                {h}h
              </button>
            ))}
          </div>
        </div>
      )}

      {status && (
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-3">
            <div className="text-xs text-zinc-500">Current Power</div>
            <div className="text-xl font-bold text-white">{status.power_w.toFixed(1)} W</div>
          </div>
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-3">
            <div className="text-xs text-zinc-500">Daily Energy</div>
            <div className="text-xl font-bold text-white">
              {status.daily_energy_kwh != null ? `${status.daily_energy_kwh.toFixed(2)} kWh` : "--"}
            </div>
          </div>
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-3">
            <div className="text-xs text-zinc-500">State</div>
            <div className={cn("text-xl font-bold", status.power_state ? "text-emerald-400" : "text-zinc-500")}>
              {status.power_state ? "On" : "Off"}
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center gap-2 p-12 text-zinc-400">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading...</span>
        </div>
      )}

      {!loading && chartData.length > 0 && (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis
                  dataKey="time"
                  tick={{ fill: "#71717a", fontSize: 11 }}
                  tickLine={false}
                  axisLine={{ stroke: "#27272a" }}
                />
                <YAxis
                  tick={{ fill: "#71717a", fontSize: 11 }}
                  tickLine={false}
                  axisLine={{ stroke: "#27272a" }}
                  width={50}
                  tickFormatter={(v) => `${v}W`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#09090b",
                    border: "1px solid #27272a",
                    borderRadius: "6px",
                    fontSize: "12px",
                  }}
                  labelStyle={{ color: "#e4e4e7" }}
                />
                <Area
                  type="monotone"
                  dataKey="power_w"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {!loading && chartData.length === 0 && selected && (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-8 text-center text-zinc-500">
          <Activity className="h-8 w-8 mx-auto mb-2 opacity-40" />
          <p>No energy data yet.</p>
          <p className="text-xs mt-1">Data accumulates as the backend polls.</p>
        </div>
      )}
    </div>
  );
}
