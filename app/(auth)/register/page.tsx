"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import InputField from "@/components/ui/InputField";
import Button from "@/components/ui/Button";
import PasswordRequirements from "@/components/ui/PasswordStrengthIndicator";
import TermsAndConditions from "@/components/ui/TermsAndConditions";
import { useState, useMemo } from "react";
import { FormValidator, FormState } from "@/utils/FormValidator";

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState<FormState>({
    hotelName: "",
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    hotelAddress: "",
    hotelLicenseNumber: "",
  });

  const [errors, setErrors] = useState({
    global: "",
    email: "",
    confirmPassword: "",
  });

  const [emailError, setEmailError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [loading, setLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // ✅ Handles field changes
  const handleChange = (field: keyof FormState, value: string) => {
    const updatedForm = { ...form, [field]: value };
    setForm(updatedForm);

    const validator = new FormValidator(updatedForm);
    const fieldError = validator.validateField(field, value);

    if (field === "email") {
      setErrors((prev) => ({ ...prev, email: fieldError }));
    }

    if (field === "confirmPassword") {
      setErrors((prev) => ({ ...prev, confirmPassword: fieldError }));
    }


    if (errors.global) {
      setErrors((prev) => ({ ...prev, global: "" }));
    }
  };

  const isFormValid = useMemo(() => {
    const allFilled =
      form.hotelName.trim() &&
      form.email.trim() &&
      form.password.trim() &&
      form.confirmPassword.trim() &&
      form.hotelLicenseNumber.trim();

    const passwordsMatch = form.password === form.confirmPassword;
    return allFilled && passwordsMatch && acceptedTerms;
  }, [form, acceptedTerms]);

  // ✅ Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid) {
      setErrors((prev) => ({
        ...prev,
        global: "Please fill all fields and accept the Terms.",
      }));
      return;
    }

    if (loading) return;
    setLoading(true);

    // Simulate loading delay for better UX
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Save dummy token to localStorage
    localStorage.setItem('token', 'dummy-token');
    localStorage.setItem('user', JSON.stringify({
      email: form.email,
      hotelName: form.hotelName
    }));

    // Redirect to dashboard
    router.push("/dashboard");

    setLoading(false);
  };

  return (
    <div className="rounded-2xl p-8">
      <div className="text-left mb-8">
        <h1 className="text-4xl font-semibold text-gray-800 mb-4">
          Register Your Hotel
        </h1>
        <p className="text-gray-500 text-sm">
          Create your hotel account to manage bookings, rooms, and staff
          effortlessly.
        </p>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        <InputField
          label="Hotel Name"
          placeholder="e.g., Grand View"
          value={form.hotelName}
          onChange={(e) => handleChange("hotelName", e.target.value)}
        />

        <InputField
          label="Email Address"
          placeholder="e.g., hotel@example.com"
          value={form.email}
          onChange={(e) => {
            const email = e.target.value;
            handleChange("email", email);

            const validator = new FormValidator({ ...form, email });
            if (email.trim() === "") {
              setEmailError("");
            } else if (!validator.validateEmail(email)) {
              setEmailError("Please enter a valid email address.");
            } else {
              setEmailError("");
            }
          }}
          error={emailError}
        />

        {/* <InputField
//           label="Hotel Address"
//           placeholder="Enter hotel address"
//           value={form.hotelAddress}
//           onChange={(e) => handleChange("hotelAddress", e.target.value)}
//         /> */}

        <InputField
          label="Hotel License Number"
          placeholder="Enter license number"
          value={form.hotelLicenseNumber}
          onChange={(e) => handleChange("hotelLicenseNumber", e.target.value)}
        />

        <InputField
          label="Password"
          type="password"
          placeholder="Create a password"
          value={form.password}
          onChange={(e) => {
            const value = e.target.value;
            handleChange("password", value);
          }}
        />

        <PasswordRequirements password={form.password} />

        <InputField
          label="Confirm Password"
          type="password"
          placeholder="Re-enter your password"
          value={form.confirmPassword}
          onChange={(e) => {
            const value = e.target.value;
            handleChange("confirmPassword", value);

            if (!value) {
              setConfirmPasswordError("");
            } else if (value !== form.password) {
              setConfirmPasswordError("Passwords do not match.");
            } else {
              setConfirmPasswordError("");
            }
          }}
          error={confirmPasswordError}
        />

        {/* ✅ Terms Section */}
        <TermsAndConditions
          accepted={acceptedTerms}
          onChange={setAcceptedTerms}
        />

        <Button
          text="Register Hotel"
          onClick={handleSubmit}
          loading={loading}
          disabled={!isFormValid || loading} // ✅ Disable until valid
        />
      </form>

      {errors.global && (
        <p className="text-red-600 text-sm mt-2">{errors.global}</p>
      )}

      <p className="text-left text-sm text-gray-600 mt-4">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-[#0F75BD] hover:underline font-semibold"
        >
          Log in
        </Link>
      </p>
    </div>
  );
}
