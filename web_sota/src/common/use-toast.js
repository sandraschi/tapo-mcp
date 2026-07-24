import { useCallback, useState } from "react";
export function useToast() {
    const [toasts, setToasts] = useState([]);
    const addToast = useCallback((type, message) => {
        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        setToasts((prev) => [...prev.slice(-4), { id, type, message }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 4000);
    }, []);
    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);
    return { toasts, addToast, removeToast };
}
