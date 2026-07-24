import { motion, AnimatePresence } from "framer-motion";
import { X, HelpCircle, BookOpen, ExternalLink } from "lucide-react";

const HELP_ITEMS = [
  {
    title: "Plugs",
    desc: "Discover, toggle, and monitor Tapo smart plugs. Set TAPO_CLOUD_EMAIL/PASSWORD in Settings or .env.",
    link: "/plugs",
  },
  {
    title: "Cameras",
    desc: "View snapshots, control PTZ, toggle privacy mode and LED. Register cameras in Settings or via tapo_register_camera tool.",
    link: "/cameras",
  },
  {
    title: "Energy Trends",
    desc: "recharts AreaChart showing power consumption over time (12h-168h). Select a plug and time range.",
    link: "/trends",
  },
  {
    title: "API Docs",
    desc: "Full FastAPI Swagger UI and ReDoc documentation for all REST endpoints.",
    link: "/api-docs",
  },
  {
    title: "MCP Tools",
    desc: "tapo_plug (list/status/toggle/energy_history), tapo_camera (list/status/snapshot/ptz/privacy/led/stream), tapo_register_camera.",
    link: "/tools",
  },
];

export function HelpModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[520px] z-50 rounded-xl border border-zinc-800 bg-zinc-950/95 backdrop-blur-2xl shadow-2xl flex flex-col"
            data-testid="help-modal"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-emerald-400" />
                <h2 className="text-lg font-semibold text-white">Help</h2>
              </div>
              <button onClick={onClose} className="p-1 rounded text-zinc-400 hover:text-white transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {HELP_ITEMS.map((item) => (
                <div key={item.title} className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <BookOpen className="h-4 w-4 text-emerald-400" />
                    <h3 className="text-sm font-medium text-white">{item.title}</h3>
                  </div>
                  <p className="text-sm text-zinc-400 ml-6">{item.desc}</p>
                </div>
              ))}
            </div>
            <div className="px-5 py-3 border-t border-zinc-800 text-xs text-zinc-500 flex items-center gap-1">
              <ExternalLink className="h-3 w-3" />
              <a href="https://github.com/sandraschi/tapo-mcp" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-300 transition-colors">
                github.com/sandraschi/tapo-mcp
              </a>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
