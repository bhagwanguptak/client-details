import { prisma } from "@/lib/prisma";
import AddDocumentButton from "@/components/AddDocumentButton";
import { 
  Mail, 
  Phone, 
  Building2, 
  Briefcase, 
  FileText, 
  Download, 
  User,
  ExternalLink,
  Plus
} from "lucide-react";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!id) return <div className="p-8 text-center text-red-500">Invalid client id</div>;

  // Fetching data
  const [documents, client] = await Promise.all([
    prisma.document.findMany({
      where: { clientId: id },
      include: {
        subService: {
          include: { service: true },
        },
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.client.findUnique({
      where: { id },
      include: {
        user: true,
        services: {
          include: {
            service: true,
            subService: true,
          },
        },
      },
    })
  ]);

  if (!client) return <div className="p-8 text-center text-gray-500">Client not found</div>;

  return (
    <div className="p-4 md:p-8 space-y-8 bg-gray-50/50 dark:bg-zinc-950 min-h-screen">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/20 text-2xl font-bold">
            {client.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{client.name}</h1>
            <p className="text-sm text-gray-500 dark:text-zinc-400 flex items-center gap-1 mt-1">
              <Building2 className="w-3.5 h-3.5" /> {client.organization || "No Organization"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-full border border-emerald-100 dark:border-emerald-800">
             Active Client
           </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: CONTACT INFO & SERVICES */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* CONTACT INFO CARD */}
          <section className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm">
            <h3 className="text-sm font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-4">Contact Details</h3>
            <div className="space-y-4">
              <InfoItem icon={<Mail className="w-4 h-4" />} label="Email" value={client.user.email} />
              <InfoItem icon={<Phone className="w-4 h-4" />} label="Phone" value={client.user.phone} />
              <InfoItem icon={<Building2 className="w-4 h-4" />} label="Org" value={client.organization} />
            </div>
          </section>

          {/* SERVICES LIST CARD */}
          <section className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">Subscribed Services</h3>
              <Briefcase className="w-4 h-4 text-gray-400" />
            </div>
            
            <div className="space-y-3">
              {client.services.map((cs) => (
                <div key={cs.id} className="group p-3 rounded-xl bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800">
                  <div className="flex justify-between items-start">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{cs.service.name}</p>
                      {cs.subService && (
                        <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">{cs.subService.name}</p>
                      )}
                    </div>
                    {cs.subService && (
                      <AddDocumentButton clientId={client.id} subServiceId={cs.subService.id} />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN: DOCUMENTS SECTION */}
        <div className="lg:col-span-2">
          <section className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden h-full">
            <div className="p-6 border-b border-gray-50 dark:border-zinc-800 flex items-center justify-between bg-gray-50/30 dark:bg-zinc-800/30">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Documents Repository</h3>
              </div>
              <span className="text-xs font-medium text-gray-400 dark:text-zinc-500 bg-gray-100 dark:bg-zinc-800 px-2 py-1 rounded">
                {documents.length} Files
              </span>
            </div>

            <div className="p-6">
              {documents.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="w-12 h-12 bg-gray-50 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-6 h-6 text-gray-300 dark:text-zinc-600" />
                  </div>
                  <p className="text-gray-500 dark:text-zinc-500 text-sm">No documents found for this client.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {documents.map((doc) => (
                    <div key={doc.id} className="group p-4 rounded-xl border border-gray-100 dark:border-zinc-800 hover:border-blue-200 dark:hover:border-blue-900 transition-all bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md">
                      <div className="flex items-start justify-between gap-3">
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                          <FileText className="w-5 h-5" />
                        </div>
                        <a 
                          href={`/api/documents/${doc.id}`} target="_blank" rel="noopener noreferrer"
                          download 
                          className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          title="Download File"
                        >
                          <Download className="w-5 h-5" />
                        </a>
                      </div>
                      
                      <div className="mt-4">
                        <h4 className="text-sm font-bold text-gray-900 dark:text-zinc-100 truncate" title={doc.fileName}>
                          {doc.fileName}
                        </h4>
                        <div className="mt-1 flex flex-wrap gap-1 text-[10px] uppercase font-bold tracking-wider text-gray-400 dark:text-zinc-500">
                          <span>{doc.subService.service.name}</span>
                          <span>•</span>
                          <span className="text-blue-600 dark:text-blue-400">{doc.subService.name}</span>
                        </div>
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

/* ================= MINI COMPONENTS ================= */

function InfoItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | null }) {
  return (
    <div className="flex items-center gap-3">
      <div className="p-2 bg-gray-50 dark:bg-zinc-800 text-gray-400 dark:text-zinc-500 rounded-lg">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-tight leading-none mb-1">{label}</p>
        <p className="text-sm font-semibold text-gray-700 dark:text-zinc-200 truncate">{value || "N/A"}</p>
      </div>
    </div>
  );
}