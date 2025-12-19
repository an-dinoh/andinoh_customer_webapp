"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Calendar, Users, CreditCard, CheckCircle, ArrowLeft, Mail, Phone, User } from "lucide-react";
import Button from "@/components/common/Button";
import Card from "@/components/common/Card";
import Input from "@/components/common/Input";

export default function RoomBookingPage() {
  const params = useParams();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [bookingData, setBookingData] = useState({
    checkIn: "",
    checkOut: "",
    guests: 2,
    specialRequests: "",
  });

  const [guestInfo, setGuestInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  const [paymentMethod, setPaymentMethod] = useState<"card" | "bank" | "wallet">("card");

  // Mock room data
  const room = {
    id: params.id,
    name: "Executive Double Room",
    hotelName: "Grand Plaza Hotel",
    hotelAddress: "123 Victoria Island, Lagos, Nigeria",
    type: "Double",
    capacity: 2,
    size: 35,
    price: 45000,
    amenities: ["Queen Bed", "WiFi", "TV", "Mini Bar", "Work Desk"],
    description: "Spacious double room ideal for couples or business travelers",
  };

  const calculateNights = () => {
    if (!bookingData.checkIn || !bookingData.checkOut) return 0;
    const checkIn = new Date(bookingData.checkIn);
    const checkOut = new Date(bookingData.checkOut);
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    return nights > 0 ? nights : 0;
  };

  const nights = calculateNights();
  const subtotal = room.price * nights;
  const serviceFee = subtotal * 0.05;
  const tax = subtotal * 0.075;
  const total = subtotal + serviceFee + tax;

  const handleNextStep = () => {
    if (step === 1 && (!bookingData.checkIn || !bookingData.checkOut || nights === 0)) {
      alert("Please select valid check-in and check-out dates");
      return;
    }
    if (step === 2 && (!guestInfo.firstName || !guestInfo.lastName || !guestInfo.email || !guestInfo.phone)) {
      alert("Please fill in all guest information");
      return;
    }
    setStep(step + 1);
  };

  const handleBooking = async () => {
    setLoading(true);
    try {
      // TODO: Implement actual booking API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setStep(4); // Success step
    } catch (error) {
      alert("Booking failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (step === 4) {
    return (
      <div className="min-h-screen bg-[#FAFAFB] flex items-center justify-center px-4 py-12">
        <Card className="max-w-2xl w-full p-8 text-center">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold text-[#1A1A1A] mb-4">Booking Confirmed!</h1>
          <p className="text-[#5C5B59] mb-8">
            Your booking has been confirmed. We've sent a confirmation email to {guestInfo.email}
          </p>

          <Card className="p-6 bg-[#F9FAFB] mb-8 text-left">
            <h3 className="font-bold text-[#1A1A1A] mb-4">Booking Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#5C5B59]">Hotel:</span>
                <span className="font-semibold text-[#1A1A1A]">{room.hotelName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5C5B59]">Room:</span>
                <span className="font-semibold text-[#1A1A1A]">{room.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5C5B59]">Check-in:</span>
                <span className="font-semibold text-[#1A1A1A]">
                  {new Date(bookingData.checkIn).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5C5B59]">Check-out:</span>
                <span className="font-semibold text-[#1A1A1A]">
                  {new Date(bookingData.checkOut).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5C5B59]">Guests:</span>
                <span className="font-semibold text-[#1A1A1A]">{bookingData.guests}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-[#E5E7EB]">
                <span className="text-[#5C5B59]">Total Paid:</span>
                <span className="font-bold text-[#0F75BD] text-lg">₦{total.toLocaleString()}</span>
              </div>
            </div>
          </Card>

          <div className="flex gap-4">
            <Button variant="outline" fullWidth onClick={() => router.push("/bookings")}>
              View My Bookings
            </Button>
            <Button fullWidth onClick={() => router.push("/")}>
              Back to Home
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFB] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <button
          onClick={() => (step === 1 ? router.back() : setStep(step - 1))}
          className="flex items-center gap-2 text-[#0F75BD] mb-6 hover:underline"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    s <= step
                      ? "bg-[#0F75BD] text-white"
                      : "bg-[#E5E7EB] text-[#5C5B59]"
                  }`}
                >
                  {s}
                </div>
                {s < 3 && (
                  <div
                    className={`w-16 h-1 ${s < step ? "bg-[#0F75BD]" : "bg-[#E5E7EB]"}`}
                  ></div>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-16 text-sm">
            <span className={step >= 1 ? "text-[#0F75BD] font-semibold" : "text-[#5C5B59]"}>
              Dates & Guests
            </span>
            <span className={step >= 2 ? "text-[#0F75BD] font-semibold" : "text-[#5C5B59]"}>
              Guest Info
            </span>
            <span className={step >= 3 ? "text-[#0F75BD] font-semibold" : "text-[#5C5B59]"}>
              Payment
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card className="p-8">
              {/* Step 1: Booking Details */}
              {step === 1 && (
                <div>
                  <h2 className="text-2xl font-bold text-[#1A1A1A] mb-6">
                    Select Dates and Guests
                  </h2>
                  <div className="space-y-5">
                    <Input
                      label="Check-in Date"
                      type="date"
                      value={bookingData.checkIn}
                      onChange={(e) => setBookingData({ ...bookingData, checkIn: e.target.value })}
                      icon={<Calendar className="w-5 h-5" />}
                      required
                    />
                    <Input
                      label="Check-out Date"
                      type="date"
                      value={bookingData.checkOut}
                      onChange={(e) => setBookingData({ ...bookingData, checkOut: e.target.value })}
                      icon={<Calendar className="w-5 h-5" />}
                      required
                    />
                    <Input
                      label="Number of Guests"
                      type="number"
                      value={bookingData.guests.toString()}
                      onChange={(e) => setBookingData({ ...bookingData, guests: parseInt(e.target.value) })}
                      icon={<Users className="w-5 h-5" />}
                      min={1}
                      max={room.capacity}
                      helperText={`Maximum ${room.capacity} guests for this room`}
                      required
                    />
                    <div>
                      <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
                        Special Requests (Optional)
                      </label>
                      <textarea
                        value={bookingData.specialRequests}
                        onChange={(e) => setBookingData({ ...bookingData, specialRequests: e.target.value })}
                        rows={4}
                        className="w-full px-4 py-3 border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F75BD] focus:border-transparent"
                        placeholder="Any special requests? (e.g., early check-in, high floor, etc.)"
                      />
                    </div>
                  </div>
                  <Button fullWidth size="lg" onClick={handleNextStep} className="mt-6">
                    Continue to Guest Information
                  </Button>
                </div>
              )}

              {/* Step 2: Guest Information */}
              {step === 2 && (
                <div>
                  <h2 className="text-2xl font-bold text-[#1A1A1A] mb-6">Guest Information</h2>
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="First Name"
                        type="text"
                        value={guestInfo.firstName}
                        onChange={(e) => setGuestInfo({ ...guestInfo, firstName: e.target.value })}
                        icon={<User className="w-5 h-5" />}
                        required
                      />
                      <Input
                        label="Last Name"
                        type="text"
                        value={guestInfo.lastName}
                        onChange={(e) => setGuestInfo({ ...guestInfo, lastName: e.target.value })}
                        icon={<User className="w-5 h-5" />}
                        required
                      />
                    </div>
                    <Input
                      label="Email Address"
                      type="email"
                      value={guestInfo.email}
                      onChange={(e) => setGuestInfo({ ...guestInfo, email: e.target.value })}
                      icon={<Mail className="w-5 h-5" />}
                      helperText="Your booking confirmation will be sent here"
                      required
                    />
                    <Input
                      label="Phone Number"
                      type="tel"
                      value={guestInfo.phone}
                      onChange={(e) => setGuestInfo({ ...guestInfo, phone: e.target.value })}
                      icon={<Phone className="w-5 h-5" />}
                      required
                    />
                  </div>
                  <Button fullWidth size="lg" onClick={handleNextStep} className="mt-6">
                    Continue to Payment
                  </Button>
                </div>
              )}

              {/* Step 3: Payment */}
              {step === 3 && (
                <div>
                  <h2 className="text-2xl font-bold text-[#1A1A1A] mb-6">Payment Method</h2>

                  {/* Payment Method Selection */}
                  <div className="space-y-3 mb-6">
                    <button
                      onClick={() => setPaymentMethod("card")}
                      className={`w-full p-4 border-2 rounded-xl text-left transition-colors ${
                        paymentMethod === "card"
                          ? "border-[#0F75BD] bg-[#E8F4F8]"
                          : "border-[#E5E7EB] hover:border-[#D3D9DD]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <CreditCard className="w-5 h-5 text-[#0F75BD]" />
                        <div>
                          <p className="font-semibold text-[#1A1A1A]">Credit/Debit Card</p>
                          <p className="text-sm text-[#5C5B59]">Pay securely with your card</p>
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => setPaymentMethod("bank")}
                      className={`w-full p-4 border-2 rounded-xl text-left transition-colors ${
                        paymentMethod === "bank"
                          ? "border-[#0F75BD] bg-[#E8F4F8]"
                          : "border-[#E5E7EB] hover:border-[#D3D9DD]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <CreditCard className="w-5 h-5 text-[#0F75BD]" />
                        <div>
                          <p className="font-semibold text-[#1A1A1A]">Bank Transfer</p>
                          <p className="text-sm text-[#5C5B59]">Transfer directly from your bank</p>
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => setPaymentMethod("wallet")}
                      className={`w-full p-4 border-2 rounded-xl text-left transition-colors ${
                        paymentMethod === "wallet"
                          ? "border-[#0F75BD] bg-[#E8F4F8]"
                          : "border-[#E5E7EB] hover:border-[#D3D9DD]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <CreditCard className="w-5 h-5 text-[#0F75BD]" />
                        <div>
                          <p className="font-semibold text-[#1A1A1A]">Digital Wallet</p>
                          <p className="text-sm text-[#5C5B59]">Pay with Paystack, Flutterwave</p>
                        </div>
                      </div>
                    </button>
                  </div>

                  {/* Card Details (shown only when card is selected) */}
                  {paymentMethod === "card" && (
                    <div className="space-y-4 mb-6">
                      <Input
                        label="Card Number"
                        type="text"
                        placeholder="1234 5678 9012 3456"
                        icon={<CreditCard className="w-5 h-5" />}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <Input label="Expiry Date" type="text" placeholder="MM/YY" />
                        <Input label="CVV" type="text" placeholder="123" />
                      </div>
                      <Input label="Cardholder Name" type="text" placeholder="John Doe" />
                    </div>
                  )}

                  <Button fullWidth size="lg" onClick={handleBooking} loading={loading}>
                    {loading ? "Processing..." : `Pay ₦${total.toLocaleString()}`}
                  </Button>

                  <p className="text-xs text-[#5C5B59] text-center mt-4">
                    By completing this booking, you agree to our Terms and Conditions
                  </p>
                </div>
              )}
            </Card>
          </div>

          {/* Booking Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24">
              <h3 className="text-xl font-bold text-[#1A1A1A] mb-4">Booking Summary</h3>

              {/* Room Info */}
              <div className="mb-6 pb-6 border-b border-[#E5E7EB]">
                <h4 className="font-bold text-[#1A1A1A] mb-2">{room.name}</h4>
                <p className="text-sm text-[#5C5B59] mb-1">{room.hotelName}</p>
                <p className="text-xs text-[#5C5B59]">{room.hotelAddress}</p>
              </div>

              {/* Dates */}
              {bookingData.checkIn && bookingData.checkOut && (
                <div className="mb-6 pb-6 border-b border-[#E5E7EB]">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-[#5C5B59]">Check-in:</span>
                    <span className="font-semibold text-[#1A1A1A]">
                      {new Date(bookingData.checkIn).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-[#5C5B59]">Check-out:</span>
                    <span className="font-semibold text-[#1A1A1A]">
                      {new Date(bookingData.checkOut).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#5C5B59]">Guests:</span>
                    <span className="font-semibold text-[#1A1A1A]">{bookingData.guests}</span>
                  </div>
                </div>
              )}

              {/* Price Breakdown */}
              {nights > 0 && (
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#5C5B59]">₦{room.price.toLocaleString()} × {nights} {nights === 1 ? "night" : "nights"}</span>
                    <span className="text-[#1A1A1A]">₦{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#5C5B59]">Service fee</span>
                    <span className="text-[#1A1A1A]">₦{serviceFee.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#5C5B59]">Taxes</span>
                    <span className="text-[#1A1A1A]">₦{tax.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between pt-4 border-t border-[#E5E7EB]">
                    <span className="font-bold text-[#1A1A1A]">Total</span>
                    <span className="font-bold text-[#0F75BD] text-xl">₦{total.toLocaleString()}</span>
                  </div>
                </div>
              )}

              {/* Cancellation Policy */}
              <div className="bg-[#F9FAFB] p-4 rounded-xl">
                <p className="text-xs text-[#5C5B59]">
                  <strong className="text-[#1A1A1A]">Free cancellation</strong> up to 24 hours before check-in. After that, cancellation fees may apply.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
