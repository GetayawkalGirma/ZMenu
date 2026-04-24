import Link from "next/link";
import { Button } from "@/components/ui";
import { Store, ChefHat, Pizza, PlusCircle } from "lucide-react";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-full flex flex-col bg-white">
      {/* Premium Navigation Header - Compact on Mobile */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm transition-all h-14 sm:h-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex justify-between items-center h-full">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 sm:space-x-2 group">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg shadow-blue-200 group-hover:scale-105 transition-transform shrink-0">
                <span className="text-white font-black text-sm sm:text-xl tracking-tighter">
                  Z
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm sm:text-xl font-black text-gray-900 leading-none">
                  Menu
                </span>
                <span className="text-[7px] sm:text-[10px] font-black text-blue-600 uppercase tracking-widest mt-0.5 hidden xs:block">
                  Directory
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              <Link
                href="/restaurants"
                className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all rounded-xl hover:bg-gray-50 active:scale-95"
              >
                <Store className="w-4 h-4" />
                <span>Restaurants</span>
              </Link>
              <Link
                href="/search"
                className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all rounded-xl hover:bg-gray-50 active:scale-95"
              >
                <ChefHat className="w-4 h-4" />
                <span>Search</span>
              </Link>
              <Link
                href="/Food"
                className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all rounded-xl hover:bg-gray-50 active:scale-95"
              >
                <Pizza className="w-4 h-4" />
                <span>Foods</span>
              </Link>
              <Link
                href="/add-restaurant"
                className="flex items-center space-x-2 text-emerald-600 hover:text-emerald-700 px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all rounded-xl hover:bg-emerald-50 active:scale-95 border border-emerald-200"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Add Restaurant</span>
              </Link>
            </nav>

            {/* Premium Action Button */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link href="/admin">
                <Button
                  variant="ghost"
                  className="text-gray-400 hover:text-gray-900 font-bold text-[8px] sm:text-xs uppercase tracking-widest px-2 sm:px-4 h-8 sm:h-10"
                >
                  Admin <span className="hidden sm:inline ml-1">Portal</span>
                </Button>
              </Link>
              <Link href="/search" className="hidden xs:block">
                <Button className="bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-100 rounded-lg sm:rounded-xl px-3 sm:px-6 font-black uppercase tracking-tighter text-[9px] sm:text-xs h-9 sm:h-11">
                  Find Food
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 relative pb-20 md:pb-0">{children}</main>

      {/* Mobile Bottom Navigation - Strategic Density */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/95 backdrop-blur-xl border-t border-gray-100 px-6 py-3 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
         <div className="flex items-center justify-between max-w-md mx-auto">
            <Link href="/Food" className="flex flex-col items-center gap-1 group">
               <div className="w-10 h-10 rounded-2xl flex items-center justify-center group-active:bg-blue-50 transition-colors">
                  <Pizza className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
               </div>
               <span className="text-[7px] font-black uppercase tracking-widest text-gray-400">Foods</span>
            </Link>
            <Link href="/add-restaurant" className="flex flex-col items-center gap-1 group">
               <div className="w-10 h-10 rounded-2xl flex items-center justify-center group-active:bg-emerald-50 transition-colors">
                  <PlusCircle className="w-5 h-5 text-emerald-500 group-hover:text-emerald-600" />
               </div>
               <span className="text-[7px] font-black uppercase tracking-widest text-emerald-500">Add</span>
            </Link>
            <Link href="/search" className="flex flex-col items-center gap-1 group">
               <div className="w-12 h-12 bg-gray-900 rounded-[1.5rem] flex items-center justify-center -mt-8 shadow-2xl shadow-blue-200 border-4 border-white">
                  <ChefHat className="w-5 h-5 text-white" />
               </div>
               <span className="text-[7px] font-black uppercase tracking-widest text-gray-900">Search</span>
            </Link>
            <Link href="/restaurants" className="flex flex-col items-center gap-1 group">
               <div className="w-10 h-10 rounded-2xl flex items-center justify-center group-active:bg-blue-50 transition-colors">
                  <Store className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
               </div>
               <span className="text-[7px] font-black uppercase tracking-widest text-gray-400">Venues</span>
            </Link>
         </div>
      </nav>

      {/* Elevated Footer */}
      <footer className="bg-white border-t border-gray-100 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 sm:gap-16">
            {/* Brand Identity */}
            <div className="col-span-1 md:col-span-2 space-y-6">
              <Link href="/" className="flex items-center space-x-2 group">
                <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center">
                  <span className="text-white font-black text-xl tracking-tighter">
                    Z
                  </span>
                </div>
                <span className="text-2xl font-black text-gray-900 tracking-tighter">
                  ZMenu
                </span>
              </Link>
              <p className="text-gray-500 text-lg font-medium leading-relaxed max-w-sm">
                The ultimate visual directory for Ethiopia&apos;s culinary
                landscape. Discover real menus and real prices.
              </p>
              <div className="flex space-x-4">
                {/* Social Placeholders */}
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 hover:text-blue-600 hover:border-blue-100 cursor-pointer transition-all"
                  >
                    <div className="w-4 h-4 bg-current rounded-sm" />
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation Clusters */}
            <div>
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-6">
                Directory
              </h3>
              <ul className="space-y-4">
                <li>
                  <Link
                    href="/restaurants"
                    className="text-gray-600 hover:text-blue-600 font-bold transition-colors"
                  >
                    All Restaurants
                  </Link>
                </li>
                <li>
                  <Link
                    href="/search"
                    className="text-gray-600 hover:text-blue-600 font-bold transition-colors"
                  >
                    Meal Search
                  </Link>
                </li>
                <li>
                  <span className="text-gray-300 font-bold cursor-not-allowed">
                    Top Rated
                  </span>
                </li>
              </ul>
            </div>

            {/* Legal / Meta */}
            <div>
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-6">
                Platform
              </h3>
              <ul className="space-y-4">
                <li>
                  <Link
                    href="/admin"
                    className="text-gray-600 hover:text-blue-600 font-bold transition-colors"
                  >
                    Merchant Portal
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy"
                    className="text-gray-600 hover:text-blue-600 font-bold transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Legal Footer */}
          <div className="border-t border-gray-100 mt-16 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">
              © 2026 ZMenu — Real Food. Real Prices.
            </p>
            <div className="flex items-center space-x-8">
              <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest flex items-center">
                <div className="w-2 h-2 rounded-full bg-green-500 mr-2 shadow-sm animate-pulse" />
                System Operational
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* Very Compact Mobile Footer - Legal Only */}
      <footer className="md:hidden bg-white px-4 pb-32 pt-8 border-t border-gray-50 text-center">
         <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest">© 2026 ZMenu Directory</p>
      </footer>
    </div>
  );
}
