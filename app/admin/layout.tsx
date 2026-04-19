"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, LayoutDashboard, Utensils, Pizza, Tags, Settings, Activity, Users, Globe } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu when pathname changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const getActiveClass = (href: string) => {
    if (!pathname) return "text-gray-600 hover:bg-gray-50 hover:text-gray-900";
    if (href === "/admin" && pathname === "/admin")
      return "bg-blue-50 text-blue-700 font-bold border-r-4 border-blue-600";
    if (href !== "/admin" && pathname.startsWith(href))
      return "bg-blue-50 text-blue-700 font-bold border-r-4 border-blue-600";
    return "text-gray-600 hover:bg-gray-50 hover:text-gray-900";
  };

  const navItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Restaurants", href: "/admin/restaurant-management", icon: Utensils },
    { name: "Meals", href: "/admin/meals", icon: Pizza },
    { name: "Categories", href: "/admin/categories", icon: Tags },
    { name: "Features", href: "/admin/features-management", icon: Settings },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Settings", href: "/admin/settings", icon: Settings },
    { name: "System Health", href: "/admin/health", icon: Activity, color: "text-blue-600" },
  ];

  const isLoginPage = pathname === "/admin/login";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="flex justify-between h-16 items-center px-4">
          <div className="flex items-center">
            {!isLoginPage && (
                <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 -ml-2 text-gray-600 hover:text-gray-900 focus:outline-none"
                >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            )}
            
            <Link href="/admin" className="flex items-center space-x-3 ml-2 lg:ml-0">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-200">
                <span className="text-white font-black text-lg">Z</span>
              </div>
              <span className="text-xl font-black text-gray-900 tracking-tighter uppercase hidden xs:block">
                Admin
              </span>
            </Link>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            <Link href="/">
              <button className="flex items-center space-x-2 px-3 py-1.5 border border-gray-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:bg-gray-50 hover:border-gray-900 transition-all">
                <Globe className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">View Site</span>
              </button>
            </Link>

            {!isLoginPage && (
                <button 
                    onClick={() => {
                        document.cookie = "admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
                        window.location.href = "/admin/login";
                    }}
                    className="flex items-center space-x-2 px-3 py-1.5 border border-red-100 bg-red-50/30 rounded-xl text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 transition-all"
                >
                    <X className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Logout</span>
                </button>
            )}

            {!isLoginPage && <ServerUserProfile />}
          </div>
        </div>
      </nav>

      <div className="flex flex-1 relative overflow-hidden">
        {/* Desktop Sidebar */}
        {!isLoginPage && (
            <aside className="hidden lg:block w-72 bg-white border-r border-gray-100 min-h-full overflow-y-auto">
            <nav className="mt-8 px-4">
                <div className="space-y-2">
                {navItems.map((item) => (
                    <Link
                    key={item.href}
                    href={item.href}
                    className={`${getActiveClass(item.href)} group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200`}
                    >
                    <item.icon className={`w-5 h-5 mr-3 ${pathname === item.href || (item.href !== "/admin" && pathname?.startsWith(item.href)) ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600"}`} />
                    {item.name}
                    </Link>
                ))}
                </div>
            </nav>
            </aside>
        )}

        {/* Mobile Slide-over Menu */}
        {!isLoginPage && isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-[60] flex">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity" 
              onClick={() => setIsMobileMenuOpen(false)}
            />
            
            {/* Menu Panel */}
            <div className="relative w-full max-w-xs bg-white h-full shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out">
              <div className="p-6 flex items-center justify-between border-b border-gray-50">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-black text-lg">Z</span>
                  </div>
                  <span className="text-xl font-black text-gray-900 tracking-tighter uppercase">Menu Admin</span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="text-gray-400 hover:text-gray-900">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <nav className="flex-1 overflow-y-auto mt-6 px-4">
                <div className="space-y-2">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`${getActiveClass(item.href)} group flex items-center px-4 py-4 text-base font-bold rounded-2xl transition-all duration-200`}
                    >
                      <item.icon className="w-6 h-6 mr-4" />
                      {item.name}
                    </Link>
                  ))}
                </div>
              </nav>

              <div className="p-6 border-t border-gray-50 bg-gray-50/50">
                <Link href="/" className="flex items-center justify-center space-x-2 w-full p-4 bg-white border border-gray-200 rounded-2xl text-xs font-black uppercase tracking-widest text-gray-900 hover:border-black transition-all">
                  <Globe className="w-4 h-4" />
                  <span>Exit Admin</span>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">{children}</main>
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
