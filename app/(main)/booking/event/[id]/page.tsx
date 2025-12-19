"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Calendar, Users, CreditCard, CheckCircle, ArrowLeft, Mail, Phone, User, PartyPopper } from "lucide-react";
import Button from "@/components/common/Button";
import Card from "@/components/common/Card";
import Input from "@/components/common/Input";

export default function EventBookingPage() {
  const params = useParams();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [bookingData, setBookingData] = useState({
    eventDate: "",
    startTime: "",
    endTime: "",
    attendees: 50,
    eventType: "",
    cateringNeeded: false,
    specialRequests: "",
  });

  const [organizerInfo, setOrganizerInfo] = useState({
    organizationName: "",
    contactPerson: "",
    email: "",
    phone: "",
  });

  const [paymentMethod, setPaymentMethod] = useState<"card" | "bank" | "wallet">("card");

  // Mock event space data
  const eventSpace = {
    id: params.id,
    name: "Grand Ballroom",
    hotelName: "Grand Plaza Hotel",
    hotelAddress: "123 Victoria Island, Lagos, Nigeria",
    capacity: 500,
    size: 450,
    price: 500000,
    amenities: ["Sound System", "Projector", "Stage", "Catering Available"],
    description: "Perfect for weddings, conferences, and large events",
  };

  const eventTypes = [
    "Wedding",
    "Conference",
    "Corporate Meeting",
    "Birthday Party",
    "Product Launch",
    "Workshop/Training",
    "Other",
  ];

  const calculateHours = () => {
    if (!bookingData.startTime || !bookingData.endTime) return 0;
    const [startH, startM] = bookingData.startTime.split(":").map(Number);
    const [endH, endM] = bookingData.endTime.split(":").map(Number);
    const hours = (endH * 60 + endM - (startH * 60 + startM)) / 60;
    return hours > 0 ? hours : 0;
  };

  const hours = calculateHours();
  const subtotal = eventSpace.price;
  const cateringFee = bookingData.cateringNeeded ? bookingData.attendees * 5000 : 0;
  const serviceFee = (subtotal + cateringFee) * 0.05;
  const tax = (subtotal + cateringFee) * 0.075;
  const total = subtotal + cateringFee + serviceFee + tax;

  const handleNextStep = () => {
    if (step === 1 && (!bookingData.eventDate || !bookingData.startTime || !bookingData.endTime || !bookingData.eventType)) {
      alert("Please fill in all event details");
      return;
    }
    if (step === 2 && (!organizerInfo.contactPerson || !organizerInfo.email || !organizerInfo.phone)) {
      alert("Please fill in all organizer information");
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
          <h1 className="text-3xl font-bold text-[#1A1A1A] mb-4">Event Space Reserved!</h1>
          <p className="text-[#5C5B59] mb-8">
            Your event space has been reserved. We've sent a confirmation email to {organizerInfo.email}
          </p>

          <Card className="p-6 bg-[#F9FAFB] mb-8 text-left">
            <h3 className="font-bold text-[#1A1A1A] mb-4">Booking Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#5C5B59]">Venue:</span>
                <span className="font-semibold text-[#1A1A1A]">{eventSpace.hotelName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5C5B59]">Space:</span>
                <span className="font-semibold text-[#1A1A1A]">{eventSpace.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5C5B59]">Event Date:</span>
                <span className="font-semibold text-[#1A1A1A]">
                  {new Date(bookingData.eventDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5C5B59]">Time:</span>
                <span className="font-semibold text-[#1A1A1A]">
                  {bookingData.startTime} - {bookingData.endTime}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5C5B59]">Event Type:</span>
                <span className="font-semibold text-[#1A1A1A]">{bookingData.eventType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5C5B59]">Attendees:</span>
                <span className="font-semibold text-[#1A1A1A]">{bookingData.attendees}</span>
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
              Event Details
            </span>
            <span className={step >= 2 ? "text-[#0F75BD] font-semibold" : "text-[#5C5B59]"}>
              Organizer Info
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
              {/* Step 1: Event Details */}
              {step === 1 && (
                <div>
                  <h2 className="text-2xl font-bold text-[#1A1A1A] mb-6">Event Details</h2>
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
                        Event Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={bookingData.eventType}
                        onChange={(e) => setBookingData({ ...bookingData, eventType: e.target.value })}
                        className="w-full px-4 py-3 border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F75BD]"
                        required
                      >
                        <option value="">Select event type</option>
                        {eventTypes.map((type) => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>

                    <Input
                      label="Event Date"
                      type="date"
                      value={bookingData.eventDate}
                      onChange={(e) => setBookingData({ ...bookingData, eventDate: e.target.value })}
                      icon={<Calendar className="w-5 h-5" />}
                      required
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Start Time"
                        type="time"
                        value={bookingData.startTime}
                        onChange={(e) => setBookingData({ ...bookingData, startTime: e.target.value })}
                        required
                      />
                      <Input
                        label="End Time"
                        type="time"
                        value={bookingData.endTime}
                        onChange={(e) => setBookingData({ ...bookingData, endTime: e.target.value })}
                        required
                      />
                    </div>

                    <Input
                      label="Expected Number of Attendees"
                      type="number"
                      value={bookingData.attendees.toString()}
                      onChange={(e) => setBookingData({ ...bookingData, attendees: parseInt(e.target.value) })}
                      icon={<Users className="w-5 h-5" />}
                      min={1}
                      max={eventSpace.capacity}
                      helperText={`Maximum capacity: ${eventSpace.capacity} people`}
                      required
                    />

                    {/* Catering Option */}
                    <div className="flex items-start gap-3 p-4 bg-[#F9FAFB] rounded-xl">
                      <input
                        type="checkbox"
                        id="catering"
                        checked={bookingData.cateringNeeded}
                        onChange={(e) => setBookingData({ ...bookingData, cateringNeeded: e.target.checked })}
                        className="mt-1 w-5 h-5 text-[#0F75BD] border-[#E5E7EB] rounded focus:ring-[#0F75BD]"
                      />
                      <label htmlFor="catering" className="cursor-pointer">
                        <p className="font-semibold text-[#1A1A1A]">Add Catering Services</p>
                        <p className="text-sm text-[#5C5B59]">₦5,000 per person</p>
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
                        Special Requests (Optional)
                      </label>
                      <textarea
                        value={bookingData.specialRequests}
                        onChange={(e) => setBookingData({ ...bookingData, specialRequests: e.target.value })}
                        rows={4}
                        className="w-full px-4 py-3 border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F75BD] focus:border-transparent"
                        placeholder="Any special requirements or additional services needed?"
                      />
                    </div>
                  </div>
                  <Button fullWidth size="lg" onClick={handleNextStep} className="mt-6">
                    Continue to Organizer Information
                  </Button>
                </div>
              )}

              {/* Step 2: Organizer Information */}
              {step === 2 && (
                <div>
                  <h2 className="text-2xl font-bold text-[#1A1A1A] mb-6">Organizer Information</h2>
                  <div className="space-y-5">
                    <Input
                      label="Organization/Company Name (Optional)"
                      type="text"
                      value={organizerInfo.organizationName}
                      onChange={(e) => setOrganizerInfo({ ...organizerInfo, organizationName: e.target.value })}
                      icon={<PartyPopper className="w-5 h-5" />}
                    />
                    <Input
                      label="Contact Person"
                      type="text"
                      value={organizerInfo.contactPerson}
                      onChange={(e) => setOrganizerInfo({ ...organizerInfo, contactPerson: e.target.value })}
                      icon={<User className="w-5 h-5" />}
                      required
                    />
                    <Input
                      label="Email Address"
                      type="email"
                      value={organizerInfo.email}
                      onChange={(e) => setOrganizerInfo({ ...organizerInfo, email: e.target.value })}
                      icon={<Mail className="w-5 h-5" />}
                      helperText="Booking confirmation will be sent here"
                      required
                    />
                    <Input
                      label="Phone Number"
                      type="tel"
                      value={organizerInfo.phone}
                      onChange={(e) => setOrganizerInfo({ ...organizerInfo, phone: e.target.value })}
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

                  {/* Card Details */}
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

              {/* Event Space Info */}
              <div className="mb-6 pb-6 border-b border-[#E5E7EB]">
                <h4 className="font-bold text-[#1A1A1A] mb-2">{eventSpace.name}</h4>
                <p className="text-sm text-[#5C5B59] mb-1">{eventSpace.hotelName}</p>
                <p className="text-xs text-[#5C5B59] mb-3">{eventSpace.hotelAddress}</p>
                <div className="flex gap-2 text-xs">
                  <span className="px-2 py-1 bg-[#E8F4F8] text-[#0F75BD] rounded">
                    {eventSpace.capacity} capacity
                  </span>
                  <span className="px-2 py-1 bg-[#E8F4F8] text-[#0F75BD] rounded">
                    {eventSpace.size}m²
                  </span>
                </div>
              </div>

              {/* Event Details */}
              {bookingData.eventDate && (
                <div className="mb-6 pb-6 border-b border-[#E5E7EB]">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-[#5C5B59]">Event Date:</span>
                    <span className="font-semibold text-[#1A1A1A]">
                      {new Date(bookingData.eventDate).toLocaleDateString()}
                    </span>
                  </div>
                  {bookingData.startTime && bookingData.endTime && (
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-[#5C5B59]">Time:</span>
                      <span className="font-semibold text-[#1A1A1A]">
                        {bookingData.startTime} - {bookingData.endTime}
                      </span>
                    </div>
                  )}
                  {bookingData.eventType && (
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-[#5C5B59]">Event Type:</span>
                      <span className="font-semibold text-[#1A1A1A]">{bookingData.eventType}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-[#5C5B59]">Attendees:</span>
                    <span className="font-semibold text-[#1A1A1A]">{bookingData.attendees}</span>
                  </div>
                </div>
              )}

              {/* Price Breakdown */}
              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-[#5C5B59]">Space rental</span>
                  <span className="text-[#1A1A1A]">₦{subtotal.toLocaleString()}</span>
                </div>
                {bookingData.cateringNeeded && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[#5C5B59]">Catering ({bookingData.attendees} people)</span>
                    <span className="text-[#1A1A1A]">₦{cateringFee.toLocaleString()}</span>
                  </div>
                )}
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

              {/* Cancellation Policy */}
              <div className="bg-[#F9FAFB] p-4 rounded-xl">
                <p className="text-xs text-[#5C5B59]">
                  <strong className="text-[#1A1A1A]">Cancellation Policy:</strong> Free cancellation up to 7 days before the event. Partial refund for cancellations within 7 days.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
