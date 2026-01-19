import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import ClientLogoutButton from "@/components/ClientLogoutButton";
import { 
  FileText, 
  Download, 
  Briefcase, 
  User, 
  Building2, 
  BadgeCheck,
  Layers,
  LayoutDashboard
} from "lucide-react";

export const dynamic = "force-dynamic";

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

export default async function ClientDashboardPage() {
  /* ---------------- AUTH (Logic Intact) ---------------- */
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) return <div className="p-8 text-center text-red-500">Unauthorized</div>;

  const { payload } = await jwtVerify(token, secret);
  const userId = payload.sub as string;

  if (!userId) return <div className="p-8 text-center text-red-500">Unauthorized</div>;

  /* ---------------- DATA FETCHING (Logic Intact) ---------------- */
  const client = await prisma.client.findUnique({
    where: { userId },
    include: {
      user: true,
      services: {
        include: { service: true, subService: true },
      },
      documents: {
        include: {
          subService: { include: { service: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!client) return <div className="p-8 text-center text-gray-500">Client record not found</div>;

  /* ---------------- GROUP DOCUMENTS (Logic Intact) ---------------- */
  const docsByService = client.documents.reduce<
    Record<string, { serviceName: string; items: any[] }>
  >((acc, doc) => {
    const service = doc.subService.service;
    if (!acc[service.id]) {
      acc[service.id] = { serviceName: service.name, items: [] };
    }
    acc[service.id].items.push({
      id: doc.id,
      fileName: doc.fileName,
      fileUrl: doc.fileUrl,
      subServiceName: doc.subService.name,
    });
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 p-4 md:p-8 space-y-8 transition-colors duration-300">
      
      {/* ================= HEADER ================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-zinc-900 p-6 md:p-8 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-sm">
        <div className="flex items-center gap-5">
          <div className="h-16 w-16 md:h-20 md:w-20 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-xl shadow-blue-600/20 text-3xl font-bold">
            {client.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl md:text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
              Hello, {client.name.split(" ")[0]}
            </h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-zinc-500 dark:text-zinc-400">
              <p className="text-sm md:text-base flex items-center gap-1.5 font-medium">
                <Building2 size={16} className="text-blue-500" />
                {client.organization}
              </p>
              <p className="text-sm md:text-base flex items-center gap-1.5 font-medium">
                <User size={16} className="text-blue-500" />
                {client.user.email}
              </p>
            </div>
          </div>
        </div>
        <div className="shrink-0 flex items-center gap-3">
           <ClientLogoutButton />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* ================= SERVICES SECTION ================= */}
        <div className="lg:col-span-1 space-y-6">
          <section className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <Briefcase className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white uppercase tracking-wider text-[11px]">
                Your Active Subscriptions
              </h2>
            </div>

            {client.services.length === 0 ? (
              <p className="text-sm text-zinc-400 italic">No services assigned yet.</p>
            ) : (
              <div className="space-y-3">
                {client.services.map((cs) => (
                  <div key={cs.id} className="p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800 flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="font-bold text-zinc-900 dark:text-white text-sm truncate">{cs.service.name}</p>
                      {cs.subService && (
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{cs.subService.name}</p>
                      )}
                    </div>
                    <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-full">
                      <BadgeCheck size={12} />
                      ACTIVE
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* ================= DOCUMENTS SECTION ================= */}
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-50 dark:border-zinc-800 flex items-center gap-2 bg-gray-50/50 dark:bg-zinc-800/30">
              <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Your Document Vault</h2>
            </div>

            <div className="p-6">
              {Object.keys(docsByService).length === 0 ? (
                <div className="py-20 text-center">
                   <div className="w-16 h-16 bg-gray-50 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileText className="w-8 h-8 text-zinc-200 dark:text-zinc-700" />
                   </div>
                   <p className="text-zinc-500 dark:text-zinc-500 font-medium">No documents have been shared with you yet.</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {Object.values(docsByService).map((group) => (
                    <div key={group.serviceName} className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Layers size={14} className="text-zinc-400" />
                        <h3 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                          {group.serviceName}
                        </h3>
                        <div className="h-px flex-1 bg-zinc-100 dark:bg-zinc-800 ml-2" />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {group.items.map((doc) => (
                          <div
                            key={doc.id}
                            className="group p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-blue-200 dark:hover:border-blue-900 transition-all hover:shadow-md"
                          >
                            <div className="flex justify-between items-start gap-4">
                              <div className="min-w-0">
                                <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate pr-2 break-all" title={doc.fileName}>
                                  {doc.fileName}
                                </p>
                                <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 mt-1 uppercase tracking-tight">
                                  {doc.subServiceName}
                                </p>
                              </div>
                              <a
                                href={`/api/documents/${doc.id}/view`} 
                                target="_blank"
                                download
                                className="shrink-0 p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white transition-all shadow-sm"
                                title="Download File"
                              >
                                <Download size={18} />
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>

      </div>
    </div>
  );
}