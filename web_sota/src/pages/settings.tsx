import { useState } from "react";
import { Settings, Save, Check, AlertCircle } from "lucide-react";

export function SettingsPage() {
  const [email, setEmail] = useState(localStorage.getItem("tapo_cloud_email") || "");
  const [password, setPassword] = useState(localStorage.getItem("tapo_cloud_password") || "");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    localStorage.setItem("tapo_cloud_email", email);
    localStorage.setItem("tapo_cloud_password", password);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h2 className="text-2xl font-bold text-white">Settings</h2>
        <p className="text-zinc-400">Tapo cloud and device configuration</p>
      </div>

      <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 space-y-4">
        <h3 className="text-sm font-medium text-white flex items-center gap-2">
          <Settings className="h-4 w-4 text-zinc-400" />
          Tapo Cloud Credentials
        </h3>
        <p className="text-xs text-zinc-500">
          Used for smart plug discovery and control via the Tapo cloud API.
        </p>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              placeholder="tapo@example.com"
            />
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              placeholder="Cloud account password"
            />
          </div>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 rounded-md bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-500 transition-colors"
        >
          {saved ? (
            <>
              <Check className="h-4 w-4" /> Saved
            </>
          ) : (
            <>
              <Save className="h-4 w-4" /> Save
            </>
          )}
        </button>
        {saved && (
          <div className="flex items-center gap-2 text-xs text-emerald-400">
            <Check className="h-3 w-3" /> Credentials saved to localStorage. Restart the backend.
          </div>
        )}
      </div>

      <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 space-y-3">
        <h3 className="text-sm font-medium text-white flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-zinc-400" />
          About
        </h3>
        <div className="text-xs text-zinc-500 space-y-1">
          <p><strong>tapo-mcp</strong> v0.1.0</p>
          <p>TP-Link Tapo camera and smart plug management via MCP.</p>
          <p>Backend port: 11102 | Frontend port: 11103</p>
        </div>
      </div>
    </div>
  );
}
