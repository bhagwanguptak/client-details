"use client";

import { useEffect, useState, useMemo } from "react";
import toast from "react-hot-toast";
import { 
  Layers, 
  Search, 
  Trash2, 
  ChevronRight, 
  Hash,
  Filter,
  AlertTriangle // Added for orphan warning
} from "lucide-react";
import AddSubServiceButton from "@/components/AddSubServiceButton";

type Service = { id: string; name: string };
type SubService = {
  id: string;
  name: string;
  service?: Service | null; // 🟢 Changed to optional/null to prevent crashes
};

export default function SubServicesPage() {
  const [subServices, setSubServices] = useState<SubService[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/subservices/all");
      const data = await res.json();
      setSubServices(data);
    } catch (err) {
      toast.error("Failed to load sub-services");
    } finally {
      setLoading(false);
    }
  }

  async function remove(id: string) {
    const ok = confirm("Are you sure you want to delete this sub-service?");
    if (!ok) return;

    await fetch(`/api/subservices/${id}`, {
      method: "DELETE",
    });
    toast.success("Sub-service deleted");
    load();
  }

  useEffect(() => {
    load();
  }, []);

  // 🟢 FIXED: Search logic now handles cases where service might be null
  const filteredData = useMemo(() => {
    return subServices.filter(ss => {
      const searchStr = search.toLowerCase();
      const nameMatch = ss.name.toLowerCase().includes(searchStr);
      const serviceMatch = ss.service?.name?.toLowerCase().includes(searchStr) ?? false;
      return nameMatch || serviceMatch;
    });
  }, [search, subServices]);

  return (
    <div className="p-4 md:p-8 space-y-8 bg-gray-50/50 dark:bg-zinc-950 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white flex items-center gap-3">
            <Hash className="text-blue-600 w-8 h-8" />
            Sub-Service Master
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Detailed breakdown of your service offerings
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-blue-500 transition-colors" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search sub-services..."
              className="pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm w-full md:w-64 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all dark:text-white"
            />
          </div>
          <AddSubServiceButton onSuccess={load} />
        </div>
      </div>

      {/* Content Area */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="hidden md:grid grid-cols-12 p-4 bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800 text-[10px] uppercase font-bold tracking-widest text-zinc-500">
          <div className="col-span-6">Sub-Service Name</div>
          <div className="col-span-4 text-center">Parent Service</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {loading ? (
            <div className="p-12 text-center animate-pulse text-zinc-400">Loading master list...</div>
          ) : filteredData.length === 0 ? (
            <div className="p-12 text-center text-zinc-500 italic">
              {search ? `No results found for "${search}"` : "No sub-services configured."}
            </div>
          ) : (
            filteredData.map((ss) => {
              const isOrphan = !ss.service; // 🟢 Check if parent is missing

              return (
                <div
                  key={ss.id}
                  className={`grid grid-cols-1 md:grid-cols-12 items-center p-4 md:p-5 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors gap-3 ${isOrphan ? 'bg-red-50/20' : ''}`}
                >
                  {/* Sub Service Name */}
                  <div className="col-span-6 flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isOrphan ? 'bg-red-100 text-red-600' : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600'}`}>
                      {isOrphan ? <AlertTriangle size={16} /> : <Hash size={16} />}
                    </div>
                    <span className={`font-bold ${isOrphan ? 'text-red-700' : 'text-zinc-900 dark:text-zinc-100'}`}>
                      {ss.name}
                    </span>
                  </div>

                  {/* Parent Service Badge */}
                  <div className="col-span-4 flex md:justify-center">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                      isOrphan 
                        ? 'bg-red-100 text-red-700 border-red-200' 
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700'
                    }`}>
                      <Filter size={10} />
                      {ss.service?.name ?? "Missing Parent"}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="col-span-2 flex justify-end">
                    <button
                      onClick={() => remove(ss.id)}
                      className="p-2 text-zinc-400 hover:text-red-600 dark:hover:text-red-400 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                      title={isOrphan ? "Delete Orphan Record" : "Delete Sub-Service"}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Footer Stat */}
      <div className="flex items-center justify-between text-xs text-zinc-400 dark:text-zinc-500 px-2 font-medium">
        <div className="flex gap-4">
          <span>Total Entries: {filteredData.length}</span>
          {subServices.some(ss => !ss.service) && (
            <span className="text-red-500 font-bold flex items-center gap-1">
              <AlertTriangle size={12} /> Needs Cleanup
            </span>
          )}
        </div>
        <span>Version 1.0</span>
      </div>
    </div>
  );
}