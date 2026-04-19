import prisma from "@/lib/prisma";
import { Activity, Database, CheckCircle, XCircle, Clock, Server, ShieldCheck, Terminal as TerminalIcon } from "lucide-react";
import HealthActionsUI from "./HealthActionsUI";

export const dynamic = "force-dynamic";

export default async function AdminHealthPage() {
  let initialStatus: "OK" | "ERROR" = "OK";
  let initialErrorMsg = "";
  let initialStats: any = {};
  const start = Date.now();

  // Initial server-side check
  try {
    await prisma.$queryRaw`SELECT 1`;
    const latency = Date.now() - start;

    const schemas: any = await prisma.$queryRaw`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name IN ('menu', 'restaurant', 'app_storage', 'public')
    `;

    initialStats = {
      latency: `${latency}ms`,
      schemas: schemas.map((s: any) => s.schema_name),
    };
  } catch (err: any) {
    initialStatus = "ERROR";
    initialErrorMsg = err.message || "Unknown database error";
  }

  const envAudit = {
    DATABASE_URL: process.env.DATABASE_URL ? "SET (Masked: " + process.env.DATABASE_URL.split("@")[1] + ")" : "MISSING",
    DIRECT_URL: process.env.DIRECT_URL ? "SET" : "MISSING",
    NODE_ENV: process.env.NODE_ENV,
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase flex items-center gap-4">
          <Activity className="w-10 h-10 text-blue-600 animate-pulse" />
          Diagnostics
        </h1>
        <div className={`px-6 py-2 rounded-full font-black text-xs uppercase tracking-widest flex items-center gap-2 ${
          initialStatus === "OK" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
        }`}>
          {initialStatus === "OK" ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
          System Init: {initialStatus}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Quick Stats & Env */}
        <div className="space-y-8">
          {/* Env Audit */}
          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <ShieldCheck className="w-3 h-3" /> Environment Audit
            </h3>
            <div className="space-y-4">
               {Object.entries(envAudit).map(([key, value]) => (
                 <div key={key}>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">{key}</p>
                    <p className={`text-xs font-mono break-all ${value === "MISSING" ? "text-red-500 font-bold" : "text-gray-700"}`}>
                      {value || "undefined"}
                    </p>
                 </div>
               ))}
            </div>
          </div>

          {/* Initial Load Stats */}
          <div className="bg-gray-900 rounded-[2rem] p-8 text-white">
            <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <Clock className="w-3 h-3" /> Initialization Metrics
            </h3>
            <div className="space-y-6">
              <div>
                <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1">Cold Start Latency</p>
                <p className="text-2xl font-black">{initialStats.latency || "N/A"}</p>
              </div>
              <div>
                <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1">Detected Active Schemas</p>
                <div className="flex flex-wrap gap-2 mt-2">
                   {initialStats.schemas?.map((s: string) => (
                     <span key={s} className="px-2 py-0.5 bg-white/10 text-white rounded text-[8px] font-black uppercase">
                       {s}
                     </span>
                   ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Console */}
        <div className="lg:col-span-2">
           <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden flex flex-col h-full min-h-[600px]">
              <div className="bg-gray-50 px-8 py-4 border-b border-gray-100 flex items-center justify-between">
                 <div className="flex items-center gap-2 text-gray-400">
                    <TerminalIcon className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Live Diagnostic Console</span>
                 </div>
                 <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-200" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-200" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-200" />
                 </div>
              </div>
              
              <div className="flex-1 overflow-hidden flex flex-col">
                 <HealthActionsUI />
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
