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

  useEffect(() => {
    const authToken = localStorage.getItem("authToken");
    setIsLoggedIn(!!authToken);
  }, []);

  return (
    <>
      {!isAuthPage ? (
        <div className="flex h-screen overflow-hidden">
          {/* Sidebar - Only show when logged in */}
          {isLoggedIn && <Sidebar />}

          {/* Main Content Area */}
          <div className="flex flex-col flex-1 overflow-hidden">
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
