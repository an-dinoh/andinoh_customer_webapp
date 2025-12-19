"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, MapPin, Star, Filter, Grid, List, Building2, Wifi, Car, Coffee, Dumbbell, SlidersHorizontal } from "lucide-react";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import Card from "@/components/common/Card";

export default function HotelsPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(true);
  const [filters, setFilters] = useState({
    priceRange: [0, 200000],
    rating: 0,
    amenities: [] as string[],
    city: "",
  });

  // Mock hotel data
  const hotels = [
    {
      id: "1",
      name: "Grand Plaza Hotel",
      city: "Lagos",
      country: "Nigeria",
      rating: 4.8,
      reviews: 245,
      price: 45000,
      image: "/hotel-1.jpg",
      amenities: ["Wifi", "Parking", "Restaurant", "Pool", "Gym"],
      description: "Luxurious 5-star hotel in the heart of Lagos with stunning views",
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
      amenities: ["Wifi", "Spa", "Restaurant", "Pool", "Gym", "Bar"],
      description: "Premium accommodation with world-class spa facilities",
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
      amenities: ["Wifi", "Beach Access", "Restaurant", "Pool"],
      description: "Beachfront resort offering relaxation and luxury",
    },
    {
      id: "4",
      name: "Business Hub Hotel",
      city: "Lagos",
      country: "Nigeria",
      rating: 4.6,
      reviews: 156,
      price: 35000,
      image: "/hotel-4.jpg",
      amenities: ["Wifi", "Conference Room", "Restaurant", "Parking"],
      description: "Perfect for business travelers with modern facilities",
    },
    {
      id: "5",
      name: "Royal Gardens Inn",
      city: "Abuja",
      country: "Nigeria",
      rating: 4.8,
      reviews: 203,
      price: 48000,
      image: "/hotel-5.jpg",
      amenities: ["Wifi", "Garden", "Restaurant", "Pool", "Spa"],
      description: "Serene garden setting with premium amenities",
    },
    {
      id: "6",
      name: "City Center Lodge",
      city: "Ibadan",
      country: "Nigeria",
      rating: 4.5,
      reviews: 128,
      price: 28000,
      image: "/hotel-6.jpg",
      amenities: ["Wifi", "Parking", "Restaurant"],
      description: "Affordable comfort in the city center",
    },
  ];

  const amenitiesList = [
    { id: "wifi", label: "Free WiFi", icon: Wifi },
    { id: "parking", label: "Parking", icon: Car },
    { id: "restaurant", label: "Restaurant", icon: Coffee },
    { id: "gym", label: "Gym", icon: Dumbbell },
  ];

  const toggleAmenity = (amenityId: string) => {
    setFilters({
      ...filters,
      amenities: filters.amenities.includes(amenityId)
        ? filters.amenities.filter((a) => a !== amenityId)
        : [...filters.amenities, amenityId],
    });
  };

  return (
    <div className="min-h-screen bg-[#FAFAFB] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1A1A1A] mb-2">Find Your Perfect Hotel</h1>
          <p className="text-[#5C5B59]">Discover amazing hotels across Nigeria</p>
        </div>

        {/* Search Bar */}
        <Card className="mb-6 p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by city, hotel name..."
                icon={<Search className="w-5 h-5" />}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <SlidersHorizontal className="w-5 h-5" />
                Filters
              </Button>
              <div className="flex border border-[#E5E7EB] rounded-xl overflow-hidden">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-3 ${
                    viewMode === "grid" ? "bg-[#0F75BD] text-white" : "bg-white text-[#5C5B59]"
                  }`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-3 ${
                    viewMode === "list" ? "bg-[#0F75BD] text-white" : "bg-white text-[#5C5B59]"
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </Card>

        <div className="flex gap-6">
          {/* Filters Sidebar */}
          {showFilters && (
            <aside className="hidden lg:block w-80 flex-shrink-0">
              <Card className="p-6 sticky top-24">
                <h3 className="text-lg font-bold text-[#1A1A1A] mb-4">Filters</h3>

                {/* Price Range */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-[#1A1A1A] mb-3">
                    Price Range (per night)
                  </label>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0"
                      max="200000"
                      step="5000"
                      value={filters.priceRange[1]}
                      onChange={(e) =>
                        setFilters({ ...filters, priceRange: [0, parseInt(e.target.value)] })
                      }
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-[#5C5B59]">
                      <span>₦0</span>
                      <span>₦{filters.priceRange[1].toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Rating */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-[#1A1A1A] mb-3">
                    Minimum Rating
                  </label>
                  <div className="space-y-2">
                    {[4.5, 4.0, 3.5, 3.0].map((rating) => (
                      <label key={rating} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="rating"
                          checked={filters.rating === rating}
                          onChange={() => setFilters({ ...filters, rating })}
                          className="w-4 h-4 text-[#0F75BD]"
                        />
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm text-[#5C5B59]">{rating}+</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Amenities */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-[#1A1A1A] mb-3">
                    Amenities
                  </label>
                  <div className="space-y-2">
                    {amenitiesList.map((amenity) => {
                      const Icon = amenity.icon;
                      return (
                        <label key={amenity.id} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={filters.amenities.includes(amenity.id)}
                            onChange={() => toggleAmenity(amenity.id)}
                            className="w-4 h-4 text-[#0F75BD] rounded"
                          />
                          <Icon className="w-4 h-4 text-[#5C5B59]" />
                          <span className="text-sm text-[#5C5B59]">{amenity.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Clear Filters */}
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() =>
                    setFilters({ priceRange: [0, 200000], rating: 0, amenities: [], city: "" })
                  }
                >
                  Clear All Filters
                </Button>
              </Card>
            </aside>
          )}

          {/* Hotels Grid/List */}
          <main className="flex-1">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-[#5C5B59]">
                <span className="font-semibold text-[#1A1A1A]">{hotels.length}</span> hotels found
              </p>
              <select className="px-4 py-2 border border-[#E5E7EB] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F75BD]">
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Rating: High to Low</option>
                <option>Most Popular</option>
              </select>
            </div>

            {/* Grid View */}
            {viewMode === "grid" && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {hotels.map((hotel) => (
                  <Link href={`/hotels/${hotel.id}`} key={hotel.id}>
                    <Card hover className="overflow-hidden h-full">
                      <div className="aspect-video bg-gray-200 relative">
                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#0F75BD] to-[#02A5E6]">
                          <Building2 className="w-16 h-16 text-white/30" />
                        </div>
                      </div>
                      <div className="p-5">
                        <h3 className="text-xl font-bold text-[#1A1A1A] mb-2">{hotel.name}</h3>
                        <p className="text-[#5C5B59] text-sm mb-3 flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {hotel.city}, {hotel.country}
                        </p>
                        <p className="text-sm text-[#5C5B59] mb-4 line-clamp-2">
                          {hotel.description}
                        </p>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-semibold text-[#1A1A1A]">{hotel.rating}</span>
                            <span className="text-[#5C5B59] text-sm">({hotel.reviews})</span>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold text-[#0F75BD]">
                              ₦{hotel.price.toLocaleString()}
                            </p>
                            <p className="text-xs text-[#5C5B59]">per night</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {hotel.amenities.slice(0, 3).map((amenity) => (
                            <span
                              key={amenity}
                              className="px-2 py-1 bg-[#E8F4F8] text-[#0F75BD] text-xs rounded-lg"
                            >
                              {amenity}
                            </span>
                          ))}
                          {hotel.amenities.length > 3 && (
                            <span className="px-2 py-1 bg-[#F9FAFB] text-[#5C5B59] text-xs rounded-lg">
                              +{hotel.amenities.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            )}

            {/* List View */}
            {viewMode === "list" && (
              <div className="space-y-4">
                {hotels.map((hotel) => (
                  <Link href={`/hotels/${hotel.id}`} key={hotel.id}>
                    <Card hover className="overflow-hidden">
                      <div className="flex flex-col md:flex-row">
                        <div className="md:w-80 aspect-video md:aspect-auto bg-gray-200 relative">
                          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#0F75BD] to-[#02A5E6]">
                            <Building2 className="w-16 h-16 text-white/30" />
                          </div>
                        </div>
                        <div className="flex-1 p-6">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="text-2xl font-bold text-[#1A1A1A] mb-2">
                                {hotel.name}
                              </h3>
                              <p className="text-[#5C5B59] flex items-center gap-1 mb-2">
                                <MapPin className="w-4 h-4" />
                                {hotel.city}, {hotel.country}
                              </p>
                              <div className="flex items-center gap-1 mb-3">
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                <span className="font-semibold text-[#1A1A1A]">{hotel.rating}</span>
                                <span className="text-[#5C5B59] text-sm">
                                  ({hotel.reviews} reviews)
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-[#0F75BD]">
                                ₦{hotel.price.toLocaleString()}
                              </p>
                              <p className="text-sm text-[#5C5B59]">per night</p>
                            </div>
                          </div>
                          <p className="text-[#5C5B59] mb-4">{hotel.description}</p>
                          <div className="flex flex-wrap gap-2">
                            {hotel.amenities.map((amenity) => (
                              <span
                                key={amenity}
                                className="px-3 py-1 bg-[#E8F4F8] text-[#0F75BD] text-sm rounded-lg"
                              >
                                {amenity}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
