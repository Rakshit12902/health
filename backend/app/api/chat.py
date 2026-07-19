from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import json
from app.services.llm import generate_chat_stream
from app.core.db import get_supabase

router = APIRouter()

@router.get("/sessions")
def get_user_sessions(user_id: str):
    supabase = get_supabase()
    # Fetch sessions for the user, ordered by newest first
    response = supabase.table("sessions").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
    return response.data

@router.post("/sessions")
def create_session(user_id: str, title: str = "New Chat"):
    supabase = get_supabase()
    # Create a new profile if it doesn't exist for simplicity, or just set profile_id to None
    # For now, let's create a dummy profile if we don't have one, or just insert session
    
    # First get or create user in public.users to satisfy FK
    usr_resp = supabase.table("users").select("id").eq("id", user_id).execute()
    if not usr_resp.data:
        try:
            supabase.table("users").insert({
                "id": user_id,
                "email": f"{user_id}@placeholder.com",
                "full_name": "New User"
            }).execute()
        except Exception as e:
            print(f"Error creating user: {e}")

    # Then get or create profile
    prof_resp = supabase.table("profiles").select("id").eq("user_id", user_id).execute()
    profile_id = None
    if not prof_resp.data:
        new_prof = supabase.table("profiles").insert({
            "user_id": user_id,
            "name": "Primary Profile"
        }).execute()
        profile_id = new_prof.data[0]["id"]
    else:
        profile_id = prof_resp.data[0]["id"]
        
    response = supabase.table("sessions").insert({
        "user_id": user_id,
        "profile_id": profile_id,
        "title": title
    }).execute()
    return response.data[0]

@router.get("/sessions/{session_id}/messages")
def get_session_messages(session_id: str):
    supabase = get_supabase()
    response = supabase.table("messages").select("*").eq("session_id", session_id).order("created_at", desc=False).execute()
    return response.data

class ChatRequest(BaseModel):
    session_id: str
    message: str
    language: str = "en"
    document_id: str = None # Optional, if chatting about a specific doc

@router.post("/stream")
async def chat_stream(req: ChatRequest):
    supabase = get_supabase()
    extracted_text = ""
    
    if req.document_id:
        # Fetch document context
        doc_resp = supabase.table("documents").select("extracted_text").eq("id", req.document_id).execute()
        if doc_resp.data and doc_resp.data[0].get("extracted_text"):
            extracted_text = doc_resp.data[0]["extracted_text"]
            
    # Fetch profile context (assuming one profile per session for simplicity here)
    sess_resp = supabase.table("sessions").select("profile_id").eq("id", req.session_id).execute()
    medical_history = "None"
    if sess_resp.data:
        prof_resp = supabase.table("profiles").select("medical_history").eq("id", sess_resp.data[0]["profile_id"]).execute()
        if prof_resp.data and prof_resp.data[0].get("medical_history"):
            medical_history = prof_resp.data[0]["medical_history"]

    def event_generator():
        try:
            # Save user message to DB
            supabase.table("messages").insert({
                "session_id": req.session_id,
                "sender_type": "user",
                "content": req.message
            }).execute()
            
            full_ai_response = ""
            for token in generate_chat_stream(req.message, extracted_text, req.language, medical_history):
                full_ai_response += token
                yield f"data: {json.dumps({'token': token})}\n\n"
            
            # Save AI response to DB
            supabase.table("messages").insert({
                "session_id": req.session_id,
                "sender_type": "ai",
                "content": full_ai_response
            }).execute()
            
            # Send done event
            yield f"data: {json.dumps({'event': 'done'})}\n\n"
            
        except Exception as e:
            print(f"Error in stream: {e}")
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")
