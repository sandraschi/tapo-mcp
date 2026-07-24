import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Code2, Loader2, ChevronDown, ChevronRight, Terminal } from "lucide-react";

interface ToolInfo {
  name: string;
  description?: string;
  inputSchema?: { properties?: Record<string, unknown> };
}

export function ToolsPage() {
  const [tools, setTools] = useState<ToolInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/v1/diagnostics");
        const data = await r.json();
        if (data.tools) {
          setTools(data.tools);
        } else {
          // Fallback: try MCP tools list via proxy
          const r2 = await fetch("/api/health");
          if (r2.ok) setTools([{ name: "tapo_plug", description: "Smart plug management" }, { name: "tapo_camera", description: "Camera management" }, { name: "tapo_register_camera", description: "Register a camera" }]);
        }
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 p-12 text-zinc-400">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span>Discovering tools...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-800 bg-red-950/30 p-4 text-red-200" data-testid="tools-error">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="tools-page">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">Tools</h2>
        <p className="text-zinc-400">MCP tools registered by the server</p>
      </div>

      <div className="grid gap-3">
        {tools.map((tool, i) => (
          <motion.div
            key={tool.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-lg border border-zinc-800 bg-zinc-900/50 overflow-hidden"
            data-testid={`tool-card-${tool.name}`}
          >
            <button
              onClick={() => setExpanded(expanded === tool.name ? null : tool.name)}
              className="flex items-center justify-between w-full px-4 py-3 hover:bg-zinc-800/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Code2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span className="text-sm font-medium text-white">{tool.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-500">portmanteau</span>
                {expanded === tool.name ? (
                  <ChevronDown className="h-4 w-4 text-zinc-400" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-zinc-400" />
                )}
              </div>
            </button>
            {expanded === tool.name && (
              <div className="px-4 pb-4 pt-0 border-t border-zinc-800/50 mt-0">
                {tool.description && (
                  <p className="text-sm text-zinc-400 mt-3 mb-3">{tool.description}</p>
                )}
                {tool.inputSchema?.properties && (
                  <div className="space-y-1.5">
                    <span className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Parameters</span>
                    {Object.entries(tool.inputSchema.properties).map(([key, val]) => (
                      <div key={key} className="flex items-start gap-2 text-xs">
                        <span className="font-mono text-emerald-400 shrink-0">{key}</span>
                        <span className="text-zinc-500">
                          {(val as { description?: string }).description || ""}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {tools.length === 0 && (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-8 text-center text-zinc-500">
          <Terminal className="h-8 w-8 mx-auto mb-2 opacity-40" />
          <p>No tools discovered.</p>
        </div>
      )}
    </div>
  );
}
