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
    return {"status": "ok"}
