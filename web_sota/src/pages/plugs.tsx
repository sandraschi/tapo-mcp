import { useEffect, useState } from "react";
import {
  Zap,
  Power,
  PowerOff,
  Loader2,
  RefreshCw,
} from "lucide-react";
import {
  type PlugDevice,
  type PlugStatus,
  getPlugs,
  getPlugStatus,
  togglePlug,
} from "../common/api";
import { cn } from "../common/utils";

export function Plugs() {
  const [plugs, setPlugs] = useState<PlugDevice[]>([]);
  const [statuses, setStatuses] = useState<Record<string, PlugStatus>>({});
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      const res = await getPlugs();
      setPlugs(res.devices);
      const s: Record<string, PlugStatus> = {};
      for (const d of res.devices) {
        try {
          const stat = await getPlugStatus(d.device_id);
          s[d.device_id] = stat.device;
        } catch { /* skip */ }
      }
      setStatuses(s);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleToggle = async (id: string) => {
    setToggling(id);
    try {
      const r = await togglePlug(id);
      setStatuses((prev) => ({
        ...prev,
        [id]: { ...prev[id], power_state: r.power_state },
      }));
    } catch { /* ignore */ }
    setToggling(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 p-12 text-zinc-400">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span>Loading plugs...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Smart Plugs</h2>
          <p className="text-zinc-400">{plugs.length} devices</p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-1 text-sm text-zinc-400 hover:text-white transition-colors"
        >
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      {plugs.length === 0 && (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-8 text-center text-zinc-500">
          <Zap className="h-8 w-8 mx-auto mb-2 opacity-40" />
          <p>No plugs discovered.</p>
          <p className="text-xs mt-1">
            Set TAPO_CLOUD_EMAIL/PASSWORD in .env.
          </p>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {plugs.map((plug) => {
          const s = statuses[plug.device_id];
          return (
            <div
              key={plug.device_id}
              className={cn(
                "rounded-lg border p-4 transition-colors",
                s?.power_state
                  ? "border-emerald-800/50 bg-emerald-950/10"
                  : "border-zinc-800 bg-zinc-900/50",
              )}
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-sm font-medium text-white">
                    {plug.device_name || plug.device_id}
                  </div>
                  <div className="text-xs text-zinc-500">
                    {plug.device_model || "Tapo Plug"}
                  </div>
                </div>
                <div
                  className={cn(
                    "h-2.5 w-2.5 rounded-full",
                    s?.power_state ? "bg-emerald-500" : "bg-zinc-600",
                  )}
                />
              </div>

              {s && (
                <div className="space-y-1 mb-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Power</span>
                    <span className="text-white font-mono">{s.power_w.toFixed(1)} W</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Daily</span>
                    <span className="text-white font-mono">
                      {s.daily_energy_kwh != null ? `${s.daily_energy_kwh.toFixed(2)} kWh` : "--"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Voltage</span>
                    <span className="text-white font-mono">{s.voltage_v.toFixed(0)} V</span>
                  </div>
                </div>
              )}

              <button
                onClick={() => handleToggle(plug.device_id)}
                disabled={toggling === plug.device_id}
                className={cn(
                  "flex items-center justify-center gap-2 w-full py-2 rounded-md text-sm font-medium transition-colors",
                  s?.power_state
                    ? "bg-red-600/20 text-red-400 hover:bg-red-600/30"
                    : "bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30",
                )}
              >
                {toggling === plug.device_id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : s?.power_state ? (
                  <PowerOff className="h-4 w-4" />
                ) : (
                  <Power className="h-4 w-4" />
                )}
                {s?.power_state ? "Turn Off" : "Turn On"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
