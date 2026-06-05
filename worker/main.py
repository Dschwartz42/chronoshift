"""
Chronoshift Video Processing Worker
Runs on Railway/Render — NOT on Vercel.

Pipeline: Replicate (images) + ElevenLabs (audio) → ffmpeg assembly → Supabase Storage
"""

import os
import asyncio
import httpx
import json
import tempfile
import subprocess
from pathlib import Path
from typing import Optional
from functools import partial

import replicate
from supabase import create_client, Client

SUPABASE_URL = os.environ["NEXT_PUBLIC_SUPABASE_URL"]
SUPABASE_KEY = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
REPLICATE_TOKEN = os.environ["REPLICATE_API_TOKEN"]
ELEVENLABS_KEY = os.environ.get("ELEVENLABS_API_KEY", "dee5b4e3dc3522b53d972aafd4a27ba66b1a3e3b54f47c1edba6d3a2730c1ecf")
print(f"[BOOT] ELEVENLABS_KEY loaded: {ELEVENLABS_KEY[:8]}... (len={len(ELEVENLABS_KEY)})")

ELEVENLABS_VOICE_ID = "JBFqnCBsd6RMkjVDRZzb"  # George - Warm, Captivating Storyteller (v2)
IMAGE_STYLE_PREFIX = "Cinematic, high detail, dramatic lighting, historically accurate, documentary style, painterly realism — "

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


def update_status(job_id: str, status: str, detail: str = None):
    data = {"status": status}
    if detail:
        data["stage_detail"] = detail
    supabase.table("videos").update(data).eq("id", job_id).execute()


NSFW_REPLACEMENTS = [
    ("battle", "scene"), ("war", "historical event"), ("soldier", "figure"),
    ("army", "group"), ("fight", "confrontation"), ("kill", "defeat"),
    ("dead", "fallen"), ("death", "end"), ("blood", ""), ("weapon", "artifact"),
    ("gun", "instrument"), ("sword", "tool"), ("attack", "event"),
    ("violence", "conflict"), ("massacre", "event"), ("bomb", "device"),
    ("explosion", "event"), ("fire", "light"), ("smoke", "mist"),
]

def sanitize_prompt(prompt: str) -> str:
    result = prompt
    for word, replacement in NSFW_REPLACEMENTS:
        result = result.replace(word, replacement).replace(word.capitalize(), replacement.capitalize())
    return result


async def generate_image(scene: dict, tmpdir: str) -> str:
    """Generate one scene image via Replicate REST API with explicit timeouts."""
    prompts_to_try = [
        IMAGE_STYLE_PREFIX + scene["image_prompt"],
        IMAGE_STYLE_PREFIX + sanitize_prompt(scene["image_prompt"]),
        f"Documentary style historical illustration, ancient map and compass, parchment texture, aged paper, sepia tones, cinematic lighting, scene {scene['id']}",
    ]

    headers = {
        "Authorization": f"Bearer {REPLICATE_TOKEN}",
        "Content-Type": "application/json",
    }

    for prompt in prompts_to_try:
        for attempt in range(4):
            try:
                # Submit prediction — short timeout, just get the ID back
                async with httpx.AsyncClient(timeout=30) as client:
                    resp = await client.post(
                        "https://api.replicate.com/v1/models/black-forest-labs/flux-1.1-pro/predictions",
                        headers=headers,
                        json={
                            "input": {
                                "prompt": prompt,
                                "aspect_ratio": "16:9",
                                "output_format": "png",
                                "output_quality": 95,
                                "safety_tolerance": 5,
                            }
                        },
                    )

                    if resp.status_code == 429:
                        wait = 15 * (attempt + 1)
                        print(f"Rate limited, waiting {wait}s...")
                        await asyncio.sleep(wait)
                        continue

                    resp.raise_for_status()
                    prediction = resp.json()

                # Poll with a hard 3-minute cap, 5s intervals
                prediction_id = prediction["id"]
                async with httpx.AsyncClient(timeout=15) as poll_client:
                    for _ in range(36):  # 36 * 5s = 3 min max
                        if prediction.get("status") in ("succeeded", "failed", "canceled"):
                            break
                        await asyncio.sleep(5)
                        poll = await poll_client.get(
                            f"https://api.replicate.com/v1/predictions/{prediction_id}",
                            headers=headers,
                        )
                        prediction = poll.json()

                if prediction.get("status") != "succeeded":
                    error = prediction.get("error", "unknown error")
                    if "NSFW" in str(error):
                        break
                    raise RuntimeError(f"Prediction failed: {error}")

                image_url = prediction["output"]
                if isinstance(image_url, list):
                    image_url = image_url[0]

                async with httpx.AsyncClient(timeout=60) as dl_client:
                    img_resp = await dl_client.get(str(image_url))
                    img_resp.raise_for_status()

                path = f"{tmpdir}/scene_{scene['id']}.png"
                with open(path, "wb") as f:
                    f.write(img_resp.content)
                print(f"Scene {scene['id']} image done.")
                return path

            except httpx.TimeoutException:
                print(f"Timeout on scene {scene['id']}, attempt {attempt + 1}, retrying...")
                await asyncio.sleep(10)
                continue
            except RuntimeError as e:
                if "NSFW" in str(e):
                    break
                if attempt < 3:
                    await asyncio.sleep(10)
                    continue
                raise

    raise RuntimeError(f"Failed to generate image for scene {scene['id']} after all retries")


async def generate_audio(scene: dict, tmpdir: str) -> str:
    """Generate narration audio via ElevenLabs TTS."""
    async with httpx.AsyncClient(timeout=60) as client:
        resp = await client.post(
            f"https://api.elevenlabs.io/v1/text-to-speech/{ELEVENLABS_VOICE_ID}",
            headers={
                "xi-api-key": ELEVENLABS_KEY,
                "Content-Type": "application/json",
            },
            json={
                "text": scene["narration"],
                "model_id": "eleven_multilingual_v2",
                "voice_settings": {"stability": 0.75, "similarity_boost": 0.85},
            },
        )
        resp.raise_for_status()
    path = f"{tmpdir}/scene_{scene['id']}.mp3"
    with open(path, "wb") as f:
        f.write(resp.content)
    return path


def get_audio_duration(audio_path: str) -> float:
    """Get audio file duration in seconds via ffprobe."""
    result = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "default=noprint_wrappers=1:nokey=1", audio_path],
        capture_output=True, text=True, check=True
    )
    return float(result.stdout.strip())


def build_scene_video(scene: dict, image_path: str, audio_path: str, tmpdir: str) -> str:
    """Assemble one scene: slow pan + narration audio."""
    duration = get_audio_duration(audio_path)
    output_path = f"{tmpdir}/scene_{scene['id']}_out.mp4"

    # Slow pan: scale to 115% width, crop panning left→right over the duration.
    # At 1fps this is very fast to encode (one frame per second).
    cmd = [
        "ffmpeg", "-y",
        "-loop", "1", "-r", "3", "-i", image_path,
        "-i", audio_path,
        "-filter_complex",
        "[0:v]scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720[v]",
        "-map", "[v]",
        "-map", "1:a",
        "-r", "3",
        "-c:v", "libx264", "-preset", "ultrafast", "-crf", "26",
        "-c:a", "aac", "-b:a", "128k",
        "-movflags", "+faststart",
        "-t", str(duration),
        "-shortest",
        output_path,
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        raise RuntimeError(f"ffmpeg scene error: {result.stderr[-500:]}")
    return output_path


def build_title_card(what_if: str, tmpdir: str) -> str:
    """Create opening title card: black bg, white text, 4s."""
    output = f"{tmpdir}/title_card.mp4"
    text_file = f"{tmpdir}/title_text.txt"
    with open(text_file, "w") as f:
        f.write(what_if)
    cmd = [
        "ffmpeg", "-y",
        "-f", "lavfi", "-i", "color=c=black:size=1280x720:rate=3:duration=4",
        "-f", "lavfi", "-i", "anullsrc=r=44100:cl=mono:duration=4",
        "-filter_complex",
        f"[0:v]drawtext=textfile={text_file}:fontsize=36:fontcolor=white:"
        f"x=(w-text_w)/2:y=(h-text_h)/2[v]",
        "-map", "[v]", "-map", "1:a",
        "-c:v", "libx264", "-preset", "ultrafast",
        "-c:a", "aac", "-t", "4",
        output,
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        raise RuntimeError(f"ffmpeg title card error: {result.stderr[-500:]}")
    return output


def build_reality_card(reality: str, tmpdir: str) -> str:
    """Create closing 'Historical Reality' card using textfile to avoid escaping issues."""
    output = f"{tmpdir}/reality_card.mp4"

    # Write text to files — avoids all drawtext escaping problems
    header_file = f"{tmpdir}/reality_header.txt"
    body_file = f"{tmpdir}/reality_body.txt"
    with open(header_file, "w") as f:
        f.write("Historical Reality")
    with open(body_file, "w") as f:
        f.write(reality[:160])

    cmd = [
        "ffmpeg", "-y",
        "-f", "lavfi", "-i", "color=c=0x1A1714:size=1280x720:rate=3:duration=5",
        "-f", "lavfi", "-i", "anullsrc=r=44100:cl=mono:duration=5",
        "-filter_complex",
        f"[0:v]"
        f"drawtext=textfile={header_file}:fontsize=24:fontcolor=#C9A84C:"
        f"x=(w-text_w)/2:y=(h/2-70),"
        f"drawtext=textfile={body_file}:fontsize=16:fontcolor=white:"
        f"x=80:y=(h/2)[v]",
        "-map", "[v]", "-map", "1:a",
        "-c:v", "libx264", "-preset", "ultrafast",
        "-c:a", "aac", "-t", "5",
        output,
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        raise RuntimeError(f"ffmpeg reality card error: {result.stderr[-500:]}")
    return output


def concat_with_crossfades(video_paths: list[str], tmpdir: str) -> str:
    """Stitch scene videos via stream-copy concat (fast, no re-encoding)."""
    output = f"{tmpdir}/final.mp4"

    if len(video_paths) == 1:
        return video_paths[0]

    # Write concat list file
    list_path = f"{tmpdir}/concat.txt"
    with open(list_path, "w") as f:
        for p in video_paths:
            f.write(f"file '{p}'\n")

    cmd = [
        "ffmpeg", "-y",
        "-f", "concat", "-safe", "0", "-i", list_path,
        "-c:v", "libx264", "-preset", "ultrafast", "-crf", "26",
        "-c:a", "aac", "-b:a", "128k",
        "-movflags", "+faststart",
        output,
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        raise RuntimeError(f"ffmpeg concat error: {result.stderr[-500:]}")
    return output


def extract_thumbnail(video_path: str, tmpdir: str) -> str:
    """Extract first meaningful frame as thumbnail."""
    thumb = f"{tmpdir}/thumbnail.jpg"
    cmd = ["ffmpeg", "-y", "-ss", "00:00:05", "-i", video_path,
           "-vframes", "1", "-q:v", "2", thumb]
    subprocess.run(cmd, check=True, capture_output=True)
    return thumb


def upload_to_supabase(local_path: str, remote_path: str, content_type: str) -> str:
    """Upload file to Supabase Storage and return public URL."""
    with open(local_path, "rb") as f:
        data = f.read()
    supabase.storage.from_("videos").upload(
        remote_path, data, {"content-type": content_type, "upsert": "true"}
    )
    res = supabase.storage.from_("videos").get_public_url(remote_path)
    return res


async def process_job(job_id: str):
    """Main pipeline for a single generation job."""
    # Fetch job
    row = supabase.table("videos").select("*").eq("id", job_id).single().execute()
    job = row.data
    narrative = job["narrative_json"]
    scenes = narrative["scenes"]

    with tempfile.TemporaryDirectory() as tmpdir:
        try:
            # Step 2: Generate images sequentially to avoid rate limits
            update_status(job_id, "images", f"Generating {len(scenes)} scene illustrations...")
            image_paths = []
            for i, scene in enumerate(scenes):
                update_status(job_id, "images", f"Generating illustration {i + 1} of {len(scenes)}...")
                path = await generate_image(scene, tmpdir)
                image_paths.append(path)
                if i < len(scenes) - 1:
                    await asyncio.sleep(12)  # stay within 6/min rate limit

            # Step 3: Generate audio sequentially
            update_status(job_id, "audio", f"Generating narration for {len(scenes)} scenes...")
            audio_paths = []
            for i, scene in enumerate(scenes):
                update_status(job_id, "audio", f"Generating narration {i + 1} of {len(scenes)}...")
                path = await generate_audio(scene, tmpdir)
                audio_paths.append(path)

            # Step 4: Build scene videos sequentially (ffmpeg)
            update_status(job_id, "assembling", "Assembling scenes with Ken Burns effects...")
            scene_videos = []

            title_card = build_title_card(narrative["what_if"], tmpdir)
            scene_videos.append(title_card)

            for i, scene in enumerate(scenes):
                update_status(job_id, "assembling", f"Rendering scene {i + 1} of {len(scenes)}...")
                scene_vid = build_scene_video(scene, image_paths[i], audio_paths[i], tmpdir)
                scene_videos.append(scene_vid)

            # Stitch all scenes
            update_status(job_id, "assembling", "Stitching final video...")
            final_video = concat_with_crossfades(scene_videos, tmpdir)
            thumbnail = extract_thumbnail(final_video, tmpdir)

            # Step 5: Upload
            update_status(job_id, "assembling", "Uploading to storage...")
            video_url = upload_to_supabase(final_video, f"{job_id}/video.mp4", "video/mp4")
            thumb_url = upload_to_supabase(thumbnail, f"{job_id}/thumbnail.jpg", "image/jpeg")

            # Get total duration
            dur = get_audio_duration(final_video)

            # Mark complete
            supabase.table("videos").update({
                "status": "complete",
                "video_url": video_url,
                "thumbnail_url": thumb_url,
                "duration_seconds": int(dur),
                "is_public": True,
                "stage_detail": None,
            }).eq("id", job_id).execute()

        except Exception as e:
            print(f"Error processing job {job_id}: {e}")
            supabase.table("videos").update({
                "status": "error",
                "error_message": str(e),
            }).eq("id", job_id).execute()
            raise


if __name__ == "__main__":
    import sys
    job_id = sys.argv[1] if len(sys.argv) > 1 else None
    if not job_id:
        print("Usage: python main.py <job_id>")
        sys.exit(1)
    asyncio.run(process_job(job_id))
