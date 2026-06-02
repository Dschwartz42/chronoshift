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
ELEVENLABS_KEY = os.environ["ELEVENLABS_API_KEY"]

ELEVENLABS_VOICE_ID = "JBFqnCBsd6RMkjVDRZzb"  # George - Warm, Captivating Storyteller
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
    """Generate one scene image via Replicate FLUX, with NSFW retry."""
    prompts_to_try = [
        IMAGE_STYLE_PREFIX + scene["image_prompt"],
        IMAGE_STYLE_PREFIX + sanitize_prompt(scene["image_prompt"]),
        f"Documentary style historical illustration, ancient map and compass, parchment texture, aged paper, sepia tones, cinematic lighting, scene {scene['id']}",
    ]

    for prompt in prompts_to_try:
        for attempt in range(4):  # up to 4 retries per prompt (handles 429s)
            try:
                loop = asyncio.get_event_loop()
                output = await loop.run_in_executor(
                    None,
                    partial(
                        replicate.run,
                        "black-forest-labs/flux-1.1-pro",
                        input={
                            "prompt": prompt,
                            "aspect_ratio": "16:9",
                            "output_format": "png",
                            "output_quality": 95,
                            "safety_tolerance": 5,
                        },
                    ),
                )
                image_url = str(output)
                async with httpx.AsyncClient(timeout=60) as client:
                    resp = await client.get(image_url)
                    resp.raise_for_status()
                path = f"{tmpdir}/scene_{scene['id']}.png"
                with open(path, "wb") as f:
                    f.write(resp.content)
                return path
            except Exception as e:
                err = str(e)
                if "429" in err or "throttled" in err.lower() or "rate limit" in err.lower():
                    wait = 15 * (attempt + 1)
                    print(f"Rate limited, waiting {wait}s before retry...")
                    await asyncio.sleep(wait)
                    continue
                elif "NSFW" in err:
                    break  # try next prompt
                elif "Cannot connect" in err or "connection" in err.lower() or "timeout" in err.lower() or "network" in err.lower():
                    wait = 10 * (attempt + 1)
                    print(f"Network error, waiting {wait}s before retry...")
                    await asyncio.sleep(wait)
                    continue
                else:
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
                "model_id": "eleven_monolingual_v1",
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
    """Assemble one scene: Ken Burns effect + title card + narration audio."""
    duration = get_audio_duration(audio_path)
    output_path = f"{tmpdir}/scene_{scene['id']}_out.mp4"

    # Ken Burns zoom + title card overlay + audio
    title_escaped = scene["title"].replace("'", "\\'").replace(":", "\\:").replace(",", "\\,")
    fps = 30
    frames = int(duration * fps)

    cmd = [
        "ffmpeg", "-y",
        "-loop", "1", "-i", image_path,
        "-i", audio_path,
        "-filter_complex", (
            f"[0:v]scale=1920:1080:force_original_aspect_ratio=increase,"
            f"crop=1920:1080,"
            f"zoompan=z='min(zoom+0.0015,1.5)':d={frames}:"
            f"x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)',"
            f"scale=1920:1080,"
            f"drawtext=text='{title_escaped}'"
            f":fontsize=36:fontcolor=white:x=(w-text_w)/2:y=h-120"
            f":enable='between(t,0,3)':alpha='if(lt(t,0.5),t/0.5,if(gt(t,2.5),(3-t)/0.5,1))'[v]"
        ),
        "-map", "[v]",
        "-map", "1:a",
        "-c:v", "libx264", "-preset", "fast", "-crf", "22",
        "-c:a", "aac", "-b:a", "128k",
        "-t", str(duration),
        "-shortest",
        output_path,
    ]
    subprocess.run(cmd, check=True, capture_output=True)
    return output_path


def build_title_card(what_if: str, tmpdir: str) -> str:
    """Create opening title card: black bg, white text, 4s."""
    output = f"{tmpdir}/title_card.mp4"
    text_escaped = what_if.replace("'", "\\'").replace(":", "\\:").replace(",", "\\,")
    cmd = [
        "ffmpeg", "-y",
        "-f", "lavfi", "-i", "color=c=black:size=1920x1080:rate=30:duration=4",
        "-f", "lavfi", "-i", "anullsrc=r=44100:cl=mono:duration=4",
        "-filter_complex",
        f"[0:v]drawtext=text='{text_escaped}':fontsize=48:fontcolor=white:"
        f"x=(w-text_w)/2:y=(h-text_h)/2:alpha='if(lt(t,1),t,if(gt(t,3),4-t,1))'[v]",
        "-map", "[v]", "-map", "1:a",
        "-c:v", "libx264", "-c:a", "aac", "-t", "4",
        output,
    ]
    subprocess.run(cmd, check=True, capture_output=True)
    return output


def build_reality_card(reality: str, tmpdir: str) -> str:
    """Create closing 'Historical Reality' card: 5s fade out."""
    output = f"{tmpdir}/reality_card.mp4"
    header_escaped = "Historical Reality"
    text_escaped = reality[:120].replace("'", "\\'").replace(":", "\\:").replace(",", "\\,")
    cmd = [
        "ffmpeg", "-y",
        "-f", "lavfi", "-i", "color=c=0x1A1714:size=1920x1080:rate=30:duration=5",
        "-f", "lavfi", "-i", "anullsrc=r=44100:cl=mono:duration=5",
        "-filter_complex",
        f"[0:v]"
        f"drawtext=text='{header_escaped}':fontsize=28:fontcolor=#C9A84C:"
        f"x=(w-text_w)/2:y=(h/2-80):alpha='if(lt(t,1),t,if(gt(t,4),5-t,1))',"
        f"drawtext=text='{text_escaped}':fontsize=24:fontcolor=white:"
        f"x=(w-text_w)/2:y=(h/2):alpha='if(lt(t,1),t,if(gt(t,4),5-t,1))'[v]",
        "-map", "[v]", "-map", "1:a",
        "-c:v", "libx264", "-c:a", "aac", "-t", "5",
        output,
    ]
    subprocess.run(cmd, check=True, capture_output=True)
    return output


def concat_with_crossfades(video_paths: list[str], tmpdir: str) -> str:
    """Stitch scene videos with 1-second crossfade transitions."""
    output = f"{tmpdir}/final.mp4"

    if len(video_paths) == 1:
        return video_paths[0]

    # Build complex filter for crossfades
    inputs = []
    for p in video_paths:
        inputs.extend(["-i", p])

    n = len(video_paths)
    filter_parts = []
    # xfade each consecutive pair
    prev = "0:v"
    audio_parts = ["0:a"]
    offset = 0

    for i in range(1, n):
        dur_cmd = ["ffprobe", "-v", "error", "-show_entries", "format=duration",
                   "-of", "default=noprint_wrappers=1:nokey=1", video_paths[i - 1]]
        dur = float(subprocess.run(dur_cmd, capture_output=True, text=True).stdout.strip())
        offset += dur - 1.0  # 1s crossfade overlap
        tag = f"v{i}"
        filter_parts.append(f"[{prev}][{i}:v]xfade=transition=fade:duration=1:offset={offset:.2f}[{tag}]")
        audio_parts.append(f"{i}:a")
        prev = tag

    # Mix audio streams
    audio_filter = "".join(f"[{a}]" for a in audio_parts) + f"amix=inputs={n}:duration=first[aout]"
    filter_parts.append(audio_filter)

    full_filter = ";".join(filter_parts)

    cmd = (
        ["ffmpeg", "-y"]
        + inputs
        + ["-filter_complex", full_filter,
           "-map", f"[{prev}]", "-map", "[aout]",
           "-c:v", "libx264", "-preset", "fast", "-crf", "22",
           "-c:a", "aac", "-b:a", "128k",
           output]
    )
    subprocess.run(cmd, check=True, capture_output=True)
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

            reality_card = build_reality_card(narrative["historical_reality"], tmpdir)
            scene_videos.append(reality_card)

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
