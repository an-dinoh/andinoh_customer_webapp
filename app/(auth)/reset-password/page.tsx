"use client";

export const dynamic = 'force-dynamic';

import Link from "next/link";
import InputField from "@/components/ui/InputField";
import Button from "@/components/ui/Button";
import PasswordStrengthIndicator from "@/components/ui/PasswordStrengthIndicator";
import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { FormValidator } from "@/utils/FormValidator";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const verified = searchParams.get("verified");

  const [form, setForm] = useState({
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({
    global: "",
    confirmPassword: "",
  });

  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(false);

  const isFormValid = useMemo(() => {
    return (
      form.password.trim() !== "" &&
      form.confirmPassword.trim() !== "" &&
      form.password === form.confirmPassword &&
      passwordStrength >= 4
    );
  }, [form.password, form.confirmPassword, passwordStrength]);

  useEffect(() => {
    // Check if user came from OTP verification
    if (!email || verified !== "true") {
      setIsVerified(false);
    } else {
      setIsVerified(true);
    }
  }, [email, verified]);

  const handleChange = (
    field: "password" | "confirmPassword",
    value: string
  ) => {
    const updatedForm = { ...form, [field]: value };
    setForm(updatedForm);

    // Clear global error when user types
    if (errors.global) {
      setErrors((prev) => ({ ...prev, global: "" }));
    }

    const validator = new FormValidator({
      hotelName: "",
      email: email || "",
      password: updatedForm.password,
      confirmPassword: updatedForm.confirmPassword,
      hotelLicenseNumber: "",
    });

    // Update password strength
    if (field === "password") {
      setPasswordStrength(validator.getPasswordStrength(value));
    }

    // Validate confirm password field
    if (field === "confirmPassword") {
      const fieldError = validator.validateField("confirmPassword", value);
      setErrors((prev) => ({ ...prev, confirmPassword: fieldError }));
    }

    // Re-validate confirmPassword when password changes
    if (field === "password" && updatedForm.confirmPassword) {
      const confirmError = validator.validateField(
        "confirmPassword",
        updatedForm.confirmPassword
      );
      setErrors((prev) => ({ ...prev, confirmPassword: confirmError }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validator = new FormValidator({
      hotelName: "",
      email: email || "",
      password: form.password,
      confirmPassword: form.confirmPassword,
      hotelLicenseNumber: "",
    });

    const formErrors = validator.validateForm();

    if (formErrors.global) {
      setErrors((prev) => ({ ...prev, global: formErrors.global || "" }));
      return;
    }

    if (loading) return;

    setErrors({ global: "", confirmPassword: "" });
    setLoading(true);

    try {
      // TODO: Call API to reset password
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsSubmitted(true);
    } catch {
      setErrors((prev) => ({ ...prev, global: "Failed to reset password. Please try again." }));
    } finally {
      setLoading(false);
    }
  };

  if (!isVerified) {
    return (
      <div className="rounded-2xl p-8">
        <Link
          href="/login"
          className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-[#0F75BD] hover:bg-gray-50 transition-colors mb-6"
        >
          <svg
            className="w-6 h-6 text-[#0F75BD]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </Link>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h1 className="text-4xl font-semibold text-gray-800 mb-4">
            Access Denied
          </h1>
          <p className="text-gray-500 text-sm">
            Please verify your OTP before resetting your password.
          </p>
        </div>

        <Link href="/forgot-password">
          <Button text="Start Password Reset" onClick={() => {}} />
        </Link>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="rounded-2xl p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-4xl font-semibold text-gray-800 mb-4">
            Password Reset Successfully
          </h1>
          <p className="text-gray-500 text-sm">
            Your password has been reset. You can now sign in with your new
            password.
          </p>
        </div>

        <Link href="/login">
          <Button text="Continue to Sign In" onClick={() => {}} />
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-8">
      <Link
        href="/verify-otp"
        className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-[#0F75BD] hover:bg-gray-50 transition-colors mb-6"
      >
        <svg
          className="w-6 h-6 text-[#0F75BD]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </Link>

      <div className="text-left mb-8">
        <h1 className="text-4xl font-semibold text-gray-800 mb-4">
          Reset Your Password
        </h1>
        <p className="text-gray-500 text-sm">
          Enter your new password for{" "}
          <span className="font-semibold text-gray-700">{email}</span>
        </p>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        <InputField
          label="New Password"
          type="password"
          placeholder="Enter new password"
          value={form.password}
          onChange={(e) => handleChange("password", e.target.value)}
        />

        {form.password && (
          <PasswordStrengthIndicator password={form.password} />
        )}

        <InputField
          label="Confirm Password"
          type="password"
          placeholder="Confirm new password"
          value={form.confirmPassword}
          onChange={(e) => handleChange("confirmPassword", e.target.value)}
          error={errors.confirmPassword}
        />

        {errors.global && (
          <p className="text-red-600 text-sm">{errors.global}</p>
        )}

        <Button
          text="Reset Password"
          onClick={handleSubmit}
          loading={loading}
          disabled={!isFormValid || loading}
        />
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="rounded-2xl p-8 text-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
