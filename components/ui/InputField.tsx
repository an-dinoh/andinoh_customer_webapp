"use client";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface InputFieldProps {
  label: string;
  type?: string;
  placeholder?: string;
  value?: string;
  error?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  icon?: React.ReactNode;
  min?: string;
  step?: string;
  helpText?: string;
}

export default function InputField({
  label,
  type = "text",
  placeholder,
  value,
  error,
  onChange,
  required = false,
  icon,
  min,
  step,
  helpText,
}: InputFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";

  return (
    <div className="w-full">
      <label className="block text-[#0B0A07] text-xs sm:text-sm mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            {icon}
          </div>
        )}
        <input
          type={isPassword && !showPassword ? "password" : type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          min={min}
          step={step}
          className={`w-full rounded-xl border ${icon ? "pl-10" : "px-3"} ${isPassword ? "pr-14" : "pr-3"} py-2 text-sm text-gray-800
    focus:outline-none focus:ring-1 focus:border-transparent
    placeholder:text-[#8F8E8D] placeholder:text-sm
    ${
      error
        ? "border-red-500 focus:ring-red-500"
        : "border-[#D3D9DD] focus:ring-[#8E9397]"
    }`}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            <span className="text-[#0B0A07] text-xs sm:text-xm font-semibold cursor-pointer select-none">
              {showPassword ? "Hide" : "Show"}
            </span>
          </button>
        )}
      </div>
      {helpText && !error && (
        <p className="mt-1 text-xs text-gray-500">{helpText}</p>
      )}
      {error && (
        <p className="mt-1 text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}
