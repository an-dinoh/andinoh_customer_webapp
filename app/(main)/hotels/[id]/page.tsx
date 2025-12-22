"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { MapPin, Star, Wifi, Car, Coffee, Dumbbell, UtensilsCrossed, Wind, Tv, Shield, ChevronLeft, ChevronRight, Calendar, Users, Building2, PartyPopper, Bed, Maximize2, Sparkles, Eye } from "lucide-react";
import Button from "@/components/common/Button";
import Card from "@/components/common/Card";
import Input from "@/components/common/Input";

export default function HotelDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedTab, setSelectedTab] = useState<"rooms" | "events" | "reviews">("rooms");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(2);

  // Mock hotel data
  const hotel = {
    id: params.id,
    name: "Grand Plaza Hotel",
    city: "Lagos",
    country: "Nigeria",
    address: "123 Victoria Island, Lagos, Nigeria",
    rating: 4.8,
    reviews: 245,
    description:
      "Experience luxury at its finest at Grand Plaza Hotel. Our 5-star establishment offers world-class amenities, exceptional service, and stunning views of Lagos. Whether you're here for business or leisure, we provide the perfect sanctuary for your stay.",
    images: ["/hotel-1.jpg", "/hotel-2.jpg", "/hotel-3.jpg", "/hotel-4.jpg"],
    amenities: [
      { icon: Wifi, label: "Free WiFi" },
      { icon: Car, label: "Free Parking" },
      { icon: Coffee, label: "Restaurant" },
      { icon: Dumbbell, label: "Fitness Center" },
      { icon: UtensilsCrossed, label: "Room Service" },
      { icon: Wind, label: "Air Conditioning" },
      { icon: Tv, label: "Smart TV" },
      { icon: Shield, label: "24/7 Security" },
    ],
    rooms: [
      {
        id: "1",
        name: "Deluxe Single Room",
        type: "Single",
        capacity: 1,
        size: 25,
        price: 35000,
        available: 5,
        amenities: ["King Bed", "WiFi", "TV", "Mini Bar"],
        description: "Comfortable single room perfect for solo travelers",
      },
      {
        id: "2",
        name: "Executive Double Room",
        type: "Double",
        capacity: 2,
        size: 35,
        price: 45000,
        available: 8,
        amenities: ["Queen Bed", "WiFi", "TV", "Mini Bar", "Work Desk"],
        description: "Spacious double room ideal for couples or business travelers",
      },
      {
        id: "3",
        name: "Premium Suite",
        type: "Suite",
        capacity: 4,
        size: 55,
        price: 75000,
        available: 3,
        amenities: ["King Bed", "Living Area", "WiFi", "TV", "Mini Bar", "Balcony"],
        description: "Luxurious suite with separate living area and stunning views",
      },
      {
        id: "4",
        name: "Presidential Suite",
        type: "Suite",
        capacity: 6,
        size: 85,
        price: 120000,
        available: 1,
        amenities: ["2 King Beds", "Living Area", "WiFi", "TV", "Mini Bar", "Balcony", "Jacuzzi"],
        description: "Our finest accommodation with premium amenities",
      },
    ],
    eventSpaces: [
      {
        id: "1",
        name: "Grand Ballroom",
        capacity: 500,
        size: 450,
        price: 500000,
        amenities: ["Sound System", "Projector", "Stage", "Catering Available"],
        description: "Perfect for weddings, conferences, and large events",
      },
      {
        id: "2",
        name: "Conference Hall A",
        capacity: 100,
        size: 120,
        price: 150000,
        amenities: ["Projector", "WiFi", "Whiteboard", "Coffee Service"],
        description: "Ideal for corporate meetings and seminars",
      },
      {
        id: "3",
        name: "Garden Pavilion",
        capacity: 200,
        size: 300,
        price: 300000,
        amenities: ["Outdoor Setting", "Sound System", "Lighting", "Catering Available"],
        description: "Beautiful outdoor space for garden parties and ceremonies",
      },
    ],
    customerReviews: [
      {
        id: "1",
        author: "John Adebayo",
        rating: 5,
        date: "2024-01-15",
        comment: "Excellent service and beautiful rooms. The staff went above and beyond!",
      },
      {
        id: "2",
        author: "Sarah Mohammed",
        rating: 4,
        date: "2024-01-10",
        comment: "Great location and amenities. Would definitely stay here again.",
      },
      {
        id: "3",
        author: "David Chen",
        rating: 5,
        date: "2024-01-05",
        comment: "Outstanding experience from check-in to check-out. Highly recommended!",
      },
    ],
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % hotel.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + hotel.images.length) % hotel.images.length);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Image Gallery */}
      <div className="relative h-96 bg-gray-200">
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#0F75BD] to-[#02A5E6]">
          <Building2 className="w-32 h-32 text-white/30" />
        </div>

        {/* Navigation Buttons */}
        <button
          onClick={prevImage}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-[#1A1A1A]" />
        </button>
        <button
          onClick={nextImage}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
        >
          <ChevronRight className="w-6 h-6 text-[#1A1A1A]" />
        </button>

        {/* Image Counter */}
        <div className="absolute bottom-4 right-4 px-4 py-2 bg-black/60 text-white rounded-full text-sm">
          {currentImageIndex + 1} / {hotel.images.length}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Hotel Info */}
            <div className="mb-8">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-[#1A1A1A] mb-2">{hotel.name}</h1>
                  <p className="text-[#5C5B59] flex items-center gap-1 mb-2">
                    <MapPin className="w-5 h-5" />
                    {hotel.address}
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      <span className="font-bold text-[#1A1A1A]">{hotel.rating}</span>
                    </div>
                    <span className="text-[#5C5B59]">({hotel.reviews} reviews)</span>
                  </div>
                </div>
              </div>

              <p className="text-[#5C5B59] leading-relaxed">{hotel.description}</p>
            </div>

            {/* Amenities */}
            <Card className="p-6 mb-8">
              <h2 className="text-xl font-bold text-[#1A1A1A] mb-4">Hotel Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {hotel.amenities.map((amenity, index) => {
                  const Icon = amenity.icon;
                  return (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-[#E8F4F8] rounded-xl flex items-center justify-center">
                        <Icon className="w-5 h-5 text-[#0F75BD]" />
                      </div>
                      <span className="text-sm text-[#5C5B59]">{amenity.label}</span>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Tabs */}
            <div className="mb-6">
              <div className="flex gap-2 border-b border-[#E5E7EB]">
                <button
                  onClick={() => setSelectedTab("rooms")}
                  className={`px-6 py-3 font-semibold transition-colors relative ${
                    selectedTab === "rooms"
                      ? "text-[#0F75BD]"
                      : "text-[#5C5B59] hover:text-[#1A1A1A]"
                  }`}
                >
                  Rooms
                  {selectedTab === "rooms" && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0F75BD]"></div>
                  )}
                </button>
                <button
                  onClick={() => setSelectedTab("events")}
                  className={`px-6 py-3 font-semibold transition-colors relative ${
                    selectedTab === "events"
                      ? "text-[#0F75BD]"
                      : "text-[#5C5B59] hover:text-[#1A1A1A]"
                  }`}
                >
                  Event Spaces
                  {selectedTab === "events" && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0F75BD]"></div>
                  )}
                </button>
                <button
                  onClick={() => setSelectedTab("reviews")}
                  className={`px-6 py-3 font-semibold transition-colors relative ${
                    selectedTab === "reviews"
                      ? "text-[#0F75BD]"
                      : "text-[#5C5B59] hover:text-[#1A1A1A]"
                  }`}
                >
                  Reviews
                  {selectedTab === "reviews" && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0F75BD]"></div>
                  )}
                </button>
              </div>
            </div>

            {/* Rooms Tab */}
            {selectedTab === "rooms" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {hotel.rooms.map((room, index) => {
                  const roomNumber = `R${String(index + 1).padStart(2, '0')}`;
                  return (
                    <div
                      key={room.id}
                      className="bg-white rounded-[22px] overflow-hidden border border-[#E5E7EB] hover:border-[#0F75BD] transition-all group"
                    >
                      {/* Room Image */}
                      <div className="relative h-40 bg-[#E8F4F8] flex items-center justify-center overflow-hidden">
                        <span className="text-6xl">🏨</span>

                        {/* Room Number */}
                        <div className="absolute top-4 right-4 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center">
                          <span className="text-sm font-bold text-[#0F75BD]">{roomNumber}</span>
                        </div>

                        {/* Room Type Badge */}
                        <div className="absolute top-4 left-4">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/90 backdrop-blur-sm text-[#0F75BD] text-xs font-medium rounded-lg">
                            <Sparkles className="w-3 h-3" />
                            {room.type.toUpperCase()}
                          </span>
                        </div>

                        {/* Availability Badge */}
                        <div className="absolute bottom-3 right-3">
                          <span
                            className={`px-2.5 py-1 text-xs font-semibold rounded-lg ${
                              room.available > 0
                                ? "bg-[#ECFDF5] text-green-700"
                                : "bg-[#FEE2E2] text-red-700"
                            }`}
                          >
                            {room.available > 0 ? `${room.available} Available` : "Occupied"}
                          </span>
                        </div>
                      </div>

                      {/* Room Content */}
                      <div className="p-5">
                        {/* Room Title */}
                        <h3 className="text-lg font-bold text-[#1A1A1A] mb-2 group-hover:text-[#0F75BD] transition-colors truncate">
                          {room.name}
                        </h3>

                        {/* Description */}
                        <p className="text-sm text-[#5C5B59] mb-3 line-clamp-2">
                          {room.description}
                        </p>

                        {/* Room Details */}
                        <div className="grid grid-cols-3 gap-2 mb-3">
                          <div className="flex flex-col items-center p-2 bg-[#FAFAFB] rounded-lg">
                            <Bed className="w-4 h-4 text-[#0F75BD] mb-1" />
                            <span className="text-xs font-semibold text-[#1A1A1A] capitalize">{room.type}</span>
                          </div>
                          <div className="flex flex-col items-center p-2 bg-[#FAFAFB] rounded-lg">
                            <Users className="w-4 h-4 text-[#0F75BD] mb-1" />
                            <span className="text-xs font-semibold text-[#1A1A1A]">{room.capacity}</span>
                          </div>
                          <div className="flex flex-col items-center p-2 bg-[#FAFAFB] rounded-lg">
                            <Maximize2 className="w-4 h-4 text-[#0F75BD] mb-1" />
                            <span className="text-xs font-semibold text-[#1A1A1A]">{room.size} m²</span>
                          </div>
                        </div>

                        {/* Divider */}
                        <div className="border-t border-[#E5E7EB] my-3"></div>

                        {/* Price & Actions */}
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-[#5C5B59] mb-0.5">Starting from</p>
                            <p className="text-xl font-bold text-[#0F75BD]">
                              ₦{room.price.toLocaleString()}
                              <span className="text-xs font-normal text-[#5C5B59]">/night</span>
                            </p>
                          </div>
                          <button
                            onClick={() => router.push(`/booking/room/${room.id}`)}
                            disabled={room.available === 0}
                            className="px-4 py-2 bg-[#0F75BD] text-white text-sm font-medium rounded-xl hover:bg-[#0050C8] transition-colors flex items-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                          >
                            <Eye className="w-4 h-4" />
                            {room.available === 0 ? "Booked" : "View"}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Event Spaces Tab */}
            {selectedTab === "events" && (
              <div className="space-y-4">
                {hotel.eventSpaces.map((space) => (
                  <Card key={space.id} className="p-6">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-[#1A1A1A] mb-2">{space.name}</h3>
                        <p className="text-[#5C5B59] mb-3">{space.description}</p>
                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className="px-3 py-1 bg-[#E8F4F8] text-[#0F75BD] text-sm rounded-lg">
                            <PartyPopper className="w-3 h-3 inline mr-1" />
                            Up to {space.capacity} people
                          </span>
                          <span className="px-3 py-1 bg-[#E8F4F8] text-[#0F75BD] text-sm rounded-lg">
                            {space.size}m²
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {space.amenities.map((amenity) => (
                            <span
                              key={amenity}
                              className="text-xs text-[#5C5B59] bg-[#F9FAFB] px-2 py-1 rounded"
                            >
                              {amenity}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-col justify-between items-end">
                        <div className="text-right mb-4">
                          <p className="text-xs text-[#5C5B59]">From</p>
                          <p className="text-2xl font-bold text-[#0F75BD]">
                            ₦{space.price.toLocaleString()}
                          </p>
                          <p className="text-xs text-[#5C5B59]">per day</p>
                        </div>
                        <Button onClick={() => router.push(`/booking/event/${space.id}`)}>
                          Book Event Space
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* Reviews Tab */}
            {selectedTab === "reviews" && (
              <div className="space-y-4">
                {hotel.customerReviews.map((review) => (
                  <Card key={review.id} className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-[#0F75BD] rounded-full flex items-center justify-center text-white font-bold">
                        {review.author.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-bold text-[#1A1A1A]">{review.author}</h4>
                          <span className="text-sm text-[#5C5B59]">
                            {new Date(review.date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-[#5C5B59]">{review.comment}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24">
              <h3 className="text-xl font-bold text-[#1A1A1A] mb-4">Check Availability</h3>
              <form className="space-y-4">
                <Input
                  label="Check-in"
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  icon={<Calendar className="w-5 h-5" />}
                  required
                />
                <Input
                  label="Check-out"
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  icon={<Calendar className="w-5 h-5" />}
                  required
                />
                <Input
                  label="Guests"
                  type="number"
                  value={guests.toString()}
                  onChange={(e) => setGuests(parseInt(e.target.value))}
                  icon={<Users className="w-5 h-5" />}
                  min={1}
                  required
                />
                <Button fullWidth size="lg">
                  Check Availability
                </Button>
              </form>

              <div className="mt-6 pt-6 border-t border-[#E5E7EB]">
                <h4 className="font-semibold text-[#1A1A1A] mb-3">Why Book With Us?</h4>
                <ul className="space-y-2 text-sm text-[#5C5B59]">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>Best price guarantee</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>Free cancellation up to 24 hours</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>Instant confirmation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>24/7 customer support</span>
                  </li>
                </ul>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
