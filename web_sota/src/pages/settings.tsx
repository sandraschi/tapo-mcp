import { useEffect, useState } from "react";
import { Settings, Save, Check, AlertCircle, Cpu, Wifi, WifiOff, Loader2 } from "lucide-react";

interface LLMProvider {
  name: string;
  base: string;
  port: number;
  probePath: string;
  modelPath: string;
  modelExtractor: string; // JSON path to model list
}

const LLM_PROVIDERS: LLMProvider[] = [
  { name: "Ollama", base: "http://127.0.0.1", port: 11434, probePath: "/api/tags", modelPath: "/api/tags", modelExtractor: "models[].name" },
  { name: "LM Studio", base: "http://127.0.0.1", port: 1234, probePath: "/v1/models", modelPath: "/v1/models", modelExtractor: "data[].id" },
];

async function probeProvider(p: LLMProvider): Promise<boolean> {
  try {
    const r = await fetch(`${p.base}:${p.port}${p.probePath}`, { signal: AbortSignal.timeout(3000) });
    return r.ok;
  } catch {
    return false;
  }
}

async function fetchModels(p: LLMProvider): Promise<string[]> {
  try {
    const r = await fetch(`${p.base}:${p.port}${p.modelPath}`, { signal: AbortSignal.timeout(5000) });
    if (!r.ok) return [];
    const data = await r.json();
    if (p.name === "Ollama") {
      return (data.models || []).map((m: { name: string }) => m.name);
    }
    if (p.name === "LM Studio") {
      return (data.data || []).map((m: { id: string }) => m.id);
    }
    return [];
  } catch {
    return [];
  }
}

const DETECTED_PROVIDERS_KEY = "llm_provider";
const SELECTED_MODEL_KEY = "llm_model";

export function SettingsPage() {
  const [email, setEmail] = useState(localStorage.getItem("tapo_cloud_email") || "");
  const [password, setPassword] = useState(localStorage.getItem("tapo_cloud_password") || "");
  const [credsSaved, setCredsSaved] = useState(false);

  // LLM state
  const [providerStatus, setProviderStatus] = useState<Record<string, "probing" | "detected" | "not_found">>({});
  const [selectedProvider, setSelectedProvider] = useState(localStorage.getItem(DETECTED_PROVIDERS_KEY) || "");
  const [selectedModel, setSelectedModel] = useState(localStorage.getItem(SELECTED_MODEL_KEY) || "");
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [modelsLoading, setModelsLoading] = useState(false);

  const detectedProviders = LLM_PROVIDERS.filter((p) => providerStatus[p.name] === "detected");

  // Probe all providers on mount
  useEffect(() => {
    (async () => {
      const status: Record<string, "probing" | "detected" | "not_found"> = {};
      for (const p of LLM_PROVIDERS) {
        status[p.name] = "probing";
      }
      setProviderStatus({ ...status });

      for (const p of LLM_PROVIDERS) {
        const ok = await probeProvider(p);
        status[p.name] = ok ? "detected" : "not_found";
        setProviderStatus({ ...status });
      }
    })();
  }, []);

  // After detection settles, set default provider + fetch models
  useEffect(() => {
    const detected = LLM_PROVIDERS.filter((p) => providerStatus[p.name] === "detected");
    if (detected.length === 0) return;

    const saved = localStorage.getItem(DETECTED_PROVIDERS_KEY);
    const target = saved && detected.find((p) => p.name === saved) ? saved : detected[0].name;

    setSelectedProvider(target);
    loadModels(target);
  }, [providerStatus]);

  const loadModels = async (providerName: string) => {
    const provider = LLM_PROVIDERS.find((p) => p.name === providerName);
    if (!provider) return;

    setModelsLoading(true);
    const models = await fetchModels(provider);
    setAvailableModels(models);

    const savedModel = localStorage.getItem(SELECTED_MODEL_KEY);
    if (savedModel && models.includes(savedModel)) {
      setSelectedModel(savedModel);
    } else if (models.length > 0) {
      setSelectedModel(models[0]);
    } else {
      setSelectedModel("");
    }
    setModelsLoading(false);
  };

  const handleProviderChange = (name: string) => {
    setSelectedProvider(name);
    localStorage.setItem(DETECTED_PROVIDERS_KEY, name);
    loadModels(name);
  };

  const handleModelChange = (model: string) => {
    setSelectedModel(model);
    localStorage.setItem(SELECTED_MODEL_KEY, model);
  };

  const handleSaveCreds = () => {
    localStorage.setItem("tapo_cloud_email", email);
    localStorage.setItem("tapo_cloud_password", password);
    setCredsSaved(true);
    setTimeout(() => setCredsSaved(false), 2000);
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
        <p className="text-xs text-zinc-500">Used for smart plug discovery via the Tapo cloud API.</p>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              placeholder="tapo@example.com" data-testid="settings-email" />
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              placeholder="Cloud account password" data-testid="settings-password" />
          </div>
        </div>
        <button onClick={handleSaveCreds}
          className="flex items-center gap-2 px-4 py-2 rounded-md bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-500 transition-colors"
          data-testid="settings-save">
          {credsSaved ? <><Check className="h-4 w-4" /> Saved</> : <><Save className="h-4 w-4" /> Save</>}
        </button>
      </div>

      {/* Local LLM — Provider Detection + Selection */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 space-y-3" data-testid="settings-llm">
        <h3 className="text-sm font-medium text-white flex items-center gap-2">
          <Cpu className="h-4 w-4 text-zinc-400" />
          Local LLM
        </h3>

        {/* Provider status badges */}
        <div className="space-y-1.5">
          {LLM_PROVIDERS.map((p) => (
            <div key={p.name} className="flex items-center justify-between">
              <span className="text-sm text-zinc-300">{p.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-500">:{p.port}</span>
                {providerStatus[p.name] === "probing" ? (
                  <Loader2 className="h-3 w-3 animate-spin text-zinc-500" />
                ) : providerStatus[p.name] === "detected" ? (
                  <span className="flex items-center gap-1 text-xs text-emerald-400">
                    <Wifi className="h-3 w-3" /> Detected
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs text-zinc-500">
                    <WifiOff className="h-3 w-3" /> Not found
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Provider dropdown */}
        {detectedProviders.length > 0 && (
          <>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Provider</label>
              <select
                value={selectedProvider}
                onChange={(e) => handleProviderChange(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                data-testid="llm-provider-select"
              >
                {detectedProviders.map((p) => (
                  <option key={p.name} value={p.name}>{p.name} ({p.base}:{p.port})</option>
                ))}
              </select>
            </div>

            {/* Model dropdown */}
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Model</label>
              <select
                value={selectedModel}
                onChange={(e) => handleModelChange(e.target.value)}
                disabled={modelsLoading || availableModels.length === 0}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-50"
                data-testid="llm-model-select"
              >
                {modelsLoading ? (
                  <option>Loading models...</option>
                ) : availableModels.length === 0 ? (
                  <option>No models found</option>
                ) : (
                  availableModels.map((m) => <option key={m} value={m}>{m}</option>)
                )}
              </select>
            </div>
          </>
        )}

        {/* No provider prompt */}
        {detectedProviders.length === 0 && (
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
