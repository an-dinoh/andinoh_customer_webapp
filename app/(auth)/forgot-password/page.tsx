"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import InputField from "@/components/ui/InputField";
import Button from "@/components/ui/Button";
import { useState, useMemo } from "react";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({
    global: "",
    email: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const isFormValid = useMemo(() => {
    return email.trim() !== "" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }, [email]);

  const handleChange = (value: string) => {
    setEmail(value);

    // Clear global error when user types
    if (errors.global) {
      setErrors((prev) => ({ ...prev, global: "" }));
    }

    // Validate email field
    if (value.trim() === "") {
      setErrors((prev) => ({ ...prev, email: "" }));
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setErrors((prev) => ({
        ...prev,
        email: "Please enter a valid email address.",
      }));
    } else {
      setErrors((prev) => ({ ...prev, email: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setErrors((prev) => ({ ...prev, global: "Email is required." }));
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrors((prev) => ({
        ...prev,
        global: "Please enter a valid email address.",
      }));
      return;
    }

    if (loading) return;

    setErrors({ global: "", email: "" });
    setLoading(true);

    try {
      // TODO: Send OTP to email via API
      console.log("✅ OTP sent to:", email);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsSubmitted(true);
    } catch {
      setErrors((prev) => ({ ...prev, global: "Failed to send OTP. Please try again." }));
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
  };

  if (isSubmitted) {
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

        <div className="text-left mb-8">
          <h1 className="text-4xl font-semibold text-gray-800 mb-4">
            Check Your Email
          </h1>
          <p className="text-gray-500 text-sm">
            We&apos;ve sent a 6-digit OTP to{" "}
            <span className="font-semibold text-gray-700">{email}</span>
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-700">
            Didn&apos;t receive the email? Check your spam folder or{" "}
            <button
              onClick={() => setIsSubmitted(false)}
              className="text-[#0F75BD] font-semibold hover:underline"
            >
              try again
            </button>
          </p>
        </div>

        <Button text="Continue to Verify OTP" onClick={handleContinue} />
      </div>
    );
  }

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

      <div className="text-left mb-8">
        <h1 className="text-4xl font-semibold text-gray-800 mb-4">
          Forgot Password?
        </h1>
        <p className="text-gray-500 text-sm">
          No worries, we&apos;ll send you reset instructions
        </p>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        <InputField
          label="Email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => handleChange(e.target.value)}
          error={errors.email}
        />

        {errors.global && (
          <p className="text-red-600 text-sm">{errors.global}</p>
        )}

        <Button
          text="Send Reset Link"
          onClick={handleSubmit}
          loading={loading}
          disabled={!isFormValid || loading}
        />
      </form>

      <p className="text-left text-sm text-gray-600 mt-4">
        Remember your password?{" "}
        <Link
          href="/login"
          className="text-[#0F75BD] hover:underline font-semibold"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
