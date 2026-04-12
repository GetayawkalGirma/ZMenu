"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const getActiveClass = (href: string) => {
    if (!pathname) return "text-gray-600 hover:bg-gray-50 hover:text-gray-900";
    if (href === "/admin" && pathname === "/admin")
      return "bg-gray-100 text-gray-900";
    if (href !== "/admin" && pathname.startsWith(href))
      return "bg-gray-100 text-gray-900";
    return "text-gray-600 hover:bg-gray-50 hover:text-gray-900";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Navigation Header - Server Rendered */}
      <nav className="bg-white shadow-sm border-b">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center pl-4">
            <Link href="/admin" className="flex items-center space-x-3 -ml-4">
              <div className="ml-2 w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">Z</span>
              </div>
              <span className="text-xl font-bold text-gray-900">
                Menu Admin
              </span>
            </Link>

            <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
              <Link
                href="/admin/restaurant-management"
                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Restaurants
              </Link>
              <Link
                href="/admin/meals"
                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Meals
              </Link>
              <Link
                href="/admin/analytics"
                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Analytics
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-4 pr-4">
            <Link href="/">
              <button className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50">
                View Site
              </button>
            </Link>

            <ServerUserProfile />
          </div>
        </div>
      </nav>

      {/* Admin Content with Sidebar - Server Rendered */}
      <div className="flex">
        {/* Sidebar - Server Rendered */}
        <aside className="w-64 bg-white shadow-sm min-h-screen">
          <nav className="mt-5 px-2">
            <div className="space-y-1">
              <Link
                href="/admin"
                className={`${getActiveClass("/admin")} group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
              >
                Dashboard
              </Link>
              <Link
                href="/admin/restaurant-management"
                className={`${getActiveClass("/admin/restaurant-management")} group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
              >
                Restaurants
              </Link>
              <Link
                href="/admin/meals"
                className={`${getActiveClass("/admin/meals")} group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
              >
                Meals
              </Link>
              <Link
                href="/admin/categories"
                className={`${getActiveClass("/admin/categories")} group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
              >
                Categories
              </Link>
              <Link
                href="/admin/features-management"
                className={`${getActiveClass("/admin/features-management")} group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
              >
                Features Management
              </Link>
              <Link
                href="/admin/users"
                className={`${getActiveClass("/admin/users")} group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
              >
                Users
              </Link>
              <Link
                href="/admin/settings"
                className={`${getActiveClass("/admin/settings")} group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
              >
                Settings
              </Link>
            </div>
          </nav>
        </aside>

        {/* Main Content - Client Component for interactivity */}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}

// Server Component for user profile (static content)
function ServerUserProfile() {
  return (
    <div className="flex items-center space-x-2">
      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
        <span className="text-white text-sm font-medium">A</span>
      </div>
      <span className="text-sm text-gray-700">Admin</span>
    </div>
  );
}
