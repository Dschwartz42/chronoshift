import { VideoRecord } from "./types";

export const EXAMPLE_VIDEOS: Partial<VideoRecord>[] = [
  {
    id: "0f625caa-bef3-403c-8726-b4f9495f9a55",
    prompt: "What if Germany won WWII?",
    title: "Iron Meridian: A World Under the Eagle",
    duration_seconds: 346,
    thumbnail_url: "https://iqafznzwckyodegoyanc.supabase.co/storage/v1/object/public/videos/0f625caa-bef3-403c-8726-b4f9495f9a55/thumbnail.jpg",
    video_url: "https://iqafznzwckyodegoyanc.supabase.co/storage/v1/object/public/videos/0f625caa-bef3-403c-8726-b4f9495f9a55/video.mp4",
    is_public: true,
    status: "complete",
  },
  {
    id: "7bd35572-c59c-4ce6-89f7-55345f28639d",
    prompt: "What if the printing press was never invented?",
    title: "Ink Never Spilled: A World Without the Printing Press",
    duration_seconds: 305,
    thumbnail_url: "https://iqafznzwckyodegoyanc.supabase.co/storage/v1/object/public/videos/7bd35572-c59c-4ce6-89f7-55345f28639d/thumbnail.jpg",
    video_url: "https://iqafznzwckyodegoyanc.supabase.co/storage/v1/object/public/videos/7bd35572-c59c-4ce6-89f7-55345f28639d/video.mp4",
    is_public: true,
    status: "complete",
  },
  {
    id: "civil-war-south",
    prompt: "What if the South won the Civil War?",
    title: "The Confederate States of America: 160 Years Later",
    duration_seconds: 154,
    thumbnail_url: null,
    is_public: true,
    status: "complete",
  },
  {
    id: "british-colonies",
    prompt: "What if Britain kept the American colonies?",
    title: "Greater Britain: The Empire That Never Fell",
    duration_seconds: 168,
    thumbnail_url: null,
    is_public: true,
    status: "complete",
  },
  {
    id: "thermopylae",
    prompt: "What if the Spartans won the Battle of Thermopylae?",
    title: "The Spartan World: A Warrior Civilization's Legacy",
    duration_seconds: 142,
    thumbnail_url: null,
    is_public: true,
    status: "complete",
  },
  {
    id: "alexander-80",
    prompt: "What if Alexander the Great lived to 80?",
    title: "The Eternal Empire: Alexander's Unified World",
    duration_seconds: 176,
    thumbnail_url: null,
    is_public: true,
    status: "complete",
  },
  {
    id: "library-alexandria",
    prompt: "What if the Library of Alexandria was never destroyed?",
    title: "The Renaissance That Never Ended",
    duration_seconds: 161,
    thumbnail_url: null,
    is_public: true,
    status: "complete",
  },
  {
    id: "cuban-missile",
    prompt: "What if the Cuban Missile Crisis went nuclear?",
    title: "Aftermath: A World Without Cities",
    duration_seconds: 189,
    thumbnail_url: null,
    is_public: true,
    status: "complete",
  },
  {
    id: "china-americas",
    prompt: "What if China discovered the Americas first?",
    title: "The Zheng He Civilization: Two Worlds United",
    duration_seconds: 171,
    thumbnail_url: null,
    is_public: true,
    status: "complete",
  },
  {
    id: "roman-empire",
    prompt: "What if the Roman Empire never fell?",
    title: "Roma Aeterna: Two Thousand Years of the Eternal City",
    duration_seconds: 195,
    thumbnail_url: null,
    is_public: true,
    status: "complete",
  },
];

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s.toString().padStart(2, "0")}s`;
}
