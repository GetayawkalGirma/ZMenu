"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { Lock, ShieldCheck, ArrowRight, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(false);

    // Dummy delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (password === "admin") {
      // Set a dummy cookie
      document.cookie = "admin_session=authenticated; path=/; max-age=86400; SameSite=Strict";
      router.push("/admin");
      router.refresh();
    } else {
      setError(true);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-[440px] space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-[2.5rem] bg-gray-900 shadow-2xl shadow-gray-200">
                <ShieldCheck className="w-10 h-10 text-white" />
            </div>
            <div>
                <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase">Security</h1>
                <p className="text-gray-400 font-medium italic mt-1">Authorized access only. Please verify identity.</p>
            </div>
        </div>

        <Card className="rounded-[3rem] border-gray-100 shadow-2xl shadow-gray-100 overflow-hidden bg-white">
          <CardHeader className="bg-gray-50/50 border-b border-gray-100 p-8 text-center">
            <CardTitle className="text-xs font-black uppercase tracking-[0.3em] text-gray-400">Admin Authentication</CardTitle>
          </CardHeader>
          <CardContent className="p-8 sm:p-10">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-4">
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-gray-900 transition-colors">
                        <Lock className="w-5 h-5" />
                    </div>
                    <input
                        type="password"
                        placeholder="Enter admin password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={cn(
                            "w-full h-14 pl-12 pr-4 bg-gray-50 border-gray-100 rounded-2xl text-sm font-bold focus:bg-white focus:ring-4 focus:ring-gray-100 transition-all outline-none",
                            error && "border-red-200 ring-4 ring-red-50"
                        )}
                        required
                        autoFocus
                    />
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-red-500 text-xs font-bold uppercase tracking-widest bg-red-50 p-3 rounded-xl animate-bounce">
                    <AlertCircle className="w-4 h-4" />
                    Invalid Access Credentials
                  </div>
                )}
              </div>

              <Button 
                type="submit" 
                disabled={loading}
                className="w-full h-14 bg-gray-900 hover:bg-black text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-gray-200 transition-all active:scale-95 flex items-center justify-center gap-3"
              >
                {loading ? "Verifying..." : (
                    <>
                        Unlock Console
                        <ArrowRight className="w-4 h-4" />
                    </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-[10px] text-gray-300 font-black uppercase tracking-[0.2em] pt-4">
            ZMenu Management System v2.0
        </p>
      </div>
    </div>
  );
}
