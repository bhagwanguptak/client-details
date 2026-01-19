"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  FileText,
  Menu,
  X,Layers,
} from "lucide-react";
import LogoutButton from "@/components/LogoutButton";
import { Toaster } from "react-hot-toast";
import ClientLogoutButton from "@/components/ClientLogoutButton";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState({ name: "Admin", email: "", role: "ADMIN" });
  const pathname = usePathname();

  // Fetch and Decode Cookie
  useEffect(() => {
    const token = Cookies.get("auth_token");
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        setUser({
          name: decoded.name || "Admin",
          email: decoded.email || "No email provided",
          role: decoded.role || "ADMIN",
        });
      } catch (error) {
        console.error("Token decoding failed:", error);
      }
    }
  }, []);

  const menu = [
    { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard, roles: ["ADMIN"] },
    { label: "Clients", href: "/admin/clients", icon: Users, roles: ["ADMIN"] },
    { label: "Services", href: "/admin/services", icon: Briefcase, roles: ["ADMIN"] },
    {label: "Sub-Services",href: "/admin/subservices", icon: Layers, roles: ["ADMIN"]},
    { label: "Documents", href: "/admin/documents", icon: FileText, roles: ["ADMIN", "CLIENT"] },
    // Inside AdminLayout menu array:

  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 transition-colors duration-300 flex">
      {/* MOBILE OVERLAY */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 dark:bg-black text-white
          transform transition-transform duration-300 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full"}
          md:relative md:translate-x-0 flex flex-col border-r border-slate-800 dark:border-zinc-800
        `}
      >
        <div className="px-6 py-6 text-2xl font-bold border-b border-slate-800 dark:border-zinc-800 flex justify-between items-center">
          <span className="text-white">CAClient</span>
          <button className="md:hidden p-1 text-slate-400" onClick={() => setOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-1">
          {menu
            .filter((item) => item.roles.includes(user.role))
            .map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    active ? "bg-blue-600 text-white shadow-md" : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </a>
              );
            })}
        </nav>

        <div className="px-4 py-4 border-t border-slate-800 dark:border-zinc-800">
          <LogoutButton />
        </div>
      </aside>

      {/* MAIN SECTION */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* HEADER */}
        <header className="bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 h-16 px-4 md:px-8 flex justify-between items-center sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-4">
            <button
              className="md:hidden p-2 text-zinc-600 dark:text-zinc-100 bg-gray-100 dark:bg-zinc-800 rounded-lg"
              onClick={() => setOpen(true)}
            >
              <Menu size={24} />
            </button>
            {/*  High contrast title */}
            <h1 className="text-lg md:text-xl font-bold text-zinc-900 dark:text-zinc-50">
              {menu.find((m) => m.href === pathname)?.label || "Admin"}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              {/*  High contrast User data */}
              <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50 leading-tight">
                {user.name}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                {user.email}
              </p>
            </div>
            
            {/*  Highly visible Profile Icon */}
            <div className="h-10 w-10 rounded-full bg-blue-600 ring-2 ring-white dark:ring-zinc-800 flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-lg select-none">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
             <div className="shrink-0 flex items-center gap-3">
           <ClientLogoutButton />
        </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto h-full p-0">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export function RootLayout({ children }: any) {
  return (
    <html lang="en" className="dark:bg-zinc-950">
      <body className="antialiased font-sans bg-gray-50 dark:bg-zinc-950">
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}