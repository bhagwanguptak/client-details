"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Mail,
  Building2,
  Trash2,
  Search,
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import AddClientButton from "@/components/AddClientButton";

/* ---------------- Types ---------------- */

type Client = {
  id: string;
  name: string;
  organization: string;
  user: {
    email: string;
    active?: boolean;
  };
  services: {
    id: string;
    service: { name: string };
    subService: { name: string } | null;
  }[];
};

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  // UI state
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const PAGE_SIZE = 6;

  /* ---------------- Data ---------------- */

  async function loadClients() {
    setLoading(true);
    try {
      const res = await fetch("/api/clients");
      const data = await res.json();
      setClients(data);
    } catch (err) {
      toast.error("Failed to load clients");
    } finally {
      setLoading(false);
    }
  }

  async function removeClient(id: string) {
    const ok = confirm("Are you sure you want to delete this client? This action cannot be undone.");
    if (!ok) return;

    const res = await fetch(`/api/clients/${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      toast.success("Client deleted successfully");
      loadClients();
    } else {
      toast.error("Failed to delete client");
    }
  }

  useEffect(() => {
    loadClients();
  }, []);

  /* ---------------- Derived ---------------- */

  const filtered = useMemo(() => {
    return clients.filter((c) =>
      `${c.name} ${c.user.email} ${c.organization}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [clients, search]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  const paginated = filtered.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  return (
    <div className="p-4 md:p-8 space-y-8 bg-gray-50/50 dark:bg-zinc-950 min-h-screen">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white">
            Clients
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Manage and view your customer database</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <SearchBox value={search} onChange={(val) => {setSearch(val); setPage(1);}} />
          <AddClientButton onSuccess={loadClients} />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <SkeletonGrid />
      ) : paginated.length === 0 ? (
        <EmptyState search={search} />
      ) : (
        <div className="space-y-8">
          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginated.map((client) => (
              <div
                key={client.id}
                className="group relative bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
              >
                {/* Header with Avatar & Status */}
                <div className="p-6 pb-4 flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-600/20">
                      {client.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 truncate pr-2">
                        {client.name}
                      </h3>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800">
                        <BadgeCheck className="h-3 w-3" />
                        Active
                      </span>
                    </div>
                  </div>
                  
                  <Link 
                    href={`/admin/clients/${client.id}`}
                    className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-400 dark:text-zinc-500 transition-colors"
                  >
                    <ExternalLink size={18} />
                  </Link>
                </div>

                {/* Details Body */}
                <div className="px-8 space-y-4">
                  <InfoRow icon={Mail} value={client.user.email} />
                  <InfoRow icon={Building2} value={client.organization || "No Organization"} />

                  <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
                    <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-2">Services</p>
                    {client.services.length === 0 ? (
                      <p className="text-xs text-zinc-400 italic">No services assigned</p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {client.services.slice(0, 3).map((cs) => (
                          <span key={cs.id} className="text-[10px] px-2 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-md font-medium border border-zinc-200 dark:border-zinc-700">
                            {cs.service.name}
                          </span>
                        ))}
                        {client.services.length > 3 && (
                          <span className="text-[10px] px-2 py-1 bg-zinc-50 dark:bg-zinc-800 text-zinc-400 rounded-md border border-dashed border-zinc-200 dark:border-zinc-700">
                            +{client.services.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Action */}
                {/* Footer Action */}
                  <div className="mt-auto p-4 px-6 border-t border-zinc-50 dark:border-zinc-800 flex justify-end items-center bg-red-50/30 dark:bg-red-900/10 rounded-b-2xl">
                    <button
                      onClick={(e) => { e.preventDefault(); removeClient(client.id); }}
                      className="flex items-center gap-1.5 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-xs font-bold transition-colors uppercase tracking-wider"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete Client
                    </button>
                  </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <Pagination
            page={page}
            total={totalPages}
            onChange={setPage}
          />
        </div>
      )}
    </div>
  );
}

/* ---------------- Components ---------------- */

function SearchBox({ value, onChange }: { value: string; onChange: (v: string) => void; }) {
  return (
    <div className="relative group">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-blue-500 transition-colors" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search by name, email, org..."
        className="pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm w-full md:w-80 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all dark:text-white"
      />
    </div>
  );
}

function InfoRow({ icon: Icon, value }: { icon: any; value: string; }) {
  return (
    <div className="flex items-start gap-2.5 text-zinc-600 dark:text-zinc-400">
      <div className="p-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-md shrink-0 mt-0.5">
        <Icon className="h-3.5 w-3.5" />
      </div>
      {/* Changed truncate to break-all and removed leading-none to allow wrapping */}
      <span className="text-sm font-medium break-all leading-snug">{value}</span>
    </div>
  );
}

function Pagination({ page, total, onChange }: { page: number; total: number; onChange: (p: number) => void; }) {
  if (total <= 1) return null;

  return (
    <div className="flex justify-center items-center gap-2 pt-6">
      <button 
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
        className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 disabled:opacity-30"
      >
        <ChevronLeft size={18} className="dark:text-white" />
      </button>
      
      <div className="flex gap-1.5">
        {Array.from({ length: total }).map((_, i) => (
          <button
            key={i}
            onClick={() => onChange(i + 1)}
            className={`w-10 h-10 rounded-lg text-sm font-bold transition-all ${
              page === i + 1
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800"
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      <button 
        disabled={page === total}
        onClick={() => onChange(page + 1)}
        className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 disabled:opacity-30"
      >
        <ChevronRight size={18} className="dark:text-white" />
      </button>
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-4 animate-pulse">
          <div className="flex gap-3">
            <div className="h-12 w-12 bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
            <div className="space-y-2 flex-1 pt-1">
              <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-1/2" />
              <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-1/3" />
            </div>
          </div>
          <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-full" />
          <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4" />
        </div>
      ))}
    </div>
  );
}

function EmptyState({ search }: { search: string }) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-16 text-center shadow-sm">
      <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
        <UsersIcon className="h-8 w-8 text-zinc-400" />
      </div>
      <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
        {search ? "No matches found" : "No clients yet"}
      </h3>
      <p className="text-zinc-500 dark:text-zinc-400 mt-1 max-w-xs mx-auto text-sm">
        {search 
          ? `We couldn't find any results for "${search}". Try adjusting your search keywords.` 
          : "Get started by onboarding your first client using the button above."}
      </p>
    </div>
  );
}

function UsersIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
  )
}