"use client";

export const dynamic = 'force-dynamic';

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Button from "@/components/ui/Button";
import { useState, useEffect, useRef, useMemo, Suspense } from "react";

function VerifyOTPForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const isFormValid = useMemo(() => {
    return otp.every((digit) => digit !== "");
  }, [otp]);

  useEffect(() => {
    if (!email) {
      router.push("/forgot-password");
    }
  }, [email, router]);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Clear error when user types
    if (error) setError("");

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    pastedData.split("").forEach((char, index) => {
      if (index < 6) newOtp[index] = char;
    });
    setOtp(newOtp);

    // Focus the next empty input or the last input
    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const otpValue = otp.join("");

    if (otpValue.length !== 6) {
      setError("Please enter the complete 6-digit code.");
      return;
    }

    if (loading) return;

    setLoading(true);
    setError("");

    try {
      // TODO: Verify OTP with API
      console.log("✅ Verifying OTP:", otpValue);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Simulate OTP verification (replace with actual API call)
      if (otpValue === "123456") {
        // Valid OTP - redirect to reset password
        router.push(
          `/reset-password?email=${encodeURIComponent(email)}&verified=true`
        );
      } else {
        setError("Invalid OTP. Please try again.");
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      }
    } catch {
      setError("Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = () => {
    setIsResending(true);
    setResendTimer(60);
    console.log("✅ Resending OTP to:", email);
    // TODO: Resend OTP via API
    setTimeout(() => setIsResending(false), 1000);
  };

  return (
    <div className="rounded-2xl p-8">
      <Link
        href="/forgot-password"
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
        <h1 className="text-4xl font-semibold text-gray-800 mb-4">Verify OTP</h1>
        <p className="text-gray-500 text-sm">
          Enter the 6-digit code sent to{" "}
          <span className="font-semibold text-gray-700">{email}</span>
        </p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="flex gap-3 justify-between">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => { inputRefs.current[index] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={index === 0 ? handlePaste : undefined}
              className={`
                w-full h-14 text-center text-2xl font-semibold
                border-2 rounded-lg
                focus:outline-none focus:ring-2 focus:ring-[#0F75BD]
                transition-all
                ${error ? "border-red-500" : "border-gray-300"}
                ${digit ? "border-[#0F75BD]" : ""}
              `}
            />
          ))}
        </div>

        {error && <p className="text-red-600 text-sm text-center">{error}</p>}

        <Button
          text="Verify OTP"
          onClick={handleSubmit}
          loading={loading}
          disabled={!isFormValid || loading}
        />
      </form>

      <div className="mt-4 text-left">
        <p className="text-sm text-gray-600">
          Didn&apos;t receive the code?{" "}
          {resendTimer > 0 ? (
            <span className="text-gray-500">Resend in {resendTimer}s</span>
          ) : (
            <button
              onClick={handleResend}
              disabled={isResending}
              className="text-[#0F75BD] font-semibold hover:underline disabled:opacity-50"
            >
              {isResending ? "Sending..." : "Resend OTP"}
            </button>
          )}
        </p>
      </div>
    </div>
  );
}

export default function VerifyOTPPage() {
  return (
    <Suspense fallback={
      <div className="rounded-2xl p-8 text-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    }>
      <VerifyOTPForm />
    </Suspense>
  );
}
