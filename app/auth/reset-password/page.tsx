"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import InputField from "@/components/ui/InputField";
import PasswordStrengthIndicator from "@/components/ui/PasswordStrengthIndicator";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};

    if (!form.password) {
      newErrors.password = "Password is required";
    } else if (form.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    if (loading) return;

    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setLoading(false);
    router.push("/auth/login");
  };

  return (
    <div className="rounded-2xl p-8">
      <div className="text-left mb-8">
        <h1 className="text-4xl font-semibold text-gray-800 mb-4">
          Reset Password
        </h1>
        <p className="text-gray-500 text-sm">
          Please enter your new password
        </p>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        <InputField
          label="New Password"
          type="password"
          placeholder="Enter new password"
          value={form.password}
          onChange={(e) => {
            setForm({ ...form, password: e.target.value });
            if (errors.password) {
              const newErrors = { ...errors };
              delete newErrors.password;
              setErrors(newErrors);
            }
          }}
          error={errors.password}
        />

        {form.password && (
          <PasswordStrengthIndicator password={form.password} />
        )}

        <InputField
          label="Confirm Password"
          type="password"
          placeholder="Re-enter new password"
          value={form.confirmPassword}
          onChange={(e) => {
            setForm({ ...form, confirmPassword: e.target.value });
            if (errors.confirmPassword) {
              const newErrors = { ...errors };
              delete newErrors.confirmPassword;
              setErrors(newErrors);
            }
          }}
          error={errors.confirmPassword}
        />

        <Button
          text="Reset Password"
          onClick={handleSubmit}
          loading={loading}
          disabled={!form.password.trim() || !form.confirmPassword.trim() || loading}
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
