import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Routes, Route, NavLink } from "react-router-dom";
import { LayoutDashboard, Camera, Zap, Activity, Settings, } from "lucide-react";
import { Dashboard } from "./pages/dashboard";
import { Cameras } from "./pages/cameras";
import { Plugs } from "./pages/plugs";
import { Trends } from "./pages/trends";
import { SettingsPage } from "./pages/settings";
import { cn } from "./common/utils";
const NAV = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/cameras", label: "Cameras", icon: Camera },
    { href: "/plugs", label: "Plugs", icon: Zap },
    { href: "/trends", label: "Trends", icon: Activity },
    { href: "/settings", label: "Settings", icon: Settings },
];
export default function App() {
    return (_jsxs("div", { className: "flex h-screen bg-zinc-950", children: [_jsxs("aside", { className: "w-56 border-r border-zinc-800 bg-zinc-950/50 p-4 flex flex-col gap-1", children: [_jsxs("div", { className: "flex items-center gap-2 px-3 py-4 mb-2", children: [_jsx(Zap, { className: "h-5 w-5 text-emerald-500" }), _jsx("span", { className: "font-bold text-white", children: "Tapo MCP" })] }), NAV.map(({ href, label, icon: Icon }) => (_jsxs(NavLink, { to: href, end: href === "/", className: ({ isActive }) => cn("flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors", isActive
                            ? "bg-emerald-600/20 text-emerald-400"
                            : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"), children: [_jsx(Icon, { className: "h-4 w-4" }), label] }, href)))] }), _jsx("main", { className: "flex-1 overflow-y-auto p-6", children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(Dashboard, {}) }), _jsx(Route, { path: "/cameras", element: _jsx(Cameras, {}) }), _jsx(Route, { path: "/plugs", element: _jsx(Plugs, {}) }), _jsx(Route, { path: "/trends", element: _jsx(Trends, {}) }), _jsx(Route, { path: "/settings", element: _jsx(SettingsPage, {}) })] }) })] }));
}
