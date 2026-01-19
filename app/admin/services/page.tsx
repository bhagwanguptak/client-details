"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { 
  Settings2, 
  Trash2, 
  RefreshCw, 
  Plus, 
  ChevronRight, 
  Layers,
  AlertTriangle 
} from "lucide-react";
import AddServiceButton from "@/components/AddServiceButton";
import AddSubServiceButton from "@/components/AddSubServiceButton";

type Service = {
  id: string;
  name: string;
};

type SubService = {
  id: string;
  name: string;
};

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [subMap, setSubMap] = useState<Record<string, SubService[]>>({});
  const [syncing, setSyncing] = useState<string | null>(null);

  async function loadServices() {
    const res = await fetch("/api/services");
    setServices(await res.json());
  }

  async function loadSubServices(serviceId: string) {
    const res = await fetch(`/api/subservices?serviceId=${serviceId}`);
    const data = await res.json();
    setSubMap((prev) => ({ ...prev, [serviceId]: data }));
  }

  async function deleteService(id: string) {
    const ok = confirm("Are you sure? This will delete the service and all associated sub-services.");
    if (!ok) return;
    
    await fetch(`/api/services/${id}`, { method: "DELETE" });
    toast.success("Service deleted");
    loadServices();
  }

  async function deleteSub(id: string, serviceId: string) {
    const ok = confirm("Delete this sub-service?");
    if (!ok) return;

    await fetch(`/api/subservices/${id}`, { method: "DELETE" });
    toast.success("Sub-service deleted");
    loadSubServices(serviceId);
  }

  async function syncClients(serviceId: string) {
    const ok = confirm("This will update sub-services for ALL clients using this service. Continue?");
    if (!ok) return;

    setSyncing(serviceId);
    try {
      const res = await fetch(`/api/services/${serviceId}/sync-clients`, { method: "POST" });
      if (res.ok) toast.success("All clients synced successfully");
      else throw new Error();
    } catch (err) {
      toast.error("Failed to sync clients");
    } finally {
      setSyncing(null);
    }
  }

  useEffect(() => {
    loadServices();
  }, []);

  useEffect(() => {
    services.forEach((s) => loadSubServices(s.id));
  }, [services]);

  return (
    
    <div className="p-4 md:p-8 space-y-8 bg-gray-50/50 dark:bg-zinc-950 min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white flex items-center gap-3">
            <Settings2 className="text-blue-600 w-8 h-8" />
            Service Master
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Configure your primary services and sub-categories</p>
        </div>
        <AddServiceButton onSuccess={loadServices} />
      </div>

      {/* Sync Warning Helper */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30">
        <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
          <strong>Note:</strong> Using the <span className="font-bold underline">Sync All Clients</span> button will automatically assign newly added sub-services to existing clients who are already subscribed to the parent service.
        </p>
      </div>
      {/* Services List */}
      <div className="grid grid-cols-1 gap-6">
        {services.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 p-12 text-center rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-800">
            <Layers className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
            <p className="text-zinc-500 font-medium">No services configured yet.</p>
          </div>
        ) : (
          services.map((s) => (
            <div key={s.id} className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          {/* Primary Service Row */}
            <div className="p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-800/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-600">
                  <Layers size={20} />
                </div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{s.name}</h3>
              </div>
              
              {/* 🟢 FIXED: Changed flex-wrap and items-center for better mobile spacing */}
              <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto">
                <div className="flex items-center gap-2">
                  <AddSubServiceButton
                    serviceId={s.id}
                    onSuccess={() => loadSubServices(s.id)}
                  />
                  
                  <button
                    onClick={() => syncClients(s.id)}
                    disabled={syncing === s.id}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 border border-emerald-100 dark:border-emerald-800"
                  >
                    <RefreshCw size={12} className={syncing === s.id ? "animate-spin" : ""} />
                    {syncing === s.id ? "..." : "Sync Clients"}
                  </button>
                </div>

                {/* Main Service Delete Icon - Always visible */}
                <button
                  onClick={() => deleteService(s.id)}
                  className="p-2 text-red-400 hover:text-red-600 transition-colors shrink-0"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

                    {/* SubServices Section */}
              <div className="p-4 md:p-6 bg-white dark:bg-zinc-900">
                <div className="flex items-center gap-2 mb-4">
                  <ChevronRight size={16} className="text-zinc-400" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                    Sub-Services ({(subMap[s.id] || []).length})
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {/* 🟢 Added (subMap[s.id] || []) to prevent the crash */}
                  {(subMap[s.id] || []).length === 0 ? (
                    <p className="text-xs text-zinc-400 italic">No sub-services found.</p>
                  ) : (
                    (subMap[s.id] || []).map((ss) => (
                      <div
                        key={ss.id}
                        className="flex justify-between items-center px-4 py-3 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 group hover:border-blue-200 dark:hover:border-blue-900 transition-colors"
                      >
                        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                          {ss.name}
                        </span>
                        
                        <button
                          onClick={() => deleteSub(ss.id, s.id)}
                          className="p-1.5 text-red-500/50 hover:text-red-600 md:opacity-0 md:group-hover:opacity-100 transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      
    </div>
  );
}