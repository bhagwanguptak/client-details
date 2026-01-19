"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { 
  UploadCloud, 
  File, 
  X, 
  Loader2, 
  FileText, 
  CheckCircle2 
} from "lucide-react";

export default function AddDocumentButton({
  clientId,
  subServiceId,
}: {
  clientId: string;
  subServiceId: string;
}) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function upload() {
    if (!file) {
      toast.error("Please select a file first");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("clientId", clientId);
    formData.append("subServiceId", subServiceId);

    try {
      const res = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error();

      toast.success("Document uploaded successfully");
      setOpen(false);
      setFile(null);
      router.refresh();
    } catch (err) {
      toast.error("Document upload failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* TRIGGER BUTTON */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 transition-all active:scale-95"
      >
        <UploadCloud size={14} />
        Upload
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm transition-opacity" 
            onClick={() => !loading && setOpen(false)} 
          />

          {/* Modal Content */}
          <div className="relative bg-white dark:bg-zinc-900 rounded-[2rem] w-full max-w-sm shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden animate-in fade-in zoom-in duration-200">
            
            {/* Header */}
            <div className="px-6 py-5 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-800/50">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Upload File
              </h3>
              <button 
                disabled={loading}
                onClick={() => setOpen(false)} 
                className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full text-zinc-400 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* DROPZONE AREA */}
              {!file ? (
                <label className="group relative border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-all">
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-full text-blue-600 mb-4 group-hover:scale-110 transition-transform">
                    <UploadCloud size={32} />
                  </div>
                  <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    Click to select file
                  </p>
                  <p className="text-xs text-zinc-400 mt-2">
                    PDF, JPG, PNG or XLS (Max 10MB)
                  </p>
                </label>
              ) : (
                /* FILE PREVIEW STATE */
                <div className="relative border-2 border-blue-100 dark:border-blue-900 bg-blue-50/30 dark:bg-blue-900/10 rounded-2xl p-6 flex flex-col items-center animate-in slide-in-from-bottom-2">
                  <button 
                    onClick={() => setFile(null)}
                    className="absolute top-3 right-3 p-1.5 bg-white dark:bg-zinc-800 text-zinc-400 hover:text-red-500 rounded-full shadow-sm"
                  >
                    <X size={14} />
                  </button>
                  <div className="p-3 bg-white dark:bg-zinc-800 rounded-xl shadow-sm mb-3">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                  </div>
                  <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate max-w-full px-4">
                    {file.name}
                  </p>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">
                    {(file.size / 1024 / 1024).toFixed(2)} MB • Ready
                  </p>
                </div>
              )}

              {/* ACTION BUTTONS */}
              <div className="flex flex-col gap-2">
                <button
                  onClick={upload}
                  disabled={loading || !file}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-3.5 rounded-xl text-sm shadow-xl shadow-blue-600/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <UploadCloud size={18} />
                  )}
                  {loading ? "Uploading..." : "Start Upload"}
                </button>
                <button
                  disabled={loading}
                  onClick={() => setOpen(false)}
                  className="w-full py-2 text-xs font-bold text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors uppercase tracking-widest"
                >
                  Cancel
                </button>
              </div>
            </div>

            {/* SECURITY FOOTER */}
            <div className="px-6 py-3 bg-zinc-50 dark:bg-zinc-800/30 text-center">
              <p className="text-[9px] text-zinc-400 uppercase font-bold tracking-[0.2em]">
                Secure Cloud Storage
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}