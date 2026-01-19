import { prisma } from "@/lib/prisma";
import { 
  FileText, 
  Download, 
  Briefcase, 
  User, 
  Calendar,
  Layers,
  Search,
  Trash2,
  FileCode,
  ArrowUpRight,
  Database
} from "lucide-react";
import Link from "next/link";
import DeleteDocButton from "@/components/DeleteDocuments";

export const dynamic = "force-dynamic";

export default async function AdminDocumentsPage() {
  const documents = await prisma.document.findMany({
    include: {
      client: true,
      subService: { include: { service: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  /* ---------------- STATS LOGIC ---------------- */
  const serviceCountMap = documents.reduce<Record<string, { name: string; count: number }>>((acc, doc) => {
    const service = doc.subService.service;
    if (!acc[service.id]) acc[service.id] = { name: service.name, count: 0 };
    acc[service.id].count += 1;
    return acc;
  }, {});

  const serviceCounts = Object.values(serviceCountMap);
  const totalDocs = documents.length;
  const uniqueClients = new Set(documents.map(d => d.clientId)).size;

  return (
    <div className="p-4 md:p-8 space-y-8 bg-gray-50/50 dark:bg-zinc-950 min-h-screen">
      
      {/* 1. TOP HEADER & GLOBAL STATS */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
            Document Center
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Central repository for all client uploads and compliance files.
          </p>
        </div>

        <div className="flex items-center gap-4 overflow-x-auto pb-2 md:pb-0">
            <QuickStat label="Total Files" value={totalDocs} icon={<FileText size={16} />} color="text-blue-600" />
            <QuickStat label="Clients" value={uniqueClients} icon={<User size={16} />} color="text-emerald-600" />
            <QuickStat label="Services" value={serviceCounts.length} icon={<Database size={16} />} color="text-purple-600" />
        </div>
      </div>

      {/* 2. SERVICE CATEGORIES (Horizontal Scrollable) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
            <Layers size={14} /> Filter by Service
          </h3>
        </div>
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
          {serviceCounts.map((s) => (
            <button
              key={s.name}
              className="flex-shrink-0 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-5 py-3 flex items-center gap-4 shadow-sm hover:border-blue-500 transition-all group"
            >
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <FileCode size={18} />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{s.name}</p>
                <p className="text-[10px] text-zinc-400 font-bold uppercase">{s.count} Documents</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* 3. DOCUMENT MANAGEMENT TABLE */}
      <section className="bg-white dark:bg-zinc-900 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden">
        
        {/* Table Header / Toolbar */}
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
             <input 
                placeholder="Search by file name or client..." 
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
             />
          </div>
          <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
            Showing {documents.length} Recent Files
          </div>
        </div>

        {/* The List */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-zinc-50/50 dark:bg-zinc-800/30 text-[10px] font-bold uppercase tracking-widest text-zinc-500 border-b border-zinc-100 dark:border-zinc-800">
              <tr>
                <th className="px-6 py-4">File Name</th>
                <th className="px-6 py-4">Client</th>
                <th className="px-6 py-4">Service Path</th>
                <th className="px-6 py-4 text-right">Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {documents.map((doc) => (
                <tr key={doc.id} className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 transition-colors">
                  {/* Filename */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg group-hover:scale-110 transition-transform">
                        <FileText size={18} />
                      </div>
                      <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate max-w-[200px]" title={doc.fileName}>
                        {doc.fileName}
                      </span>
                    </div>
                  </td>

                  {/* Client Link */}
                  <td className="px-6 py-4">
                    <Link href={`/admin/clients/${doc.clientId}`} className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-md">
                      <User size={12} />
                      {doc.client.name}
                      <ArrowUpRight size={10} />
                    </Link>
                  </td>

                  {/* Service Path */}
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{doc.subService.service.name}</span>
                      <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium">↳ {doc.subService.name}</span>
                    </div>
                  </td>

                  {/* Date */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex flex-col items-end">
                      <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                         {new Date(doc.createdAt).toLocaleDateString('en-GB')}
                      </span>
                      <span className="text-[10px] text-zinc-400 uppercase font-bold">Uploaded</span>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <a 
                          href={`/api/documents/${doc.id}`} target="_blank" rel="noopener noreferrer"
                          download 
                          className="p-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-lg hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                        >
                          <Download size={16} />
                       </a>
                      <DeleteDocButton id={doc.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

/* ---------------- HELPER COMPONENTS ---------------- */

function QuickStat({ label, value, icon, color }: { label: string; value: any; icon: React.ReactNode; color: string }) {
  return (
    <div className="bg-white dark:bg-zinc-900 px-4 py-2.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex items-center gap-3 shadow-sm min-w-[140px]">
       <div className={`${color} p-1.5 bg-gray-50 dark:bg-zinc-800 rounded-lg`}>{icon}</div>
       <div>
         <p className="text-[10px] font-bold text-zinc-400 uppercase leading-none mb-1">{label}</p>
         <p className="text-sm font-black text-zinc-900 dark:text-white leading-none">{value}</p>
       </div>
    </div>
  )
}