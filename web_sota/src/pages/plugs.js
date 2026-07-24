import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { Zap, Power, PowerOff, Loader2, RefreshCw, } from "lucide-react";
import { getPlugs, getPlugStatus, togglePlug, } from "../common/api";
import { cn } from "../common/utils";
export function Plugs() {
    const [plugs, setPlugs] = useState([]);
    const [statuses, setStatuses] = useState({});
    const [loading, setLoading] = useState(true);
    const [toggling, setToggling] = useState(null);
    const load = async () => {
        try {
            setLoading(true);
            const res = await getPlugs();
            setPlugs(res.devices);
            const s = {};
            for (const d of res.devices) {
                try {
                    const stat = await getPlugStatus(d.device_id);
                    s[d.device_id] = stat.device;
                }
                catch { /* skip */ }
            }
            setStatuses(s);
        }
        catch { /* ignore */ }
        setLoading(false);
    };
    useEffect(() => {
        load();
    }, []);
    const handleToggle = async (id) => {
        setToggling(id);
        try {
            const r = await togglePlug(id);
            setStatuses((prev) => ({
                ...prev,
                [id]: { ...prev[id], power_state: r.power_state },
            }));
        }
        catch { /* ignore */ }
        setToggling(null);
    };
    if (loading) {
        return (_jsxs("div", { className: "flex items-center justify-center gap-2 p-12 text-zinc-400", children: [_jsx(Loader2, { className: "h-6 w-6 animate-spin" }), _jsx("span", { children: "Loading plugs..." })] }));
    }
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold text-white", children: "Smart Plugs" }), _jsxs("p", { className: "text-zinc-400", children: [plugs.length, " devices"] })] }), _jsxs("button", { onClick: load, className: "flex items-center gap-1 text-sm text-zinc-400 hover:text-white transition-colors", children: [_jsx(RefreshCw, { className: "h-4 w-4" }), " Refresh"] })] }), plugs.length === 0 && (_jsxs("div", { className: "rounded-lg border border-zinc-800 bg-zinc-900/50 p-8 text-center text-zinc-500", children: [_jsx(Zap, { className: "h-8 w-8 mx-auto mb-2 opacity-40" }), _jsx("p", { children: "No plugs discovered." }), _jsx("p", { className: "text-xs mt-1", children: "Set TAPO_CLOUD_EMAIL/PASSWORD in .env." })] })), _jsx("div", { className: "grid gap-4 md:grid-cols-2 lg:grid-cols-3", children: plugs.map((plug) => {
                    const s = statuses[plug.device_id];
                    return (_jsxs("div", { className: cn("rounded-lg border p-4 transition-colors", s?.power_state
                            ? "border-emerald-800/50 bg-emerald-950/10"
                            : "border-zinc-800 bg-zinc-900/50"), children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsxs("div", { children: [_jsx("div", { className: "text-sm font-medium text-white", children: plug.device_name || plug.device_id }), _jsx("div", { className: "text-xs text-zinc-500", children: plug.device_model || "Tapo Plug" })] }), _jsx("div", { className: cn("h-2.5 w-2.5 rounded-full", s?.power_state ? "bg-emerald-500" : "bg-zinc-600") })] }), s && (_jsxs("div", { className: "space-y-1 mb-3 text-sm", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-zinc-400", children: "Power" }), _jsxs("span", { className: "text-white font-mono", children: [s.power_w.toFixed(1), " W"] })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-zinc-400", children: "Daily" }), _jsx("span", { className: "text-white font-mono", children: s.daily_energy_kwh != null ? `${s.daily_energy_kwh.toFixed(2)} kWh` : "--" })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-zinc-400", children: "Voltage" }), _jsxs("span", { className: "text-white font-mono", children: [s.voltage_v.toFixed(0), " V"] })] })] })), _jsxs("button", { onClick: () => handleToggle(plug.device_id), disabled: toggling === plug.device_id, className: cn("flex items-center justify-center gap-2 w-full py-2 rounded-md text-sm font-medium transition-colors", s?.power_state
                                    ? "bg-red-600/20 text-red-400 hover:bg-red-600/30"
                                    : "bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30"), children: [toggling === plug.device_id ? (_jsx(Loader2, { className: "h-4 w-4 animate-spin" })) : s?.power_state ? (_jsx(PowerOff, { className: "h-4 w-4" })) : (_jsx(Power, { className: "h-4 w-4" })), s?.power_state ? "Turn Off" : "Turn On"] })] }, plug.device_id));
                }) })] }));
}
