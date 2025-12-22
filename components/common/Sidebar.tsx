"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Building2, Plane, PartyPopper, Menu, ChevronRight, ChevronLeft, Settings, LogOut } from "lucide-react";
import { useState } from "react";
import HelpIcon from "@/components/icons/HelpIcon";
import BookingIcon from "@/components/icons/BookingIcon";
import HomeIcon from "@/components/icons/HomeIcon";

const navigationMain = [
  { name: "Home", href: "/", icon: HomeIcon, badge: null },
  { name: "Hotels", href: "/hotels", icon: Building2, badge: null },
  { name: "Flights", href: "/flights", icon: Plane, badge: null },
  { name: "Events", href: "/events", icon: PartyPopper, badge: null },
  { name: "My Bookings", href: "/bookings", icon: BookingIcon, badge: null },
];

const navigationSecondary = [
  { name: "Settings", href: "/settings", icon: Settings, badge: null },
  { name: "Help & Support", href: "/help", icon: HelpIcon, badge: null },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    window.location.href = "/";
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white relative">
      {/* Collapse Button - Positioned at top right edge */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute top-6 -right-3 z-50 w-6 h-6 bg-white border border-[#E5E7EB] rounded-full flex items-center justify-center text-[#5C5B59] hover:bg-[#FAFAFB] hover:text-[#0F75BD] transition-all duration-200"
      >
        {collapsed ? (
          <ChevronRight className="w-3.5 h-3.5" />
        ) : (
          <ChevronLeft className="w-3.5 h-3.5" />
        )}
      </button>

      {/* Logo Section - Aligned with Navbar height */}
      <div className="h-[80px] flex items-center overflow-hidden">
        {!collapsed ? (
          <div className="flex items-center gap-3 pl-4">
            <div className="w-10 h-10 bg-white border border-[#0F75BD] rounded-xl flex items-center justify-center p-1.5">
              <Image
                src="/logos/ANDINOH.svg"
                alt="Andinoh"
                width={32}
                height={32}
                priority
                className="w-full h-full object-contain"
              />
            </div>
            <div className="leading-tight">
              <h1 className="font-bold text-lg text-[#0B0A07]">Andinoh</h1>
              <p className="text-xs text-[#5C5B59]">Customer</p>
            </div>
          </div>
        ) : (
          <div className="w-10 h-10 bg-white border-2 border-[#0F75BD] rounded-xl flex items-center justify-center mx-auto p-1.5">
            <Image
              src="/logos/ANDINOH.svg"
              alt="Andinoh"
              width={32}
              height={32}
              priority
              className="w-full h-full object-contain"
            />
          </div>
        )}
      </div>

      {/* Divider to match navbar border */}
      <div className="border-b border-[#E5E7EB]"></div>

      {/* Navigation */}
      <nav className="px-4 pt-8 space-y-3 overflow-y-auto scrollbar-hide flex-1">
        {navigationMain.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`group relative flex items-center justify-center ${
                !collapsed && "gap-3"
              } ${
                collapsed ? "px-2" : "px-5"
              } py-3 rounded-xl transition-all duration-300 ease-in-out ${
                isActive
                  ? "bg-[#0F75BD] text-white"
                  : "text-gray-300 hover:bg-[#EEF0F2] hover:text-[#0F75BD]"
              }`}
            >
              <item.icon
                className={`w-5 h-5 font-medium transition-all duration-300 ${
                  isActive
                    ? "text-white"
                    : "text-[#5C5B59] group-hover:text-[#0F75BD]"
                }`}
              />

              {!collapsed && (
                <>
                  <span
                    className={`${
                      isActive
                        ? "font-semibold text-[#FFFFFF]"
                        : "font-regular text-[#3C3B39]"
                    } text-sm flex-1 whitespace-nowrap`}
                  >
                    {item.name}
                  </span>

                  {item.badge && (
                    <span className="px-2 py-0.5 text-xs font-bold bg-red-500 text-white rounded-full">
                      {item.badge}
                    </span>
                  )}
                </>
              )}

              {collapsed && (
                <div className="absolute left-full ml-6 px-3 py-2 bg-gray-800 text-white text-sm font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                  {item.name}
                  <div className="absolute right-full top-1/2 -translate-y-1/2 border-8 border-transparent border-r-gray-800" />
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="mx-4 my-6 border-t border-[#E5E7EB] space-y-3"></div>

      {/* Secondary Navigation */}
      <nav className="px-4 space-y-3">
        {navigationSecondary.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`group relative flex items-center justify-center ${
                !collapsed && "gap-3"
              } ${
                collapsed ? "px-2" : "px-5"
              } py-3 rounded-xl transition-all duration-300 ease-in-out ${
                isActive
                  ? "bg-[#0F75BD] text-white text-sm"
                  : "text-gray-300 hover:bg-[#EEF0F2] hover:text-[#0F75BD]"
              }`}
            >
              <item.icon
                className={`w-5 h-5 font-medium transition-all duration-300 ${
                  isActive
                    ? "text-white"
                    : "text-[#5C5B59] group-hover:text-[#0F75BD]"
                }`}
              />

              {!collapsed && (
                <>
                  <span
                    className={`${
                      isActive
                        ? "font-semibold text-[#FFFFFF]"
                        : "font-regular text-[#3C3B39]"
                    } text-sm flex-1 whitespace-nowrap`}
                  >
                    {item.name}
                  </span>

                  {item.badge && (
                    <span className="px-2 py-0.5 text-xs font-bold bg-red-500 text-white rounded-full">
                      {item.badge}
                    </span>
                  )}
                </>
              )}

              {collapsed && (
                <div className="absolute left-full ml-6 px-3 py-2 bg-gray-800 text-white text-sm font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                  {item.name}
                  <div className="absolute right-full top-1/2 -translate-y-1/2 border-8 border-transparent border-r-gray-800" />
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mx-4 my-10 border-t border-[#E5E7EB]"></div>

      {/* Bottom Section */}
      <div className="px-4 pb-4 pt-2 space-y-1 mt-auto">
        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className={`flex items-center justify-center ${
            !collapsed && "gap-3"
          } ${
            collapsed ? "px-2" : "px-5"
          } py-3 w-full rounded-xl transition-all duration-300 ease-in-out group hover:bg-red-500/10`}
        >
          <LogOut className="w-5 h-5 text-red-400 group-hover:text-red-500 group-hover:rotate-180 transition-all duration-300" />
          {!collapsed && (
            <span className="font-regular text-sm text-red-400 flex-1 text-left">
              Logout
            </span>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:block bg-white transition-all duration-300 ${
          collapsed ? "w-20" : "w-[244px]"
        }`}
      >
        <div className="h-screen sticky top-0">
          <SidebarContent />
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`lg:hidden fixed top-0 left-0 h-full w-64 bg-white transform transition-transform duration-300 ease-out z-50 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed bottom-6 right-6 bg-gradient-to-r from-[#0F75BD] to-[#0050C8] text-white p-4 rounded-full z-30 hover:scale-110 transition-all duration-200 shadow-lg"
      >
        <Menu size={24} />
      </button>
    </>
  );
}
