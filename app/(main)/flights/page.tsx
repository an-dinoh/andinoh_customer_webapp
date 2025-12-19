"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Plane, Calendar, Users, MapPin, ArrowRight, Clock, SlidersHorizontal } from "lucide-react";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import Card from "@/components/common/Card";

export default function FlightsPage() {
  const [tripType, setTripType] = useState<"round-trip" | "one-way">("round-trip");
  const [cabinClass, setCabinClass] = useState<"economy" | "business" | "first">("economy");
  const [showFilters, setShowFilters] = useState(true);
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
  ];

  const handleSearch = () => {
    // TODO: Implement flight search
    console.log("Searching flights...", searchParams);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFB]">
      {/* Search Section */}
      <section className="bg-gradient-to-br from-[#0F75BD] to-[#02A5E6] text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Find Your Perfect Flight</h1>

          <Card className="p-6">
            {/* Trip Type Toggle */}
            <div className="flex gap-4 mb-6">
              <button
                onClick={() => setTripType("round-trip")}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  tripType === "round-trip"
                    ? "bg-[#0F75BD] text-white"
                    : "bg-[#F9FAFB] text-[#5C5B59]"
                }`}
              >
                Round Trip
              </button>
              <button
                onClick={() => setTripType("one-way")}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  tripType === "one-way"
                    ? "bg-[#0F75BD] text-white"
                    : "bg-[#F9FAFB] text-[#5C5B59]"
                }`}
              >
                One Way
              </button>
            </div>

            {/* Search Form */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <Input
                placeholder="From (City or Airport)"
                value={searchParams.from}
                onChange={(e) => setSearchParams({ ...searchParams, from: e.target.value })}
                icon={<Plane className="w-5 h-5" />}
              />
              <Input
                placeholder="To (City or Airport)"
                value={searchParams.to}
                onChange={(e) => setSearchParams({ ...searchParams, to: e.target.value })}
                icon={<MapPin className="w-5 h-5" />}
              />
              <Input
                type="date"
                placeholder="Departure"
                value={searchParams.departure}
                onChange={(e) => setSearchParams({ ...searchParams, departure: e.target.value })}
                icon={<Calendar className="w-5 h-5" />}
              />
              {tripType === "round-trip" && (
                <Input
                  type="date"
                  placeholder="Return"
                  value={searchParams.returnDate}
                  onChange={(e) => setSearchParams({ ...searchParams, returnDate: e.target.value })}
                  icon={<Calendar className="w-5 h-5" />}
                />
              )}
              <Input
                type="number"
                placeholder="Passengers"
                value={searchParams.passengers.toString()}
                onChange={(e) =>
                  setSearchParams({ ...searchParams, passengers: parseInt(e.target.value) })
                }
                icon={<Users className="w-5 h-5" />}
                min={1}
              />
              <div>
                <select
                  value={cabinClass}
                  onChange={(e) => setCabinClass(e.target.value as any)}
                  className="w-full px-4 py-3 border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F75BD]"
                >
                  <option value="economy">Economy</option>
                  <option value="business">Business Class</option>
                  <option value="first">First Class</option>
                </select>
              </div>
            </div>

            <Button fullWidth size="lg" onClick={handleSearch}>
              <Search className="w-5 h-5" />
              Search Flights
            </Button>
          </Card>
        </div>
      </section>

      {/* Results Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-6">
          {/* Filters Sidebar */}
          {showFilters && (
            <aside className="hidden lg:block w-80 flex-shrink-0">
              <Card className="p-6 sticky top-24">
                <h3 className="text-lg font-bold text-[#1A1A1A] mb-4">Filters</h3>

                {/* Price Range */}
                <div className="mb-6">
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
                <div className="mb-6">
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
                <div className="mb-6">
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
                <div className="mb-6">
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

                <Button variant="outline" fullWidth>
                  Clear All Filters
                </Button>
              </Card>
            </aside>
          )}

          {/* Flights List */}
          <main className="flex-1">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-[#5C5B59]">
                <span className="font-semibold text-[#1A1A1A]">{flights.length}</span> flights
                available
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden"
                >
                  <SlidersHorizontal className="w-5 h-5" />
                </Button>
                <select className="px-4 py-2 border border-[#E5E7EB] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F75BD]">
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Departure: Earliest</option>
                  <option>Departure: Latest</option>
                  <option>Duration: Shortest</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              {flights.map((flight) => (
                <Card key={flight.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Airline Logo & Name */}
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-[#E8F4F8] rounded-lg flex items-center justify-center">
                        <Plane className="w-6 h-6 text-[#0F75BD]" />
                      </div>
                      <div>
                        <p className="font-bold text-[#1A1A1A]">{flight.airline}</p>
                        <p className="text-xs text-[#5C5B59]">{flight.flightNumber}</p>
                      </div>
                    </div>

                    {/* Flight Details */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-[#1A1A1A]">{flight.departure}</p>
                          <p className="text-sm text-[#5C5B59]">{flight.from}</p>
                        </div>

                        <div className="flex-1 px-4">
                          <div className="flex items-center justify-center gap-2 mb-1">
                            <div className="flex-1 h-px bg-[#E5E7EB]"></div>
                            <Plane className="w-4 h-4 text-[#5C5B59] rotate-90" />
                            <div className="flex-1 h-px bg-[#E5E7EB]"></div>
                          </div>
                          <p className="text-xs text-[#5C5B59] text-center">{flight.duration}</p>
                          <p className="text-xs text-[#0F75BD] text-center font-semibold">
                            {flight.stops === 0 ? "Direct" : `${flight.stops} stop${flight.stops > 1 ? "s" : ""}`}
                          </p>
                        </div>

                        <div className="text-center">
                          <p className="text-2xl font-bold text-[#1A1A1A]">{flight.arrival}</p>
                          <p className="text-sm text-[#5C5B59]">{flight.to}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-3 py-1 bg-[#E8F4F8] text-[#0F75BD] text-xs rounded-lg">
                          {flight.class}
                        </span>
                        <span className="px-3 py-1 bg-green-50 text-green-600 text-xs rounded-lg">
                          {flight.seatsAvailable} seats left
                        </span>
                      </div>
                    </div>

                    {/* Price & Book Button */}
                    <div className="flex flex-col justify-between items-end">
                      <div className="text-right mb-4">
                        <p className="text-xs text-[#5C5B59]">From</p>
                        <p className="text-2xl font-bold text-[#0F75BD]">
                          ₦{flight.price.toLocaleString()}
                        </p>
                        <p className="text-xs text-[#5C5B59]">per person</p>
                      </div>
                      <Link href={`/booking/flight/${flight.id}`}>
                        <Button>Select Flight</Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
