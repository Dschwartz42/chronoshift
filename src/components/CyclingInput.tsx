"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

const PLACEHOLDERS = [
  "What if the South won the Civil War?",
  "What if Einstein never published his theory of relativity?",
  "What if the Black Death never reached Europe?",
  "What if Alexander the Great lived to 80?",
  "What if China discovered the Americas first?",
];

export default function CyclingInput() {
  const [value, setValue] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [placeholderVisible, setPlaceholderVisible] = useState(true);
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isFocused) return;
    const interval = setInterval(() => {
      setPlaceholderVisible(false);
      setTimeout(() => {
        setPlaceholderIndex((i) => (i + 1) % PLACEHOLDERS.length);
        setPlaceholderVisible(true);
      }, 500);
    }, 3000);
    return () => clearInterval(interval);
  }, [isFocused]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) {
      inputRef.current?.focus();
      return;
    }
    setIsLoading(true);
    router.push(`/generate?q=${encodeURIComponent(trimmed)}`);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="relative">
        <div className="relative placeholder-cycle">
          {!isFocused && !value && (
            <span
              className={`placeholder-text font-sans text-base md:text-lg ${
                placeholderVisible ? "visible" : "hidden"
              }`}
              aria-hidden="true"
            >
              {PLACEHOLDERS[placeholderIndex]}
            </span>
          )}
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            aria-label="Enter your historical what-if question"
            className="w-full px-5 py-4 md:py-5 text-base md:text-lg font-sans text-charcoal bg-white border-2 border-border-light rounded-xl shadow-sm focus:outline-none focus:border-accent-red focus:shadow-[0_0_0_4px_rgba(139,26,26,0.1)] transition-all placeholder-transparent"
            placeholder=" "
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="mt-4 w-full flex items-center justify-center gap-2 px-8 py-4 bg-charcoal text-parchment font-sans font-medium text-base rounded-xl hover:bg-charcoal-soft active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Starting generation...
            </span>
          ) : (
            <>
              Rewrite History
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
