import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { Camera, RefreshCw, Loader2, Eye, EyeOff, Sun, Moon, MoveUp, MoveDown, MoveLeft, MoveRight, } from "lucide-react";
import { getCameras, ptzMove, togglePrivacyMode, toggleLed, } from "../common/api";
export function Cameras() {
    const [cameras, setCameras] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [refreshing, setRefreshing] = useState(null);
    const load = async () => {
        try {
            setLoading(true);
            const res = await getCameras();
            setCameras(res.cameras);
        }
        catch (e) {
            setError(e.message);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        load();
    }, []);
    const handlePtz = async (id, dir) => {
        setRefreshing(id);
        try {
            await ptzMove(id, dir);
        }
        catch { /* ignore */ }
        setRefreshing(null);
    };
    if (loading) {
        return (_jsxs("div", { className: "flex items-center justify-center gap-2 p-12 text-zinc-400", children: [_jsx(Loader2, { className: "h-6 w-6 animate-spin" }), _jsx("span", { children: "Loading cameras..." })] }));
    }
    if (error) {
        return (_jsx("div", { className: "rounded-lg border border-red-800 bg-red-950/30 p-4 text-red-200", children: error }));
    }
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold text-white", children: "Cameras" }), _jsxs("p", { className: "text-zinc-400", children: [cameras.length, " registered"] })] }), _jsxs("button", { onClick: load, className: "flex items-center gap-1 text-sm text-zinc-400 hover:text-white transition-colors", children: [_jsx(RefreshCw, { className: "h-4 w-4" }), " Refresh"] })] }), cameras.length === 0 && (_jsxs("div", { className: "rounded-lg border border-zinc-800 bg-zinc-900/50 p-8 text-center text-zinc-500", children: [_jsx(Camera, { className: "h-8 w-8 mx-auto mb-2 opacity-40" }), _jsx("p", { children: "No cameras registered." }), _jsx("p", { className: "text-xs mt-1", children: "Set TAPO_CAMERA_HOST/PASSWORD in .env or use the Settings page." })] })), _jsx("div", { className: "grid gap-4 md:grid-cols-2 lg:grid-cols-3", children: cameras.map((cam) => (_jsxs("div", { className: "rounded-lg border border-zinc-800 bg-zinc-900/50 overflow-hidden", children: [_jsx("div", { className: "aspect-video bg-zinc-800 flex items-center justify-center", children: _jsx("img", { src: `/api/cameras/${encodeURIComponent(cam.id)}/snapshot`, alt: cam.name, className: "w-full h-full object-cover", onError: (e) => {
                                    e.target.style.display = "none";
                                    e.target.parentElement.innerHTML =
                                        '<div class="text-zinc-600"><Camera class="h-8 w-8 mx-auto" /></div>';
                                } }) }), _jsxs("div", { className: "p-3 space-y-2", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm font-medium text-white", children: cam.name }), _jsx("span", { className: "text-xs text-zinc-500", children: cam.host })] }), _jsxs("div", { className: "flex gap-1", children: [["up", "down", "left", "right"].map((dir) => (_jsxs("button", { onClick: () => handlePtz(cam.id, dir), disabled: refreshing === cam.id, className: "p-1.5 rounded bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors disabled:opacity-50", title: `Move ${dir}`, children: [dir === "up" && _jsx(MoveUp, { className: "h-3.5 w-3.5" }), dir === "down" && _jsx(MoveDown, { className: "h-3.5 w-3.5" }), dir === "left" && _jsx(MoveLeft, { className: "h-3.5 w-3.5" }), dir === "right" && _jsx(MoveRight, { className: "h-3.5 w-3.5" })] }, dir))), _jsxs("div", { className: "ml-auto flex gap-1", children: [_jsx("button", { onClick: () => togglePrivacyMode(cam.id, true), className: "p-1.5 rounded bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors", title: "Privacy mode on", children: _jsx(EyeOff, { className: "h-3.5 w-3.5" }) }), _jsx("button", { onClick: () => togglePrivacyMode(cam.id, false), className: "p-1.5 rounded bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors", title: "Privacy mode off", children: _jsx(Eye, { className: "h-3.5 w-3.5" }) }), _jsx("button", { onClick: () => toggleLed(cam.id, true), className: "p-1.5 rounded bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors", title: "LED on", children: _jsx(Sun, { className: "h-3.5 w-3.5" }) }), _jsx("button", { onClick: () => toggleLed(cam.id, false), className: "p-1.5 rounded bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors", title: "LED off", children: _jsx(Moon, { className: "h-3.5 w-3.5" }) })] })] })] })] }, cam.id))) })] }));
}
