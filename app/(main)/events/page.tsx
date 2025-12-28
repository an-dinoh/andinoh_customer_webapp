"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, MapPin, Users, Maximize2, Banknote, Sparkles, Eye, SlidersHorizontal, Grid, List } from "lucide-react";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import Card from "@/components/common/Card";

export default function EventsPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    priceRange: [0, 3000000],
    capacity: 0,
    city: "",
    spaceTypes: [] as string[],
    amenities: [] as string[],
  });

  // Helper function to format space type
  const formatSpaceType = (type: string) => {
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const toggleSpaceType = (type: string) => {
    setFilters({
      ...filters,
      spaceTypes: filters.spaceTypes.includes(type)
        ? filters.spaceTypes.filter((t) => t !== type)
        : [...filters.spaceTypes, type],
    });
  };

  const toggleAmenity = (amenity: string) => {
    setFilters({
      ...filters,
      amenities: filters.amenities.includes(amenity)
        ? filters.amenities.filter((a) => a !== amenity)
        : [...filters.amenities, amenity],
    });
  };

  // Mock event spaces data
  const eventSpaces = [
    {
      id: "1",
      title: "Grand Ballroom",
      description: "Elegant ballroom perfect for weddings and large corporate events with stunning chandeliers",
      space_type: "ballroom",
      space_size: 5000,
      max_capacity_banquet: 500,
      max_capacity_theater: 800,
      base_rate_per_hour: 150000,
      base_rate_full_day: 2000000,
      has_audio_visual: true,
      has_stage: true,
      has_natural_light: false,
      is_available: true,
      hotel: "Grand Plaza Hotel",
      city: "Lagos",
    },
    {
      id: "2",
      title: "Garden Pavilion",
      description: "Beautiful outdoor space with natural scenery, ideal for weddings and garden parties",
      space_type: "outdoor",
      space_size: 3000,
      max_capacity_banquet: 300,
      max_capacity_theater: 400,
      base_rate_per_hour: 100000,
      base_rate_full_day: 1200000,
      has_audio_visual: true,
      has_stage: false,
      has_natural_light: true,
      is_available: true,
      hotel: "Ocean View Resort",
      city: "Port Harcourt",
    },
    {
      id: "3",
      title: "Executive Conference Room",
      description: "Modern conference room with state-of-the-art technology for business meetings",
      space_type: "conference_room",
      space_size: 800,
      max_capacity_banquet: 80,
      max_capacity_theater: 120,
      base_rate_per_hour: 50000,
      base_rate_full_day: 500000,
      has_audio_visual: true,
      has_stage: false,
      has_natural_light: true,
      is_available: false,
      hotel: "Business Hub Hotel",
      city: "Abuja",
    },
    {
      id: "4",
      title: "Rooftop Terrace",
      description: "Stunning rooftop venue with panoramic city views, perfect for cocktail events",
      space_type: "rooftop",
      space_size: 2000,
      max_capacity_banquet: 150,
      max_capacity_theater: 200,
      base_rate_per_hour: 120000,
      base_rate_full_day: 1500000,
      has_audio_visual: true,
      has_stage: true,
      has_natural_light: true,
      is_available: true,
      hotel: "Royal Gardens Inn",
      city: "Abuja",
    },
    {
      id: "5",
      title: "Intimate Meeting Room",
      description: "Cozy space perfect for small meetings, workshops, and brainstorming sessions",
      space_type: "meeting_room",
      space_size: 400,
      max_capacity_banquet: 30,
      max_capacity_theater: 50,
      base_rate_per_hour: 30000,
      base_rate_full_day: 300000,
      has_audio_visual: true,
      has_stage: false,
      has_natural_light: true,
      is_available: true,
      hotel: "City Center Lodge",
      city: "Lagos",
    },
    {
      id: "6",
      title: "Crystal Hall",
      description: "Luxurious hall with crystal decor and premium amenities for upscale events",
      space_type: "banquet_hall",
      space_size: 4000,
      max_capacity_banquet: 400,
      max_capacity_theater: 600,
      base_rate_per_hour: 180000,
      base_rate_full_day: 2500000,
      has_audio_visual: true,
      has_stage: true,
      has_natural_light: false,
      is_available: true,
      hotel: "Luxury Suites & Spa",
      city: "Abuja",
    },
  ];

  return (
    <div className="min-h-screen bg-white py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#1A1A1A] mb-2">Event Spaces</h1>
        <p className="text-[#5C5B59]">Find the perfect venue for your next event</p>
      </div>

      {/* Search Bar - Sticky */}
      <div className="sticky top-[80px] z-40 bg-white pb-4 -mx-6 sm:-mx-8 md:-mx-12 lg:-mx-16 xl:-mx-20 2xl:-mx-24 px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20 2xl:px-24 border-b border-[#E5E7EB]">
        <Card className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by city, venue name, event type..."
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

          {/* Filters Dropdown */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-[#E5E7EB] grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Price Range */}
              <div>
                <label className="block text-sm font-semibold text-[#1A1A1A] mb-3">
                  Price Range (Full Day)
                </label>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max="3000000"
                    step="100000"
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

              {/* Capacity */}
              <div>
                <label className="block text-sm font-semibold text-[#1A1A1A] mb-3">
                  Minimum Capacity
                </label>
                <div className="space-y-2">
                  {[50, 100, 200, 300, 500].map((capacity) => (
                    <label key={capacity} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="capacity"
                        checked={filters.capacity === capacity}
                        onChange={() => setFilters({ ...filters, capacity })}
                        className="w-4 h-4 text-[#0F75BD]"
                      />
                      <span className="text-sm text-[#5C5B59]">{capacity}+ guests</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Space Type */}
              <div>
                <label className="block text-sm font-semibold text-[#1A1A1A] mb-3">
                  Space Type
                </label>
                <div className="space-y-2">
                  {["ballroom", "conference_room", "outdoor", "rooftop", "meeting_room"].map((type) => (
                    <label key={type} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.spaceTypes.includes(type)}
                        onChange={() => toggleSpaceType(type)}
                        className="w-4 h-4 text-[#0F75BD] rounded"
                      />
                      <span className="text-sm text-[#5C5B59]">{formatSpaceType(type)}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Amenities */}
              <div>
                <label className="block text-sm font-semibold text-[#1A1A1A] mb-3">
                  Amenities
                </label>
                <div className="space-y-2">
                  {["audio_visual", "stage", "natural_light"].map((amenity) => (
                    <label key={amenity} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.amenities.includes(amenity)}
                        onChange={() => toggleAmenity(amenity)}
                        className="w-4 h-4 text-[#0F75BD] rounded"
                      />
                      <span className="text-sm text-[#5C5B59]">
                        {amenity === "audio_visual" ? "A/V Equipment" : formatSpaceType(amenity)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Event Spaces Grid/List */}
      <div className="mt-6">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-[#5C5B59]">
            <span className="font-semibold text-[#1A1A1A]">{eventSpaces.length}</span> event spaces found
          </p>
          <select className="px-4 py-2 border border-[#E5E7EB] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F75BD]">
            <option>Price: Low to High</option>
            <option>Price: High to Low</option>
            <option>Capacity: Largest First</option>
            <option>Most Popular</option>
          </select>
        </div>

        {/* Grid View */}
        {viewMode === "grid" && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {eventSpaces.map((space, index) => {
              const spaceNumber = `E${String(index + 1).padStart(2, '0')}`;
              return (
                <Link href={`/booking/event/${space.id}`} key={space.id}>
                  <div className="bg-white rounded-[22px] overflow-hidden border border-[#E5E7EB] hover:border-[#0F75BD] transition-all group">
                      {/* Space Image */}
                      <div className="relative h-48 bg-gradient-to-br from-[#E8F4F8] to-[#F0F9FF] flex items-center justify-center overflow-hidden">
                        <span className="text-7xl">🎭</span>

                        {/* Space Number */}
                        <div className="absolute top-4 right-4 w-14 h-14 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center">
                          <span className="text-xs font-bold text-[#0F75BD]">{spaceNumber}</span>
                        </div>

                        {/* Space Type Badge */}
                        <div className="absolute top-4 left-4">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/90 backdrop-blur-sm text-[#0F75BD] text-xs font-medium rounded-lg">
                            <Sparkles className="w-3 h-3" />
                            {formatSpaceType(space.space_type)}
                          </span>
                        </div>

                        {/* Availability Badge */}
                        <div className="absolute bottom-3 right-3">
                          <span
                            className={`px-2.5 py-1 text-xs font-semibold rounded-lg ${
                              space.is_available
                                ? "bg-[#ECFDF5] text-green-700"
                                : "bg-[#FEE2E2] text-red-700"
                            }`}
                          >
                            {space.is_available ? "Available" : "Booked"}
                          </span>
                        </div>
                      </div>

                      {/* Space Content */}
                      <div className="p-5 flex flex-col h-full">
                        {/* Space Title */}
                        <h3 className="text-lg font-bold text-[#1A1A1A] mb-2 group-hover:text-[#0F75BD] transition-colors truncate">
                          {space.title}
                        </h3>

                        {/* Description */}
                        <p className="text-sm text-[#5C5B59] mb-4 line-clamp-2 h-10">
                          {space.description}
                        </p>

                        {/* Space Details */}
                        <div className="grid grid-cols-3 gap-2 mb-4">
                          <div className="flex flex-col items-center p-2 bg-[#FAFAFB] rounded-lg">
                            <Users className="w-4 h-4 text-[#0F75BD] mb-1" />
                            <span className="text-xs font-semibold text-[#1A1A1A]">{space.max_capacity_banquet}</span>
                            <span className="text-[10px] text-[#5C5B59]">Banquet</span>
                          </div>
                          <div className="flex flex-col items-center p-2 bg-[#FAFAFB] rounded-lg">
                            <Maximize2 className="w-4 h-4 text-[#0F75BD] mb-1" />
                            <span className="text-xs font-semibold text-[#1A1A1A]">{space.space_size}</span>
                            <span className="text-[10px] text-[#5C5B59]">sq ft</span>
                          </div>
                          <div className="flex flex-col items-center p-2 bg-[#FAFAFB] rounded-lg">
                            <Banknote className="w-4 h-4 text-[#0F75BD] mb-1" />
                            <span className="text-xs font-semibold text-[#1A1A1A]">₦{(space.base_rate_per_hour / 1000).toFixed(0)}k</span>
                            <span className="text-[10px] text-[#5C5B59]">/hour</span>
                          </div>
                        </div>

                        {/* Features Pills */}
                        <div className="flex gap-2 mb-4 h-7 overflow-hidden">
                          {space.has_audio_visual && (
                            <span className="px-2 py-1 bg-[#F0F9FF] text-[#0F75BD] text-xs font-medium rounded-lg whitespace-nowrap">
                              A/V Equipment
                            </span>
                          )}
                          {space.has_stage && (
                            <span className="px-2 py-1 bg-[#F5F3FF] text-purple-700 text-xs font-medium rounded-lg whitespace-nowrap">
                              Stage
                            </span>
                          )}
                          {space.has_natural_light && (
                            <span className="px-2 py-1 bg-[#FEF3C7] text-orange-700 text-xs font-medium rounded-lg whitespace-nowrap">
                              Natural Light
                            </span>
                          )}
                        </div>

                        {/* Divider */}
                        <div className="border-t border-[#E5E7EB] my-3"></div>

                        {/* Pricing & Actions */}
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-[#5C5B59] mb-0.5">Full Day Rate</p>
                            <p className="text-xl font-bold text-[#0F75BD]">
                              ₦{(space.base_rate_full_day / 1000000).toFixed(1)}M
                            </p>
                          </div>
                          <button className="px-4 py-2 bg-[#0F75BD] text-white text-sm font-medium rounded-xl hover:bg-[#0050C8] transition-colors flex items-center gap-2">
                            <Eye className="w-4 h-4" />
                            View
                          </button>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* List View */}
          {viewMode === "list" && (
            <div className="space-y-4">
              {eventSpaces.map((space, index) => {
                const spaceNumber = `E${String(index + 1).padStart(2, '0')}`;
                return (
                  <Link href={`/booking/event/${space.id}`} key={space.id}>
                    <Card hover className="overflow-hidden">
                      <div className="flex flex-col md:flex-row">
                        <div className="md:w-80 aspect-video md:aspect-auto bg-gradient-to-br from-[#E8F4F8] to-[#F0F9FF] relative">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-8xl">🎭</span>
                          </div>
                          {/* Space Number Badge */}
                          <div className="absolute top-4 right-4 w-14 h-14 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center">
                            <span className="text-xs font-bold text-[#0F75BD]">{spaceNumber}</span>
                          </div>
                        </div>
                        <div className="flex-1 p-6">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-2xl font-bold text-[#1A1A1A]">
                                  {space.title}
                                </h3>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#E8F4F8] text-[#0F75BD] text-xs font-medium rounded-lg">
                                  <Sparkles className="w-3 h-3" />
                                  {formatSpaceType(space.space_type)}
                                </span>
                                <span
                                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg ${
                                    space.is_available
                                      ? "bg-[#ECFDF5] text-green-700"
                                      : "bg-[#FEE2E2] text-red-700"
                                  }`}
                                >
                                  {space.is_available ? "Available" : "Booked"}
                                </span>
                              </div>
                              <p className="text-[#5C5B59] flex items-center gap-1 mb-3">
                                <MapPin className="w-4 h-4" />
                                {space.hotel}, {space.city}
                              </p>
                            </div>
                            <div className="text-right ml-4">
                              <p className="text-xs text-[#5C5B59] mb-0.5">Full Day Rate</p>
                              <p className="text-2xl font-bold text-[#0F75BD]">
                                ₦{(space.base_rate_full_day / 1000000).toFixed(1)}M
                              </p>
                              <p className="text-sm text-[#5C5B59]">
                                ₦{space.base_rate_per_hour.toLocaleString()}/hour
                              </p>
                            </div>
                          </div>
                          <p className="text-[#5C5B59] mb-4">{space.description}</p>

                          {/* Space Details */}
                          <div className="flex gap-6 mb-4">
                            <div className="flex items-center gap-2">
                              <Users className="w-5 h-5 text-[#0F75BD]" />
                              <div>
                                <p className="text-sm font-semibold text-[#1A1A1A]">
                                  {space.max_capacity_banquet} Banquet / {space.max_capacity_theater} Theater
                                </p>
                                <p className="text-xs text-[#5C5B59]">Capacity</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Maximize2 className="w-5 h-5 text-[#0F75BD]" />
                              <div>
                                <p className="text-sm font-semibold text-[#1A1A1A]">{space.space_size} sq ft</p>
                                <p className="text-xs text-[#5C5B59]">Space Size</p>
                              </div>
                            </div>
                          </div>

                          {/* Features */}
                          <div className="flex flex-wrap gap-2">
                            {space.has_audio_visual && (
                              <span className="px-3 py-1 bg-[#F0F9FF] text-[#0F75BD] text-xs font-medium rounded-lg">
                                A/V Equipment
                              </span>
                            )}
                            {space.has_stage && (
                              <span className="px-3 py-1 bg-[#F5F3FF] text-purple-700 text-xs font-medium rounded-lg">
                                Stage
                              </span>
                            )}
                            {space.has_natural_light && (
                              <span className="px-3 py-1 bg-[#FEF3C7] text-orange-700 text-xs font-medium rounded-lg">
                                Natural Light
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
      </div>
    </div>
  );
}
