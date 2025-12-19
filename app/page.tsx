"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, MapPin, Calendar, Users, Star, TrendingUp, Award, Shield, Plane, Building2 } from "lucide-react";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import Card from "@/components/common/Card";

export default function Home() {
  const [searchType, setSearchType] = useState<"hotels" | "flights">("hotels");

  const featuredHotels = [
    {
      id: "1",
      name: "Grand Plaza Hotel",
      city: "Lagos",
      country: "Nigeria",
      rating: 4.8,
      reviews: 245,
      price: 45000,
      image: "/hotel-1.jpg",
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
      image: "/hotel-2.jpg",
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
      image: "/hotel-3.jpg",
      featured: false,
    },
  ];

  const features = [
    {
      icon: Shield,
      title: "Secure Booking",
      description: "Your payments and data are 100% protected",
    },
    {
      icon: Award,
      title: "Best Price Guarantee",
      description: "Find the lowest prices or we'll refund the difference",
    },
    {
      icon: TrendingUp,
      title: "Easy Booking",
      description: "Book in just a few clicks with instant confirmation",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#0F75BD] to-[#02A5E6] text-white py-20 px-4">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              Discover Your Perfect Stay
            </h1>
            <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
              Book hotels, flights, and event spaces with the best prices guaranteed
            </p>
          </div>

          {/* Search Card */}
          <Card className="max-w-4xl mx-auto shadow-xl">
            {/* Search Type Tabs */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setSearchType("hotels")}
                className={`flex items-center gap-2 px-6 py-4 rounded-xl font-semibold text-sm transition-all ${
                  searchType === "hotels"
                    ? "bg-[#0F75BD] text-white"
                    : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                }`}
              >
                <Building2 className="w-5 h-5" />
                Hotels
              </button>
              <button
                onClick={() => setSearchType("flights")}
                className={`flex items-center gap-2 px-6 py-4 rounded-xl font-semibold text-sm transition-all ${
                  searchType === "flights"
                    ? "bg-[#0F75BD] text-white"
                    : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                }`}
              >
                <Plane className="w-5 h-5" />
                Flights
              </button>
            </div>

            {/* Hotel Search Form */}
            {searchType === "hotels" && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <Input
                    placeholder="Where are you going?"
                    icon={<MapPin className="w-5 h-5" />}
                  />
                </div>
                <Input
                  type="date"
                  placeholder="Check-in"
                  icon={<Calendar className="w-5 h-5" />}
                />
                <Input
                  type="date"
                  placeholder="Check-out"
                  icon={<Calendar className="w-5 h-5" />}
                />
                <Input
                  type="number"
                  placeholder="Guests"
                  defaultValue="2"
                  icon={<Users className="w-5 h-5" />}
                />
                <div className="md:col-span-3">
                  <Button fullWidth size="lg">
                    <Search className="w-5 h-5" />
                    Search Hotels
                  </Button>
                </div>
              </div>
            )}

            {/* Flight Search Form */}
            {searchType === "flights" && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Input
                  placeholder="From"
                  icon={<Plane className="w-5 h-5" />}
                />
                <Input
                  placeholder="To"
                  icon={<MapPin className="w-5 h-5" />}
                />
                <Input
                  type="date"
                  placeholder="Departure"
                  icon={<Calendar className="w-5 h-5" />}
                />
                <Input
                  type="date"
                  placeholder="Return"
                  icon={<Calendar className="w-5 h-5" />}
                />
                <Input
                  type="number"
                  placeholder="Passengers"
                  defaultValue="1"
                  icon={<Users className="w-5 h-5" />}
                />
                <div className="md:col-span-3">
                  <Button fullWidth size="lg">
                    <Search className="w-5 h-5" />
                    Search Flights
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-[#FAFAFB]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-[#E6EFF6] rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-[#0F75BD]" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{feature.title}</h3>
                  <p className="text-[#5C5B59] text-sm">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Hotels Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-semibold text-gray-800 mb-2">Featured Hotels</h2>
              <p className="text-[#5C5B59] text-sm">Handpicked hotels for your perfect stay</p>
            </div>
            <Link href="/hotels" className="text-[#0F75BD] font-semibold text-sm hover:underline">
              View All
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredHotels.map((hotel) => (
              <Link href={`/hotels/${hotel.id}`} key={hotel.id}>
                <Card padding="none" hover className="overflow-hidden">
                  <div className="aspect-video bg-gray-200 relative">
                    {/* Placeholder for hotel image */}
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#0F75BD] to-[#02A5E6]">
                      <Building2 className="w-16 h-16 text-white/30" />
                    </div>
                    {hotel.featured && (
                      <div className="absolute top-3 right-3 bg-[#FBB81F] text-white px-3 py-1 rounded-full text-xs font-semibold">
                        Featured
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">{hotel.name}</h3>
                    <p className="text-[#5C5B59] text-sm mb-3 flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {hotel.city}, {hotel.country}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold text-gray-800">{hotel.rating}</span>
                        <span className="text-[#5C5B59] text-xs">({hotel.reviews})</span>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-[#5C5B59]">From</p>
                        <p className="text-lg font-semibold text-[#0F75BD]">₦{hotel.price.toLocaleString()}</p>
                        <p className="text-xs text-[#5C5B59]">per night</p>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-br from-[#0F75BD] to-[#02A5E6] text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-semibold mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-base text-white/90 mb-8">
            Join thousands of travelers who trust Andinoh for their bookings
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup">
              <Button variant="secondary" size="lg">
                Create Free Account
              </Button>
            </Link>
            <Link href="/hotels">
              <Button variant="outline" size="lg" className="bg-white/10 border border-white text-white hover:bg-white/20">
                Explore Hotels
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
