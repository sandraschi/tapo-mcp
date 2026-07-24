import { useEffect, useState } from "react";
import { Camera, Zap, Activity, Wifi } from "lucide-react";
import { getCameras, getPlugs, getHealth } from "../common/api";
import { cn } from "../common/utils";

export function Dashboard() {
  const [health, setHealth] = useState<boolean | null>(null);
  const [cameraCount, setCameraCount] = useState(0);
  const [plugCount, setPlugCount] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const h = await getHealth();
        setHealth(h.success && h.status === "online");
        if (!h.success) return;
        const [cams, plugs] = await Promise.all([getCameras(), getPlugs()]);
        setCameraCount(cams.count);
        setPlugCount(plugs.count);
      } catch {
        setHealth(false);
      }
    })();
  }, []);

  const cards = [
    {
      title: "Cameras",
      value: cameraCount,
      icon: Camera,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      title: "Plugs",
      value: plugCount,
      icon: Zap,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
    },
    {
      title: "Backend",
      value: health === null ? "..." : health ? "Online" : "Offline",
      icon: Activity,
      color: health ? "text-emerald-400" : "text-red-400",
      bg: health ? "bg-emerald-500/10" : "bg-red-500/10",
    },
  ];

  return (
    <div className="space-y-6" data-testid="dashboard">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">Dashboard</h2>
        <p className="text-zinc-400">Tapo device overview</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3" data-testid="kpi-grid">
        {cards.map((c) => (
          <div
            key={c.title}
            className={cn(
              "rounded-lg border border-zinc-800 p-5",
              c.bg,
            )}
            data-testid={`kpi-${c.title.toLowerCase()}`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-zinc-400">{c.title}</span>
              <c.icon className={cn("h-5 w-5", c.color)} />
            </div>
            <div className={cn("text-3xl font-bold", c.color)}>
              {c.value}
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 text-sm text-zinc-500" data-testid="backend-status">
        <Wifi className="h-4 w-4" />
        {health ? "Connected to backend" : health === null ? "Connecting..." : "Offline"}
      </div>
    </div>
  );
}
