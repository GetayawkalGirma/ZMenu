import Link from "next/link";
import { Button } from "@/components/ui";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-full flex flex-col">
      {/* Public Navigation Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">Z</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Menu</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              <Link
                href="/restaurants"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium"
              >
                Restaurants
              </Link>
              <Link
                href="/search"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium"
              >
                Search Meals
              </Link>
              <Link
                href="/about"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium"
              >
                About
              </Link>
            </nav>

            {/* Admin Login Button */}
            <Link href="/admin">
              <Button variant="outline" size="sm">
                Admin Login
              </Button>
            </Link>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              href="/restaurants"
              className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md"
            >
              Restaurants
            </Link>
            <Link
              href="/search"
              className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md"
            >
              Search Meals
            </Link>
            <Link
              href="/about"
              className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md"
            >
              About
            </Link>
            <Link
              href="/admin"
              className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md"
            >
              Admin Login
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">Z</span>
                </div>
                <span className="text-xl font-bold text-gray-900">ZMenu</span>
              </div>
              <p className="text-gray-600 mb-4">
                Discover restaurants and their menus with detailed meal
                information, pricing, and portion sizes.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">
                Quick Links
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/restaurants"
                    className="text-gray-600 hover:text-gray-900"
                  >
                    Restaurants
                  </Link>
                </li>
                <li>
                  <Link
                    href="/search"
                    className="text-gray-600 hover:text-gray-900"
                  >
                    Search Meals
                  </Link>
                </li>
                <li>
                  <Link
                    href="/about"
                    className="text-gray-600 hover:text-gray-900"
                  >
                    About Us
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">
                Support
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/help"
                    className="text-gray-600 hover:text-gray-900"
                  >
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="text-gray-600 hover:text-gray-900"
                  >
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy"
                    className="text-gray-600 hover:text-gray-900"
                  >
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-200 mt-8 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-500 text-sm">
                © 2026 ZMenu. All rights reserved.
              </p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <Link
                  href="/terms"
                  className="text-gray-500 hover:text-gray-700 text-sm"
                >
                  Terms of Service
                </Link>
                <Link
                  href="/privacy"
                  className="text-gray-500 hover:text-gray-700 text-sm"
                >
                  Privacy Policy
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
