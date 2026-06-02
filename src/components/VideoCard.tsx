"use client";

import Link from "next/link";
import { Play } from "lucide-react";

interface VideoCardProps {
  id: string;
  title: string;
  thumbnail?: string;
  duration?: string;
  small?: boolean;
}

export default function VideoCard({ id, title, thumbnail, duration, small = false }: VideoCardProps) {
  return (
    <Link href={`/watch/${id}`} className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-red rounded-lg">
      <div className={`video-card rounded-lg overflow-hidden bg-[#F0EDE8] border border-border-light ${small ? "w-56" : "w-72 md:w-80"}`}>
        {/* Thumbnail */}
        <div className={`relative ${small ? "aspect-[4/3]" : "aspect-video"} bg-[#E8E4DC] overflow-hidden`}>
          {thumbnail ? (
            <img
              src={thumbnail}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#E8E0D0] to-[#D8CFC0]">
              <svg
                viewBox="0 0 100 60"
                className="w-3/4 opacity-20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Simplified map lines */}
                <path d="M0 30 Q25 10 50 30 Q75 50 100 30" stroke="#8B6914" strokeWidth="1.5" />
                <path d="M10 10 Q30 50 60 20 Q80 0 100 40" stroke="#8B6914" strokeWidth="1" />
                <circle cx="50" cy="30" r="3" fill="#8B6914" />
                <circle cx="25" cy="22" r="2" fill="#8B6914" />
                <circle cx="75" cy="38" r="2" fill="#8B6914" />
              </svg>
            </div>
          )}
          {/* Watch overlay */}
          <div className="watch-btn absolute inset-0 bg-black/40 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
              <Play className="w-5 h-5 text-charcoal ml-0.5" fill="currentColor" />
            </div>
          </div>
          {/* Duration badge */}
          {duration && (
            <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/60 text-white text-xs rounded font-mono">
              {duration}
            </div>
          )}
        </div>
        {/* Title */}
        <div className="p-3 md:p-4">
          <p className={`font-serif text-charcoal leading-snug line-clamp-2 ${small ? "text-sm" : "text-base"}`}>
            {title}
          </p>
        </div>
      </div>
    </Link>
  );
}
