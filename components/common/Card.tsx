import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
  hover?: boolean;
  onClick?: () => void;
}

export default function Card({
  children,
  className = "",
  padding = "md",
  hover = false,
  onClick
}: CardProps) {
  const paddingStyles = {
    none: "",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  const hoverClass = hover ? "transition-all duration-200" : "";
  const clickClass = onClick ? "cursor-pointer" : "";

  return (
    <div
      className={`bg-white rounded-[22px] border border-[#E5E7EB] ${paddingStyles[padding]} ${hoverClass} ${clickClass} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
