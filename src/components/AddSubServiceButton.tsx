"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Plus, X, Loader2, Layers } from "lucide-react";

type Service = { id: string; name: string };

export default function AddSubServiceButton({
  serviceId: initialServiceId, // Rename to avoid confusion
  onSuccess,
}: {
  serviceId?: string; // 🟢 Made Optional to fix the TS error
  onSuccess: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [selectedServiceId, setSelectedServiceId] = useState(initialServiceId || "");
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch services only if we don't have a serviceId passed in
  useEffect(() => {
    if (open && !initialServiceId) {
      fetch("/api/services")
        .then((res) => res.json())
        .then((data) => setServices(data));
    }
  }, [open, initialServiceId]);

  async function save() {
    const finalServiceId = initialServiceId || selectedServiceId;

    if (!name.trim()) return toast.error("Name is required");
    if (!finalServiceId) return toast.error("Please select a parent service");

    setLoading(true);
    try {
      const res = await fetch("/api/subservices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          serviceId: finalServiceId,
        }),
      });

      if (!res.ok) throw new Error();

      toast.success("Sub-service created");
      setName("");
      setOpen(false);
      onSuccess();
    } catch (error) {
      toast.error("Failed to add sub-service");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* TRIGGER BUTTON */}
      <button
        onClick={() => setOpen(true)}
        className={`flex items-center gap-2 font-bold transition-all shadow-sm
          ${initialServiceId 
            ? "text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300" // Link style inside Services Master
            : "px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm" // Primary button style on SubService Master
          }
        `}
      >
        <Plus size={initialServiceId ? 14 : 18} />
        <span>Add Sub-Service</span>
      </button>

      {/* MODAL OVERLAY */}
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm transition-opacity" 
            onClick={() => setOpen(false)} 
          />
          
          <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-800/50">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-blue-600" />
                New Sub-Service
              </h3>
              <button 
                onClick={() => setOpen(false)} 
                className="p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full text-zinc-500 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5">
              {/* Parent Service Dropdown (Only shows if serviceId wasn't passed as a prop) */}
              {!initialServiceId && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Parent Service
                  </label>
                  <select
                    value={selectedServiceId}
                    onChange={(e) => setSelectedServiceId(e.target.value)}
                    className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none dark:text-white"
                  >
                    <option value="">Select a service...</option>
                    {services.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Sub-Service Name
                </label>
                <input
                  autoFocus
                  placeholder="e.g. GST Monthly Filing"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none dark:text-white"
                />
              </div>
            </div>

            {/* Footer Actions */}
            <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-800/30 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-3">
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 text-sm font-bold text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={save}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-600/20 transition-all active:scale-95"
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                {loading ? "Saving..." : "Create Sub-Service"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}