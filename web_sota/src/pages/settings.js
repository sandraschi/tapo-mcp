import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { Settings, Save, Check, AlertCircle, Cpu, Wifi, WifiOff, Loader2 } from "lucide-react";
const LLM_PROVIDERS = [
    { name: "Ollama", base: "http://127.0.0.1", port: 11434, probePath: "/api/tags", modelPath: "/api/tags", modelExtractor: "models[].name" },
    { name: "LM Studio", base: "http://127.0.0.1", port: 1234, probePath: "/v1/models", modelPath: "/v1/models", modelExtractor: "data[].id" },
];
async function probeProvider(p) {
    try {
        const r = await fetch(`${p.base}:${p.port}${p.probePath}`, { signal: AbortSignal.timeout(3000) });
        return r.ok;
    }
    catch {
        return false;
    }
}
async function fetchModels(p) {
    try {
        const r = await fetch(`${p.base}:${p.port}${p.modelPath}`, { signal: AbortSignal.timeout(5000) });
        if (!r.ok)
            return [];
        const data = await r.json();
        if (p.name === "Ollama") {
            return (data.models || []).map((m) => m.name);
        }
        if (p.name === "LM Studio") {
            return (data.data || []).map((m) => m.id);
        }
        return [];
    }
    catch {
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
    const [providerStatus, setProviderStatus] = useState({});
    const [selectedProvider, setSelectedProvider] = useState(localStorage.getItem(DETECTED_PROVIDERS_KEY) || "");
    const [selectedModel, setSelectedModel] = useState(localStorage.getItem(SELECTED_MODEL_KEY) || "");
    const [availableModels, setAvailableModels] = useState([]);
    const [modelsLoading, setModelsLoading] = useState(false);
    const detectedProviders = LLM_PROVIDERS.filter((p) => providerStatus[p.name] === "detected");
    // Probe all providers on mount
    useEffect(() => {
        (async () => {
            const status = {};
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
        if (detected.length === 0)
            return;
        const saved = localStorage.getItem(DETECTED_PROVIDERS_KEY);
        const target = saved && detected.find((p) => p.name === saved) ? saved : detected[0].name;
        setSelectedProvider(target);
        loadModels(target);
    }, [providerStatus]);
    const loadModels = async (providerName) => {
        const provider = LLM_PROVIDERS.find((p) => p.name === providerName);
        if (!provider)
            return;
        setModelsLoading(true);
        const models = await fetchModels(provider);
        setAvailableModels(models);
        const savedModel = localStorage.getItem(SELECTED_MODEL_KEY);
        if (savedModel && models.includes(savedModel)) {
            setSelectedModel(savedModel);
        }
        else if (models.length > 0) {
            setSelectedModel(models[0]);
        }
        else {
            setSelectedModel("");
        }
        setModelsLoading(false);
    };
    const handleProviderChange = (name) => {
        setSelectedProvider(name);
        localStorage.setItem(DETECTED_PROVIDERS_KEY, name);
        loadModels(name);
    };
    const handleModelChange = (model) => {
        setSelectedModel(model);
        localStorage.setItem(SELECTED_MODEL_KEY, model);
    };
    const handleSaveCreds = () => {
        localStorage.setItem("tapo_cloud_email", email);
        localStorage.setItem("tapo_cloud_password", password);
        setCredsSaved(true);
        setTimeout(() => setCredsSaved(false), 2000);
    };
    return (_jsxs("div", { className: "space-y-6 max-w-lg", "data-testid": "settings-page", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold text-white", children: "Settings" }), _jsx("p", { className: "text-zinc-400", children: "Tapo cloud and device configuration" })] }), _jsxs("div", { className: "rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 space-y-4", "data-testid": "settings-credentials", children: [_jsxs("h3", { className: "text-sm font-medium text-white flex items-center gap-2", children: [_jsx(Settings, { className: "h-4 w-4 text-zinc-400" }), "Tapo Cloud Credentials"] }), _jsx("p", { className: "text-xs text-zinc-500", children: "Used for smart plug discovery via the Tapo cloud API." }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-xs text-zinc-400 mb-1", children: "Email" }), _jsx("input", { type: "email", value: email, onChange: (e) => setEmail(e.target.value), className: "w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-emerald-500", placeholder: "tapo@example.com", "data-testid": "settings-email" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs text-zinc-400 mb-1", children: "Password" }), _jsx("input", { type: "password", value: password, onChange: (e) => setPassword(e.target.value), className: "w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-emerald-500", placeholder: "Cloud account password", "data-testid": "settings-password" })] })] }), _jsx("button", { onClick: handleSaveCreds, className: "flex items-center gap-2 px-4 py-2 rounded-md bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-500 transition-colors", "data-testid": "settings-save", children: credsSaved ? _jsxs(_Fragment, { children: [_jsx(Check, { className: "h-4 w-4" }), " Saved"] }) : _jsxs(_Fragment, { children: [_jsx(Save, { className: "h-4 w-4" }), " Save"] }) })] }), _jsxs("div", { className: "rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 space-y-3", "data-testid": "settings-llm", children: [_jsxs("h3", { className: "text-sm font-medium text-white flex items-center gap-2", children: [_jsx(Cpu, { className: "h-4 w-4 text-zinc-400" }), "Local LLM"] }), _jsx("div", { className: "space-y-1.5", children: LLM_PROVIDERS.map((p) => (_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm text-zinc-300", children: p.name }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("span", { className: "text-xs text-zinc-500", children: [":", p.port] }), providerStatus[p.name] === "probing" ? (_jsx(Loader2, { className: "h-3 w-3 animate-spin text-zinc-500" })) : providerStatus[p.name] === "detected" ? (_jsxs("span", { className: "flex items-center gap-1 text-xs text-emerald-400", children: [_jsx(Wifi, { className: "h-3 w-3" }), " Detected"] })) : (_jsxs("span", { className: "flex items-center gap-1 text-xs text-zinc-500", children: [_jsx(WifiOff, { className: "h-3 w-3" }), " Not found"] }))] })] }, p.name))) }), detectedProviders.length > 0 && (_jsxs(_Fragment, { children: [_jsxs("div", { children: [_jsx("label", { className: "block text-xs text-zinc-400 mb-1", children: "Provider" }), _jsx("select", { value: selectedProvider, onChange: (e) => handleProviderChange(e.target.value), className: "w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500", "data-testid": "llm-provider-select", children: detectedProviders.map((p) => (_jsxs("option", { value: p.name, children: [p.name, " (", p.base, ":", p.port, ")"] }, p.name))) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs text-zinc-400 mb-1", children: "Model" }), _jsx("select", { value: selectedModel, onChange: (e) => handleModelChange(e.target.value), disabled: modelsLoading || availableModels.length === 0, className: "w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-50", "data-testid": "llm-model-select", children: modelsLoading ? (_jsx("option", { children: "Loading models..." })) : availableModels.length === 0 ? (_jsx("option", { children: "No models found" })) : (availableModels.map((m) => _jsx("option", { value: m, children: m }, m))) })] })] })), detectedProviders.length === 0 && (_jsxs("p", { className: "text-xs text-amber-500 flex items-center gap-1", children: [_jsx(AlertCircle, { className: "h-3 w-3" }), "Install Ollama or LM Studio to enable AI features."] }))] }), _jsxs("div", { className: "rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 space-y-3", "data-testid": "settings-about", children: [_jsxs("h3", { className: "text-sm font-medium text-white flex items-center gap-2", children: [_jsx(AlertCircle, { className: "h-4 w-4 text-zinc-400" }), "About"] }), _jsxs("div", { className: "text-xs text-zinc-500 space-y-1", children: [_jsxs("p", { children: [_jsx("strong", { children: "tapo-mcp" }), " v0.1.0"] }), _jsx("p", { children: "TP-Link Tapo camera and smart plug management via MCP." }), _jsx("p", { children: "Backend port: 11102 | Frontend port: 11103" })] })] })] }));
}
