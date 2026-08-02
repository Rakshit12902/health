from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import json
import uuid
from datetime import datetime, timedelta
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

@router.delete("/sessions/{session_id}")
def delete_session(session_id: str):
    supabase = get_supabase()
    try:
        # Delete messages first to satisfy foreign keys if cascading delete isn't on
        supabase.table("messages").delete().eq("session_id", session_id).execute()
        # Delete the session
        supabase.table("sessions").delete().eq("id", session_id).execute()
        return {"status": "success", "message": "Session deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class ProfileUpdateRequest(BaseModel):
    user_id: str
    age: int = None
    gender: str = None
    blood_group: str = None

@router.get("/profile")
def get_profile(user_id: str):
    supabase = get_supabase()
    prof_resp = supabase.table("profiles").select("*").eq("user_id", user_id).execute()
    if not prof_resp.data:
        return {"status": "ok", "data": None}
    return {"status": "ok", "data": prof_resp.data[0]}

@router.post("/profile")
def update_profile(req: ProfileUpdateRequest):
    supabase = get_supabase()
    
    updates = {}
    if req.age is not None:
        updates["age"] = req.age
    if req.gender is not None:
        updates["gender"] = req.gender
    if req.blood_group is not None:
        updates["blood_group"] = req.blood_group
        
    if not updates:
        return {"status": "ok"}
        
    prof_resp = supabase.table("profiles").select("id").eq("user_id", req.user_id).execute()
    
    if prof_resp.data:
        res = supabase.table("profiles").update(updates).eq("user_id", req.user_id).execute()
    else:
        updates["user_id"] = req.user_id
        updates["name"] = "Primary Profile"
        res = supabase.table("profiles").insert([updates]).execute()
        
    return {"status": "ok", "data": res.data}

@router.get("/metrics")
def get_metrics(profile_id: str):
    supabase = get_supabase()
    try:
        res = supabase.table("metrics").select("*").eq("profile_id", profile_id).order("date_recorded", desc=False).execute()
        return {"status": "ok", "data": res.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


class ShareRequest(BaseModel):
    user_id: str
    expires_in_days: int = 7

@router.post("/doctor-links")
def create_doctor_link(req: ShareRequest):
    supabase = get_supabase()
    try:
        # Generate a unique token
        token = str(uuid.uuid4())
        # Calculate expiration
        expires_at = (datetime.utcnow() + timedelta(days=req.expires_in_days)).isoformat()
        
        # Save to DB
        res = supabase.table("doctor_links").insert({
            "user_id": req.user_id,
            "secure_token": token,
            "expires_at": expires_at
        }).execute()
        
        return {"status": "ok", "token": token, "expires_at": expires_at}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/doctor-links/{token}")
def get_shared_patient_data(token: str):
    supabase = get_supabase()
    try:
        # 1. Validate token
        link_resp = supabase.table("doctor_links").select("*").eq("secure_token", token).execute()
        if not link_resp.data:
            raise HTTPException(status_code=404, detail="Invalid or expired link")
            
        link_data = link_resp.data[0]
        
        # Check expiration (basic check, could also rely on DB timezone)
        expires_at = datetime.fromisoformat(link_data["expires_at"].replace("Z", "+00:00"))
        if datetime.utcnow().replace(tzinfo=expires_at.tzinfo) > expires_at:
            raise HTTPException(status_code=403, detail="Link has expired")
            
        user_id = link_data["user_id"]
        
        # 2. Fetch Profile Info
        prof_resp = supabase.table("profiles").select("*").eq("user_id", user_id).execute()
        profile = prof_resp.data[0] if prof_resp.data else None
        
        # 3. Fetch Metrics
        metrics = []
        if profile:
            met_resp = supabase.table("metrics").select("*").eq("profile_id", profile["id"]).order("date_recorded", desc=True).execute()
            metrics = met_resp.data
            
        # 4. Fetch Prescriptions
        presc_resp = supabase.table("prescriptions").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
        prescriptions = presc_resp.data
        
        return {
            "status": "ok",
            "data": {
                "profile": profile,
                "metrics": metrics,
                "prescriptions": prescriptions
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


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
