import { useState } from "react";
import { motion } from "framer-motion";
import { ExternalLink, RefreshCw } from "lucide-react";

const BACKEND_PORT = 11102;
const ENDPOINTS = [
  { method: "GET", path: "/api/health", desc: "Health check" },
  { method: "GET", path: "/api/v1/diagnostics", desc: "Server diagnostics" },
  { method: "GET", path: "/api/plugs", desc: "List plugs" },
  { method: "GET", path: "/api/plugs/{id}", desc: "Plug details" },
  { method: "POST", path: "/api/plugs/{id}/toggle", desc: "Toggle plug" },
  { method: "GET", path: "/api/plugs/{id}/history", desc: "Plug energy history" },
  { method: "GET", path: "/api/cameras", desc: "List cameras" },
  { method: "GET", path: "/api/cameras/{id}", desc: "Camera status" },
  { method: "GET", path: "/api/cameras/{id}/snapshot", desc: "Camera snapshot" },
  { method: "POST", path: "/api/cameras/{id}/ptz", desc: "PTZ move" },
  { method: "POST", path: "/api/cameras/{id}/privacy_mode", desc: "Toggle privacy" },
  { method: "POST", path: "/api/cameras/{id}/led", desc: "Toggle LED" },
];

function MethodBadge({ method }: { method: string }) {
  const colors: Record<string, string> = {
    GET: "bg-emerald-600/20 text-emerald-400",
    POST: "bg-blue-600/20 text-blue-400",
    PUT: "bg-amber-600/20 text-amber-400",
    DELETE: "bg-red-600/20 text-red-400",
  };
  return (
    <span className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded ${colors[method] || "bg-zinc-700 text-zinc-300"}`}>
      {method}
    </span>
  );
}

export function ApiDocsPage() {
  const [view, setView] = useState<"swagger" | "redoc">("swagger");
  const [iframeKey, setIframeKey] = useState(0);

  const iframeUrl = view === "swagger"
    ? `http://127.0.0.1:${BACKEND_PORT}/docs`
    : `http://127.0.0.1:${BACKEND_PORT}/redoc`;

  return (
    <div className="space-y-6" data-testid="api-docs-page">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">API Docs</h2>
          <p className="text-zinc-400">FastAPI Swagger UI and ReDoc documentation</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-zinc-800 overflow-hidden">
            <button
              onClick={() => setView("swagger")}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${view === "swagger" ? "bg-emerald-600 text-white" : "bg-zinc-900 text-zinc-400 hover:text-white"}`}
            >
              Swagger
            </button>
            <button
              onClick={() => setView("redoc")}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${view === "redoc" ? "bg-emerald-600 text-white" : "bg-zinc-900 text-zinc-400 hover:text-white"}`}
            >
              ReDoc
            </button>
          </div>
          <button
            onClick={() => setIframeKey((k) => k + 1)}
            className="p-1.5 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <a
            href={iframeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-zinc-800 text-zinc-300 text-xs font-medium hover:bg-zinc-700 transition-colors"
            data-testid="open-in-browser"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Open in browser
          </a>
        </div>
      </div>

      {/* Quick-ref strip */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin"
      >
        {ENDPOINTS.map((ep) => (
          <div
            key={ep.path}
            className="flex items-center gap-1.5 shrink-0 px-2.5 py-1.5 rounded-md bg-zinc-900 border border-zinc-800 text-xs"
          >
            <MethodBadge method={ep.method} />
            <span className="text-zinc-400 font-mono text-[11px]">{ep.path}</span>
          </div>
        ))}
      </motion.div>

      {/* Iframe */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-950 overflow-hidden" style={{ height: "calc(100vh - 280px)" }}>
        <iframe
          key={iframeKey}
          src={iframeUrl}
          className="w-full h-full"
          title={view === "swagger" ? "Swagger UI" : "ReDoc"}
          sandbox="allow-scripts allow-same-origin"
        />
      </div>
    </div>
  );
}
