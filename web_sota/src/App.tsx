import { Routes, Route, NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Camera,
  Zap,
  Activity,
  Settings,
} from "lucide-react";
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
  return (
    <div className="flex h-screen bg-zinc-950">
      <aside className="w-56 border-r border-zinc-800 bg-zinc-950/50 p-4 flex flex-col gap-1">
        <div className="flex items-center gap-2 px-3 py-4 mb-2">
          <Zap className="h-5 w-5 text-emerald-500" />
          <span className="font-bold text-white">Tapo MCP</span>
        </div>
        {NAV.map(({ href, label, icon: Icon }) => (
          <NavLink
            key={href}
            to={href}
            end={href === "/"}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                isActive
                  ? "bg-emerald-600/20 text-emerald-400"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800",
              )
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </aside>
      <main className="flex-1 overflow-y-auto p-6">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/cameras" element={<Cameras />} />
          <Route path="/plugs" element={<Plugs />} />
          <Route path="/trends" element={<Trends />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </main>
    </div>
  );
}
