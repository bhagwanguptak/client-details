export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";
import { 
  Users, 
  Briefcase, 
  FileText, 
  IndianRupee, 
  Clock, 
  ArrowRight,
  AlertCircle 
} from "lucide-react";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const [totalClients, activeServices, totalDocuments] = await Promise.all([
    prisma.client.count(),
    prisma.service.count({ where: { active: true } }),
    prisma.document.count(),
  ]);

  const [recentClients, pendingDocs] = await Promise.all([
    prisma.client.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        services: {
          include: { service: true, subService: true },
        },
      },
    }),
    prisma.clientService.findMany({
      where: {
        subServiceId: { not: null },
        client: { documents: { none: {} } },
      },
      take: 5,
      include: { client: true, service: true, subService: true },
    }),
  ]);

  return (
    <div className="p-4 md:p-8 space-y-8 bg-gray-50 dark:bg-zinc-950 min-h-screen transition-colors duration-300">
      {/* Header Section */}
      <div className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-500 dark:text-zinc-400 text-sm md:text-base">Overview of your business performance.</p>
      </div>

      {/* ================= STATS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard
          title="Total Clients"
          value={totalClients.toLocaleString()}
          icon={<Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />}
          trend="+4% from last month"
          color="bg-blue-50 dark:bg-blue-900/20"
          href="/admin/clients"
        />
        <StatCard
          title="Active Services"
          value={activeServices.toLocaleString()}
          icon={<Briefcase className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />}
          trend="Currently live"
          color="bg-emerald-50 dark:bg-emerald-900/20"
          href="/admin/services"
        />
        <StatCard
          title="Docs Uploaded"
          value={totalDocuments.toLocaleString()}
          icon={<FileText className="w-6 h-6 text-orange-600 dark:text-orange-400" />}
          trend="Total in cloud"
          color="bg-orange-50 dark:bg-orange-900/20"
          href="/admin/documents"
        />
        <StatCard
          title="Est. Revenue"
          value="₹ 3.2L"
          icon={<IndianRupee className="w-6 h-6 text-purple-600 dark:text-purple-400" />}
          trend="+12% growth"
          color="bg-purple-50 dark:bg-purple-900/20"
        />
      </div>

      {/* ================= PANELS ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* RECENT CLIENTS */}
        <Panel 
          title="Recent Clients" 
          description="Latest onboarded customers" 
          icon={<Clock className="w-5 h-5 text-gray-400 dark:text-zinc-500" />}
        >
          {recentClients.length === 0 ? (
            <EmptyState message="No clients added yet" />
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-zinc-800">
              {recentClients.map((client) => {
                const firstService = client.services[0];
                return (
                  <ClientRow
                    key={client.id}
                    name={client.name}
                  
                    service={
                      firstService
                        ? `${firstService.service.name}${
                            firstService.subService
                              ? " • " + firstService.subService.name
                              : ""
                          }`
                        : "No services"
                    }
                  />
                );
              })}
            </div>
          )}
        </Panel>

       <Panel 
        title="Pending Actions" 
        description="Clients with missing documentation"
        icon={<AlertCircle className="w-5 h-5 text-amber-500" />}
      >
        {pendingDocs.length === 0 ? (
          <EmptyState message="All caught up! No pending actions." />
        ) : (
          <div className="space-y-3">
            {pendingDocs.map((item) => (
              /* 🟢 1. Change the wrapper to a Link component */
              <Link 
                key={item.id} 
                href={`/admin/clients/${item.client.id}`} // 🟢 2. Point to the client detail page
                className="group flex items-start gap-3 p-3 rounded-xl border border-amber-100 dark:border-amber-900/30 bg-amber-50/30 dark:bg-amber-900/10 transition-all hover:bg-amber-100 dark:hover:bg-amber-900/20 hover:shadow-sm cursor-pointer block"
              >
                <div className="mt-1 p-1.5 bg-amber-100 dark:bg-amber-900/40 rounded-full text-amber-600 dark:text-amber-400">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 dark:text-zinc-100 truncate">
                    Upload documents for {item.client.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5 truncate">
                    {item.service.name} {item.subService && `→ ${item.subService.name}`}
                  </p>
                </div>
                {/* 🟢 3. The arrow is now always visible on mobile and pops on hover for desktop */}
                <ArrowRight className="w-4 h-4 text-amber-600 dark:text-amber-400 opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all self-center" />
              </Link>
            ))}
          </div>
        )}
      </Panel>

      </div>
    </div>
  );
}

/* ================= UI COMPONENTS ================= */



function StatCard({ 
  title, 
  value, 
  icon, 
  trend, 
  color, 
  href // 🟢 Add href here
}: { 
  title: string; 
  value: string; 
  icon: React.ReactNode; 
  trend: string;
  color: string;
  href?: string; // 🟢 Make it optional with ?
}) {
  const cardBody = (
    <div className={`
      bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 p-6 shadow-sm 
      transition-all duration-200 h-full
      ${href ? "hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-md cursor-pointer active:scale-[0.98]" : ""}
    `}>
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2.5 rounded-xl ${color}`}>
          {icon}
        </div>
      </div>
      <div>
        <p className="text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
          {title}
        </p>
        <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mt-1">
          {value}
        </h3>
        <p className="text-[10px] md:text-xs text-gray-400 dark:text-zinc-500 mt-2 font-medium">
          {trend}
        </p>
      </div>
    </div>
  );

  // If href exists, wrap in Link. If not, return plain div.
  return href ? (
    <Link href={href} className="block h-full">
      {cardBody}
    </Link>
  ) : (
    cardBody
  );
}

function Panel({ title, description, children, icon }: { 
  title: string; 
  description: string;
  children: React.ReactNode; 
  icon?: React.ReactNode;
}) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-50 dark:border-zinc-800 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h2>
            {icon}
          </div>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-0.5">{description}</p>
        </div>
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  );
}

function ClientRow({ name, email, service }: { 
  name: string; 
  email?: string;
  service: string; 
}) {
  return (
    <div className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
      <div className="min-w-0 pr-4">
        <p className="text-sm font-semibold text-gray-900 dark:text-zinc-100 truncate">{name}</p>
        <p className="text-xs text-gray-500 dark:text-zinc-400 truncate">{email}</p>
      </div>
      <div className="flex-shrink-0">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] md:text-xs font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800">
          {service}
        </span>
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <p className="text-sm text-gray-500 dark:text-zinc-500 italic">{message}</p>
    </div>
  );
}