import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, AlertCircle, Info, X } from "lucide-react";
import type { Toast } from "../common/use-toast";
import { cn } from "../common/utils";

const ICONS = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
};

const COLORS = {
  success: "border-emerald-800 bg-emerald-950/80 text-emerald-200",
  error: "border-red-800 bg-red-950/80 text-red-200",
  info: "border-blue-800 bg-blue-950/80 text-blue-200",
};

export function ToastContainer({
  toasts,
  onRemove,
}: {
  toasts: Toast[];
  onRemove: (id: string) => void;
}) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2" data-testid="toast-container">
      <AnimatePresence>
        {toasts.map((t) => {
          const Icon = ICONS[t.type];
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 80 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 80 }}
              className={cn("flex items-center gap-2 px-4 py-3 rounded-lg border backdrop-blur-xl text-sm min-w-[260px] shadow-lg", COLORS[t.type])}
              data-testid={`toast-${t.type}`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="flex-1">{t.message}</span>
              <button onClick={() => onRemove(t.id)} className="opacity-60 hover:opacity-100 transition-opacity">
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
