"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Plus, X, Loader2, Briefcase } from "lucide-react";

export default function AddServiceButton({
  onSuccess,
}: {
  onSuccess: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  async function save() {
    if (name.trim().length < 3) {
      toast.error("Service name must be at least 3 characters");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (!res.ok) throw new Error();

      toast.success("Service created successfully");
      setName("");
      setOpen(false);
      onSuccess();
    } catch (error) {
      toast.error("Failed to add service");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* TRIGGER BUTTON */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-600/20 transition-all active:scale-95 shrink-0"
      >
        <Plus size={18} />
        <span>Add Service</span>
      </button>

      {/* MODAL OVERLAY */}
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop Blur */}
          <div 
            className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm transition-opacity" 
            onClick={() => setOpen(false)} 
          />
          
          {/* Modal Card */}
          <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden animate-in fade-in zoom-in duration-200">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-800/50">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-600/10 dark:bg-blue-600/20 rounded-lg text-blue-600">
                  <Briefcase size={18} />
                </div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                  New Service
                </h3>
              </div>
              <button 
                onClick={() => setOpen(false)} 
                className="p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full text-zinc-500 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Service Name
                </label>
                <input
                  autoFocus
                  placeholder="e.g. Income Tax Returns"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none dark:text-white transition-all"
                />
                <p className="text-[10px] text-zinc-400">
                  This will be the main category for your sub-services.
                </p>
              </div>
            </div>

            {/* Footer */}
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
                {loading ? "Creating..." : "Save Service"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}