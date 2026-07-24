import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, } from "recharts";
import { Activity, Loader2, RefreshCw, } from "lucide-react";
import { getPlugs, getPlugStatus, getPlugHistory, } from "../common/api";
import { cn } from "../common/utils";
function formatTime(ts) {
    try {
        const d = new Date(ts);
        return Number.isNaN(d.getTime()) ? ts : d.toLocaleTimeString("de-AT", { hour: "2-digit", minute: "2-digit" });
    }
    catch {
        return ts;
    }
}
export function Trends() {
    const [plugs, setPlugs] = useState([]);
    const [selected, setSelected] = useState("");
    const [status, setStatus] = useState(null);
    const [history, setHistory] = useState([]);
    const [hours, setHours] = useState(24);
    const [loading, setLoading] = useState(true);
    const load = async (deviceId, h) => {
        setLoading(true);
        try {
            const [stat, hist] = await Promise.all([
                getPlugStatus(deviceId),
                getPlugHistory(deviceId, h),
            ]);
            setStatus(stat.device);
            setHistory(Array.isArray(hist.data_points) ? hist.data_points : []);
        }
        catch { /* ignore */ }
        setLoading(false);
    };
    useEffect(() => {
        (async () => {
            try {
                const res = await getPlugs();
                setPlugs(res.devices);
                if (res.devices.length > 0) {
                    setSelected(res.devices[0].device_id);
                    await load(res.devices[0].device_id, 24);
                }
                else {
                    setLoading(false);
                }
            }
            catch {
                setLoading(false);
            }
        })();
    }, []);
    const handleSelect = (id) => {
        setSelected(id);
        load(id, hours);
    };
    const handleHours = (h) => {
        setHours(h);
        if (selected)
            load(selected, h);
    };
    const chartData = history.map((p) => ({
        time: formatTime(p.timestamp),
        power_w: p.power_w ?? 0,
    }));
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold text-white", children: "Energy Trends" }), _jsx("p", { className: "text-zinc-400", children: "Power consumption over time" })] }), _jsx("button", { onClick: () => selected && load(selected, hours), className: "text-zinc-400 hover:text-white transition-colors", children: _jsx(RefreshCw, { className: "h-4 w-4" }) })] }), plugs.length > 0 && (_jsxs("div", { className: "flex gap-2 flex-wrap items-center", children: [plugs.map((p) => (_jsx("button", { onClick: () => handleSelect(p.device_id), className: cn("px-3 py-1.5 rounded-md text-sm font-medium transition-colors", selected === p.device_id
                            ? "bg-emerald-600 text-white"
                            : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"), children: p.device_name || p.device_id }, p.device_id))), _jsx("div", { className: "ml-auto flex gap-1", children: [12, 24, 72, 168].map((h) => (_jsxs("button", { onClick: () => handleHours(h), className: cn("px-2.5 py-1 rounded text-xs font-medium transition-colors", hours === h
                                ? "bg-zinc-700 text-white"
                                : "bg-zinc-800/50 text-zinc-500 hover:text-zinc-300"), children: [h, "h"] }, h))) })] })), status && (_jsxs("div", { className: "grid grid-cols-3 gap-3", children: [_jsxs("div", { className: "rounded-lg border border-zinc-800 bg-zinc-900/50 p-3", children: [_jsx("div", { className: "text-xs text-zinc-500", children: "Current Power" }), _jsxs("div", { className: "text-xl font-bold text-white", children: [status.power_w.toFixed(1), " W"] })] }), _jsxs("div", { className: "rounded-lg border border-zinc-800 bg-zinc-900/50 p-3", children: [_jsx("div", { className: "text-xs text-zinc-500", children: "Daily Energy" }), _jsx("div", { className: "text-xl font-bold text-white", children: status.daily_energy_kwh != null ? `${status.daily_energy_kwh.toFixed(2)} kWh` : "--" })] }), _jsxs("div", { className: "rounded-lg border border-zinc-800 bg-zinc-900/50 p-3", children: [_jsx("div", { className: "text-xs text-zinc-500", children: "State" }), _jsx("div", { className: cn("text-xl font-bold", status.power_state ? "text-emerald-400" : "text-zinc-500"), children: status.power_state ? "On" : "Off" })] })] })), loading && (_jsxs("div", { className: "flex items-center justify-center gap-2 p-12 text-zinc-400", children: [_jsx(Loader2, { className: "h-6 w-6 animate-spin" }), _jsx("span", { children: "Loading..." })] })), !loading && chartData.length > 0 && (_jsx("div", { className: "rounded-lg border border-zinc-800 bg-zinc-900/50 p-4", children: _jsx("div", { className: "h-72", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(AreaChart, { data: chartData, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#27272a" }), _jsx(XAxis, { dataKey: "time", tick: { fill: "#71717a", fontSize: 11 }, tickLine: false, axisLine: { stroke: "#27272a" } }), _jsx(YAxis, { tick: { fill: "#71717a", fontSize: 11 }, tickLine: false, axisLine: { stroke: "#27272a" }, width: 50, tickFormatter: (v) => `${v}W` }), _jsx(Tooltip, { contentStyle: {
                                        backgroundColor: "#09090b",
                                        border: "1px solid #27272a",
                                        borderRadius: "6px",
                                        fontSize: "12px",
                                    }, labelStyle: { color: "#e4e4e7" } }), _jsx(Area, { type: "monotone", dataKey: "power_w", stroke: "#10b981", fill: "#10b981", fillOpacity: 0.15, strokeWidth: 2 })] }) }) }) })), !loading && chartData.length === 0 && selected && (_jsxs("div", { className: "rounded-lg border border-zinc-800 bg-zinc-900/50 p-8 text-center text-zinc-500", children: [_jsx(Activity, { className: "h-8 w-8 mx-auto mb-2 opacity-40" }), _jsx("p", { children: "No energy data yet." }), _jsx("p", { className: "text-xs mt-1", children: "Data accumulates as the backend polls." })] }))] }));
}
