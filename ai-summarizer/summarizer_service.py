from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from cachetools import TTLCache
from huggingface_hub import InferenceClient
import asyncio
import logging
import os
from dotenv import load_dotenv
load_dotenv()

app = FastAPI(title="AI Summarization Service", version="1.0")

logging.basicConfig(level=logging.INFO)

client = InferenceClient(
    provider="hf-inference",
    api_key=os.environ["HF_TOKEN"],
)

cache = TTLCache(maxsize=100, ttl=6 * 3600)
semaphore = asyncio.Semaphore(3)

class RepoSummaryRequest(BaseModel):
    readme_text: str

@app.post("/summarize")
async def summarize_repo(payload: RepoSummaryRequest):
    cache_key = hash(payload.readme_text[:2000])
    if cache_key in cache:
        logging.info("Returning cached result")
        return cache[cache_key]
    
    async with semaphore:
        try:
            readme_snippet = payload.readme_text[:2000]

            summary = client.summarization(readme_snippet, model="facebook/bart-large-cnn")
            return { "data": summary.summary_text }
        
        except Exception as e:
            logging.exception("Summarization failed")
            raise HTTPException(status_code=500, detail=str(e))
        