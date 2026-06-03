"use client";

interface VideoPlayerProps {
  src: string;
  poster?: string;
}

export default function VideoPlayer({ src, poster }: VideoPlayerProps) {
  return (
    <video
      src={src}
      poster={poster}
      controls
      playsInline
      preload="auto"
      className="w-full h-full"
    />
  );
}
