import prisma from "@/lib/prisma";
import { Activity, Database, CheckCircle, XCircle, Clock, Server } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminHealthPage() {
  let status: "OK" | "ERROR" = "OK";
  let errorMsg = "";
  let stats: any = {};
  const start = Date.now();

  try {
    // 1. Basic connection and latency check
    await prisma.$queryRaw`SELECT 1`;
    const latency = Date.now() - start;

    // 2. Schema existence check
    const schemas: any = await prisma.$queryRaw`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name IN ('menu', 'restaurant', 'app_storage', 'public')
    `;

    // 3. Table counts
    const tableCounts: any = await prisma.$queryRaw`
      SELECT 
        (SELECT COUNT(*)::int FROM "restaurant"."Restaurant") as restaurants,
        (SELECT COUNT(*)::int FROM "menu"."MenuItem") as meals,
        (SELECT COUNT(*)::int FROM "app_storage"."File") as files
    `;

    stats = {
      latency: `${latency}ms`,
      schemas: schemas.map((s: any) => s.schema_name),
      counts: tableCounts[0] || {}
    };
  } catch (err: any) {
    status = "ERROR";
    errorMsg = err.message || "Unknown database error";
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-12">
        <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase flex items-center gap-4">
          <Activity className="w-10 h-10 text-blue-600" />
          System Health
        </h1>
        <div className={`px-6 py-2 rounded-full font-black text-xs uppercase tracking-widest flex items-center gap-2 ${
          status === "OK" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
        }`}>
          {status === "OK" ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
          Database Status: {status}
        </div>
      </div>

      {status === "ERROR" && (
        <div className="bg-red-50 border-2 border-red-100 rounded-3xl p-8 mb-8">
          <h2 className="text-red-900 font-black uppercase text-sm mb-4">Connection Failure</h2>
          <code className="text-red-600 font-mono text-xs block bg-white p-4 rounded-xl border border-red-100 overflow-x-auto">
            {errorMsg}
          </code>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Connection Stats */}
        <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100 space-y-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
               <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Response Time</p>
              <p className="text-2xl font-black text-gray-900">{stats.latency || 'N/A'}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center">
               <Database className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Schemas</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {stats.schemas?.map((s: string) => (
                  <span key={s} className="px-2 py-0.5 bg-gray-50 text-gray-500 rounded-md text-[9px] font-black uppercase border border-gray-100">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Inventory Stats */}
        <div className="bg-gray-900 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-blue-200/20 space-y-8">
           <h3 className="text-xs font-black text-blue-400 uppercase tracking-[0.3em]">Inventory Pulse</h3>
           
           <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                 <p className="text-2xl font-black">{stats.counts?.restaurants || 0}</p>
                 <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest leading-none">Venues</p>
              </div>
              <div className="space-y-1">
                 <p className="text-2xl font-black">{stats.counts?.meals || 0}</p>
                 <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest leading-none">Meals</p>
              </div>
              <div className="space-y-1">
                 <p className="text-2xl font-black">{stats.counts?.files || 0}</p>
                 <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest leading-none">Files</p>
              </div>
           </div>

           <div className="pt-6 border-t border-white/5 flex items-center gap-3">
              <Server className="w-4 h-4 text-gray-600" />
              <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Prisma PostgreSQL Driver Adapter Active</span>
           </div>
        </div>
      </div>

      <div className="mt-12 text-center">
         <p className="text-xs text-gray-400 font-medium italic">
            This page performs real-time queries against your Supabase instance to verify end-to-end connectivity.
         </p>
      </div>
    </div>
  );
}
