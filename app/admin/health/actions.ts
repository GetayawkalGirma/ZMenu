"use server";

import prisma from "@/lib/prisma";

export async function testRawQuery() {
  try {
    const start = Date.now();
    // #region agent log
    fetch("http://127.0.0.1:7854/ingest/a5621d9f-7d5e-4ddb-9798-71ead7724972", { method: "POST", headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "adceb3" }, body: JSON.stringify({ sessionId: "adceb3", runId: "pre-fix-ssl", hypothesisId: "H3", location: "app/admin/health/actions.ts:testRawQuery:start", message: "Starting raw health query", data: { nodeEnv: process.env.NODE_ENV }, timestamp: Date.now() }) }).catch(() => {});
    // #endregion
    await prisma.$queryRaw`SELECT 1`;
    return { success: true, message: `Raw query (SELECT 1) succeeded in ${Date.now() - start}ms` };
  } catch (err: any) {
    const e = err as {
      message?: string;
      name?: string;
      stack?: string;
      code?: string;
      meta?: unknown;
      cause?: unknown;
    };
    // #region agent log
    fetch("http://127.0.0.1:7854/ingest/a5621d9f-7d5e-4ddb-9798-71ead7724972", { method: "POST", headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "adceb3" }, body: JSON.stringify({ sessionId: "adceb3", runId: "pre-fix-ssl", hypothesisId: "H3", location: "app/admin/health/actions.ts:testRawQuery:catch", message: "Raw health query failed", data: { errorMessage: e?.message, errorName: e?.name, errorCode: e?.code, errorMeta: e?.meta, errorCause: e?.cause ? String(e.cause) : null, stack: e?.stack }, timestamp: Date.now() }) }).catch(() => {});
    // #endregion
    return { success: false, message: err.message };
  }
}

export async function testFetchRestaurants() {
  try {
    const start = Date.now();
    const count = await prisma.restaurant.count();
    return { success: true, message: `Successfully fetched count (${count}) from restaurant.Restaurant in ${Date.now() - start}ms` };
  } catch (err: any) {
    const e = err as {
      message?: string;
      name?: string;
      code?: string;
      meta?: unknown;
      cause?: unknown;
    };
    // #region agent log
    fetch("http://127.0.0.1:7854/ingest/a5621d9f-7d5e-4ddb-9798-71ead7724972", { method: "POST", headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "adceb3" }, body: JSON.stringify({ sessionId: "adceb3", runId: "pre-fix-ssl", hypothesisId: "H4", location: "app/admin/health/actions.ts:testFetchRestaurants:catch", message: "Restaurant count failed", data: { errorMessage: e?.message, errorName: e?.name, errorCode: e?.code, errorMeta: e?.meta, errorCause: e?.cause ? String(e.cause) : null }, timestamp: Date.now() }) }).catch(() => {});
    // #endregion
    return { success: false, message: err.message };
  }
}

export async function testFetchMeals() {
  try {
    const start = Date.now();
    const count = await prisma.menuItem.count();
    return { success: true, message: `Successfully fetched count (${count}) from menu.MenuItem in ${Date.now() - start}ms` };
  } catch (err: any) {
    const e = err as {
      message?: string;
      name?: string;
      code?: string;
      meta?: unknown;
      cause?: unknown;
    };
    // #region agent log
    fetch("http://127.0.0.1:7854/ingest/a5621d9f-7d5e-4ddb-9798-71ead7724972", { method: "POST", headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "adceb3" }, body: JSON.stringify({ sessionId: "adceb3", runId: "pre-fix-ssl", hypothesisId: "H5", location: "app/admin/health/actions.ts:testFetchMeals:catch", message: "Meal count failed", data: { errorMessage: e?.message, errorName: e?.name, errorCode: e?.code, errorMeta: e?.meta, errorCause: e?.cause ? String(e.cause) : null }, timestamp: Date.now() }) }).catch(() => {});
    // #endregion
    return { success: false, message: err.message };
  }
}

export async function checkEnvVars() {
  return {
    dbUrlSet: !!process.env.DATABASE_URL,
    directUrlSet: !!process.env.DIRECT_URL,
    dbUrlMasked: process.env.DATABASE_URL?.replace(/:([^@]+)@/, ":****@"),
    nodeEnv: process.env.NODE_ENV,
  };
}
