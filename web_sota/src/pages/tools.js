import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Code2, Loader2, ChevronDown, ChevronRight, Terminal } from "lucide-react";
export function ToolsPage() {
    const [tools, setTools] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [expanded, setExpanded] = useState(null);
    useEffect(() => {
        (async () => {
            try {
                const r = await fetch("/api/v1/diagnostics");
                const data = await r.json();
                if (data.tools) {
                    setTools(data.tools);
                }
                else {
                    // Fallback: try MCP tools list via proxy
                    const r2 = await fetch("/api/health");
                    if (r2.ok)
                        setTools([{ name: "tapo_plug", description: "Smart plug management" }, { name: "tapo_camera", description: "Camera management" }, { name: "tapo_register_camera", description: "Register a camera" }]);
                }
            }
            catch (e) {
                setError(e.message);
            }
            finally {
                setLoading(false);
            }
        })();
    }, []);
    if (loading) {
        return (_jsxs("div", { className: "flex items-center justify-center gap-2 p-12 text-zinc-400", children: [_jsx(Loader2, { className: "h-6 w-6 animate-spin" }), _jsx("span", { children: "Discovering tools..." })] }));
    }
    if (error) {
        return (_jsx("div", { className: "rounded-lg border border-red-800 bg-red-950/30 p-4 text-red-200", "data-testid": "tools-error", children: error }));
    }
    return (_jsxs("div", { className: "space-y-6", "data-testid": "tools-page", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold tracking-tight text-white", children: "Tools" }), _jsx("p", { className: "text-zinc-400", children: "MCP tools registered by the server" })] }), _jsx("div", { className: "grid gap-3", children: tools.map((tool, i) => (_jsxs(motion.div, { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.05 }, className: "rounded-lg border border-zinc-800 bg-zinc-900/50 overflow-hidden", "data-testid": `tool-card-${tool.name}`, children: [_jsxs("button", { onClick: () => setExpanded(expanded === tool.name ? null : tool.name), className: "flex items-center justify-between w-full px-4 py-3 hover:bg-zinc-800/50 transition-colors", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Code2, { className: "h-4 w-4 text-emerald-400 shrink-0" }), _jsx("span", { className: "text-sm font-medium text-white", children: tool.name })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-xs text-zinc-500", children: "portmanteau" }), expanded === tool.name ? (_jsx(ChevronDown, { className: "h-4 w-4 text-zinc-400" })) : (_jsx(ChevronRight, { className: "h-4 w-4 text-zinc-400" }))] })] }), expanded === tool.name && (_jsxs("div", { className: "px-4 pb-4 pt-0 border-t border-zinc-800/50 mt-0", children: [tool.description && (_jsx("p", { className: "text-sm text-zinc-400 mt-3 mb-3", children: tool.description })), tool.inputSchema?.properties && (_jsxs("div", { className: "space-y-1.5", children: [_jsx("span", { className: "text-xs font-medium text-zinc-500 uppercase tracking-wide", children: "Parameters" }), Object.entries(tool.inputSchema.properties).map(([key, val]) => (_jsxs("div", { className: "flex items-start gap-2 text-xs", children: [_jsx("span", { className: "font-mono text-emerald-400 shrink-0", children: key }), _jsx("span", { className: "text-zinc-500", children: val.description || "" })] }, key)))] }))] }))] }, tool.name))) }), tools.length === 0 && (_jsxs("div", { className: "rounded-lg border border-zinc-800 bg-zinc-900/50 p-8 text-center text-zinc-500", children: [_jsx(Terminal, { className: "h-8 w-8 mx-auto mb-2 opacity-40" }), _jsx("p", { children: "No tools discovered." })] }))] }));
}
