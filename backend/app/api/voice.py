import os
import io
import uuid
from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from faster_whisper import WhisperModel
from gtts import gTTS

router = APIRouter()

# Initialize Whisper model (Tiny model for CPU speed)
# Use 'tiny' or 'base' for fast CPU inference
model = None
try:
    model = WhisperModel("tiny", device="cpu", compute_type="int8")
except Exception as e:
    print(f"Failed to load Whisper model: {e}")

@router.post("/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    """Transcribes uploaded audio using Faster-Whisper."""
    if not model:
        raise HTTPException(status_code=500, detail="Whisper model not initialized")
    
    try:
        audio_bytes = await file.read()
        
        # Save temp file because whisper needs a file path or file-like object with specific formats
        temp_filename = f"temp_{uuid.uuid4()}.wav"
        with open(temp_filename, "wb") as f:
            f.write(audio_bytes)
            
        segments, info = model.transcribe(temp_filename, beam_size=5)
        
        text = " ".join([segment.text for segment in segments])
        
        # Clean up temp file
        os.remove(temp_filename)
        
        return {"text": text.strip()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


class TTSRequest(BaseModel):
    text: str
    language: str = "en"

@router.post("/speak")
async def text_to_speech(req: TTSRequest):
    """Converts text to speech using gTTS and returns the audio stream."""
    try:
        tts = gTTS(text=req.text, lang=req.language, slow=False)
        audio_fp = io.BytesIO()
        tts.write_to_fp(audio_fp)
        audio_fp.seek(0)
        
        return StreamingResponse(audio_fp, media_type="audio/mpeg")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
