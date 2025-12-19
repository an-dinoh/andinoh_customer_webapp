"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";
import ArrowLeftIcon from "@/icons/ArrowLeftIcon";
import ArrowRightIcon from "@/icons/ArrowRightIcon";

export default function AnalyticsDatePicker() {
  const [selectedYear, setSelectedYear] = useState(2024);
  const [selectedMonth, setSelectedMonth] = useState(0); // 0 = JAN
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const [yearPage, setYearPage] = useState(0); // Track which page of years to show
  const dropdownRef = useRef<HTMLDivElement>(null);
  const monthsContainerRef = useRef<HTMLDivElement>(null);

  const months = [
    "JAN",
    "FEB",
    "MAR",
    "APR",
    "MAY",
    "JUN",
    "JUL",
    "AUG",
    "SEP",
    "OCT",
    "NOV",
    "DEC",
  ];

  // Generate years - 9 years per page (3x3 grid)
  const YEARS_PER_PAGE = 9;
  const BASE_YEAR = 2020;
  const startYear = BASE_YEAR + yearPage * YEARS_PER_PAGE;
  const years = Array.from({ length: YEARS_PER_PAGE }, (_, i) => startYear + i);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setShowYearDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Scroll to center the selected month with smooth animation
  useEffect(() => {
    if (monthsContainerRef.current) {
      const container = monthsContainerRef.current;
      const selectedButton = container.children[selectedMonth] as HTMLElement;
      if (selectedButton) {
        const containerWidth = container.offsetWidth;
        const buttonLeft = selectedButton.offsetLeft;
        const buttonWidth = selectedButton.offsetWidth;
        const scrollPosition =
          buttonLeft - containerWidth / 2 + buttonWidth / 2;

        container.scrollTo({
          left: scrollPosition,
          behavior: "smooth",
        });
      }
    }
  }, [selectedMonth]);

  const handlePreviousMonth = () => {
    if (selectedMonth > 0) {
      setSelectedMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth < 11) {
      setSelectedMonth((prev) => prev + 1);
    }
  };

  return (
    <div className="flex items-center justify-between gap-3 relative">
      {/* YEAR SELECTOR */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setShowYearDropdown(!showYearDropdown)}
          className="border border-[#0B0A07] px-3 py-1.5 rounded-2xl flex items-center gap-2 hover:bg-gray-50 transition-colors min-w-[95px] justify-center"
        >
          <span className="text-xs font-regular text-[#0B0A07] tracking-tight">
            {selectedYear}
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
        </button>

        {/* YEAR DROPDOWN (Big Box Grid) */}
        {showYearDropdown && (
          <div className="absolute top-full left-0 mt-3 bg-white border border-[#0B0A07] rounded-2xl p-6 z-10 min-w-[280px]">
            {/* Year range header with navigation */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
              <button
                onClick={() => setYearPage((prev) => prev - 1)}
                className="p-1.5 hover:bg-gray-100 rounded-2xl transition-colors"
              >
                <ArrowLeftIcon className="w-4 h-4 text-[#0B0A07]" />
              </button>

              <span className="text-sm font-regular text-[#0B0A07] tracking-tight">
                {startYear} - {startYear + YEARS_PER_PAGE - 1}
              </span>

              <button
                onClick={() => setYearPage((prev) => prev + 1)}
                className="p-1.5 hover:bg-gray-100 rounded-2xl transition-colors"
              >
                <ArrowRightIcon className="w-4 h-4 text-[#0B0A07]" />
              </button>
            </div>

            {/* 3x3 Grid of years */}
            <div className="grid grid-cols-3 gap-3">
              {years.map((year) => (
                <button
                  key={year}
                  onClick={() => {
                    setSelectedYear(year);
                    setShowYearDropdown(false);
                  }}
                  className={`py-3 px-4 rounded-2xl text-sm font-medium transition-all duration-200 ${
                    year === selectedYear
                      ? "bg-[#002968] text-white"
                      : "text-[#0B0A07] hover:bg-gray-100"
                  }`}
                >
                  {year}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* MONTH SELECTOR */}
      <div className="border border-[#0B0A07] px-2 py-1.5 rounded-2xl flex items-center gap-1.5">
        {/* Left Arrow - only show if not at January */}
        {selectedMonth > 0 && (
          <button
            onClick={handlePreviousMonth}
            className="p-0.5 hover:bg-gray-100 rounded transition-colors flex-shrink-0"
          >
            <ArrowLeftIcon className="w-3 h-3 text-[#0B0A07]" />
          </button>
        )}

        {/* Scrollable months container - shows 3 months at a time */}
        <div
          ref={monthsContainerRef}
          className="flex items-center gap-1 overflow-x-hidden scroll-smooth"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            width: "calc(3 * 46px + 2 * 4px)", // 3 months × 46px width + 2 gaps × 4px
          }}
        >
          {months.map((month, monthIndex) => {
            const isSelected = monthIndex === selectedMonth;
            return (
              <button
                key={monthIndex}
                onClick={() => setSelectedMonth(monthIndex)}
                className={`px-2 py-1 rounded-xl text-xs font-medium tracking-tight transition-all duration-300 flex-shrink-0 w-[46px] ${
                  isSelected
                    ? "bg-[#002968] text-white"
                    : "text-[#B3B3B2] hover:text-[#0B0A07]"
                }`}
              >
                {month}
              </button>
            );
          })}
        </div>

        {/* Right Arrow - only show if not at December */}
        {selectedMonth < 11 && (
          <button
            onClick={handleNextMonth}
            className="p-0.5 hover:bg-gray-100 rounded transition-colors flex-shrink-0"
          >
            <ArrowRightIcon className="w-3 h-3 text-[#0B0A07]" />
          </button>
        )}
      </div>
    </div>
  );
}
