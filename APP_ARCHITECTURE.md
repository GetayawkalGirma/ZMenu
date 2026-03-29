# 🏗️ Next.js Enterprise Architecture Instructions for IDE AI

## ⚡ Purpose

Always build Next.js applications using this **internal-first, clean architecture** approach. Use API routes **only for external clients in the future**.

---

## 1️⃣ Layers & Responsibilities

| Layer                             | Responsibility                       | Usage Notes                                                                                                                                                                   |
| --------------------------------- | ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Client / TSX**                  | React components, pages, forms       | Handles all user interactions and submits data to Server Actions                                                                                                              |
| **Server Action (`use server`)**  | Page-level backend entry             | Runs on the server. Validates inputs, calls Service layer, triggers revalidation, returns results to TSX                                                                      |
| **Service Layer**                 | Business logic, reusable operations  | Handles logic like `getRestaurantById`, `createRestaurant`, `deleteRestaurantById`. **Never call DB directly here**. Can be shared across pages/actions.                      |
| **Repository Layer**              | Database interactions (Prisma / SQL) | Encapsulates all database calls. Only layer allowed to touch DB.                                                                                                              |
| **API Folder (optional, future)** | HTTP endpoints for external clients  | Located at `app/api/`. Only use if other apps (Flutter, React Native, etc.) need to call backend. Calls the same Service → Repository. Do **not** call API routes internally. |

---

## 2️⃣ Internal Admin Panel Flow (Default)

```text
TSX (Client)
  → Server Action (use server)
      → Service (business logic)
          → Repository (DB calls)
              → Database
```

**Key Points:**

1. **No HTTP requests** between layers internally.
2. Server Actions are already server-side, so **secure DB access is guaranteed**.
3. Validation logic can live in Server Actions per-page.
4. Services are reusable and contain only logic, not DB calls.
5. Repositories are the **single source of truth** for DB interactions.

---

## 3️⃣ Optional Future Flow (External Frontends)

```text
External Client (Flutter, React Native, etc.)
  → API Route (app/api/restaurants)
      → Service (business logic)
          → Repository (DB calls)
              → Database
```

**Key Points:**

1. API routes use `NextRequest` / `NextResponse` to receive HTTP requests.
2. **API routes call Services**, not Repositories directly.
3. Internal pages/actions **never call API routes**. Only external apps use them.
4. This ensures **single source of truth** and avoids duplicated DB logic.

---

## 4️⃣ Guidelines for AI IDE

1. **Always** create Server Actions per page with `use server`.
2. **Always** create Services for reusable business logic.
3. **Always** create Repository layer for DB operations.
4. **Never** call API routes internally. API routes are **future-use only** for external apps.
5. **Always** keep Prisma / DB logic in Repository.
6. **Validations**: Can be done in Server Actions, different per page if needed.
7. **HTTP Requests**: Only from **external clients** to API routes; no internal fetch needed.
8. **Structure**: For each resource (e.g., Restaurant), create:
   - `actions.ts` (Server Action, page-specific)
   - `service.ts` (reusable logic)
   - `repository.ts` (DB access)
   - `api/` (optional for external apps)

---

## 5️⃣ Example Structure for Restaurant Resource

```
app/
  admin/
    restaurant-management/
      actions.ts         # Server Action for page
      new/
        page.tsx        # TSX page
  services/
    restaurant.service.ts  # Reusable logic
  repositories/
    restaurant.repository.ts  # Prisma DB calls
  api/                     # Optional, future external access
    restaurants/
      route.ts              # API route calling service → repository
```

---

## 6️⃣ Current Implementation Status

### ✅ Completed Layers

- **✅ Server Actions**: `app/admin/restaurant-management/actions.ts`
- **✅ Service Layer**: `services/restaurant/restaurant.service.ts`
- **✅ Repository Layer**: `repositories/restaurant.repository.ts`
- **✅ UI Components**: `app/admin/restaurant-management/page.tsx`

### 🚫 Removed/Future Layers

- **❌ API Routes**: Deleted `app/api/` folder (future use only for external clients)

### 🔄 Current Architecture Flow

```text
TSX → Server Action → Service → Repository → Database
```

---

## ✅ Summary

- **Internal pages:** TSX → Server Action → Service → Repository → DB
- **External apps (future):** API Route → Service → Repository → DB
- **Key principle:** Never expose DB directly to client, no internal HTTP fetch.
- **Goal:** Enterprise-level separation of concerns, reusable logic, maintainable code.
- **Current status:** Clean internal architecture implemented, API routes removed for future use.
