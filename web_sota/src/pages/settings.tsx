import { useEffect, useState } from "react";
import { Settings, Save, Check, AlertCircle, Cpu, Wifi, WifiOff } from "lucide-react";

interface LLMProvider {
  name: string;
  base: string;
  port: number;
}

const LLM_PROVIDERS: LLMProvider[] = [
  { name: "Ollama", base: "http://127.0.0.1", port: 11434 },
  { name: "LM Studio", base: "http://127.0.0.1", port: 1234 },
];

async function probeProvider(p: LLMProvider): Promise<boolean> {
  try {
    const r = await fetch(`${p.base}:${p.port}/api/tags`, { signal: AbortSignal.timeout(3000) });
    return r.ok;
  } catch {
    return false;
  }
}

export function SettingsPage() {
  const [email, setEmail] = useState(localStorage.getItem("tapo_cloud_email") || "");
  const [password, setPassword] = useState(localStorage.getItem("tapo_cloud_password") || "");
  const [saved, setSaved] = useState(false);
  const [providers, setProviders] = useState<Record<string, boolean>>({});

  useEffect(() => {
    (async () => {
      const results: Record<string, boolean> = {};
      for (const p of LLM_PROVIDERS) {
        results[p.name] = await probeProvider(p);
      }
      setProviders(results);
    })();
  }, []);

  const handleSave = () => {
    localStorage.setItem("tapo_cloud_email", email);
    localStorage.setItem("tapo_cloud_password", password);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-lg" data-testid="settings-page">
      <div>
        <h2 className="text-2xl font-bold text-white">Settings</h2>
        <p className="text-zinc-400">Tapo cloud and device configuration</p>
      </div>

      {/* Tapo Credentials */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 space-y-4" data-testid="settings-credentials">
        <h3 className="text-sm font-medium text-white flex items-center gap-2">
          <Settings className="h-4 w-4 text-zinc-400" />
          Tapo Cloud Credentials
        </h3>
        <p className="text-xs text-zinc-500">
          Used for smart plug discovery and control via the Tapo cloud API.
        </p>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              placeholder="tapo@example.com"
              data-testid="settings-email"
            />
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              placeholder="Cloud account password"
              data-testid="settings-password"
            />
          </div>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 rounded-md bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-500 transition-colors"
          data-testid="settings-save"
        >
          {saved ? (
            <><Check className="h-4 w-4" /> Saved</>
          ) : (
            <><Save className="h-4 w-4" /> Save</>
          )}
        </button>
      </div>

      {/* Local LLM Detection */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 space-y-3" data-testid="settings-llm">
        <h3 className="text-sm font-medium text-white flex items-center gap-2">
          <Cpu className="h-4 w-4 text-zinc-400" />
          Local LLM Detection
        </h3>
        <p className="text-xs text-zinc-500">
          Auto-detected inference engines on standard ports.
        </p>
        <div className="space-y-2">
          {LLM_PROVIDERS.map((p) => (
            <div key={p.name} className="flex items-center justify-between">
              <span className="text-sm text-zinc-300">{p.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-500">:{p.port}</span>
                {providers[p.name] === undefined ? (
                  <div className="h-2 w-2 rounded-full bg-zinc-600 animate-pulse" />
                ) : providers[p.name] ? (
                  <div className="flex items-center gap-1 text-xs text-emerald-400">
                    <Wifi className="h-3 w-3" /> Detected
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-xs text-zinc-500">
                    <WifiOff className="h-3 w-3" /> Not found
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        {!providers["Ollama"] && !providers["LM Studio"] && (
          <p className="text-xs text-amber-500 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            Install Ollama or LM Studio to enable AI features.
          </p>
        )}
      </div>

      {/* About */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 space-y-3" data-testid="settings-about">
        <h3 className="text-sm font-medium text-white flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-zinc-400" />
          About
        </h3>
        <div className="text-xs text-zinc-500 space-y-1">
          <p><strong>tapo-mcp</strong> v0.1.0</p>
          <p>TP-Link Tapo camera and smart plug management via MCP.</p>
          <p>Backend port: 11102 | Frontend port: 11103</p>
        </div>
      </div>
    </div>
  );
}
