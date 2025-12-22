"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import InputField from "@/components/ui/InputField";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setError("");
    if (loading) return;

    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setLoading(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="rounded-2xl p-8 text-center">
        <div className="w-16 h-16 bg-[#E7F2EB] rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-[#117C35]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
          </svg>
        </div>
        <h1 className="text-3xl font-semibold text-gray-800 mb-4">
          Check your email
        </h1>
        <p className="text-gray-500 text-sm mb-8">
          We've sent a password reset link to<br />
          <span className="font-semibold text-gray-700">{email}</span>
        </p>
        <Button
          text="Back to Sign In"
          onClick={() => router.push("/auth/login")}
        />
        <p className="text-left text-sm text-gray-600 mt-6">
          Didn't receive the email?{" "}
          <button
            onClick={() => setSubmitted(false)}
            className="text-[#0F75BD] hover:underline font-semibold"
          >
            Try again
          </button>
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-8">
      <div className="text-left mb-8">
        <h1 className="text-4xl font-semibold text-gray-800 mb-4">
          Forgot Password?
        </h1>
        <p className="text-gray-500 text-sm">
          No worries, we'll send you reset instructions
        </p>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        <InputField
          label="Email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError("");
          }}
          error={error}
        />

        <Button
          text="Send Reset Link"
          onClick={handleSubmit}
          loading={loading}
          disabled={!email.trim() || loading}
        />
      </form>

      <p className="text-left text-sm text-gray-600 mt-4">
        <Link
          href="/auth/login"
          className="text-[#0F75BD] hover:underline font-semibold flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Sign In
        </Link>
      </p>
    </div>
  );
}
