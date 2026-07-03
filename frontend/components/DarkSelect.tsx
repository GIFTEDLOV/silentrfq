"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

type Option = string | { label: string; value: string };

type Props = {
  options: readonly Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  icon?: React.ReactNode;
};

function normalize(opt: Option): { label: string; value: string } {
  return typeof opt === "string" ? { label: opt, value: opt } : opt;
}

/**
 * Custom dark listbox — replaces the native <select>, which renders as a
 * large white OS-themed menu on Windows/Chrome and breaks the dark UI.
 */
export function DarkSelect({ options, value, onChange, placeholder = "Select...", disabled, className = "", icon }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const normalized = options.map(normalize);
  const selected = normalized.find((o) => o.value === value);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (v: string) => {
    onChange(v);
    setIsOpen(false);
    buttonRef.current?.focus();
  };

  const handleButtonKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setIsOpen(true);
      requestAnimationFrame(() => optionRefs.current[0]?.focus());
    }
  };

  const handleOptionKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      (optionRefs.current[index + 1] ?? optionRefs.current[0])?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      (optionRefs.current[index - 1] ?? optionRefs.current[optionRefs.current.length - 1])?.focus();
    } else if (e.key === "Tab") {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {icon && (
        <span className="pointer-events-none absolute left-3.5 top-1/2 z-10 -translate-y-1/2 text-slate-600">
          {icon}
        </span>
      )}
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((o) => !o)}
        onKeyDown={handleButtonKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`flex w-full items-center justify-between gap-2 rounded-xl border bg-white/[0.04] px-4 py-3 text-left text-sm transition-all duration-200 focus:outline-none
          ${icon ? "pl-10" : ""}
          ${
            isOpen
              ? "border-zamaYellow/50 ring-1 ring-zamaYellow/30"
              : "border-white/[0.10] hover:border-white/[0.18]"
          }
          ${disabled ? "cursor-not-allowed opacity-40" : "cursor-pointer"}
        `}
      >
        <span className={selected ? "text-white" : "text-slate-600"}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-slate-500 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div
          role="listbox"
          className="absolute z-50 mt-2 max-h-64 w-full overflow-y-auto rounded-xl border border-white/[0.12] bg-[#0A0D14]/98 p-1.5 shadow-[0_20px_50px_rgba(0,0,0,0.55)] backdrop-blur-xl"
        >
          {normalized.map((opt, i) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                ref={(el) => {
                  optionRefs.current[i] = el;
                }}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(opt.value)}
                onKeyDown={(e) => handleOptionKeyDown(e, i)}
                className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition-colors focus:outline-none
                  ${
                    isSelected
                      ? "bg-zamaYellow/[0.12] font-semibold text-zamaYellow"
                      : "text-slate-300 hover:bg-white/[0.06] hover:text-white focus:bg-white/[0.06] focus:text-white"
                  }`}
              >
                {opt.label}
                {isSelected && <Check className="h-3.5 w-3.5 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
