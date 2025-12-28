"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Plane, Calendar, Users, MapPin, ArrowRight, Clock, SlidersHorizontal } from "lucide-react";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import Card from "@/components/common/Card";

export default function FlightsPage() {
  const [tripType, setTripType] = useState<"round-trip" | "one-way">("round-trip");
  const [cabinClass, setCabinClass] = useState<"economy" | "business" | "first">("economy");
  const [showFilters, setShowFilters] = useState(false);
  const [searchParams, setSearchParams] = useState({
    from: "Lagos (LOS)",
    to: "Abuja (ABV)",
    departure: "",
    returnDate: "",
    passengers: 1,
  });

  // Mock flight data
  const flights = [
    {
      id: "1",
      airline: "United Nigeria",
      flightNumber: "UN123",
      from: "Lagos (LOS)",
      to: "Abuja (ABV)",
      departure: "08:00",
      arrival: "09:15",
      duration: "1h 15m",
      stops: 0,
      price: 45000,
      class: "Economy",
      seatsAvailable: 12,
      logo: "/logos/United-ng-logo.png",
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
    <div className="min-h-screen bg-white py-6 sm:py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-[#1A1A1A] mb-2">Book Your Flight</h1>
        <p className="text-base text-[#5C5B59]">Search and compare the best flight deals</p>
      </div>

      {/* Search Form */}
      <Card className="p-6 sm:p-8 mb-8">
        {/* Trip Type & Class Selection */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-[#E5E7EB]">
          {/* Trip Type Radio Buttons */}
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="tripType"
                checked={tripType === "one-way"}
                onChange={() => setTripType("one-way")}
                className="w-4 h-4 text-[#0F75BD] focus:ring-[#0F75BD] focus:ring-2"
              />
              <span className="text-sm font-semibold text-[#1A1A1A] group-hover:text-[#0F75BD] transition-colors">
                One Way
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="tripType"
                checked={tripType === "round-trip"}
                onChange={() => setTripType("round-trip")}
                className="w-4 h-4 text-[#0F75BD] focus:ring-[#0F75BD] focus:ring-2"
              />
              <span className="text-sm font-semibold text-[#1A1A1A] group-hover:text-[#0F75BD] transition-colors">
                Round Trip
              </span>
            </label>
          </div>

          {/* Cabin Class Dropdown */}
          <select
            value={cabinClass}
            onChange={(e) => setCabinClass(e.target.value as "economy" | "business" | "first")}
            className="px-4 py-2 border border-[#E5E7EB] rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0F75BD] bg-white"
          >
            <option value="economy">Economy</option>
            <option value="business">Business Class</option>
            <option value="first">First Class</option>
          </select>
        </div>

        {/* Main Search Fields - Horizontal Layout */}
        <div className="bg-gradient-to-br from-[#E8F4F8]/30 to-[#F0F9FF]/30 rounded-[22px] p-6 mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* From */}
            <div className="lg:col-span-3">
              <label className="block text-xs font-bold text-[#5C5B59] mb-2 uppercase tracking-wide">
                From
              </label>
              <select
                value={searchParams.from}
                onChange={(e) => setSearchParams({ ...searchParams, from: e.target.value })}
                className="w-full px-4 py-3 border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#0F75BD] text-base font-bold text-[#1A1A1A] bg-white transition-colors"
              >
                <option value="Lagos (LOS)">Lagos (LOS)</option>
                <option value="Abuja (ABV)">Abuja (ABV)</option>
                <option value="Port Harcourt (PHC)">Port Harcourt (PHC)</option>
                <option value="Kano (KAN)">Kano (KAN)</option>
                <option value="Enugu (ENU)">Enugu (ENU)</option>
              </select>
            </div>

            {/* To */}
            <div className="lg:col-span-3">
              <label className="block text-xs font-bold text-[#5C5B59] mb-2 uppercase tracking-wide">
                To
              </label>
              <select
                value={searchParams.to}
                onChange={(e) => setSearchParams({ ...searchParams, to: e.target.value })}
                className="w-full px-4 py-3 border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#0F75BD] text-base font-bold text-[#1A1A1A] bg-white transition-colors"
              >
                <option value="Abuja (ABV)">Abuja (ABV)</option>
                <option value="Lagos (LOS)">Lagos (LOS)</option>
                <option value="Port Harcourt (PHC)">Port Harcourt (PHC)</option>
                <option value="Kano (KAN)">Kano (KAN)</option>
                <option value="Enugu (ENU)">Enugu (ENU)</option>
              </select>
            </div>

            {/* Departure Date */}
            <div className="lg:col-span-2">
              <label className="block text-xs font-bold text-[#5C5B59] mb-2 uppercase tracking-wide">
                Departure
              </label>
              <input
                type="date"
                value={searchParams.departure}
                onChange={(e) => setSearchParams({ ...searchParams, departure: e.target.value })}
                className="w-full px-4 py-3 border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#0F75BD] text-sm font-semibold text-[#1A1A1A] bg-white transition-colors"
              />
            </div>

            {/* Return Date */}
            <div className="lg:col-span-2">
              <label className="block text-xs font-bold text-[#5C5B59] mb-2 uppercase tracking-wide">
                {tripType === "round-trip" ? "Return" : "Return"}
              </label>
              <input
                type="date"
                value={searchParams.returnDate}
                onChange={(e) => setSearchParams({ ...searchParams, returnDate: e.target.value })}
                disabled={tripType === "one-way"}
                className="w-full px-4 py-3 border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#0F75BD] text-sm font-semibold text-[#1A1A1A] bg-white transition-colors disabled:bg-gray-50 disabled:text-gray-400"
              />
            </div>

            {/* Passengers */}
            <div className="lg:col-span-2">
              <label className="block text-xs font-bold text-[#5C5B59] mb-2 uppercase tracking-wide">
                Passengers
              </label>
              <select
                value={searchParams.passengers}
                onChange={(e) => setSearchParams({ ...searchParams, passengers: Number(e.target.value) })}
                className="w-full px-4 py-3 border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#0F75BD] text-base font-bold text-[#1A1A1A] bg-white transition-colors"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <option key={num} value={num}>
                    {num}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Search Button */}
        <button
          onClick={handleSearch}
          className="w-full py-4 px-6 bg-gradient-to-r from-[#0F75BD] via-[#0D6BA8] to-[#0A5A8F] text-white font-bold text-base rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-3 group"
        >
          <span>SEARCH FLIGHTS</span>
         </button>
      </Card>

      {/* Flights List */}
      <div className="mt-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-base sm:text-lg font-bold text-[#1A1A1A] mb-1">
              {flights.length} Flights Available
            </p>
            <p className="text-xs sm:text-sm text-[#5C5B59]">Choose your perfect flight</p>
          </div>
          <div className="relative group/sort">
            <div className="absolute inset-0 bg-gradient-to-r from-[#0F75BD]/10 to-[#0A5A8F]/10 rounded-2xl blur-xl opacity-0 group-hover/sort:opacity-100 transition-opacity duration-300" />
            <div className="relative flex items-center gap-2 px-4 py-3 bg-white border-2 border-[#E5E7EB] rounded-2xl hover:border-[#0F75BD] transition-all duration-300">
              <SlidersHorizontal className="w-4 h-4 text-[#0F75BD]" />
              <select className="bg-transparent text-sm font-semibold text-[#1A1A1A] focus:outline-none cursor-pointer pr-2 appearance-none">
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Departure: Earliest</option>
                <option>Departure: Latest</option>
                <option>Duration: Shortest</option>
              </select>
              <svg className="w-4 h-4 text-[#5C5B59] pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          {flights.map((flight) => (
            <Link href={`/booking/flight/${flight.id}`} key={flight.id} className="block group">
              <div className="relative overflow-hidden rounded-[24px] bg-white transition-all duration-500 group-hover:-translate-y-2 border border-[#E5E7EB] group-hover:border-[#0F75BD]/40">
                {/* Premium gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#0F75BD]/[0.03] via-transparent to-[#0A5A8F]/[0.02] opacity-0 group-hover:opacity-100 transition-all duration-700 pointer-events-none" />

                {/* Animated accent line */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#0F75BD] via-[#0D6BA8] to-[#0A5A8F] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />

                <div className="relative p-8">
                  {/* Header Section */}
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-5">
                      {/* Premium Logo Container */}
                      <div className="relative group/logo">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#0F75BD]/20 to-[#0A5A8F]/20 rounded-[18px] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="relative w-16 h-16 rounded-[18px] bg-gradient-to-br from-white via-[#F0F9FF] to-white border-2 border-[#E5E7EB] flex items-center justify-center overflow-hidden group-hover:border-[#0F75BD] group-hover:scale-110 transition-all duration-500">
                          {flight.logo ? (
                            <Image
                              src={flight.logo}
                              alt={flight.airline}
                              width={64}
                              height={64}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Plane className="w-7 h-7 text-[#0F75BD]" />
                          )}
                        </div>
                      </div>

                      {/* Airline Details */}
                      <div>
                        <h3 className="text-xl font-bold text-[#1A1A1A] mb-1.5 group-hover:text-[#0F75BD] transition-colors duration-300">
                          {flight.airline}
                        </h3>
                        <div className="flex items-center gap-2.5">
                          <span className="px-2.5 py-1 bg-gradient-to-br from-[#F0F9FF] to-[#E8F4F8] text-[#0F75BD] text-xs font-bold rounded-lg border border-[#E8F4F8]">
                            {flight.flightNumber}
                          </span>
                          <span className="text-sm text-[#5C5B59] font-medium">{flight.class}</span>
                        </div>
                      </div>
                    </div>

                    {/* Premium Seats Badge */}
                    <div className="relative">
                      <div className="absolute inset-0 bg-green-400/30 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <div className="relative flex items-center gap-2.5 px-4 py-2.5 bg-gradient-to-br from-emerald-50 via-green-50 to-emerald-50/70 border border-green-200/60 rounded-2xl">
                        <div className="relative">
                          <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                          <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-green-400 animate-ping" />
                        </div>
                        <span className="text-sm font-bold text-green-700">{flight.seatsAvailable} seats left</span>
                      </div>
                    </div>
                  </div>

                  {/* Flight Route - Premium Design */}
                  <div className="relative mb-8 py-6 px-8 bg-gradient-to-br from-[#FAFBFC] via-white to-[#F9FAFB] rounded-[20px]">
                    <div className="flex items-center justify-between gap-8">
                      {/* Departure */}
                      <div className="flex-1">
                        <div className="text-4xl font-bold text-[#1A1A1A] mb-2 tracking-tight">{flight.departure}</div>
                        <div className="flex items-center gap-2 text-[#5C5B59] font-medium">
                          <div className="p-1.5 bg-white rounded-lg border border-[#E5E7EB]">
                            <MapPin className="w-4 h-4" />
                          </div>
                          <span className="text-sm">{flight.from.split('(')[0].trim()}</span>
                        </div>
                        <div className="text-xs text-[#9CA3AF] mt-1 font-medium">{flight.from.match(/\((.*)\)/)?.[1]}</div>
                      </div>

                      {/* Flight Path - Enhanced */}
                      <div className="flex-1 flex flex-col items-center px-6">
                        <div className="relative w-full flex items-center justify-center mb-3">
                          {/* Dotted path */}
                          <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t-[3px] border-dotted border-[#E5E7EB] group-hover:border-[#0F75BD]/30 transition-colors duration-500" />
                          </div>

                          {/* Animated plane icon */}
                          <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-[#0F75BD] to-[#0A5A8F] rounded-full blur-lg opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="relative bg-gradient-to-br from-[#0F75BD] via-[#0D6BA8] to-[#0A5A8F] p-3.5 rounded-full group-hover:scale-125 group-hover:rotate-12 transition-all duration-500">
                              <Plane className="w-5 h-5 text-white rotate-90" />
                            </div>
                          </div>
                        </div>

                        {/* Duration badge */}
                        <div className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E5E7EB] rounded-full">
                          <Clock className="w-3.5 h-3.5 text-[#0F75BD]" />
                          <span className="text-sm font-bold text-[#1A1A1A]">{flight.duration}</span>
                        </div>
                      </div>

                      {/* Arrival */}
                      <div className="flex-1 text-right">
                        <div className="text-4xl font-bold text-[#1A1A1A] mb-2 tracking-tight">{flight.arrival}</div>
                        <div className="flex items-center justify-end gap-2 text-[#5C5B59] font-medium">
                          <span className="text-sm">{flight.to.split('(')[0].trim()}</span>
                          <div className="p-1.5 bg-white rounded-lg border border-[#E5E7EB]">
                            <MapPin className="w-4 h-4" />
                          </div>
                        </div>
                        <div className="text-xs text-[#9CA3AF] mt-1 font-medium">{flight.to.match(/\((.*)\)/)?.[1]}</div>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between">
                    {/* Flight Info Badges */}
                    <div className="flex items-center gap-3">
                      <div className="inline-flex items-center gap-2.5 px-4 py-2.5 bg-gradient-to-br from-[#F0F9FF] via-[#E8F4F8] to-[#F0F9FF] border border-[#E8F4F8] rounded-xl">
                        <div className="w-2 h-2 rounded-full bg-[#0F75BD]" />
                        <span className="text-sm font-bold text-[#0F75BD]">
                          {flight.stops === 0 ? "Direct Flight" : `${flight.stops} Stop${flight.stops > 1 ? "s" : ""}`}
                        </span>
                      </div>
                    </div>

                    {/* Price & CTA */}
                    <div className="flex items-center gap-6">
                      {/* Premium Price Display */}
                      <div className="text-right">
                        <div className="text-xs text-[#9CA3AF] uppercase tracking-wider mb-1 font-semibold">Starting from</div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-bold bg-gradient-to-r from-[#0F75BD] to-[#0A5A8F] bg-clip-text text-transparent">
                            ₦{flight.price.toLocaleString()}
                          </span>
                        </div>
                        <div className="text-xs text-[#9CA3AF] mt-0.5">per passenger</div>
                      </div>

                      {/* Premium Select Button */}
                      <button className="relative px-8 py-4 bg-gradient-to-r from-[#0F75BD] via-[#0D6BA8] to-[#0A5A8F] text-white font-bold text-base rounded-2xl active:scale-95 transition-all duration-300 flex items-center gap-3 overflow-hidden group/btn">
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700" />
                        <span className="relative">Select Flight</span>
                        <ArrowRight className="relative w-5 h-5 group-hover/btn:translate-x-2 transition-transform duration-300" />
                      </button>
                    </div>
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
