import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { Settings, Save, Check, AlertCircle, Cpu, Wifi, WifiOff } from "lucide-react";
const LLM_PROVIDERS = [
    { name: "Ollama", base: "http://127.0.0.1", port: 11434 },
    { name: "LM Studio", base: "http://127.0.0.1", port: 1234 },
];
async function probeProvider(p) {
    try {
        const r = await fetch(`${p.base}:${p.port}/api/tags`, { signal: AbortSignal.timeout(3000) });
        return r.ok;
    }
    catch {
        return false;
    }
}
export function SettingsPage() {
    const [email, setEmail] = useState(localStorage.getItem("tapo_cloud_email") || "");
    const [password, setPassword] = useState(localStorage.getItem("tapo_cloud_password") || "");
    const [saved, setSaved] = useState(false);
    const [providers, setProviders] = useState({});
    useEffect(() => {
        (async () => {
            const results = {};
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
    return (_jsxs("div", { className: "space-y-6 max-w-lg", "data-testid": "settings-page", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold text-white", children: "Settings" }), _jsx("p", { className: "text-zinc-400", children: "Tapo cloud and device configuration" })] }), _jsxs("div", { className: "rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 space-y-4", "data-testid": "settings-credentials", children: [_jsxs("h3", { className: "text-sm font-medium text-white flex items-center gap-2", children: [_jsx(Settings, { className: "h-4 w-4 text-zinc-400" }), "Tapo Cloud Credentials"] }), _jsx("p", { className: "text-xs text-zinc-500", children: "Used for smart plug discovery and control via the Tapo cloud API." }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-xs text-zinc-400 mb-1", children: "Email" }), _jsx("input", { type: "email", value: email, onChange: (e) => setEmail(e.target.value), className: "w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-emerald-500", placeholder: "tapo@example.com", "data-testid": "settings-email" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs text-zinc-400 mb-1", children: "Password" }), _jsx("input", { type: "password", value: password, onChange: (e) => setPassword(e.target.value), className: "w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-emerald-500", placeholder: "Cloud account password", "data-testid": "settings-password" })] })] }), _jsx("button", { onClick: handleSave, className: "flex items-center gap-2 px-4 py-2 rounded-md bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-500 transition-colors", "data-testid": "settings-save", children: saved ? (_jsxs(_Fragment, { children: [_jsx(Check, { className: "h-4 w-4" }), " Saved"] })) : (_jsxs(_Fragment, { children: [_jsx(Save, { className: "h-4 w-4" }), " Save"] })) })] }), _jsxs("div", { className: "rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 space-y-3", "data-testid": "settings-llm", children: [_jsxs("h3", { className: "text-sm font-medium text-white flex items-center gap-2", children: [_jsx(Cpu, { className: "h-4 w-4 text-zinc-400" }), "Local LLM Detection"] }), _jsx("p", { className: "text-xs text-zinc-500", children: "Auto-detected inference engines on standard ports." }), _jsx("div", { className: "space-y-2", children: LLM_PROVIDERS.map((p) => (_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm text-zinc-300", children: p.name }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("span", { className: "text-xs text-zinc-500", children: [":", p.port] }), providers[p.name] === undefined ? (_jsx("div", { className: "h-2 w-2 rounded-full bg-zinc-600 animate-pulse" })) : providers[p.name] ? (_jsxs("div", { className: "flex items-center gap-1 text-xs text-emerald-400", children: [_jsx(Wifi, { className: "h-3 w-3" }), " Detected"] })) : (_jsxs("div", { className: "flex items-center gap-1 text-xs text-zinc-500", children: [_jsx(WifiOff, { className: "h-3 w-3" }), " Not found"] }))] })] }, p.name))) }), !providers["Ollama"] && !providers["LM Studio"] && (_jsxs("p", { className: "text-xs text-amber-500 flex items-center gap-1", children: [_jsx(AlertCircle, { className: "h-3 w-3" }), "Install Ollama or LM Studio to enable AI features."] }))] }), _jsxs("div", { className: "rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 space-y-3", "data-testid": "settings-about", children: [_jsxs("h3", { className: "text-sm font-medium text-white flex items-center gap-2", children: [_jsx(AlertCircle, { className: "h-4 w-4 text-zinc-400" }), "About"] }), _jsxs("div", { className: "text-xs text-zinc-500 space-y-1", children: [_jsxs("p", { children: [_jsx("strong", { children: "tapo-mcp" }), " v0.1.0"] }), _jsx("p", { children: "TP-Link Tapo camera and smart plug management via MCP." }), _jsx("p", { children: "Backend port: 11102 | Frontend port: 11103" })] })] })] }));
}
