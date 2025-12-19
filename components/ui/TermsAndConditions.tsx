"use client";

import React from "react";
import CustomCheckbox from "./CustomCheckbox";

interface TermsAndConditionsProps {
  accepted: boolean;
  onChange: (value: boolean) => void;
}

export default function TermsAndConditions({
  accepted,
  onChange,
}: TermsAndConditionsProps) {
  return (
    <div className="flex items-start space-x-2 mt-4">
      <CustomCheckbox
        accepted={accepted}
        onChange={() => onChange(!accepted)}
      />

      <label htmlFor="terms" className="text-sm text-[#5C5B59] leading-snug">
        I agree to the{" "}
        <a
          href="/terms"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#0F75BD] hover:underline font-medium"
        >
          Terms of Service
        </a>{" "}
        and{" "}
        <a
          href="/privacy"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#0F75BD] font-medium hover:underline"
        >
          Privacy Policy
        </a>
        .
      </label>
    </div>
  );
}
