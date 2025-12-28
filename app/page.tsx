"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Calendar, Users, Star, MapPin, Building2, Plane, PartyPopper, TrendingUp, Clock, CheckCircle } from "lucide-react";
import Button from "@/components/common/Button";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const authToken = localStorage.getItem("authToken");
    setIsLoggedIn(!!authToken);
  }, []);

  const featuredHotels = [
    {
      id: "1",
      name: "Grand Plaza Hotel",
      city: "Lagos",
      country: "Nigeria",
      rating: 4.8,
      reviews: 245,
      price: 45000,
      featured: true,
    },
    {
      id: "2",
      name: "Luxury Suites & Spa",
      city: "Abuja",
      country: "Nigeria",
      rating: 4.9,
      reviews: 189,
      price: 55000,
      featured: true,
    },
    {
      id: "3",
      name: "Ocean View Resort",
      city: "Port Harcourt",
      country: "Nigeria",
      rating: 4.7,
      reviews: 312,
      price: 38000,
      featured: false,
    },
  ];

  const recentBookings = [
    {
      id: "1",
      type: "hotel",
      name: "Grand Plaza Hotel",
      location: "Lagos",
      date: "Dec 25-27, 2024",
      status: "confirmed",
    },
    {
      id: "2",
      type: "flight",
      name: "Lagos to Abuja",
      location: "LOS → ABV",
      date: "Jan 5, 2025",
      status: "pending",
    },
  ];

  const quickActions = [
    {
      title: "Hotels",
      icon: Building2,
      description: "Find your perfect stay",
      href: "/hotels",
      color: "bg-[#E8F4F8]",
      iconColor: "text-[#0F75BD]",
    },
    {
      title: "Flights",
      icon: Plane,
      description: "Book your next trip",
      href: "/flights",
      color: "bg-[#FEF3C7]",
      iconColor: "text-orange-600",
    },
    {
      title: "Events",
      icon: PartyPopper,
      description: "Reserve event spaces",
      href: "/events",
      color: "bg-[#F5F3FF]",
      iconColor: "text-purple-600",
    },
  ];

  // View for LOGGED-IN users
  if (isLoggedIn) {
    return (
      <div className="min-h-screen bg-white py-4 sm:py-6 md:py-8">
        {/* Welcome Section */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1A1A1A] mb-2">Welcome back!</h1>
          <p className="text-sm sm:text-base text-[#5C5B59]">Ready to plan your next adventure?</p>
        </div>

        {/* Quick Actions */}
        <div className="mb-8 sm:mb-12">
          <h2 className="text-lg sm:text-xl font-bold text-[#1A1A1A] mb-4 sm:mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link href={action.href} key={action.title}>
                  <div className="bg-white border border-[#E5E7EB] rounded-[22px] p-4 sm:p-6 hover:border-[#0F75BD] transition-all group cursor-pointer">
                    <div className={`w-12 h-12 sm:w-14 sm:h-14 ${action.color} rounded-2xl flex items-center justify-center mb-3 sm:mb-4`}>
                      <Icon className={`w-6 h-6 sm:w-7 sm:h-7 ${action.iconColor}`} />
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-[#1A1A1A] mb-1 group-hover:text-[#0F75BD] transition-colors">
                      {action.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#5C5B59]">{action.description}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="mb-8 sm:mb-12">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-[#1A1A1A]">Recent Bookings</h2>
            <Link href="/bookings" className="text-[#0F75BD] font-semibold text-xs sm:text-sm hover:underline">
              View All
            </Link>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {recentBookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white border border-[#E5E7EB] rounded-[22px] p-4 sm:p-6 hover:border-[#0F75BD] transition-all"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                  <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#E8F4F8] rounded-xl flex items-center justify-center flex-shrink-0">
                      {booking.type === "hotel" ? (
                        <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-[#0F75BD]" />
                      ) : (
                        <Plane className="w-5 h-5 sm:w-6 sm:h-6 text-[#0F75BD]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-sm sm:text-base text-[#1A1A1A] truncate">{booking.name}</h3>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mt-1">
                        <span className="text-xs sm:text-sm text-[#5C5B59] flex items-center gap-1">
                          <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                          <span className="truncate">{booking.location}</span>
                        </span>
                        <span className="text-xs sm:text-sm text-[#5C5B59] flex items-center gap-1">
                          <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                          {booking.date}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="w-full sm:w-auto">
                    <span
                      className={`inline-block w-full sm:w-auto text-center px-3 py-1.5 text-xs font-semibold rounded-lg ${
                        booking.status === "confirmed"
                          ? "bg-[#ECFDF5] text-green-700"
                          : "bg-[#FEF3C7] text-orange-700"
                      }`}
                    >
                      {booking.status === "confirmed" ? "Confirmed" : "Pending"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Featured Hotels */}
        <div>
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-[#1A1A1A]">Recommended for You</h2>
            <Link href="/hotels" className="text-[#0F75BD] font-semibold text-xs sm:text-sm hover:underline">
              View All
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {featuredHotels.map((hotel) => (
              <Link href={`/hotels/${hotel.id}`} key={hotel.id}>
                <div className="bg-white rounded-[22px] overflow-hidden border border-[#E5E7EB] hover:border-[#0F75BD] transition-all group">
                  <div className="relative h-40 sm:h-48 bg-gradient-to-br from-[#E8F4F8] to-[#F0F9FF] flex items-center justify-center overflow-hidden">
                    <span className="text-5xl sm:text-6xl">🏨</span>

                    <div className="absolute top-3 sm:top-4 right-3 sm:right-4">
                      <div className="flex items-center gap-1 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-white/90 backdrop-blur-sm rounded-lg">
                        <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs sm:text-sm font-bold text-[#1A1A1A]">{hotel.rating}</span>
                      </div>
                    </div>

                    <div className="absolute top-3 sm:top-4 left-3 sm:left-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-white/90 backdrop-blur-sm text-[#0F75BD] text-xs font-medium rounded-lg">
                        <MapPin className="w-3 h-3" />
                        {hotel.city}
                      </span>
                    </div>

                    <div className="absolute bottom-2 sm:bottom-3 right-2 sm:right-3">
                      <span className="px-2 sm:px-2.5 py-1 text-xs font-semibold rounded-lg bg-white/90 backdrop-blur-sm text-[#5C5B59]">
                        {hotel.reviews} reviews
                      </span>
                    </div>
                  </div>

                  <div className="p-4 sm:p-5">
                    <h3 className="text-base sm:text-lg font-bold text-[#1A1A1A] mb-1 sm:mb-2 group-hover:text-[#0F75BD] transition-colors truncate">
                      {hotel.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#5C5B59] mb-3">
                      {hotel.city}, {hotel.country}
                    </p>
                    <div className="border-t border-[#E5E7EB] my-3"></div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-[#5C5B59] mb-0.5">Starting from</p>
                        <p className="text-lg sm:text-xl font-bold text-[#0F75BD]">
                          ₦{hotel.price.toLocaleString()}
                          <span className="text-xs font-normal text-[#5C5B59]">/night</span>
                        </p>
                      </div>
                      <button className="px-3 sm:px-4 py-2 bg-[#0F75BD] text-white text-xs sm:text-sm font-medium rounded-xl hover:bg-[#0050C8] transition-colors">
                        View
                      </button>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // View for NON-LOGGED-IN users
  return (
    <>
      {/* Hero Section - Full Width */}
      <section className="relative bg-gradient-to-br from-[#0F75BD] to-[#02A5E6] text-white py-12 sm:py-16 md:py-20 lg:py-24 -mx-6 sm:-mx-8 md:-mx-12 lg:-mx-16 -mt-4 sm:-mt-6 md:-mt-8">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 sm:w-96 sm:h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 sm:w-96 sm:h-96 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 sm:px-8 md:px-12 lg:px-16">
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6">
              Your Journey Starts Here
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-white/90 max-w-2xl mx-auto mb-6 sm:mb-8">
              Book hotels, flights, and event spaces with the best prices guaranteed
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Link href="/auth/signup">
                <Button size="lg" className="bg-white text-[#0F75BD] hover:bg-white/90 font-semibold w-full sm:w-auto">
                  Get Started
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-white text-white hover:bg-white/10 font-semibold w-full sm:w-auto"
                >
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Content with margins */}
      <div className="min-h-screen bg-white py-8 sm:py-12 md:py-16">
        {/* Features Section */}
        <div className="mb-8 sm:py-12 md:mb-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-white border border-[#E5E7EB] rounded-[22px] p-6 sm:p-8 text-center hover:border-[#0F75BD] transition-all">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#ECFDF5] rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-[#1A1A1A] mb-2">Instant Confirmation</h3>
              <p className="text-sm sm:text-base text-[#5C5B59]">Get confirmed bookings in seconds</p>
            </div>

            <div className="bg-white border border-[#E5E7EB] rounded-[22px] p-6 sm:p-8 text-center hover:border-[#0F75BD] transition-all">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#FEF3C7] rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-[#1A1A1A] mb-2">Best Prices</h3>
              <p className="text-sm sm:text-base text-[#5C5B59]">Guaranteed lowest prices or refund</p>
            </div>

            <div className="bg-white border border-[#E5E7EB] rounded-[22px] p-6 sm:p-8 text-center sm:col-span-2 md:col-span-1 hover:border-[#0F75BD] transition-all">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#E8F4F8] rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-[#0F75BD]" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-[#1A1A1A] mb-2">24/7 Support</h3>
              <p className="text-sm sm:text-base text-[#5C5B59]">We're here whenever you need us</p>
            </div>
          </div>
        </div>

        {/* Quick Browse Section - Full Width */}
        <section className="py-8 sm:py-12 md:py-16 bg-[#FAFAFB] -mx-6 sm:-mx-8 md:-mx-12 lg:-mx-16 xl:-mx-20 2xl:-mx-24 px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20 2xl:px-24">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1A1A1A] mb-6 sm:mb-8 text-center">What would you like to book?</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link href={action.href} key={action.title}>
                  <div className="bg-white border border-[#E5E7EB] rounded-[22px] p-6 sm:p-8 hover:border-[#0F75BD] transition-all group cursor-pointer text-center">
                    <div className={`w-16 h-16 sm:w-20 sm:h-20 ${action.color} rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6`}>
                      <Icon className={`w-8 h-8 sm:w-10 sm:h-10 ${action.iconColor}`} />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-[#1A1A1A] mb-2 group-hover:text-[#0F75BD] transition-colors">
                      {action.title}
                    </h3>
                    <p className="text-sm sm:text-base text-[#5C5B59]">{action.description}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Featured Hotels */}
        <section className="py-8 sm:py-12 md:py-16">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-2">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#1A1A1A] mb-1 sm:mb-2">Featured Hotels</h2>
              <p className="text-sm sm:text-base text-[#5C5B59]">Handpicked hotels for your perfect stay</p>
            </div>
            <Link href="/hotels" className="text-[#0F75BD] font-semibold text-sm sm:text-base hover:underline whitespace-nowrap">
              View All →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {featuredHotels.map((hotel) => (
              <Link href={`/hotels/${hotel.id}`} key={hotel.id}>
                <div className="bg-white rounded-[22px] overflow-hidden border border-[#E5E7EB] hover:border-[#0F75BD] transition-all group">
                  <div className="relative h-40 sm:h-48 bg-gradient-to-br from-[#E8F4F8] to-[#F0F9FF] flex items-center justify-center overflow-hidden">
                    <span className="text-5xl sm:text-6xl">🏨</span>

                    <div className="absolute top-3 sm:top-4 right-3 sm:right-4">
                      <div className="flex items-center gap-1 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-white/90 backdrop-blur-sm rounded-lg">
                        <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs sm:text-sm font-bold text-[#1A1A1A]">{hotel.rating}</span>
                      </div>
                    </div>

                    <div className="absolute top-3 sm:top-4 left-3 sm:left-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-white/90 backdrop-blur-sm text-[#0F75BD] text-xs font-medium rounded-lg">
                        <MapPin className="w-3 h-3" />
                        {hotel.city}
                      </span>
                    </div>

                    <div className="absolute bottom-2 sm:bottom-3 right-2 sm:right-3">
                      <span className="px-2 sm:px-2.5 py-1 text-xs font-semibold rounded-lg bg-white/90 backdrop-blur-sm text-[#5C5B59]">
                        {hotel.reviews} reviews
                      </span>
                    </div>
                  </div>

                  <div className="p-4 sm:p-5">
                    <h3 className="text-base sm:text-lg font-bold text-[#1A1A1A] mb-1 sm:mb-2 group-hover:text-[#0F75BD] transition-colors truncate">
                      {hotel.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#5C5B59] mb-3">
                      {hotel.city}, {hotel.country}
                    </p>
                    <div className="border-t border-[#E5E7EB] my-3"></div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-[#5C5B59] mb-0.5">Starting from</p>
                        <p className="text-lg sm:text-xl font-bold text-[#0F75BD]">
                          ₦{hotel.price.toLocaleString()}
                          <span className="text-xs font-normal text-[#5C5B59]">/night</span>
                        </p>
                      </div>
                      <button className="px-3 sm:px-4 py-2 bg-[#0F75BD] text-white text-xs sm:text-sm font-medium rounded-xl hover:bg-[#0050C8] transition-colors">
                        View
                      </button>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* CTA Section - Full Width */}
        <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-[#0F75BD] to-[#02A5E6] text-white -mx-6 sm:-mx-8 md:-mx-12 lg:-mx-16 xl:-mx-20 2xl:-mx-24 px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20 2xl:px-24 rounded-2xl sm:rounded-[32px]">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
              Ready to Start Your Journey?
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-white/90 mb-6 sm:mb-8 px-4">
              Join thousands of travelers who trust Andinoh for their bookings
            </p>
            <Link href="/auth/signup">
              <Button size="lg" className="bg-white text-[#0F75BD] hover:bg-white/90 font-semibold w-full sm:w-auto">
                Create Your Free Account
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
