import { useEffect, useState } from "react";
import {
  Camera,
  RefreshCw,
  Loader2,
  Eye,
  EyeOff,
  Sun,
  Moon,
  MoveUp,
  MoveDown,
  MoveLeft,
  MoveRight,
} from "lucide-react";
import {
  type CameraDevice,
  getCameras,
  ptzMove,
  togglePrivacyMode,
  toggleLed,
} from "../common/api";

export function Cameras() {
  const [cameras, setCameras] = useState<CameraDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      const res = await getCameras();
      setCameras(res.cameras);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handlePtz = async (id: string, dir: string) => {
    setRefreshing(id);
    try {
      await ptzMove(id, dir);
    } catch { /* ignore */ }
    setRefreshing(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 p-12 text-zinc-400">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span>Loading cameras...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-800 bg-red-950/30 p-4 text-red-200">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Cameras</h2>
          <p className="text-zinc-400">{cameras.length} registered</p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-1 text-sm text-zinc-400 hover:text-white transition-colors"
        >
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      {cameras.length === 0 && (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-8 text-center text-zinc-500">
          <Camera className="h-8 w-8 mx-auto mb-2 opacity-40" />
          <p>No cameras registered.</p>
          <p className="text-xs mt-1">
            Set TAPO_CAMERA_HOST/PASSWORD in .env or use the Settings page.
          </p>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {cameras.map((cam) => (
          <div
            key={cam.id}
            className="rounded-lg border border-zinc-800 bg-zinc-900/50 overflow-hidden"
          >
            <div className="aspect-video bg-zinc-800 flex items-center justify-center">
              <img
                src={`/api/cameras/${encodeURIComponent(cam.id)}/snapshot`}
                alt={cam.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                  (e.target as HTMLImageElement).parentElement!.innerHTML =
                    '<div class="text-zinc-600"><Camera class="h-8 w-8 mx-auto" /></div>';
                }}
              />
            </div>
            <div className="p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-white">{cam.name}</span>
                <span className="text-xs text-zinc-500">{cam.host}</span>
              </div>
              <div className="flex gap-1">
                {["up", "down", "left", "right"].map((dir) => (
                  <button
                    key={dir}
                    onClick={() => handlePtz(cam.id, dir)}
                    disabled={refreshing === cam.id}
                    className="p-1.5 rounded bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors disabled:opacity-50"
                    title={`Move ${dir}`}
                  >
                    {dir === "up" && <MoveUp className="h-3.5 w-3.5" />}
                    {dir === "down" && <MoveDown className="h-3.5 w-3.5" />}
                    {dir === "left" && <MoveLeft className="h-3.5 w-3.5" />}
                    {dir === "right" && <MoveRight className="h-3.5 w-3.5" />}
                  </button>
                ))}
                <div className="ml-auto flex gap-1">
                  <button
                    onClick={() => togglePrivacyMode(cam.id, true)}
                    className="p-1.5 rounded bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
                    title="Privacy mode on"
                  >
                    <EyeOff className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => togglePrivacyMode(cam.id, false)}
                    className="p-1.5 rounded bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
                    title="Privacy mode off"
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => toggleLed(cam.id, true)}
                    className="p-1.5 rounded bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
                    title="LED on"
                  >
                    <Sun className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => toggleLed(cam.id, false)}
                    className="p-1.5 rounded bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
                    title="LED off"
                  >
                    <Moon className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
