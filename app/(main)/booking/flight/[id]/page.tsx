"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Plane, CreditCard, CheckCircle, ArrowLeft, Mail, Phone, User, Calendar, Luggage } from "lucide-react";
import Button from "@/components/common/Button";
import Card from "@/components/common/Card";
import Input from "@/components/common/Input";

interface PassengerInfo {
  title: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  passportNumber: string;
}

export default function FlightBookingPage() {
  const params = useParams();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [passengers, setPassengers] = useState<PassengerInfo[]>([
    {
      title: "Mr",
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      passportNumber: "",
    },
  ]);

  const [contactInfo, setContactInfo] = useState({
    email: "",
    phone: "",
  });

  const [addOns, setAddOns] = useState({
    extraBaggage: false,
    mealPreference: "none",
    seatSelection: false,
    insurance: false,
  });

  const [paymentMethod, setPaymentMethod] = useState<"card" | "bank" | "wallet">("card");

  // Mock flight data
  const flight = {
    id: params.id,
    airline: "Air Peace",
    flightNumber: "P47215",
    from: "Lagos (LOS)",
    to: "Abuja (ABV)",
    departure: "08:00",
    arrival: "09:15",
    date: "2024-02-15",
    duration: "1h 15m",
    stops: 0,
    price: 45000,
    class: "Economy",
  };

  const addOnPrices = {
    extraBaggage: 15000,
    meal: 5000,
    seatSelection: 8000,
    insurance: 3000,
  };

  const calculateTotal = () => {
    let total = flight.price * passengers.length;
    if (addOns.extraBaggage) total += addOnPrices.extraBaggage * passengers.length;
    if (addOns.mealPreference !== "none") total += addOnPrices.meal * passengers.length;
    if (addOns.seatSelection) total += addOnPrices.seatSelection * passengers.length;
    if (addOns.insurance) total += addOnPrices.insurance * passengers.length;
    return total;
  };

  const total = calculateTotal();
  const serviceFee = total * 0.05;
  const tax = total * 0.075;
  const grandTotal = total + serviceFee + tax;

  const updatePassenger = (index: number, field: keyof PassengerInfo, value: string) => {
    const updated = [...passengers];
    updated[index] = { ...updated[index], [field]: value };
    setPassengers(updated);
  };

  const handleNextStep = () => {
    if (step === 1) {
      const isValid = passengers.every(
        (p) => p.firstName && p.lastName && p.dateOfBirth && p.passportNumber
      );
      if (!isValid) {
        alert("Please fill in all passenger information");
        return;
      }
    }
    if (step === 2 && (!contactInfo.email || !contactInfo.phone)) {
      alert("Please provide contact information");
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
          <h1 className="text-3xl font-bold text-[#1A1A1A] mb-4">Flight Booked Successfully!</h1>
          <p className="text-[#5C5B59] mb-8">
            Your flight has been confirmed. We've sent your e-ticket to {contactInfo.email}
          </p>

          <Card className="p-6 bg-[#F9FAFB] mb-8 text-left">
            <h3 className="font-bold text-[#1A1A1A] mb-4">Flight Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#5C5B59]">Airline:</span>
                <span className="font-semibold text-[#1A1A1A]">{flight.airline}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5C5B59]">Flight Number:</span>
                <span className="font-semibold text-[#1A1A1A]">{flight.flightNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5C5B59]">Route:</span>
                <span className="font-semibold text-[#1A1A1A]">
                  {flight.from} → {flight.to}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5C5B59]">Departure:</span>
                <span className="font-semibold text-[#1A1A1A]">
                  {flight.date} at {flight.departure}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5C5B59]">Passengers:</span>
                <span className="font-semibold text-[#1A1A1A]">{passengers.length}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-[#E5E7EB]">
                <span className="text-[#5C5B59]">Total Paid:</span>
                <span className="font-bold text-[#0F75BD] text-lg">₦{grandTotal.toLocaleString()}</span>
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
                    s <= step ? "bg-[#0F75BD] text-white" : "bg-[#E5E7EB] text-[#5C5B59]"
                  }`}
                >
                  {s}
                </div>
                {s < 3 && (
                  <div className={`w-16 h-1 ${s < step ? "bg-[#0F75BD]" : "bg-[#E5E7EB]"}`}></div>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-12 text-sm">
            <span className={step >= 1 ? "text-[#0F75BD] font-semibold" : "text-[#5C5B59]"}>
              Passengers
            </span>
            <span className={step >= 2 ? "text-[#0F75BD] font-semibold" : "text-[#5C5B59]"}>
              Add-ons & Contact
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
              {/* Step 1: Passenger Information */}
              {step === 1 && (
                <div>
                  <h2 className="text-2xl font-bold text-[#1A1A1A] mb-6">Passenger Information</h2>
                  {passengers.map((passenger, index) => (
                    <div key={index} className="mb-8 pb-8 border-b border-[#E5E7EB] last:border-0">
                      <h3 className="font-bold text-[#1A1A1A] mb-4">
                        Passenger {index + 1}
                      </h3>
                      <div className="space-y-4">
                        <div className="grid grid-cols-4 gap-4">
                          <div className="col-span-1">
                            <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
                              Title
                            </label>
                            <select
                              value={passenger.title}
                              onChange={(e) => updatePassenger(index, "title", e.target.value)}
                              className="w-full px-4 py-3 border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F75BD]"
                            >
                              <option value="Mr">Mr</option>
                              <option value="Mrs">Mrs</option>
                              <option value="Ms">Ms</option>
                              <option value="Dr">Dr</option>
                            </select>
                          </div>
                          <div className="col-span-3">
                            <Input
                              label="First Name"
                              type="text"
                              value={passenger.firstName}
                              onChange={(e) => updatePassenger(index, "firstName", e.target.value)}
                              icon={<User className="w-5 h-5" />}
                              required
                            />
                          </div>
                        </div>
                        <Input
                          label="Last Name"
                          type="text"
                          value={passenger.lastName}
                          onChange={(e) => updatePassenger(index, "lastName", e.target.value)}
                          icon={<User className="w-5 h-5" />}
                          required
                        />
                        <Input
                          label="Date of Birth"
                          type="date"
                          value={passenger.dateOfBirth}
                          onChange={(e) => updatePassenger(index, "dateOfBirth", e.target.value)}
                          icon={<Calendar className="w-5 h-5" />}
                          required
                        />
                        <Input
                          label="Passport Number"
                          type="text"
                          value={passenger.passportNumber}
                          onChange={(e) => updatePassenger(index, "passportNumber", e.target.value)}
                          placeholder="A12345678"
                          required
                        />
                      </div>
                    </div>
                  ))}
                  <Button fullWidth size="lg" onClick={handleNextStep}>
                    Continue to Add-ons
                  </Button>
                </div>
              )}

              {/* Step 2: Add-ons & Contact */}
              {step === 2 && (
                <div>
                  <h2 className="text-2xl font-bold text-[#1A1A1A] mb-6">Add-ons & Contact</h2>

                  {/* Add-ons */}
                  <div className="mb-8">
                    <h3 className="font-bold text-[#1A1A1A] mb-4">Optional Add-ons</h3>
                    <div className="space-y-3">
                      <label className="flex items-start gap-3 p-4 border-2 border-[#E5E7EB] rounded-xl cursor-pointer hover:border-[#0F75BD] transition-colors">
                        <input
                          type="checkbox"
                          checked={addOns.extraBaggage}
                          onChange={(e) => setAddOns({ ...addOns, extraBaggage: e.target.checked })}
                          className="mt-1 w-5 h-5 text-[#0F75BD] rounded"
                        />
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-semibold text-[#1A1A1A]">Extra Baggage</p>
                              <p className="text-sm text-[#5C5B59]">Additional 23kg checked bag</p>
                            </div>
                            <p className="font-bold text-[#0F75BD]">
                              +₦{addOnPrices.extraBaggage.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </label>

                      <label className="flex items-start gap-3 p-4 border-2 border-[#E5E7EB] rounded-xl cursor-pointer hover:border-[#0F75BD] transition-colors">
                        <input
                          type="checkbox"
                          checked={addOns.seatSelection}
                          onChange={(e) => setAddOns({ ...addOns, seatSelection: e.target.checked })}
                          className="mt-1 w-5 h-5 text-[#0F75BD] rounded"
                        />
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-semibold text-[#1A1A1A]">Seat Selection</p>
                              <p className="text-sm text-[#5C5B59]">Choose your preferred seat</p>
                            </div>
                            <p className="font-bold text-[#0F75BD]">
                              +₦{addOnPrices.seatSelection.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </label>

                      <label className="flex items-start gap-3 p-4 border-2 border-[#E5E7EB] rounded-xl cursor-pointer hover:border-[#0F75BD] transition-colors">
                        <input
                          type="checkbox"
                          checked={addOns.insurance}
                          onChange={(e) => setAddOns({ ...addOns, insurance: e.target.checked })}
                          className="mt-1 w-5 h-5 text-[#0F75BD] rounded"
                        />
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-semibold text-[#1A1A1A]">Travel Insurance</p>
                              <p className="text-sm text-[#5C5B59]">
                                Coverage for cancellations and delays
                              </p>
                            </div>
                            <p className="font-bold text-[#0F75BD]">
                              +₦{addOnPrices.insurance.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </label>

                      <div className="p-4 border-2 border-[#E5E7EB] rounded-xl">
                        <label className="block font-semibold text-[#1A1A1A] mb-2">
                          Meal Preference
                        </label>
                        <select
                          value={addOns.mealPreference}
                          onChange={(e) => setAddOns({ ...addOns, mealPreference: e.target.value })}
                          className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F75BD]"
                        >
                          <option value="none">No meal (Free)</option>
                          <option value="standard">Standard Meal (+₦{addOnPrices.meal.toLocaleString()})</option>
                          <option value="vegetarian">Vegetarian (+₦{addOnPrices.meal.toLocaleString()})</option>
                          <option value="halal">Halal (+₦{addOnPrices.meal.toLocaleString()})</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="mb-6">
                    <h3 className="font-bold text-[#1A1A1A] mb-4">Contact Information</h3>
                    <div className="space-y-4">
                      <Input
                        label="Email Address"
                        type="email"
                        value={contactInfo.email}
                        onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                        icon={<Mail className="w-5 h-5" />}
                        helperText="E-ticket will be sent here"
                        required
                      />
                      <Input
                        label="Phone Number"
                        type="tel"
                        value={contactInfo.phone}
                        onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                        icon={<Phone className="w-5 h-5" />}
                        required
                      />
                    </div>
                  </div>

                  <Button fullWidth size="lg" onClick={handleNextStep}>
                    Continue to Payment
                  </Button>
                </div>
              )}

              {/* Step 3: Payment */}
              {step === 3 && (
                <div>
                  <h2 className="text-2xl font-bold text-[#1A1A1A] mb-6">Payment Method</h2>

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
                    {loading ? "Processing..." : `Pay ₦${grandTotal.toLocaleString()}`}
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

              {/* Flight Info */}
              <div className="mb-6 pb-6 border-b border-[#E5E7EB]">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-[#E8F4F8] rounded-lg flex items-center justify-center">
                    <Plane className="w-5 h-5 text-[#0F75BD]" />
                  </div>
                  <div>
                    <p className="font-bold text-[#1A1A1A]">{flight.airline}</p>
                    <p className="text-xs text-[#5C5B59]">{flight.flightNumber}</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#5C5B59]">From:</span>
                    <span className="font-semibold text-[#1A1A1A]">{flight.from}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#5C5B59]">To:</span>
                    <span className="font-semibold text-[#1A1A1A]">{flight.to}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#5C5B59]">Departure:</span>
                    <span className="font-semibold text-[#1A1A1A]">{flight.departure}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#5C5B59]">Class:</span>
                    <span className="font-semibold text-[#1A1A1A]">{flight.class}</span>
                  </div>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-[#5C5B59]">
                    Base fare × {passengers.length}
                  </span>
                  <span className="text-[#1A1A1A]">
                    ₦{(flight.price * passengers.length).toLocaleString()}
                  </span>
                </div>
                {addOns.extraBaggage && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[#5C5B59]">Extra baggage</span>
                    <span className="text-[#1A1A1A]">
                      ₦{(addOnPrices.extraBaggage * passengers.length).toLocaleString()}
                    </span>
                  </div>
                )}
                {addOns.mealPreference !== "none" && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[#5C5B59]">Meals</span>
                    <span className="text-[#1A1A1A]">
                      ₦{(addOnPrices.meal * passengers.length).toLocaleString()}
                    </span>
                  </div>
                )}
                {addOns.seatSelection && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[#5C5B59]">Seat selection</span>
                    <span className="text-[#1A1A1A]">
                      ₦{(addOnPrices.seatSelection * passengers.length).toLocaleString()}
                    </span>
                  </div>
                )}
                {addOns.insurance && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[#5C5B59]">Travel insurance</span>
                    <span className="text-[#1A1A1A]">
                      ₦{(addOnPrices.insurance * passengers.length).toLocaleString()}
                    </span>
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
                  <span className="font-bold text-[#0F75BD] text-xl">
                    ₦{grandTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Important Info */}
              <div className="bg-[#F9FAFB] p-4 rounded-xl">
                <p className="text-xs text-[#5C5B59]">
                  <strong className="text-[#1A1A1A]">Important:</strong> Please arrive at the
                  airport at least 2 hours before departure. Bring valid ID and passport.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
