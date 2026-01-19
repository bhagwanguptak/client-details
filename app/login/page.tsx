"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  Loader2, 
  ShieldCheck,
  Building2 
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/*                            LOGO CONFIGURATION                              */
/* -------------------------------------------------------------------------- */
const LOGO_CONFIG = {
  url: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png", 
  showImage: true,
  firmName: "CACLIENT DETAILS",
};

// 🟢 THE MONEY IMAGE (High-definition stacks of currency)
const MONEY_BG = "https://images.unsplash.com/photo-1580519542036-c47de6196ba5?auto=format&fit=crop&w=1920&q=80";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [showPhone, setShowPhone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, phone }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError("Invalid credentials. Try again.");
        setLoading(false);
        return;
      }
      if (data.user.role === "ADMIN") router.push("/admin/dashboard");
      else router.push("/client/dashboard");
    } catch {
      setError("Server error. Please try later.");
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 overflow-hidden bg-zinc-900">
      
      {/* 🟢 MONEY BACKGROUND WITH FLOW ANIMATION */}
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center scale-110"
          style={{ 
            backgroundImage: `url('${MONEY_BG}')`,
            animation: 'moneyFlow 30s linear infinite alternate',
            filter: 'brightness(0.7)'
          }}
        />
        {/* Subtle radial gradient to make the center form readable */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(0,0,0,0.4)_100%)]" />
      </div>

      <style jsx global>{`
        @keyframes moneyFlow {
          0% { transform: scale(1.1) translate(0, 0); }
          100% { transform: scale(1.3) translate(-20px, -20px); }
        }
      `}</style>

      {/* LOGIN BOX */}
      <div className="relative z-10 w-full max-w-[420px]">
        
        {/* LOGO */}
        <div className="flex flex-col items-center mb-8 drop-shadow-2xl">
          <div className="bg-white p-3 rounded-2xl shadow-xl mb-3">
            {LOGO_CONFIG.showImage ? (
              <img src={LOGO_CONFIG.url} alt="Logo" className="w-12 h-12 object-contain" />
            ) : (
              <Building2 className="w-10 h-10 text-blue-600" />
            )}
          </div>
          <h1 className="text-white text-2xl font-black tracking-tighter uppercase drop-shadow-md">
            {LOGO_CONFIG.firmName}
          </h1>
        </div>

        {/* FORM CARD */}
        <div className="bg-white/95 backdrop-blur-md rounded-[2.5rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] border border-white/40 overflow-hidden transition-all duration-300">
          <form onSubmit={handleLogin} className="p-8 md:p-10 space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-black text-zinc-900 tracking-tight">Secure Sign In</h2>
              <p className="text-[10px] font-bold text-zinc-400 mt-1 uppercase tracking-widest">Financial Portal</p>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-600 text-white text-[10px] font-bold text-center uppercase tracking-widest animate-bounce">
                {error}
              </div>
            )}

            <div className="space-y-4">
              {/* Email */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-1">Email</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-blue-600 transition-colors" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@firm.com"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-11 pr-4 py-3 text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all"
                  />
                </div>
              </div>

              {/* Password/Phone */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-1">Phone Number</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-blue-600 transition-colors" />
                  <input
                    type={showPhone ? "text" : "password"}
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter Password"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-11 pr-11 py-3 text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all"
                  />
                  <button type="button" onClick={() => setShowPhone(!showPhone)} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-blue-600">
                    {showPhone ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-xl shadow-blue-600/30 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2 uppercase text-xs tracking-widest"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><ShieldCheck className="w-5 h-5" /> Sign In</>}
            </button>
          </form>
        </div>

        <p className="mt-8 text-center text-[10px] text-white/70 uppercase tracking-[0.2em] font-bold">
          © {new Date().getFullYear()} {LOGO_CONFIG.firmName}
        </p>
      </div>
    </div>
  );
}