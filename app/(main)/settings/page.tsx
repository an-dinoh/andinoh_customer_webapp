"use client";

import { useState } from "react";
import { User, Bell, Lock, CreditCard, ChevronRight, Shield, Upload } from "lucide-react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [profileForm, setProfileForm] = useState({
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    phone: "+234 123 456 7890",
  });

  const tabs = [
    { id: "profile", label: "Profile", icon: User, description: "Manage your personal information" },
    { id: "notifications", label: "Notifications", icon: Bell, description: "Configure notification preferences" },
    { id: "security", label: "Security", icon: Lock, description: "Password and security settings" },
    { id: "payment", label: "Payment Methods", icon: CreditCard, description: "Manage payment options" },
  ];

  const handleSave = async () => {
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaving(false);
    setEditing(false);
  };

  return (
    <div className="h-full bg-white flex flex-col">
      <div className="border-b border-[#E5E7EB] bg-white px-8 py-6">
        <h1 className="text-3xl font-bold text-[#1A1A1A]">Settings</h1>
        <p className="text-[#5C5B59] mt-1">Manage your account preferences</p>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-80 border-r border-[#E5E7EB] bg-white p-6">
          <nav className="space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setEditing(false); }}
                  className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all ${isActive ? "bg-[#0F75BD] text-white" : "text-[#5C5B59] hover:bg-[#F9FAFB] hover:text-[#0F75BD]"}`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? "text-white" : ""}`} />
                  <div className="flex-1 text-left">
                    <div className={`font-semibold text-sm ${isActive ? "text-white" : "text-[#1A1A1A]"}`}>{tab.label}</div>
                    <div className={`text-xs ${isActive ? "text-white/80" : "text-[#5C5B59]"}`}>{tab.description}</div>
                  </div>
                  <ChevronRight className={`w-4 h-4 ${isActive ? "text-white" : "text-[#5C5B59]"}`} />
                </button>
              );
            })}
          </nav>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-hide pt-8 pb-8">
          <div className="max-w-5xl mx-auto px-8 space-y-6">
            {activeTab === "profile" && (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-800 mb-2">Personal Profile</h2>
                    <p className="text-gray-500 text-sm">Update your personal information</p>
                  </div>
                  {!editing ? (
                    <button onClick={() => setEditing(true)} className="px-6 py-3 bg-[#0F75BD] text-white font-semibold rounded-xl hover:bg-[#0050C8] transition-colors">Edit Profile</button>
                  ) : (
                    <div className="flex gap-3">
                      <button onClick={handleSave} disabled={saving} className="px-6 py-3 bg-[#0F75BD] text-white font-semibold rounded-xl hover:bg-[#0050C8] transition-colors disabled:opacity-50">{saving ? "Saving..." : "Save Changes"}</button>
                      <button onClick={() => setEditing(false)} className="px-6 py-3 border border-[#D3D9DD] rounded-xl hover:bg-gray-50 text-gray-800 font-medium transition-colors">Cancel</button>
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-2xl p-8">
                  <div className="flex items-center gap-6">
                    <div className="w-24 h-24 bg-gradient-to-br from-[#0F75BD] to-[#02A5E6] rounded-2xl flex items-center justify-center text-white text-3xl font-bold">{profileForm.firstName.charAt(0)}{profileForm.lastName.charAt(0)}</div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 mb-1">Profile Photo</h3>
                      <p className="text-sm text-gray-500 mb-3">Update your profile picture</p>
                      {editing && <button className="px-4 py-2 bg-white border border-[#D3D9DD] text-gray-800 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2"><Upload className="w-4 h-4" />Upload Photo</button>}
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-8">
                  <h2 className="text-2xl font-semibold text-gray-800 mb-6">Basic Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[#0B0A07] text-sm mb-1">First Name</label>
                      {editing ? <input type="text" value={profileForm.firstName} onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })} className="w-full rounded-xl border border-[#D3D9DD] px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#8E9397] focus:border-transparent" /> : <p className="text-gray-800 font-medium py-2">{profileForm.firstName}</p>}
                    </div>
                    <div>
                      <label className="block text-[#0B0A07] text-sm mb-1">Last Name</label>
                      {editing ? <input type="text" value={profileForm.lastName} onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })} className="w-full rounded-xl border border-[#D3D9DD] px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#8E9397] focus:border-transparent" /> : <p className="text-gray-800 font-medium py-2">{profileForm.lastName}</p>}
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[#0B0A07] text-sm mb-1">Email Address</label>
                      {editing ? <input type="email" value={profileForm.email} onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })} className="w-full rounded-xl border border-[#D3D9DD] px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#8E9397] focus:border-transparent" /> : <p className="text-gray-800 font-medium py-2">{profileForm.email}</p>}
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[#0B0A07] text-sm mb-1">Phone Number</label>
                      {editing ? <input type="tel" value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} className="w-full rounded-xl border border-[#D3D9DD] px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#8E9397] focus:border-transparent" /> : <p className="text-gray-800 font-medium py-2">{profileForm.phone}</p>}
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === "notifications" && (
              <>
                <div>
                  <h2 className="text-2xl font-semibold text-gray-800 mb-2">Notification Preferences</h2>
                  <p className="text-gray-500 text-sm">Choose how you want to be notified</p>
                </div>
                <div className="bg-white rounded-2xl p-8">
                  <h2 className="text-2xl font-semibold text-gray-800 mb-6">Email Notifications</h2>
                  <div className="space-y-5">
                    {[{ label: "Booking confirmations", description: "Get notified when your bookings are confirmed" }, { label: "Payment receipts", description: "Receive email receipts for payments" }, { label: "Special offers and promotions", description: "Stay updated on exclusive deals" }, { label: "Travel reminders", description: "Get reminders before your trips" }, { label: "Price drop alerts", description: "Notified when prices drop for your searches" }].map((item, index) => (
                      <label key={index} className="flex items-start gap-4 p-4 hover:bg-[#FAFAFB] rounded-xl transition-colors cursor-pointer">
                        <input type="checkbox" className="w-5 h-5 text-[#0F75BD] border-[#E5E7EB] rounded mt-0.5 focus:ring-[#0F75BD]" defaultChecked={index < 3} />
                        <div className="flex-1">
                          <div className="text-[#1A1A1A] font-medium">{item.label}</div>
                          <div className="text-sm text-[#5C5B59] mt-0.5">{item.description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
                <button className="px-6 py-3 bg-[#0F75BD] text-white font-medium rounded-xl hover:bg-[#0050C8] transition-colors">Save Preferences</button>
              </>
            )}

            {activeTab === "security" && (
              <>
                <div>
                  <h2 className="text-2xl font-semibold text-gray-800 mb-2">Security Settings</h2>
                  <p className="text-gray-500 text-sm">Manage your password and security preferences</p>
                </div>
                <div className="bg-white rounded-2xl p-8">
                  <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2"><Lock className="w-5 h-5 text-[#0F75BD]" />Change Password</h2>
                  <div className="space-y-5">
                    <div>
                      <label className="block text-[#0B0A07] text-sm mb-1">Current Password</label>
                      <input type="password" className="w-full rounded-xl border border-[#D3D9DD] px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#8E9397] focus:border-transparent" placeholder="Enter current password" />
                    </div>
                    <div>
                      <label className="block text-[#0B0A07] text-sm mb-1">New Password</label>
                      <input type="password" className="w-full rounded-xl border border-[#D3D9DD] px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#8E9397] focus:border-transparent" placeholder="Enter new password" />
                    </div>
                    <div>
                      <label className="block text-[#0B0A07] text-sm mb-1">Confirm New Password</label>
                      <input type="password" className="w-full rounded-xl border border-[#D3D9DD] px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#8E9397] focus:border-transparent" placeholder="Confirm new password" />
                    </div>
                    <button className="px-6 py-3 bg-[#0F75BD] text-white font-medium rounded-xl hover:bg-[#0050C8] transition-colors">Update Password</button>
                  </div>
                </div>
                <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-[#0F75BD]/10 rounded-xl flex items-center justify-center"><Shield className="w-6 h-6 text-[#0F75BD]" /></div>
                      <div>
                        <h3 className="font-semibold text-[#1A1A1A]">Two-Factor Authentication</h3>
                        <p className="text-sm text-[#5C5B59] mt-1">Add an extra layer of security to your account</p>
                        <p className="text-xs text-[#5C5B59] mt-2">Status: <span className="text-red-500 font-medium">Not enabled</span></p>
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-[#0F75BD] text-white font-medium rounded-lg hover:bg-[#0050C8] transition-colors">Enable</button>
                  </div>
                </div>
              </>
            )}

            {activeTab === "payment" && (
              <>
                <div>
                  <h2 className="text-2xl font-semibold text-gray-800 mb-2">Payment Methods</h2>
                  <p className="text-gray-500 text-sm">Manage your saved payment methods</p>
                </div>
                <div className="bg-white rounded-2xl p-8">
                  <div className="text-center py-12">
                    <CreditCard className="w-16 h-16 text-[#5C5B59] mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-[#1A1A1A] mb-2">No payment methods saved</h3>
                    <p className="text-[#5C5B59] mb-6">Add a payment method to make checkout faster</p>
                    <button className="px-6 py-3 bg-[#0F75BD] text-white font-medium rounded-xl hover:bg-[#0050C8] transition-colors">Add Payment Method</button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
