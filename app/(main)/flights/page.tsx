"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Plane, Calendar, Users, MapPin, ArrowRight, Clock, SlidersHorizontal } from "lucide-react";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import Card from "@/components/common/Card";

export default function FlightsPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [tripType, setTripType] = useState<"round-trip" | "one-way">("round-trip");
  const [cabinClass, setCabinClass] = useState<"economy" | "business" | "first">("economy");
  const [showFilters, setShowFilters] = useState(false);
  const [searchParams, setSearchParams] = useState({
    from: "",
    to: "",
    departure: "",
    returnDate: "",
    passengers: 1,
  });

  // Mock flight data
  const flights = [
    {
      id: "1",
      airline: "Air Peace",
      flightNumber: "P47215",
      from: "Lagos (LOS)",
      to: "Abuja (ABV)",
      departure: "08:00",
      arrival: "09:15",
      duration: "1h 15m",
      stops: 0,
      price: 45000,
      class: "Economy",
      seatsAvailable: 12,
    },
    {
      id: "2",
      airline: "Arik Air",
      flightNumber: "W3302",
      from: "Lagos (LOS)",
      to: "Abuja (ABV)",
      departure: "10:30",
      arrival: "11:45",
      duration: "1h 15m",
      stops: 0,
      price: 48000,
      class: "Economy",
      seatsAvailable: 8,
    },
    {
      id: "3",
      airline: "Dana Air",
      flightNumber: "9J120",
      from: "Lagos (LOS)",
      to: "Abuja (ABV)",
      departure: "14:00",
      arrival: "15:20",
      duration: "1h 20m",
      stops: 0,
      price: 42000,
      class: "Economy",
      seatsAvailable: 15,
    },
    {
      id: "4",
      airline: "Air Peace",
      flightNumber: "P47220",
      from: "Lagos (LOS)",
      to: "Abuja (ABV)",
      departure: "16:45",
      arrival: "18:00",
      duration: "1h 15m",
      stops: 0,
      price: 50000,
      class: "Economy",
      seatsAvailable: 5,
    },
    {
      id: "5",
      airline: "Arik Air",
      flightNumber: "W3310",
      from: "Lagos (LOS)",
      to: "Abuja (ABV)",
      departure: "19:30",
      arrival: "20:45",
      duration: "1h 15m",
      stops: 0,
      price: 52000,
      class: "Economy",
      seatsAvailable: 10,
    },
    {
      id: "6",
      airline: "Dana Air",
      flightNumber: "9J125",
      from: "Abuja (ABV)",
      to: "Lagos (LOS)",
      departure: "07:30",
      arrival: "08:45",
      duration: "1h 15m",
      stops: 0,
      price: 43000,
      class: "Economy",
      seatsAvailable: 20,
    },
  ];

  const handleSearch = () => {
    // TODO: Implement flight search
    console.log("Searching flights...", searchParams);
  };

  return (
    <div className="min-h-screen bg-white py-4 sm:py-6 md:py-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#1A1A1A] mb-2">Find Your Perfect Flight</h1>
        <p className="text-sm sm:text-base text-[#5C5B59]">Book flights across Nigeria with the best prices</p>
      </div>

      {/* Search Bar - Sticky */}
      <div className="sticky top-[80px] z-40 bg-white pb-4 -mx-6 sm:-mx-8 md:-mx-12 lg:-mx-16 xl:-mx-20 2xl:-mx-24 px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20 2xl:px-24 border-b border-[#E5E7EB]">
        <Card className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search flights by route, airline..."
                icon={<Search className="w-5 h-5" />}
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <SlidersHorizontal className="w-5 h-5" />
              Filters
            </Button>
          </div>

          {/* Filters Dropdown */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-[#E5E7EB] grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Price Range */}
              <div>
                <label className="block text-sm font-semibold text-[#1A1A1A] mb-3">
                  Price Range
                </label>
                <input
                  type="range"
                  min="0"
                  max="500000"
                  step="10000"
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-[#5C5B59] mt-2">
                  <span>₦0</span>
                  <span>₦500,000</span>
                </div>
              </div>

              {/* Stops */}
              <div>
                <label className="block text-sm font-semibold text-[#1A1A1A] mb-3">Stops</label>
                <div className="space-y-2">
                  {["Direct", "1 Stop", "2+ Stops"].map((stop) => (
                    <label key={stop} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 text-[#0F75BD] rounded" />
                      <span className="text-sm text-[#5C5B59]">{stop}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Airlines */}
              <div>
                <label className="block text-sm font-semibold text-[#1A1A1A] mb-3">
                  Airlines
                </label>
                <div className="space-y-2">
                  {["Air Peace", "Arik Air", "Dana Air"].map((airline) => (
                    <label key={airline} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 text-[#0F75BD] rounded" />
                      <span className="text-sm text-[#5C5B59]">{airline}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Departure Time */}
              <div>
                <label className="block text-sm font-semibold text-[#1A1A1A] mb-3">
                  Departure Time
                </label>
                <div className="space-y-2">
                  {[
                    { label: "Morning (6AM - 12PM)", value: "morning" },
                    { label: "Afternoon (12PM - 6PM)", value: "afternoon" },
                    { label: "Evening (6PM - 12AM)", value: "evening" },
                  ].map((time) => (
                    <label key={time.value} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 text-[#0F75BD] rounded" />
                      <span className="text-sm text-[#5C5B59]">{time.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Flights List */}
      <div className="mt-6">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm sm:text-base text-[#5C5B59]">
            <span className="font-semibold text-[#1A1A1A]">{flights.length}</span> flights available
          </p>
          <select className="px-3 sm:px-4 py-2 border border-[#E5E7EB] rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0F75BD]">
            <option>Price: Low to High</option>
            <option>Price: High to Low</option>
            <option>Departure: Earliest</option>
            <option>Departure: Latest</option>
            <option>Duration: Shortest</option>
          </select>
        </div>

        <div className="space-y-4">
          {flights.map((flight) => (
            <Link href={`/booking/flight/${flight.id}`} key={flight.id} className="block">
              <Card hover className="overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  {/* Flight Visual */}
                  <div className="md:w-64 h-32 md:h-auto bg-gradient-to-br from-[#E8F4F8] to-[#F0F9FF] relative flex items-center justify-center">
                    <span className="text-5xl sm:text-6xl">✈️</span>

                    {/* Flight Number Badge */}
                    <div className="absolute top-4 right-4">
                      <div className="px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm">
                        <span className="text-xs font-bold text-[#0F75BD]">{flight.flightNumber}</span>
                      </div>
                    </div>

                    {/* Seats Badge - Bottom */}
                    <div className="absolute bottom-4 right-4">
                      <span className="px-3 py-1.5 bg-green-50 text-green-600 text-xs font-semibold rounded-lg shadow-sm">
                        {flight.seatsAvailable} seats
                      </span>
                    </div>
                  </div>

                  {/* Flight Details */}
                  <div className="flex-1 p-4 sm:p-5">
                    <div className="flex flex-col lg:flex-row justify-between gap-4">
                      <div className="flex-1">
                        {/* Airline Name & Logo Space */}
                        <div className="flex items-center gap-3 mb-3">
                          {/* Airline Logo Placeholder - You can replace this div with an actual image */}
                          <div className="w-10 h-10 rounded-full bg-white border-2 border-[#E5E7EB] flex items-center justify-center flex-shrink-0">
                            <Plane className="w-5 h-5 text-[#0F75BD]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base sm:text-lg font-bold text-[#1A1A1A] truncate">
                              {flight.airline}
                            </h3>
                            <p className="text-xs text-[#5C5B59]">{flight.class}</p>
                          </div>
                        </div>

                        {/* Route Information */}
                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex-1">
                            <p className="text-lg font-bold text-[#1A1A1A]">{flight.departure}</p>
                            <p className="text-xs text-[#5C5B59] truncate">{flight.from}</p>
                          </div>

                          <div className="flex flex-col items-center px-2">
                            <div className="flex items-center gap-1.5">
                              <div className="w-8 h-px bg-[#E5E7EB]"></div>
                              <Plane className="w-3.5 h-3.5 text-[#0F75BD] rotate-90" />
                              <div className="w-8 h-px bg-[#E5E7EB]"></div>
                            </div>
                            <p className="text-[10px] text-[#5C5B59] mt-1 whitespace-nowrap">{flight.duration}</p>
                          </div>

                          <div className="flex-1 text-right">
                            <p className="text-lg font-bold text-[#1A1A1A]">{flight.arrival}</p>
                            <p className="text-xs text-[#5C5B59] truncate">{flight.to}</p>
                          </div>
                        </div>

                        {/* Additional Info */}
                        <div className="flex items-center gap-2 mt-2">
                          <span className="px-2.5 py-1 bg-[#F0F9FF] text-[#0F75BD] text-xs font-medium rounded-lg border border-[#E8F4F8]">
                            {flight.stops === 0 ? "Direct Flight" : `${flight.stops} Stop${flight.stops > 1 ? "s" : ""}`}
                          </span>
                        </div>
                      </div>

                      {/* Price & Actions Section */}
                      <div className="flex flex-row lg:flex-col justify-between lg:justify-start items-center lg:items-end gap-3 lg:min-w-[160px] border-t lg:border-t-0 lg:border-l border-[#E5E7EB] pt-3 lg:pt-0 lg:pl-4">
                        <div className="text-left lg:text-right">
                          <p className="text-xs text-[#5C5B59] mb-0.5">From</p>
                          <p className="text-xl sm:text-2xl font-bold text-[#0F75BD]">
                            ₦{flight.price.toLocaleString()}
                          </p>
                          <p className="text-xs text-[#5C5B59]">per person</p>
                        </div>

                        <Button size="sm" className="w-full lg:w-auto lg:min-w-[120px] shadow-sm">
                          Select
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
