import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useRef, useState } from "react";
import { Send, Download, Trash2, Bot, User, Sparkles, Loader2, Wifi, WifiOff } from "lucide-react";
import { cn } from "../common/utils";
const LS_HISTORY = "tapo-mcp-chat-history";
const LS_PERSONALITY = "tapo-mcp-chat-personality";
const PERSONALITIES = {
    "device-expert": {
        prompt: "You are a Tapo device expert. Answer questions about Tapo cameras and smart plugs, explain features, and suggest configurations. Be concise and practical.",
        icon: "Device Expert",
    },
    "troubleshooter": {
        prompt: "You are a technical troubleshooter. Help diagnose issues with Tapo devices: connectivity problems, PTZ calibration, power monitoring inaccuracies. Ask clarifying questions before suggesting fixes.",
        icon: "Troubleshooter",
    },
    "energy-analyst": {
        prompt: "You are an energy analyst specializing in home power monitoring. Interpret smart plug energy data, identify consumption patterns, and suggest efficiency improvements. Reference typical appliance power draws.",
        icon: "Energy Analyst",
    },
    "custom": {
        prompt: "",
        icon: "Custom",
    },
};
const EXAMPLE_PROMPTS = [
    { group: "Devices", prompts: [
            "What Tapo cameras support PTZ?",
            "How do I reset my Tapo C200 to factory settings?",
            "Explain the difference between P110 and P115 plugs",
        ] },
    { group: "Energy", prompts: [
            "How much power does a typical gaming PC draw?",
            "What's a good daily energy baseline for a home office?",
            "How can I reduce standby power consumption?",
        ] },
    { group: "Network", prompts: [
            "My camera keeps disconnecting from Wi-Fi",
            "Can Tapo plugs work without cloud access?",
            "What's the range of a Tapo camera on 2.4GHz?",
        ] },
];
function buildSystemPrompt(personalityId, customPrompt) {
    if (personalityId === "custom")
        return customPrompt || "You are a helpful assistant for Tapo device management.";
    const p = PERSONALITIES[personalityId];
    return p ? p.prompt : "You are a helpful assistant for Tapo device management.";
}
function formatTime(ts) {
    try {
        return new Date(ts).toLocaleTimeString("de-AT", { hour: "2-digit", minute: "2-digit" });
    }
    catch {
        return ts;
    }
}
export function Chat() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [personalityId, setPersonalityId] = useState(localStorage.getItem(LS_PERSONALITY) || "device-expert");
    const [customPrompt, setCustomPrompt] = useState(localStorage.getItem("tapo-mcp-chat-custom-prompt") || "");
    const [showCustom, setShowCustom] = useState(false);
    const [provider, setProvider] = useState(localStorage.getItem("llm_provider") || "");
    const [model, setModel] = useState(localStorage.getItem("llm_model") || "");
    const endRef = useRef(null);
    const inputRef = useRef(null);
    // Load history on mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem(LS_HISTORY);
            if (saved)
                setMessages(JSON.parse(saved));
        }
        catch { /* ignore */ }
    }, []);
    // Save history on change
    useEffect(() => {
        localStorage.setItem(LS_HISTORY, JSON.stringify(messages.slice(-100)));
    }, [messages]);
    // Scroll to bottom
    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);
    // Poll provider/model from localStorage (set by Settings page)
    useEffect(() => {
        const iv = setInterval(() => {
            const p = localStorage.getItem("llm_provider") || "";
            const m = localStorage.getItem("llm_model") || "";
            if (p !== provider)
                setProvider(p);
            if (m !== model)
                setModel(m);
        }, 3000);
        return () => clearInterval(iv);
    }, [provider, model]);
    const handlePersonalityChange = (id) => {
        setPersonalityId(id);
        localStorage.setItem(LS_PERSONALITY, id);
        setShowCustom(id === "custom");
    };
    const handleCustomPromptChange = (v) => {
        setCustomPrompt(v);
        localStorage.setItem("tapo-mcp-chat-custom-prompt", v);
    };
    const sendMessage = useCallback(async () => {
        const text = input.trim();
        if (!text)
            return;
        setInput("");
        const userMsg = { role: "user", content: text, ts: new Date().toISOString() };
        const updated = [...messages, userMsg];
        setMessages(updated);
        setLoading(true);
        try {
            const systemPrompt = buildSystemPrompt(personalityId, customPrompt);
            const providerName = localStorage.getItem("llm_provider") || "ollama";
            const modelName = localStorage.getItem("llm_model") || "";
            const port = providerName === "LM Studio" ? 1234 : 11434;
            const body = {
                model: modelName || "llama3.2",
                messages: [
                    { role: "system", content: systemPrompt },
                    ...updated.map((m) => ({ role: m.role, content: m.content })),
                ],
                stream: false,
            };
            let reply = "";
            try {
                const r = await fetch(`http://127.0.0.1:${port}/v1/chat/completions`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(body),
                    signal: AbortSignal.timeout(30000),
                });
                if (r.ok) {
                    const data = await r.json();
                    reply = data.choices?.[0]?.message?.content || "(empty response)";
                }
                else {
                    reply = `LLM returned HTTP ${r.status}. Is ${providerName} running?`;
                }
            }
            catch {
                reply = `Could not reach ${providerName} on port ${port}. Start the service or check Settings.`;
            }
            const assistantMsg = { role: "assistant", content: reply, ts: new Date().toISOString() };
            setMessages((prev) => [...prev, assistantMsg]);
        }
        finally {
            setLoading(false);
        }
    }, [input, messages, personalityId, customPrompt]);
    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };
    const handleExport = () => {
        const lines = messages.map((m) => `[${formatTime(m.ts || "")}] ${m.role === "user" ? "You" : "Assistant"}: ${m.content}`);
        const blob = new Blob([lines.join("\n")], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `tapo-mcp-chat-${new Date().toISOString().slice(0, 10)}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };
    const handleClear = () => {
        setMessages([]);
        localStorage.removeItem(LS_HISTORY);
    };
    const hasProvider = !!provider;
    return (_jsxs("div", { className: "flex flex-col h-full", "data-testid": "chat-page", children: [_jsxs("div", { className: "flex items-center gap-3 pb-4 border-b border-zinc-800 flex-wrap", "data-testid": "chat-controls", children: [_jsxs("div", { className: "flex items-center gap-1.5", children: [_jsx("span", { className: "text-xs text-zinc-500", children: "skill:" }), _jsx("span", { className: "text-xs font-medium text-emerald-400", children: "tapo-device" })] }), _jsx("select", { value: personalityId, onChange: (e) => handlePersonalityChange(e.target.value), className: "bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-300", "data-testid": "personality-select", children: Object.entries(PERSONALITIES).map(([id, p]) => (_jsx("option", { value: id, children: p.icon }, id))) }), showCustom && (_jsx("input", { value: customPrompt, onChange: (e) => handleCustomPromptChange(e.target.value), placeholder: "Custom system prompt...", className: "flex-1 bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-300 min-w-[200px]" })), _jsxs("div", { className: "ml-auto flex items-center gap-2", children: [_jsxs("div", { className: cn("flex items-center gap-1 text-xs", hasProvider ? "text-emerald-400" : "text-zinc-500"), children: [hasProvider ? _jsx(Wifi, { className: "h-3 w-3" }) : _jsx(WifiOff, { className: "h-3 w-3" }), _jsx("span", { className: "hidden sm:inline", children: provider || "No LLM" })] }), _jsx("button", { onClick: handleExport, disabled: messages.length === 0, className: "p-1.5 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors disabled:opacity-30", "data-testid": "chat-export", title: "Export chat", children: _jsx(Download, { className: "h-4 w-4" }) }), _jsx("button", { onClick: handleClear, disabled: messages.length === 0, className: "p-1.5 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors disabled:opacity-30", "data-testid": "chat-clear", title: "Clear chat", children: _jsx(Trash2, { className: "h-4 w-4" }) })] })] }), _jsxs("div", { className: "flex-1 overflow-y-auto py-4 space-y-4", "data-testid": "chat-messages", children: [messages.length === 0 && (_jsxs("div", { className: "flex flex-col items-center justify-center h-full text-zinc-500 space-y-4", children: [_jsx(Sparkles, { className: "h-8 w-8 opacity-40" }), _jsx("p", { className: "text-sm", children: "Ask about Tapo cameras, plugs, or energy monitoring." }), _jsx("div", { className: "w-full max-w-lg space-y-3", "data-testid": "example-prompts", children: EXAMPLE_PROMPTS.map((group) => (_jsxs("div", { children: [_jsx("p", { className: "text-xs text-zinc-600 mb-1.5 font-medium", children: group.group }), _jsx("div", { className: "flex flex-wrap gap-1.5", children: group.prompts.map((p) => (_jsx("button", { onClick: () => { setInput(p); inputRef.current?.focus(); }, className: "px-2.5 py-1 rounded-full bg-zinc-800 border border-zinc-700 text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700 transition-colors", children: p }, p))) })] }, group.group))) })] })), messages.map((msg, i) => (_jsx("div", { className: cn("flex gap-3", msg.role === "user" ? "justify-end" : "justify-start"), children: _jsxs("div", { className: cn("max-w-[75%] rounded-xl px-4 py-2.5 text-sm", msg.role === "user"
                                ? "bg-emerald-600/20 text-zinc-100 border border-emerald-800/30"
                                : "bg-zinc-900 border border-zinc-800 text-zinc-300"), children: [_jsxs("div", { className: "text-xs text-zinc-500 mb-1 flex items-center gap-1.5", children: [msg.role === "user" ? _jsx(User, { className: "h-3 w-3" }) : _jsx(Bot, { className: "h-3 w-3" }), msg.role === "user" ? "You" : "Assistant", msg.ts && _jsx("span", { className: "ml-auto", children: formatTime(msg.ts) })] }), _jsx("div", { className: "whitespace-pre-wrap", children: msg.content })] }) }, i))), loading && (_jsxs("div", { className: "flex items-center gap-2 text-sm text-zinc-500", children: [_jsx(Loader2, { className: "h-4 w-4 animate-spin" }), "Thinking..."] })), _jsx("div", { ref: endRef })] }), _jsx("div", { className: "pt-3 border-t border-zinc-800", children: _jsxs("div", { className: "flex gap-2", children: [_jsx("textarea", { ref: inputRef, value: input, onChange: (e) => setInput(e.target.value), onKeyDown: handleKeyDown, placeholder: hasProvider ? "Ask about your Tapo devices..." : "No local LLM detected. Configure in Settings.", disabled: loading, rows: 1, className: "flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-zinc-500 resize-none focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-50", "data-testid": "chat-input" }), _jsx("button", { onClick: sendMessage, disabled: loading || !input.trim(), className: "p-2.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 transition-colors disabled:opacity-40", "data-testid": "chat-send", children: _jsx(Send, { className: "h-4 w-4" }) })] }) })] }));
}
