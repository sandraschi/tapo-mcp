import { useState, useEffect } from "react";
import { Routes, Route, NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Camera,
  Zap,
  Activity,
  Settings,
  ChevronLeft,
  ChevronRight,
  Code2,
  HelpCircle,
  Terminal,
  MessageSquare,
  Wifi,
  WifiOff,
} from "lucide-react";
import { Dashboard } from "./pages/dashboard";
import { Cameras } from "./pages/cameras";
import { Plugs } from "./pages/plugs";
import { Trends } from "./pages/trends";
import { SettingsPage } from "./pages/settings";
import { ToolsPage } from "./pages/tools";
import { ApiDocsPage } from "./pages/api-docs";
import { Chat } from "./pages/chat";
import { HelpModal } from "./components/HelpModal";
import { ToastContainer } from "./components/ToastContainer";
import { useToast } from "./common/use-toast";
import { cn } from "./common/utils";

const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/cameras", label: "Cameras", icon: Camera },
  { href: "/plugs", label: "Plugs", icon: Zap },
  { href: "/trends", label: "Trends", icon: Activity },
  { href: "/chat", label: "Chat", icon: MessageSquare },
  { href: "/tools", label: "Tools", icon: Code2 },
  { href: "/api-docs", label: "API Docs", icon: Terminal },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function App() {
  const [collapsed, setCollapsed] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [backendOk, setBackendOk] = useState<boolean | null>(null);
  const { toasts, removeToast } = useToast();

  useEffect(() => {
    let cancelled = false;
    const poll = async () => {
      try {
        const r = await fetch("/api/health");
        const data = await r.json();
        if (!cancelled) setBackendOk(data.success && data.status === "online");
      } catch {
        if (!cancelled) setBackendOk(false);
      }
    };
    poll();
    const iv = setInterval(poll, 15000);
    return () => { cancelled = true; clearInterval(iv); };
  }, []);

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100">
      {/* Sidebar */}
      <aside
        className={cn(
          "flex flex-col border-r border-zinc-800 bg-zinc-950/80 backdrop-blur-xl transition-all duration-300 ease-in-out",
          collapsed ? "w-16" : "w-56",
        )}
      >
        {/* Logo + Collapse toggle (TOP, per standard) */}
        <div className="flex items-center justify-between px-3 py-4 border-b border-zinc-800/50">
          {!collapsed && (
            <span className="font-bold text-white text-sm tracking-wide">Tapo MCP</span>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            data-testid="sidebar-toggle"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col gap-1 px-2 py-3">
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
              data-testid={`nav-${label.toLowerCase().replace(/\s+/g, "-")}`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Connection status */}
        <div className="px-3 py-3 border-t border-zinc-800/50 flex items-center gap-2">
          <div
            className={cn(
              "h-2 w-2 rounded-full shrink-0",
              backendOk === null ? "bg-zinc-500" : backendOk ? "bg-emerald-500" : "bg-red-500",
            )}
            data-testid="backend-dot"
          />
          {!collapsed && (
            <span className="text-xs text-zinc-500 truncate">
              {backendOk === null ? "Checking..." : backendOk ? "Connected" : "Offline"}
            </span>
          )}
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="flex items-center justify-between h-14 px-6 border-b border-zinc-800 bg-zinc-950/50 backdrop-blur-xl shrink-0">
          <h1 className="text-sm font-medium text-zinc-300">tapo-mcp</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setHelpOpen(true)}
              className="p-2 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              data-testid="help-button"
              title="Help"
            >
              <HelpCircle className="h-4 w-4" />
            </button>
            <a
              href="http://127.0.0.1:11102/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              data-testid="popout-button"
              title="Open backend docs"
            >
              <Terminal className="h-4 w-4" />
            </a>
            <div
              className={cn(
                "flex items-center gap-1.5 text-xs px-2 py-1 rounded-full",
                backendOk === null
                  ? "bg-zinc-800 text-zinc-500"
                  : backendOk
                    ? "bg-emerald-950/50 text-emerald-400"
                    : "bg-red-950/50 text-red-400",
              )}
            >
              {backendOk === null ? (
                <Wifi className="h-3 w-3" />
              ) : backendOk ? (
                <Wifi className="h-3 w-3" />
              ) : (
                <WifiOff className="h-3 w-3" />
              )}
              <span className="hidden sm:inline">
                {backendOk === null ? "..." : backendOk ? "API" : "Offline"}
              </span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/cameras" element={<Cameras />} />
            <Route path="/plugs" element={<Plugs />} />
            <Route path="/trends" element={<Trends />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/tools" element={<ToolsPage />} />
            <Route path="/api-docs" element={<ApiDocsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </main>
      </div>

      {/* Help Modal */}
      <HelpModal open={helpOpen} onClose={() => setHelpOpen(false)} />

      {/* Toasts */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
