import { VideoRecord } from "./types";

export const EXAMPLE_VIDEOS: Partial<VideoRecord>[] = [
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
