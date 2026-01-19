"use client";

import { useState } from "react";
import toast from "react-hot-toast";

export default function UploadDocumentButton({
  clientId,
  subServiceId,
  onSuccess,
}: {
  clientId: string;
  subServiceId: string;
  onSuccess: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  async function upload() {
    if (!file) {
      toast.error("Select a file");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("clientId", clientId);
    formData.append("subServiceId", subServiceId);

    const res = await fetch("/api/documents/upload", {
      method: "POST",
      body: formData,
    });

    setLoading(false);

    if (!res.ok) {
      toast.error("Upload failed");
      return;
    }

    toast.success("Document uploaded");
    setOpen(false);
    setFile(null);
    onSuccess();
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-sm text-blue-600"
      >
        + Upload
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm space-y-4">
            <h3 className="text-lg font-semibold">
              Upload Document
            </h3>

            <input
              type="file"
              onChange={(e) =>
                setFile(e.target.files?.[0] || null)
              }
              className="w-full"
            />

            <div className="flex justify-end gap-2">
              <button onClick={() => setOpen(false)}>
                Cancel
              </button>
              <button
                onClick={upload}
                disabled={loading}
                className="bg-slate-900 text-white px-4 py-2 rounded"
              >
                {loading ? "Uploading..." : "Upload"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
