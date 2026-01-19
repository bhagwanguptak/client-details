"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { 
  User, 
  Building2, 
  Mail, 
  Phone, 
  Briefcase, 
  Plus, 
  X, 
  Loader2,
  UserPlus,
  Layers 
} from "lucide-react";

type Service = { id: string; name: string };
type SubService = { id: string; name: string };

export default function AddClientButton({
  onSuccess,
}: {
  onSuccess: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [subServices, setSubServices] = useState<SubService[]>([]);
  
  const [serviceId, setServiceId] = useState("");
  const [subServiceId, setSubServiceId] = useState("");
  const [loadingSub, setLoadingSub] = useState(false);

  const [form, setForm] = useState({
    name: "",
    organization: "",
    email: "",
    phone: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  /* ================= LOAD PRIMARY SERVICES ================= */
  useEffect(() => {
    if (!open) return;
    fetch("/api/services")
      .then((res) => res.json())
      .then(setServices)
      .catch(() => toast.error("Failed to load services"));
  }, [open]);

  /* ================= LOAD SUB-SERVICES (DEPENDENT) ================= */
  useEffect(() => {
    if (!serviceId) {
      setSubServices([]);
      setSubServiceId("");
      return;
    }

    setLoadingSub(true);
    setSubServiceId(""); // Reset selection when parent changes
    
    fetch(`/api/subservices?serviceId=${serviceId}`)
      .then((res) => res.json())
      .then((data) => {
        setSubServices(data);
        setLoadingSub(false);
      })
      .catch(() => {
        toast.error("Failed to load sub-services");
        setLoadingSub(false);
      });
  }, [serviceId]);

  /* ================= VALIDATION ================= */
  function validate() {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = "Client name is required";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Valid email is required";
    }
    if (form.phone.replace(/\D/g, "").length !== 10) {
      newErrors.phone = "10-digit phone is required";
    }
    if (!serviceId) newErrors.serviceId = "Service is required";
    // Optional: if you want sub-service to be mandatory
    // if (!subServiceId && subServices.length > 0) newErrors.subServiceId = "Sub-service is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  /* ================= SAVE ================= */
  async function save() {
    if (!validate()) return;
    setLoading(true);

    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          phone: form.phone.replace(/\D/g, ""),
          serviceId,
          subServiceId: subServiceId || null,
        }),
      });

      if (!res.ok) throw new Error();

      toast.success("Client onboarded successfully");
      setOpen(false);
      resetForm();
      onSuccess();
    } catch (err) {
      toast.error("Failed to add client");
    } finally {
      setLoading(false);
    }
  }

  const resetForm = () => {
    setForm({ name: "", organization: "", email: "", phone: "" });
    setServiceId("");
    setSubServiceId("");
    setErrors({});
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-600/20 transition-all active:scale-95 shrink-0"
      >
        <Plus size={18} />
        <span>Add Client</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-zinc-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-lg shadow-2xl border border-zinc-200 dark:border-zinc-800 animate-in fade-in zoom-in duration-200">
            
            <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-800/50">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-600/10 dark:bg-blue-600/20 rounded-lg text-blue-600"><UserPlus size={18} /></div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Onboard Client</h3>
              </div>
              <button onClick={() => setOpen(false)} className="text-zinc-400 hover:text-zinc-600"><X size={20} /></button>
            </div>

            <div className="p-6 space-y-4">
              <FormField label="Full Name" error={errors.name} icon={<User size={16} />}>
                <input
                  autoFocus
                  placeholder="John Doe"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none dark:text-white"
                />
              </FormField>
               {/* ORGANIZATION */}
              <FormField label="Organization" icon={<Building2 size={16} />}>
                <input
                  placeholder="e.g. Acme Corp"
                  value={form.organization}
                  onChange={(e) => setForm({ ...form, organization: e.target.value })}
                  className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none dark:text-white"
                />
              </FormField>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Email" error={errors.email} icon={<Mail size={16} />}>
                  <input
                    placeholder="john@example.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none dark:text-white"
                  />
                </FormField>
                <FormField label="Phone" error={errors.phone} icon={<Phone size={16} />}>
                  <input
                    placeholder="10-digit number"
                    maxLength={10}
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, "") })}
                    className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none dark:text-white"
                  />
                </FormField>
              </div>

              {/* SERVICE SELECTION */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Main Service" error={errors.serviceId} icon={<Briefcase size={16} />}>
                  <select
                    value={serviceId}
                    onChange={(e) => setServiceId(e.target.value)}
                    className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none dark:text-white"
                  >
                    <option value="">Select Service</option>
                    {services.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </FormField>

                <FormField label="Sub-Service" icon={<Layers size={16} />}>
                  <div className="relative">
                    <select
                      disabled={!serviceId || loadingSub || subServices.length === 0}
                      value={subServiceId}
                      onChange={(e) => setSubServiceId(e.target.value)}
                      className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none dark:text-white disabled:opacity-50 appearance-none transition-all"
                    >
                      <option value="">{loadingSub ? "Loading..." : subServices.length > 0 ? "Select Sub-Service" : "No Sub-Services"}</option>
                      {subServices.map((ss) => <option key={ss.id} value={ss.id}>{ss.name}</option>)}
                    </select>
                    {loadingSub && (
                      <div className="absolute right-3 top-2.5">
                        <Loader2 size={16} className="animate-spin text-blue-500" />
                      </div>
                    )}
                  </div>
                </FormField>
              </div>
            </div>

            <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-800/30 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-3">
              <button onClick={() => setOpen(false)} className="px-4 py-2 text-sm font-bold text-zinc-500">Cancel</button>
              <button
                onClick={save}
                disabled={loading}
                className="flex items-center gap-2 px-8 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-600/20 transition-all active:scale-95"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : "Onboard Client"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function FormField({ label, icon, children, error }: { label: string; icon: React.ReactNode; children: React.ReactNode; error?: string; }) {
  return (
    <div className="space-y-1.5 flex-1">
      <div className="flex items-center gap-2 mb-1">
        <div className="text-zinc-400 dark:text-zinc-500">{icon}</div>
        <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">{label}</label>
      </div>
      {children}
      {error && <p className="text-[10px] font-bold text-red-500 pl-1">{error}</p>}
    </div>
  );
}