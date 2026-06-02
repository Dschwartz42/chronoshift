"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavbarProps {
  dark?: boolean;
}

export default function Navbar({ dark = false }: NavbarProps) {
  const pathname = usePathname();

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 h-16 ${
        dark
          ? "border-b border-border-dark bg-surface-dark/80 backdrop-blur-sm"
          : "border-b border-border-light bg-parchment/80 backdrop-blur-sm"
      }`}
    >
      <Link
        href="/"
        className={`font-serif text-xl font-semibold tracking-tight ${
          dark ? "text-[#F5F0EA]" : "text-charcoal"
        }`}
      >
        Chronoshift
      </Link>
      <div className="flex items-center gap-6">
        <Link
          href="/explore"
          className={`text-sm font-medium transition-colors ${
            pathname === "/explore"
              ? dark
                ? "text-accent-gold"
                : "text-accent-red"
              : dark
              ? "text-[#9A9088] hover:text-[#F5F0EA]"
              : "text-charcoal-muted hover:text-charcoal"
          }`}
        >
          Explore
        </Link>
        <Link
          href="/generate"
          className={`px-4 py-2 text-sm font-medium rounded transition-colors ${
            dark
              ? "bg-accent-red text-white hover:bg-accent-red-light"
              : "bg-charcoal text-parchment hover:bg-charcoal-soft"
          }`}
        >
          Generate
        </Link>
      </div>
    </nav>
  );
}
