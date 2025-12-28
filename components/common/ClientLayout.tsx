"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith("/auth");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    // Check auth status on mount
    const checkAuthStatus = () => {
      const authToken = localStorage.getItem("authToken");
      setIsLoggedIn(!!authToken);
    };

    checkAuthStatus();

    // Listen for storage changes (when auth token is added/removed)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "authToken") {
        checkAuthStatus();
      }
    };

    // Listen for custom auth events
    const handleAuthChange = () => {
      checkAuthStatus();
    };

    // Listen for sidebar collapse events
    const handleSidebarToggle = ((e: CustomEvent) => {
      setSidebarCollapsed(e.detail.collapsed);
    }) as EventListener;

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("authChange", handleAuthChange);
    window.addEventListener("sidebarToggle", handleSidebarToggle);

    // Also check on pathname change (when navigating after login)
    checkAuthStatus();

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("authChange", handleAuthChange);
      window.removeEventListener("sidebarToggle", handleSidebarToggle);
    };
  }, [pathname]);

  return (
    <>
      {!isAuthPage ? (
        <div className="flex h-screen overflow-hidden relative">
          {/* Sidebar - Only show when logged in - overlaps navbar */}
          {isLoggedIn && (
            <div className="fixed top-0 left-0 h-screen z-50">
              <Sidebar />
            </div>
          )}

          {/* Main Content Area */}
          <div className={`flex flex-col flex-1 overflow-hidden transition-all duration-300 ${isLoggedIn ? (sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-[244px]') : ''}`}>
            {/* Navbar */}
            <Navbar />

            {/* Main Content with Footer */}
            <main className={`flex-1 overflow-y-auto bg-white ${isLoggedIn ? 'px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20 2xl:px-24' : 'px-6 sm:px-8 md:px-12 lg:px-16'}`}>
              <div className="min-h-full flex flex-col">
                <div className="flex-1">
                  {children}
                </div>

                {/* Footer */}
                <footer className="bg-white border-t border-[#E5E7EB] py-8 sm:py-12 md:py-16 mt-auto">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col items-center gap-6">
                      <Image
                        src="/logos/ANDINOH.svg"
                        alt="Andinoh"
                        width={190}
                        height={130}
                        className="h-16 w-auto"
                      />
                      <p className="text-center text-[#5C5B59] text-base">
                        © 2025 Andinoh. All rights reserved.
                      </p>
                    </div>
                  </div>
                </footer>
              </div>
            </main>
          </div>
        </div>
      ) : (
        children
      )}
    </>
  );
}
