"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Home, Building2, Plane, Calendar, Menu, X, PartyPopper, User, LogOut, ChevronDown, CheckCircle, AlertCircle, DollarSign, Clock, Settings, UserCircle, Search } from "lucide-react";
import NotificationIcon from "@/components/icons/NotificationIcon";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("Guest");
  const [userEmail, setUserEmail] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const notificationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Mock notifications
  const notifications = [
    {
      id: "1",
      title: "Booking Confirmed",
      message: "Your booking at Grand Plaza Hotel has been confirmed",
      time: "2 hours ago",
      read: false,
      icon: CheckCircle,
      iconBg: "bg-[#ECFDF5]",
      iconColor: "text-green-600",
    },
    {
      id: "2",
      title: "Payment Successful",
      message: "Payment of ₦45,000 received successfully",
      time: "5 hours ago",
      read: false,
      icon: DollarSign,
      iconBg: "bg-[#F0F9FF]",
      iconColor: "text-[#0F75BD]",
    },
    {
      id: "3",
      title: "Booking Reminder",
      message: "Your check-in is tomorrow at Grand Plaza Hotel",
      time: "1 day ago",
      read: true,
      icon: AlertCircle,
      iconBg: "bg-[#FEF3C7]",
      iconColor: "text-orange-600",
    },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  // Check if user is logged in (simulate auth check)
  useEffect(() => {
    // Check localStorage for auth token or user data
    const authToken = localStorage.getItem("authToken");
    const userData = localStorage.getItem("userData");

    if (authToken && userData) {
      setIsLoggedIn(true);
      try {
        const user = JSON.parse(userData);
        setUserName(user.firstName || "User");
        setUserEmail(user.email || "");
      } catch (e) {
        setUserName("User");
      }
    }
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    setIsLoggedIn(false);
    setUserName("Guest");
    setUserEmail("");
    window.location.href = "/";
  };

  const navItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Hotels", href: "/hotels", icon: Building2 },
    { name: "Flights", href: "/flights", icon: Plane },
    { name: "Events", href: "/events", icon: PartyPopper },
    { name: "My Bookings", href: "/bookings", icon: Calendar },
  ];

  return (
    <nav className="h-20 bg-white border-b border-[#E5E7EB] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-8 h-full flex items-center justify-between">
        {/* Logo - Only show when not logged in */}
        {!isLoggedIn && (
          <Link href="/" className="flex items-center">
            <Image
              src="/logos/ANDINOH.svg"
              alt="Andinoh"
              width={90}
              height={30}
              className="h-5 w-auto"
            />
          </Link>
        )}

        {/* Center Section - Navigation or Search Bar */}
        {!isLoggedIn ? (
          // Show navigation when not logged in
          <div className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all text-sm font-semibold ${
                    isActive
                      ? "bg-[#F0F9FF] text-[#0F75BD]"
                      : "text-[#5C5B59] hover:bg-[#FAFAFB] hover:text-[#1A1A1A]"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        ) : (
          // Show search bar only on home page when logged in
          pathname === "/" && (
            <div className="flex-1 max-w-xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8F8E8D]" />
                <input
                  type="text"
                  placeholder="Search hotels, flights, events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 h-11 border border-[#D3D9DD] rounded-2xl text-sm focus:outline-none focus:ring-1 focus:ring-[#8E9397] focus:border-transparent text-gray-800 placeholder:text-[#8F8E8D] placeholder:text-sm"
                />
              </div>
            </div>
          )
        )}

        {/* Right Section - Auth Buttons or User Menu */}
        <div className="hidden md:flex items-center gap-3">
          {!isLoggedIn ? (
            <>
              <Link
                href="/auth/login"
                className="px-6 py-2.5 text-[#0F75BD] hover:bg-[#F0F9FF] rounded-xl transition-all text-sm font-semibold border border-transparent hover:border-[#E5E7EB]"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="px-6 py-2.5 bg-[#0F75BD] text-white hover:bg-[#0050C8] rounded-xl transition-all text-sm font-semibold"
              >
                Sign Up
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-3">
              {/* Notification Icon */}
              <div className="relative" ref={notificationRef}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative w-11 h-11 flex items-center justify-center hover:bg-[#FAFAFB] rounded-xl transition-colors"
                >
                  <NotificationIcon className="w-6 h-6 text-[#5C5B59]" />
                  {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 w-4 h-4 bg-[#0F75BD] text-white text-xs font-medium rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-96 bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden z-50 shadow-xl">
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-[#E5E7EB] bg-[#FAFAFB]">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-bold text-[#1A1A1A]">Notifications</h3>
                          <p className="text-xs text-[#5C5B59] mt-0.5">{unreadCount} unread notifications</p>
                        </div>
                        <button
                          onClick={() => setShowNotifications(false)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4 text-[#5C5B59]" />
                        </button>
                      </div>
                    </div>

                    {/* Notifications List */}
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.map((notification) => {
                        const Icon = notification.icon;
                        return (
                          <div
                            key={notification.id}
                            className={`px-6 py-4 border-b border-[#E5E7EB] hover:bg-[#FAFAFB] transition-colors cursor-pointer ${
                              !notification.read ? "bg-[#F0F9FF]" : ""
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`w-10 h-10 ${notification.iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                                <Icon className={`w-5 h-5 ${notification.iconColor}`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <h4 className="font-semibold text-sm text-[#1A1A1A]">{notification.title}</h4>
                                  {!notification.read && (
                                    <div className="w-2 h-2 bg-[#0F75BD] rounded-full flex-shrink-0 mt-1.5"></div>
                                  )}
                                </div>
                                <p className="text-xs text-[#5C5B59] mt-1">{notification.message}</p>
                                <div className="flex items-center gap-1 mt-2 text-xs text-[#5C5B59]">
                                  <Clock className="w-3 h-3" />
                                  <span>{notification.time}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-3 bg-[#FAFAFB] border-t border-[#E5E7EB]">
                      <button className="w-full text-center text-sm font-semibold text-[#0F75BD] hover:text-[#0050C8] transition-colors">
                        View All Notifications
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Profile Section */}
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-3 hover:bg-[#F9FAFB] rounded-2xl transition-all h-12 px-3 border border-transparent hover:border-[#E5E7EB]"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-[#0F75BD] to-[#02A5E6] rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-semibold text-[#1A1A1A]">{userName}</span>
                  <ChevronDown className={`w-4 h-4 text-[#5C5B59] transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
                </button>

                {/* Profile Dropdown */}
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden z-50 shadow-xl">
                    {/* Profile Header */}
                    <div className="px-4 py-4 bg-gradient-to-br from-[#0F75BD] to-[#02A5E6]">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center ring-2 ring-white/30">
                          <span className="text-white text-base font-bold">{userName.charAt(0).toUpperCase()}</span>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">{userName}</p>
                          <p className="text-xs text-white/80">{userEmail}</p>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <button
                        onClick={() => {
                          router.push('/bookings');
                          setShowProfileMenu(false);
                        }}
                        className="w-full px-4 py-3 hover:bg-[#FAFAFB] transition-colors flex items-center gap-3 text-left group"
                      >
                        <div className="w-9 h-9 bg-[#F0F9FF] rounded-xl flex items-center justify-center group-hover:bg-[#0F75BD] transition-colors">
                          <UserCircle className="w-5 h-5 text-[#0F75BD] group-hover:text-white transition-colors" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#1A1A1A]">My Profile</p>
                          <p className="text-xs text-[#5C5B59]">View and edit profile</p>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          router.push('/bookings');
                          setShowProfileMenu(false);
                        }}
                        className="w-full px-4 py-3 hover:bg-[#FAFAFB] transition-colors flex items-center gap-3 text-left group"
                      >
                        <div className="w-9 h-9 bg-[#FEF3C7] rounded-xl flex items-center justify-center group-hover:bg-[#0F75BD] transition-colors">
                          <Calendar className="w-5 h-5 text-orange-600 group-hover:text-white transition-colors" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#1A1A1A]">My Bookings</p>
                          <p className="text-xs text-[#5C5B59]">View all bookings</p>
                        </div>
                      </button>

                      <div className="border-t border-[#E5E7EB] my-2"></div>

                      <button
                        onClick={() => {
                          handleLogout();
                          setShowProfileMenu(false);
                        }}
                        className="w-full px-4 py-3 hover:bg-red-50 transition-colors flex items-center gap-3 text-left group"
                      >
                        <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center group-hover:bg-red-100 transition-colors">
                          <LogOut className="w-5 h-5 text-red-600 transition-colors" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-red-600">Logout</p>
                          <p className="text-xs text-[#5C5B59]">Sign out of account</p>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 hover:bg-[#FAFAFB] rounded-xl transition-colors"
        >
          {isOpen ? (
            <X className="w-6 h-6 text-[#1A1A1A]" />
          ) : (
            <Menu className="w-6 h-6 text-[#1A1A1A]" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-[#E5E7EB] bg-white">
          <div className="px-4 py-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive
                      ? "bg-[#F0F9FF] text-[#0F75BD] font-semibold"
                      : "text-[#5C5B59] hover:bg-[#FAFAFB]"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-semibold">{item.name}</span>
                </Link>
              );
            })}
            <div className="border-t border-[#E5E7EB] pt-4 space-y-2">
              {!isLoggedIn ? (
                <>
                  <Link
                    href="/auth/login"
                    onClick={() => setIsOpen(false)}
                    className="block w-full px-4 py-3 text-center text-[#0F75BD] hover:bg-[#F0F9FF] rounded-xl font-semibold text-sm"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signup"
                    onClick={() => setIsOpen(false)}
                    className="block w-full px-4 py-3 text-center bg-[#0F75BD] text-white hover:bg-[#0050C8] rounded-xl font-semibold text-sm"
                  >
                    Sign Up
                  </Link>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 px-4 py-3 bg-[#F0F9FF] rounded-xl">
                    <div className="w-8 h-8 bg-[#0F75BD] rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {userName.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-semibold text-[#1A1A1A]">{userName}</span>
                  </div>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                    className="block w-full px-4 py-3 text-center text-red-600 hover:bg-red-50 rounded-xl font-semibold text-sm flex items-center justify-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
