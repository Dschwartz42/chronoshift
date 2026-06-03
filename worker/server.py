"""
Lightweight HTTP server for the worker — receives job triggers from Next.js.
Deploy on Railway or Render alongside main.py.
"""

import os
import asyncio
from fastapi import FastAPI, HTTPException, Header, BackgroundTasks
from pydantic import BaseModel
from main import process_job

app = FastAPI()
API_KEY = os.environ.get("WORKER_API_KEY", "")

@app.on_event("startup")
async def startup():
    from main import ELEVENLABS_KEY
    print(f"[STARTUP] ELEVENLABS_KEY={ELEVENLABS_KEY[:8]}... len={len(ELEVENLABS_KEY)}", flush=True)


class TriggerRequest(BaseModel):
    jobId: str


@app.post("/trigger")
async def trigger_job(
    body: TriggerRequest,
    background_tasks: BackgroundTasks,
    x_api_key: str = Header(default=""),
):
    if API_KEY and x_api_key != API_KEY:
        raise HTTPException(status_code=401, detail="Unauthorized")
    background_tasks.add_task(process_job, body.jobId)
    return {"ok": True, "jobId": body.jobId}


@app.get("/health")
def health():
    from main import ELEVENLABS_KEY
    return {"status": "ok", "version": "v12", "el_key_prefix": ELEVENLABS_KEY[:8], "el_key_len": len(ELEVENLABS_KEY)}


@app.get("/version")
def version():
    return {"version": "v12"}
