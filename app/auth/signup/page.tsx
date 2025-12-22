"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import InputField from "@/components/ui/InputField";
import PasswordStrengthIndicator from "@/components/ui/PasswordStrengthIndicator";

interface SignupFormState {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState<SignupFormState>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const isFormValid = useMemo(() => {
    return (
      form.firstName.trim() !== "" &&
      form.lastName.trim() !== "" &&
      form.email.trim() !== "" &&
      form.phone.trim() !== "" &&
      form.password.trim() !== "" &&
      form.confirmPassword.trim() !== "" &&
      acceptTerms
    );
  }, [form, acceptTerms]);

  const handleChange = (field: keyof SignupFormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!form.firstName.trim()) newErrors.firstName = "First name is required";
    if (!form.lastName.trim()) newErrors.lastName = "Last name is required";

    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!form.phone.trim()) newErrors.phone = "Phone number is required";

    if (!form.password) {
      newErrors.password = "Password is required";
    } else if (form.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!acceptTerms) {
      newErrors.terms = "You must accept the terms and conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;
    if (loading) return;

    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Simulate successful signup - store auth data
    localStorage.setItem("authToken", "mock-token-" + Date.now());
    localStorage.setItem("userData", JSON.stringify({
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      phone: form.phone,
    }));

    router.push("/");
    setLoading(false);
  };

  return (
    <div className="rounded-2xl p-8">
      <div className="text-left mb-8">
        <h1 className="text-4xl font-semibold text-gray-800 mb-4">
          Create Account
        </h1>
        <p className="text-gray-500 text-sm">
          Join thousands of travelers booking with Andinoh
        </p>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="First Name"
            type="text"
            placeholder="Enter first name"
            value={form.firstName}
            onChange={(e) => handleChange("firstName", e.target.value)}
            error={errors.firstName}
          />
          <InputField
            label="Last Name"
            type="text"
            placeholder="Enter last name"
            value={form.lastName}
            onChange={(e) => handleChange("lastName", e.target.value)}
            error={errors.lastName}
          />
        </div>

        <InputField
          label="Email"
          type="email"
          placeholder="Enter your email"
          value={form.email}
          onChange={(e) => handleChange("email", e.target.value)}
          error={errors.email}
        />

        <InputField
          label="Phone Number"
          type="tel"
          placeholder="+234 800 000 0000"
          value={form.phone}
          onChange={(e) => handleChange("phone", e.target.value)}
          error={errors.phone}
        />

        <InputField
          label="Password"
          type="password"
          placeholder="Enter your password"
          value={form.password}
          onChange={(e) => handleChange("password", e.target.value)}
          error={errors.password}
        />

        {form.password && (
          <PasswordStrengthIndicator password={form.password} />
        )}

        <InputField
          label="Confirm Password"
          type="password"
          placeholder="Re-enter your password"
          value={form.confirmPassword}
          onChange={(e) => handleChange("confirmPassword", e.target.value)}
          error={errors.confirmPassword}
        />

        <div>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              className="mt-1 w-4 h-4 text-[#0F75BD] border-[#E5E7EB] rounded focus:ring-[#0F75BD]"
            />
            <span className="text-sm text-[#5C5B59]">
              I agree to the{" "}
              <Link href="/terms" className="text-[#0F75BD] hover:underline font-medium">
                Terms and Conditions
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-[#0F75BD] hover:underline font-medium">
                Privacy Policy
              </Link>
            </span>
          </label>
          {errors.terms && <p className="mt-1 text-xs text-red-500">{errors.terms}</p>}
        </div>

        <Button
          text="Create Account"
          onClick={handleSubmit}
          loading={loading}
          disabled={!isFormValid || loading}
        />
      </form>

      <p className="text-left text-sm text-gray-600 mt-4">
        Already have an account?{" "}
        <Link
          href="/auth/login"
          className="text-[#0F75BD] hover:underline font-semibold"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
