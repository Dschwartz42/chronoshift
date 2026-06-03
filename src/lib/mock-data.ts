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
    id: "6111334f-99f6-45af-8675-c23a2effc6d9",
    prompt: "What if the South won the Civil War?",
    title: "A Nation Divided: The Confederate Century",
    duration_seconds: 338,
    thumbnail_url: "https://iqafznzwckyodegoyanc.supabase.co/storage/v1/object/public/videos/6111334f-99f6-45af-8675-c23a2effc6d9/thumbnail.jpg",
    video_url: "https://iqafznzwckyodegoyanc.supabase.co/storage/v1/object/public/videos/6111334f-99f6-45af-8675-c23a2effc6d9/video.mp4",
    is_public: true,
    status: "complete",
  },
  {
    id: "d314aa56-8ee4-49f7-8768-9b3e0fb93b7a",
    prompt: "What if Britain kept the American colonies?",
    title: "Crown and Continent: The Empire That Never Broke",
    duration_seconds: 314,
    thumbnail_url: "https://iqafznzwckyodegoyanc.supabase.co/storage/v1/object/public/videos/d314aa56-8ee4-49f7-8768-9b3e0fb93b7a/thumbnail.jpg",
    video_url: "https://iqafznzwckyodegoyanc.supabase.co/storage/v1/object/public/videos/d314aa56-8ee4-49f7-8768-9b3e0fb93b7a/video.mp4",
    is_public: true,
    status: "complete",
  },
  {
    id: "a0d3451d-5e25-4050-b5b5-215ade483132",
    prompt: "What if the Spartans won the Battle of Thermopylae?",
    title: "The Hot Gates Hold: A World Without Persian Conquest",
    duration_seconds: 290,
    thumbnail_url: "https://iqafznzwckyodegoyanc.supabase.co/storage/v1/object/public/videos/a0d3451d-5e25-4050-b5b5-215ade483132/thumbnail.jpg",
    video_url: "https://iqafznzwckyodegoyanc.supabase.co/storage/v1/object/public/videos/a0d3451d-5e25-4050-b5b5-215ade483132/video.mp4",
    is_public: true,
    status: "complete",
  },
  {
    id: "1e5eff86-e117-48c0-9c57-0a4c4497169e",
    prompt: "What if Alexander the Great lived to 80?",
    title: "The Immortal Conqueror: A World Remade by Alexander",
    duration_seconds: 378,
    thumbnail_url: "https://iqafznzwckyodegoyanc.supabase.co/storage/v1/object/public/videos/1e5eff86-e117-48c0-9c57-0a4c4497169e/thumbnail.jpg",
    video_url: "https://iqafznzwckyodegoyanc.supabase.co/storage/v1/object/public/videos/1e5eff86-e117-48c0-9c57-0a4c4497169e/video.mp4",
    is_public: true,
    status: "complete",
  },
  {
    id: "32f13f4b-a226-4393-87d4-91ef7af458bf",
    prompt: "What if the Library of Alexandria was never destroyed?",
    title: "The Eternal Flame: A World Where Alexandria Never Fell",
    duration_seconds: 391,
    thumbnail_url: "https://iqafznzwckyodegoyanc.supabase.co/storage/v1/object/public/videos/32f13f4b-a226-4393-87d4-91ef7af458bf/thumbnail.jpg",
    video_url: "https://iqafznzwckyodegoyanc.supabase.co/storage/v1/object/public/videos/32f13f4b-a226-4393-87d4-91ef7af458bf/video.mp4",
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
];

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s.toString().padStart(2, "0")}s`;
}
