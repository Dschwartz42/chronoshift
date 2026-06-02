"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";

export default function ShareButton() {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: select the URL
    }
  };

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-surface-dark-2 border border-border-dark text-[#C8C0B8] hover:border-[#5A5450] hover:text-[#F5F0EA] transition-colors text-sm font-sans"
      aria-label="Copy share link"
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5 text-accent-gold" />
          Copied!
        </>
      ) : (
        <>
          <Share2 className="w-3.5 h-3.5" />
          Share
        </>
      )}
    </button>
  );
}
