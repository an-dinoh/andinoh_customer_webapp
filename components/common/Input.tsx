import { InputHTMLAttributes, ReactNode } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
  helperText?: string;
}

export default function Input({
  label,
  error,
  icon,
  helperText,
  className = "",
  ...props
}: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-[#0B0A07] text-xs sm:text-sm mb-1">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            {icon}
          </div>
        )}
        <input
          className={`w-full rounded-xl border ${icon ? "pl-10" : "px-3"} pr-3 py-2 text-sm text-gray-800
    focus:outline-none focus:ring-1 focus:border-transparent
    placeholder:text-[#8F8E8D] placeholder:text-sm
    ${
      error
        ? "border-red-500 focus:ring-red-500"
        : "border-[#D3D9DD] focus:ring-[#8E9397]"
    } ${className}`}
          {...props}
        />
      </div>
      {helperText && !error && (
        <p className="mt-1 text-xs text-gray-500">{helperText}</p>
      )}
      {error && (
        <p className="mt-1 text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}
