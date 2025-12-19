"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import InputField from "@/components/ui/InputField";
import Button from "@/components/ui/Button";
import { useState, useMemo } from "react";

interface LoginFormState {
  email: string;
  password: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState<LoginFormState>({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    global: "",
    email: "",
  });

  const [loading, setLoading] = useState(false);

  const isFormValid = useMemo(() => {
    return form.email.trim() !== "" && form.password.trim() !== "";
  }, [form.email, form.password]);

  const handleChange = (field: keyof LoginFormState, value: string) => {
    const updatedForm = { ...form, [field]: value };
    setForm(updatedForm);

    // Clear global error when user types
    if (errors.global) {
      setErrors((prev) => ({ ...prev, global: "" }));
    }

    // Validate email field
    if (field === "email") {
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
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.email.trim()) {
      setErrors((prev) => ({ ...prev, global: "Email is required." }));
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setErrors((prev) => ({
        ...prev,
        global: "Please enter a valid email address.",
      }));
      return;
    }

    if (!form.password.trim()) {
      setErrors((prev) => ({ ...prev, global: "Password is required." }));
      return;
    }

    setErrors({ global: "", email: "" });

    // Prevent double submission
    if (loading) return;

    setLoading(true);

    // Simulate loading delay for better UX
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Save dummy token to localStorage
    localStorage.setItem('token', 'dummy-token');
    localStorage.setItem('user', JSON.stringify({ email: form.email }));

    // Redirect to dashboard
    router.push("/dashboard");

    setLoading(false);
  };

  return (
    <div className="rounded-2xl p-8">
      <div className="text-left mb-8">
        <h1 className="text-4xl font-semibold text-gray-800 mb-4">
          Welcome Back
        </h1>
        <p className="text-gray-500 text-sm">
          Sign in to your account to manage your hotel
        </p>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        <InputField
          label="Email"
          type="email"
          placeholder="Enter your email"
          value={form.email}
          onChange={(e) => handleChange("email", e.target.value)}
          error={errors.email}
        />
        <InputField
          label="Password"
          type="password"
          placeholder="Enter your password"
          value={form.password}
          onChange={(e) => handleChange("password", e.target.value)}
        />

        <div className="flex flex-row-reverse items-center justify-between text-sm">
          <Link
            href="/forgot-password"
            className="text-[#0F75BD] hover:underline font-sm font-medium"
          >
            Forgot password?
          </Link>
        </div>

        {errors.global && (
          <p className="text-red-600 text-sm">{errors.global}</p>
        )}

        <Button
          text="Sign In"
          onClick={handleSubmit}
          loading={loading}
          disabled={!isFormValid || loading}
        />
      </form>

      <p className="text-left text-sm text-gray-600 mt-4">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="text-[#0F75BD] hover:underline font-semibold"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}
