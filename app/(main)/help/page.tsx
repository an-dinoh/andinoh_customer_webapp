"use client";

import { Mail, Clock, ArrowRight, HeadphonesIcon, MessageSquare, Phone, HelpCircle, ChevronDown } from "lucide-react";
import { useState } from "react";

export default function HelpPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const supportChannels = [
    {
      icon: Mail,
      title: "Email Support",
      description: "Send us an email and we'll respond within 24 hours",
      availability: "Response within 24h",
      action: "support@andinoh.com",
      bg: "bg-[#F5F3FF]",
      iconColor: "text-purple-600",
      available: true,
    },
    {
      icon: Phone,
      title: "Phone Support",
      description: "Speak directly with our support team",
      availability: "Available 24/7",
      action: "+234 7079726698",
      bg: "bg-[#ECFDF5]",
      iconColor: "text-green-600",
      available: true,
    },
    {
      icon: MessageSquare,
      title: "WhatsApp Support",
      description: "Chat with us on WhatsApp for quick assistance",
      availability: "Available 24/7",
      action: "+44 7400 730594",
      bg: "bg-[#F0F9FF]",
      iconColor: "text-blue-600",
      available: true,
    },
  ];

  const faqs = [
    {
      question: "How do I book a flight?",
      answer: "You can book a flight by searching for your desired destination and dates on our flights page. Select your preferred flight from the results and follow the checkout process to complete your booking."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards (Visa, MasterCard, American Express), debit cards, and mobile payment options. All transactions are secure and encrypted."
    },
    {
      question: "Can I cancel or modify my booking?",
      answer: "Yes, you can cancel or modify your booking from your bookings page. Please note that cancellation and modification policies vary by airline and fare type. Additional fees may apply."
    },
    {
      question: "How do I check my booking status?",
      answer: "You can check your booking status by logging into your account and navigating to the 'My Bookings' section. You'll see all your past and upcoming bookings with their current status."
    },
    {
      question: "What if I need to change my travel dates?",
      answer: "To change your travel dates, go to 'My Bookings', select the booking you want to modify, and click 'Change Dates'. Please note that date changes are subject to availability and may incur additional fees."
    },
    {
      question: "How do I get my booking confirmation?",
      answer: "After completing your booking, you'll receive a confirmation email with your booking reference number and ticket details. You can also view and download your confirmation from the 'My Bookings' section."
    },
    {
      question: "What should I do if I encounter a technical issue?",
      answer: "If you're experiencing technical difficulties, please contact our support team via email, phone, or WhatsApp. Our team is available 24/7 to help resolve any issues you may encounter."
    },
    {
      question: "How far in advance should I book my flight?",
      answer: "We recommend booking flights at least 2-3 weeks in advance for domestic travel and 4-6 weeks for international travel to get the best prices. However, you can book flights up to 11 months in advance."
    }
  ];

  return (
    <div className="h-full bg-white overflow-y-auto scrollbar-hide">
      {/* Header */}
      <div className="border-b border-[#E5E7EB] px-8 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-[#F0F9FF] px-4 py-2 rounded-full text-[#0F75BD] text-sm mb-4 border border-[#E5E7EB]">
            <HeadphonesIcon className="w-4 h-4" />
            <span className="font-medium">We're here to help 24/7</span>
          </div>
          <h1 className="text-4xl font-bold text-[#1A1A1A] mb-3">Contact Andinoh Support</h1>
          <p className="text-lg text-[#5C5B59]">
            Get in touch with our support team for assistance
          </p>
        </div>
      </div>

      {/* Support Channels */}
      <div className="max-w-4xl mx-auto px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {supportChannels.map((channel, index) => {
            const Icon = channel.icon;
            return (
              <div
                key={index}
                className={`${channel.bg} rounded-2xl p-8 border border-[#E5E7EB] relative overflow-hidden group cursor-pointer hover:border-[#0F75BD] transition-all`}
              >
                <div className="relative">
                  {channel.available && (
                    <div className="inline-flex items-center gap-1.5 bg-green-100 px-3 py-1 rounded-full text-xs mb-4 text-green-700">
                      <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
                      Available now
                    </div>
                  )}

                  <Icon className={`w-12 h-12 mb-4 ${channel.iconColor}`} />

                  <h3 className="font-bold text-xl mb-2 text-gray-800">{channel.title}</h3>
                  <p className="text-gray-500 text-sm mb-4">{channel.description}</p>

                  <div className="flex items-center gap-2 text-sm mb-6 text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span>{channel.availability}</span>
                  </div>

                  <button className="w-full py-3 bg-[#0F75BD] text-white font-semibold rounded-xl hover:bg-[#0050C8] transition-colors flex items-center justify-center gap-2">
                    <span>{channel.action}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* FAQs Section */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <HelpCircle className="w-8 h-8 text-[#0F75BD]" />
            <h2 className="text-3xl font-bold text-[#1A1A1A]">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-8 py-6 flex items-center justify-between text-left hover:bg-[#FAFAFB] transition-colors"
                >
                  <span className="font-semibold text-[#1A1A1A] pr-4">{faq.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-[#5C5B59] transition-transform flex-shrink-0 ${
                      openFaq === index ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    openFaq === index ? "max-h-96" : "max-h-0"
                  }`}
                >
                  <div className="px-8 pb-6 text-[#5C5B59] leading-relaxed border-t border-[#E5E7EB] pt-4">
                    {faq.answer}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Extra spacing at bottom */}
        <div className="h-32"></div>
      </div>
    </div>
  );
}
