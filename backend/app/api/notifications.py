import os
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from supabase import create_client

router = APIRouter()

class PushSubscription(BaseModel):
    user_id: str
    endpoint: str
    p256dh: str
    auth: str

@router.post("/subscribe")
async def subscribe(sub: PushSubscription):
    supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_KEY"))
    try:
        # Insert or update
        res = supabase.table("push_subscriptions").upsert({
            "user_id": sub.user_id,
            "endpoint": sub.endpoint,
            "p256dh": sub.p256dh,
            "auth": sub.auth
        }, on_conflict="user_id,endpoint").execute()
        
        return {"status": "success", "message": "Subscription saved"}
    except Exception as e:
        print("Subscription Error:", e)
        raise HTTPException(status_code=500, detail=str(e))
