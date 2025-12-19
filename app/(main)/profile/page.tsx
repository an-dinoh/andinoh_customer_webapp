"use client";

import { useState } from "react";
import { User, Mail, Phone, MapPin, Calendar, Edit2, Save, X } from "lucide-react";
import Button from "@/components/common/Button";
import Card from "@/components/common/Card";
import Input from "@/components/common/Input";

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "preferences" | "security">("profile");

  const [profileData, setProfileData] = useState({
    firstName: "John",
    lastName: "Adebayo",
    email: "john.adebayo@example.com",
    phone: "+234 800 123 4567",
    dateOfBirth: "1990-05-15",
    address: "123 Victoria Island, Lagos",
    city: "Lagos",
    country: "Nigeria",
  });

  const [preferences, setPreferences] = useState({
    newsletter: true,
    promotions: true,
    bookingUpdates: true,
    smsNotifications: false,
    currency: "NGN",
    language: "en",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      // TODO: Implement API call to update profile
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsEditing(false);
    } catch (error) {
      alert("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      // TODO: Implement API call to change password
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      alert("Password changed successfully");
    } catch (error) {
      alert("Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFB] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-[#1A1A1A] mb-8">My Profile</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Profile Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-[#0F75BD] rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl font-bold text-white">
                    {profileData.firstName.charAt(0)}
                    {profileData.lastName.charAt(0)}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-[#1A1A1A]">
                  {profileData.firstName} {profileData.lastName}
                </h2>
                <p className="text-sm text-[#5C5B59]">{profileData.email}</p>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => setActiveTab("profile")}
                  className={`w-full text-left px-4 py-3 rounded-xl font-semibold transition-colors ${
                    activeTab === "profile"
                      ? "bg-[#E8F4F8] text-[#0F75BD]"
                      : "text-[#5C5B59] hover:bg-[#F9FAFB]"
                  }`}
                >
                  Profile Information
                </button>
                <button
                  onClick={() => setActiveTab("preferences")}
                  className={`w-full text-left px-4 py-3 rounded-xl font-semibold transition-colors ${
                    activeTab === "preferences"
                      ? "bg-[#E8F4F8] text-[#0F75BD]"
                      : "text-[#5C5B59] hover:bg-[#F9FAFB]"
                  }`}
                >
                  Preferences
                </button>
                <button
                  onClick={() => setActiveTab("security")}
                  className={`w-full text-left px-4 py-3 rounded-xl font-semibold transition-colors ${
                    activeTab === "security"
                      ? "bg-[#E8F4F8] text-[#0F75BD]"
                      : "text-[#5C5B59] hover:bg-[#F9FAFB]"
                  }`}
                >
                  Security
                </button>
              </div>

              <div className="mt-6 pt-6 border-t border-[#E5E7EB]">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#5C5B59]">Member since:</span>
                    <span className="font-semibold text-[#1A1A1A]">Jan 2024</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#5C5B59]">Total bookings:</span>
                    <span className="font-semibold text-[#1A1A1A]">12</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Profile Information Tab */}
            {activeTab === "profile" && (
              <Card className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-[#1A1A1A]">Profile Information</h2>
                  {!isEditing ? (
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit Profile
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setIsEditing(false)}
                        className="flex items-center gap-2"
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSaveProfile}
                        loading={loading}
                        className="flex items-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        Save Changes
                      </Button>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="First Name"
                      type="text"
                      value={profileData.firstName}
                      onChange={(e) =>
                        setProfileData({ ...profileData, firstName: e.target.value })
                      }
                      icon={<User className="w-5 h-5" />}
                      disabled={!isEditing}
                    />
                    <Input
                      label="Last Name"
                      type="text"
                      value={profileData.lastName}
                      onChange={(e) =>
                        setProfileData({ ...profileData, lastName: e.target.value })
                      }
                      icon={<User className="w-5 h-5" />}
                      disabled={!isEditing}
                    />
                  </div>

                  <Input
                    label="Email Address"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    icon={<Mail className="w-5 h-5" />}
                    disabled={!isEditing}
                  />

                  <Input
                    label="Phone Number"
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    icon={<Phone className="w-5 h-5" />}
                    disabled={!isEditing}
                  />

                  <Input
                    label="Date of Birth"
                    type="date"
                    value={profileData.dateOfBirth}
                    onChange={(e) =>
                      setProfileData({ ...profileData, dateOfBirth: e.target.value })
                    }
                    icon={<Calendar className="w-5 h-5" />}
                    disabled={!isEditing}
                  />

                  <Input
                    label="Address"
                    type="text"
                    value={profileData.address}
                    onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                    icon={<MapPin className="w-5 h-5" />}
                    disabled={!isEditing}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="City"
                      type="text"
                      value={profileData.city}
                      onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                      disabled={!isEditing}
                    />
                    <Input
                      label="Country"
                      type="text"
                      value={profileData.country}
                      onChange={(e) =>
                        setProfileData({ ...profileData, country: e.target.value })
                      }
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </Card>
            )}

            {/* Preferences Tab */}
            {activeTab === "preferences" && (
              <Card className="p-8">
                <h2 className="text-2xl font-bold text-[#1A1A1A] mb-6">Preferences</h2>

                <div className="space-y-8">
                  {/* Notifications */}
                  <div>
                    <h3 className="text-lg font-bold text-[#1A1A1A] mb-4">Notifications</h3>
                    <div className="space-y-3">
                      <label className="flex items-center justify-between p-4 bg-[#F9FAFB] rounded-xl cursor-pointer">
                        <div>
                          <p className="font-semibold text-[#1A1A1A]">Email Newsletter</p>
                          <p className="text-sm text-[#5C5B59]">
                            Receive our weekly newsletter with deals
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={preferences.newsletter}
                          onChange={(e) =>
                            setPreferences({ ...preferences, newsletter: e.target.checked })
                          }
                          className="w-5 h-5 text-[#0F75BD] rounded"
                        />
                      </label>

                      <label className="flex items-center justify-between p-4 bg-[#F9FAFB] rounded-xl cursor-pointer">
                        <div>
                          <p className="font-semibold text-[#1A1A1A]">Promotional Offers</p>
                          <p className="text-sm text-[#5C5B59]">Get notified about special offers</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={preferences.promotions}
                          onChange={(e) =>
                            setPreferences({ ...preferences, promotions: e.target.checked })
                          }
                          className="w-5 h-5 text-[#0F75BD] rounded"
                        />
                      </label>

                      <label className="flex items-center justify-between p-4 bg-[#F9FAFB] rounded-xl cursor-pointer">
                        <div>
                          <p className="font-semibold text-[#1A1A1A]">Booking Updates</p>
                          <p className="text-sm text-[#5C5B59]">
                            Updates about your bookings and reservations
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={preferences.bookingUpdates}
                          onChange={(e) =>
                            setPreferences({ ...preferences, bookingUpdates: e.target.checked })
                          }
                          className="w-5 h-5 text-[#0F75BD] rounded"
                        />
                      </label>

                      <label className="flex items-center justify-between p-4 bg-[#F9FAFB] rounded-xl cursor-pointer">
                        <div>
                          <p className="font-semibold text-[#1A1A1A]">SMS Notifications</p>
                          <p className="text-sm text-[#5C5B59]">Receive booking updates via SMS</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={preferences.smsNotifications}
                          onChange={(e) =>
                            setPreferences({ ...preferences, smsNotifications: e.target.checked })
                          }
                          className="w-5 h-5 text-[#0F75BD] rounded"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Regional Settings */}
                  <div>
                    <h3 className="text-lg font-bold text-[#1A1A1A] mb-4">Regional Settings</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
                          Currency
                        </label>
                        <select
                          value={preferences.currency}
                          onChange={(e) =>
                            setPreferences({ ...preferences, currency: e.target.value })
                          }
                          className="w-full px-4 py-3 border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F75BD]"
                        >
                          <option value="NGN">Nigerian Naira (₦)</option>
                          <option value="USD">US Dollar ($)</option>
                          <option value="GBP">British Pound (£)</option>
                          <option value="EUR">Euro (€)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
                          Language
                        </label>
                        <select
                          value={preferences.language}
                          onChange={(e) =>
                            setPreferences({ ...preferences, language: e.target.value })
                          }
                          className="w-full px-4 py-3 border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F75BD]"
                        >
                          <option value="en">English</option>
                          <option value="yo">Yoruba</option>
                          <option value="ig">Igbo</option>
                          <option value="ha">Hausa</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <Button>Save Preferences</Button>
                </div>
              </Card>
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
              <Card className="p-8">
                <h2 className="text-2xl font-bold text-[#1A1A1A] mb-6">Security Settings</h2>

                <div className="space-y-8">
                  {/* Change Password */}
                  <div>
                    <h3 className="text-lg font-bold text-[#1A1A1A] mb-4">Change Password</h3>
                    <div className="space-y-4">
                      <Input
                        label="Current Password"
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) =>
                          setPasswordData({ ...passwordData, currentPassword: e.target.value })
                        }
                        placeholder="Enter current password"
                      />
                      <Input
                        label="New Password"
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) =>
                          setPasswordData({ ...passwordData, newPassword: e.target.value })
                        }
                        placeholder="Enter new password"
                        helperText="Must be at least 8 characters"
                      />
                      <Input
                        label="Confirm New Password"
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) =>
                          setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                        }
                        placeholder="Confirm new password"
                      />
                      <Button onClick={handleChangePassword} loading={loading}>
                        Change Password
                      </Button>
                    </div>
                  </div>

                  {/* Two-Factor Authentication */}
                  <div className="pt-6 border-t border-[#E5E7EB]">
                    <h3 className="text-lg font-bold text-[#1A1A1A] mb-2">
                      Two-Factor Authentication
                    </h3>
                    <p className="text-sm text-[#5C5B59] mb-4">
                      Add an extra layer of security to your account
                    </p>
                    <Button variant="outline">Enable 2FA</Button>
                  </div>

                  {/* Active Sessions */}
                  <div className="pt-6 border-t border-[#E5E7EB]">
                    <h3 className="text-lg font-bold text-[#1A1A1A] mb-4">Active Sessions</h3>
                    <div className="space-y-3">
                      <div className="p-4 bg-[#F9FAFB] rounded-xl">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-[#1A1A1A]">Chrome on Windows</p>
                            <p className="text-sm text-[#5C5B59]">Lagos, Nigeria</p>
                            <p className="text-xs text-[#5C5B59] mt-1">
                              Last active: Just now
                            </p>
                          </div>
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                            Current
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
