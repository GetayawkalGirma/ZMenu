"use client";

import { useState } from "react";
import { 
  testRawQuery, 
  testFetchRestaurants, 
  testFetchMeals, 
  testCloudStorage 
} from "./actions";
import { Play, RotateCcw, Box, Check, X, Loader2 } from "lucide-react";

type LogEntry = {
  id: string;
  type: "INFO" | "SUCCESS" | "ERROR";
  message: string;
  timestamp: string;
};

export default function HealthActionsUI() {
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: "1",
      type: "INFO",
      message: "Diagnostic console initialized. Ready for user testing.",
      timestamp: "--:--:--",
    },
  ]);
  const [loading, setLoading] = useState(false);

  const addLog = (type: LogEntry["type"], message: string) => {
    const time = new Date().toLocaleTimeString();
    setLogs((prev) => [
      { id: Math.random().toString(36), type, message, timestamp: time },
      ...prev.slice(0, 19), // Keep last 20 logs
    ]);
  };

  const runTest = async (testName: string, testFn: () => Promise<any>) => {
    if (loading) return;
    setLoading(true);
    addLog("INFO", `Starting test: ${testName}...`);

    try {
      const result = await testFn();
      if (result.success) {
        addLog("SUCCESS", result.message);
      } else {
        addLog("ERROR", `FAILED: ${result.message}`);
      }
    } catch (err: any) {
      addLog("ERROR", `CRITICAL: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const clearLogs = () => {
    setLogs([
      {
        id: "init",
        type: "INFO",
        message: "Console cleared.",
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);
  };

  return (
    <>
      <div className="flex-1 p-8 overflow-auto border-b border-gray-100 bg-gray-50/30">
        <div className="space-y-4">
          {logs.map((log) => (
            <div key={log.id} className="flex gap-4 items-start group">
              <span className="text-[10px] font-mono text-gray-400 mt-1 whitespace-nowrap">
                {log.timestamp}
              </span>
              <div className="flex gap-2 items-start">
                {log.type === "SUCCESS" && (
                  <Check className="w-4 h-4 text-emerald-500 mt-0.5" />
                )}
                {log.type === "ERROR" && (
                  <X className="w-4 h-4 text-red-500 mt-0.5" />
                )}
                {log.type === "INFO" && (
                  <Box className="w-4 h-4 text-blue-500 mt-0.5" />
                )}

                <p
                  className={`text-xs font-mono leading-relaxed break-all ${
                    log.type === "SUCCESS"
                      ? "text-emerald-700"
                      : log.type === "ERROR"
                        ? "text-red-700 font-bold"
                        : "text-gray-600"
                  }`}
                >
                  {log.message}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-8 bg-white grid grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={() => runTest("Raw Connectivity", testRawQuery)}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 disabled:opacity-50 transition-all shadow-lg shadow-blue-200"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Play className="w-4 h-4" />
          )}
          Run Raw Query
        </button>

        <button
          onClick={() => runTest("Restaurant Count", testFetchRestaurants)}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black disabled:opacity-50 transition-all"
        >
          <Database className="w-4 h-4" />
          Table Status (Res)
        </button>

        <button
          onClick={() => runTest("Meal Count", testFetchMeals)}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black disabled:opacity-50 transition-all"
        >
          <Database className="w-4 h-4" />
          Table Status (Meal)
        </button>

        <button
          onClick={() => runTest("Cloud Storage", testCloudStorage)}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-lg shadow-emerald-200"
        >
          <Box className="w-4 h-4" />
          Test Cloud Storage
        </button>

        <button
          onClick={clearLogs}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-200 text-gray-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all"
        >
          <RotateCcw className="w-4 h-4" />
          Clear
        </button>
      </div>
    </>
  );
}

// Inline Lucide icon for UI consistency
function Database({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M3 5V19A9 3 0 0 0 21 19V5" />
      <path d="M3 12A9 3 0 0 0 21 12" />
    </svg>
  );
}
