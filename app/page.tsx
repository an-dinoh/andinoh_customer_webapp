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
      <div className="min-h-screen bg-white py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1A1A1A] mb-2">Welcome back!</h1>
          <p className="text-[#5C5B59]">Ready to plan your next adventure?</p>
        </div>

        {/* Quick Actions */}
        <div className="mb-12">
          <h2 className="text-xl font-bold text-[#1A1A1A] mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link href={action.href} key={action.title}>
                  <div className="bg-white border border-[#E5E7EB] rounded-[22px] p-6 hover:border-[#0F75BD] transition-all group cursor-pointer">
                    <div className={`w-14 h-14 ${action.color} rounded-2xl flex items-center justify-center mb-4`}>
                      <Icon className={`w-7 h-7 ${action.iconColor}`} />
                    </div>
                    <h3 className="text-lg font-bold text-[#1A1A1A] mb-1 group-hover:text-[#0F75BD] transition-colors">
                      {action.title}
                    </h3>
                    <p className="text-sm text-[#5C5B59]">{action.description}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-[#1A1A1A]">Recent Bookings</h2>
            <Link href="/bookings" className="text-[#0F75BD] font-semibold text-sm hover:underline">
              View All
            </Link>
          </div>

          <div className="space-y-4">
            {recentBookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white border border-[#E5E7EB] rounded-[22px] p-6 hover:border-[#0F75BD] transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#E8F4F8] rounded-xl flex items-center justify-center">
                      {booking.type === "hotel" ? (
                        <Building2 className="w-6 h-6 text-[#0F75BD]" />
                      ) : (
                        <Plane className="w-6 h-6 text-[#0F75BD]" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-[#1A1A1A]">{booking.name}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-sm text-[#5C5B59] flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {booking.location}
                        </span>
                        <span className="text-sm text-[#5C5B59] flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {booking.date}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <span
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg ${
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
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-[#1A1A1A]">Recommended for You</h2>
            <Link href="/hotels" className="text-[#0F75BD] font-semibold text-sm hover:underline">
              View All
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredHotels.map((hotel) => (
              <Link href={`/hotels/${hotel.id}`} key={hotel.id}>
                <div className="bg-white rounded-[22px] overflow-hidden border border-[#E5E7EB] hover:border-[#0F75BD] transition-all group">
                  <div className="relative h-48 bg-[#E8F4F8] flex items-center justify-center overflow-hidden">
                    <span className="text-6xl">🏨</span>

                    <div className="absolute top-4 right-4">
                      <div className="flex items-center gap-1 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-lg">
                        <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-bold text-[#1A1A1A]">{hotel.rating}</span>
                      </div>
                    </div>

                    <div className="absolute top-4 left-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/90 backdrop-blur-sm text-[#0F75BD] text-xs font-medium rounded-lg">
                        <MapPin className="w-3 h-3" />
                        {hotel.city}
                      </span>
                    </div>
                  </div>

                  <div className="p-5">
                    <h3 className="text-lg font-bold text-[#1A1A1A] mb-2 group-hover:text-[#0F75BD] transition-colors truncate">
                      {hotel.name}
                    </h3>
                    <p className="text-sm text-[#5C5B59] mb-3">
                      {hotel.city}, {hotel.country}
                    </p>
                    <div className="border-t border-[#E5E7EB] my-3"></div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-[#5C5B59] mb-0.5">Starting from</p>
                        <p className="text-xl font-bold text-[#0F75BD]">
                          ₦{hotel.price.toLocaleString()}
                          <span className="text-xs font-normal text-[#5C5B59]">/night</span>
                        </p>
                      </div>
                      <button className="px-4 py-2 bg-[#0F75BD] text-white text-sm font-medium rounded-xl hover:bg-[#0050C8] transition-colors">
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
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#0F75BD] to-[#02A5E6] text-white py-24 -mt-8">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="relative">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Your Journey Starts Here
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto mb-8">
              Book hotels, flights, and event spaces with the best prices guaranteed
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/auth/signup">
                <Button size="lg" className="bg-white text-[#0F75BD] hover:bg-white/90 font-semibold">
                  Get Started Free
                </Button>
              </Link>
              <Link href="/hotels">
                <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10">
                  Explore Hotels
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 -mt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-[#E5E7EB] rounded-[22px] p-8 text-center">
            <div className="w-16 h-16 bg-[#ECFDF5] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-[#1A1A1A] mb-2">Instant Confirmation</h3>
            <p className="text-[#5C5B59]">Get confirmed bookings in seconds</p>
          </div>

          <div className="bg-white border border-[#E5E7EB] rounded-[22px] p-8 text-center">
            <div className="w-16 h-16 bg-[#FEF3C7] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-orange-600" />
            </div>
            <h3 className="text-xl font-bold text-[#1A1A1A] mb-2">Best Prices</h3>
            <p className="text-[#5C5B59]">Guaranteed lowest prices or refund</p>
          </div>

          <div className="bg-white border border-[#E5E7EB] rounded-[22px] p-8 text-center">
            <div className="w-16 h-16 bg-[#E8F4F8] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-[#0F75BD]" />
            </div>
            <h3 className="text-xl font-bold text-[#1A1A1A] mb-2">24/7 Support</h3>
            <p className="text-[#5C5B59]">We're here whenever you need us</p>
          </div>
        </div>
      </section>

      {/* Quick Browse Section */}
      <section className="py-16 bg-[#FAFAFB] -mx-16 px-16">
        <h2 className="text-3xl font-bold text-[#1A1A1A] mb-8 text-center">What would you like to book?</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link href={action.href} key={action.title}>
                <div className="bg-white border border-[#E5E7EB] rounded-[22px] p-8 hover:border-[#0F75BD] transition-all group cursor-pointer text-center">
                  <div className={`w-20 h-20 ${action.color} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                    <Icon className={`w-10 h-10 ${action.iconColor}`} />
                  </div>
                  <h3 className="text-2xl font-bold text-[#1A1A1A] mb-2 group-hover:text-[#0F75BD] transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-[#5C5B59]">{action.description}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured Hotels */}
      <section className="py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-[#1A1A1A] mb-2">Featured Hotels</h2>
            <p className="text-[#5C5B59]">Handpicked hotels for your perfect stay</p>
          </div>
          <Link href="/hotels" className="text-[#0F75BD] font-semibold hover:underline">
            View All →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredHotels.map((hotel) => (
            <Link href={`/hotels/${hotel.id}`} key={hotel.id}>
              <div className="bg-white rounded-[22px] overflow-hidden border border-[#E5E7EB] hover:border-[#0F75BD] transition-all group">
                <div className="relative h-48 bg-[#E8F4F8] flex items-center justify-center overflow-hidden">
                  <span className="text-6xl">🏨</span>

                  <div className="absolute top-4 right-4">
                    <div className="flex items-center gap-1 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-lg">
                      <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-bold text-[#1A1A1A]">{hotel.rating}</span>
                    </div>
                  </div>

                  <div className="absolute top-4 left-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/90 backdrop-blur-sm text-[#0F75BD] text-xs font-medium rounded-lg">
                      <MapPin className="w-3 h-3" />
                      {hotel.city}
                    </span>
                  </div>

                  {hotel.featured && (
                    <div className="absolute bottom-3 right-3">
                      <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#FBB81F] text-white">
                        Featured
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <h3 className="text-lg font-bold text-[#1A1A1A] mb-2 group-hover:text-[#0F75BD] transition-colors truncate">
                    {hotel.name}
                  </h3>
                  <p className="text-sm text-[#5C5B59] mb-3">
                    {hotel.city}, {hotel.country}
                  </p>
                  <div className="border-t border-[#E5E7EB] my-3"></div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-[#5C5B59] mb-0.5">Starting from</p>
                      <p className="text-xl font-bold text-[#0F75BD]">
                        ₦{hotel.price.toLocaleString()}
                        <span className="text-xs font-normal text-[#5C5B59]">/night</span>
                      </p>
                    </div>
                    <button className="px-4 py-2 bg-[#0F75BD] text-white text-sm font-medium rounded-xl hover:bg-[#0050C8] transition-colors">
                      View
                    </button>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-[#0F75BD] to-[#02A5E6] text-white -mx-16 px-16 rounded-[32px]">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of travelers who trust Andinoh for their bookings
          </p>
          <Link href="/auth/signup">
            <Button size="lg" className="bg-white text-[#0F75BD] hover:bg-white/90 font-semibold">
              Create Your Free Account
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
