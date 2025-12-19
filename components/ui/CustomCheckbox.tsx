"use client";
import { Check } from "lucide-react";

export default function CustomCheckbox({
  accepted,
  onChange,
}: {
  accepted: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!accepted)}
      className={`h-4 w-4 flex items-center justify-center rounded-sm border transition-all duration-200
        ${
          accepted
            ? "bg-[#002968] border-[#002968]"
            : "border-gray-400 bg-transparent hover:border-[#002968]"
        }
      `}
    >
      {accepted && <Check className="h-3.5 w-3.5 text-white" />}
    </button>
  );
}
