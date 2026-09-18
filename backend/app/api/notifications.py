import os
import json
import logging
from pathlib import Path
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field
from app.core.db import get_supabase

router = APIRouter()
logger = logging.getLogger(__name__)

BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
SUBS_STORE_FILE = BACKEND_DIR / "curamind_push_subscriptions.json"

def load_local_subscriptions() -> list:
    if os.path.exists(SUBS_STORE_FILE):
        try:
            with open(SUBS_STORE_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            logger.warning(f"Notice loading local push subscriptions: {e}")
            return []
    return []

def save_local_subscriptions(data: list):
    try:
        with open(SUBS_STORE_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
    except Exception as e:
        logger.error(f"Notice saving local push subscriptions: {e}")

class PushSubscription(BaseModel):
    user_id: str = Field(..., max_length=128)
    endpoint: str = Field(..., max_length=1024)
    p256dh: str = Field(..., max_length=256)
    auth: str = Field(..., max_length=128)

@router.post("/subscribe")
async def subscribe(sub: PushSubscription, request: Request):
    # Validate endpoint scheme for security
    endpoint = sub.endpoint.strip()
    if not (endpoint.startswith("https://") or endpoint.startswith("http://localhost")):
        raise HTTPException(status_code=400, detail="Invalid push subscription endpoint protocol.")

    auth_header = request.headers.get("Authorization", "")
    token = None
    if auth_header.startswith("Bearer "):
        token = auth_header.split(" ", 1)[1]

    supabase = get_supabase(token=token)
    saved_to_supabase = False

    # 1. Attempt writing to Supabase
    try:
        supabase.table("push_subscriptions").upsert({
            "user_id": sub.user_id,
            "endpoint": endpoint,
            "p256dh": sub.p256dh,
            "auth": sub.auth
        }, on_conflict="user_id,endpoint").execute()
        saved_to_supabase = True
    except Exception as e:
        logger.debug(f"Notice: Supabase write notice on push_subscriptions ({e}). Saving to persistent local store.")

    # 2. Always persist to local subscriptions store so background scheduler never loses reminders
    try:
        subs = load_local_subscriptions()
        found = False
        for item in subs:
            if item.get("user_id") == sub.user_id and item.get("endpoint") == endpoint:
                item["p256dh"] = sub.p256dh
                item["auth"] = sub.auth
                found = True
                break
        if not found:
            subs.append({
                "user_id": sub.user_id,
                "endpoint": endpoint,
                "p256dh": sub.p256dh,
                "auth": sub.auth
            })
        save_local_subscriptions(subs)
    except Exception as local_err:
        logger.error(f"Notice saving local fallback subscription: {local_err}")

    return {
        "status": "success",
        "message": "Push subscription saved successfully",
        "saved_to_cloud": saved_to_supabase
    }

@router.get("/status")
async def subscription_status(user_id: str):
    clean_uid = str(user_id).strip()[:128]
    subs = load_local_subscriptions()
    user_subs = [s for s in subs if s.get("user_id") == clean_uid]
    return {
        "user_id": clean_uid,
        "active_subscriptions": len(user_subs)
    }

class UnsubscribeRequest(BaseModel):
    user_id: str = Field(..., max_length=128)

@router.post("/unsubscribe")
async def unsubscribe(req: UnsubscribeRequest):
    clean_uid = req.user_id.strip()[:128]
    # 1. Remove from local fallback store
    subs = load_local_subscriptions()
    subs = [s for s in subs if s.get("user_id") != clean_uid]
    save_local_subscriptions(subs)

    # 2. Attempt removal from Supabase if table exists
    try:
        supabase = get_supabase()
        supabase.table("push_subscriptions").delete().eq("user_id", clean_uid).execute()
    except Exception as e:
        logger.debug(f"Notice deleting push subscription from Supabase: {e}")

    return {"status": "success", "message": "Push notifications disabled"}

class TestNotificationRequest(BaseModel):
    user_id: str = Field(..., max_length=128)

@router.post("/test")
async def send_test_notification(req: TestNotificationRequest):
    try:
        from pywebpush import webpush, WebPushException
    except ImportError:
        raise HTTPException(status_code=500, detail="Push notifications not supported on this server (pywebpush missing).")
        
    clean_uid = req.user_id.strip()[:128]
    subs = load_local_subscriptions()
    
    user_subs = [s for s in subs if s.get("user_id") == clean_uid]
    
    # Try fetching from Supabase if not found locally
    if not user_subs:
        try:
            supabase = get_supabase()
            res = supabase.table("push_subscriptions").select("*").eq("user_id", clean_uid).execute()
            if res.data:
                user_subs.extend(res.data)
        except Exception:
            pass
            
    if not user_subs:
        raise HTTPException(status_code=404, detail="No active push subscriptions found for this user.")
        
    vapid_private_key = os.getenv("VAPID_PRIVATE_KEY")
    if not vapid_private_key:
        raise HTTPException(status_code=500, detail="VAPID_PRIVATE_KEY not configured on server.")
        
    vapid_claims = {"sub": "mailto:admin@curamind.com"}
    success_count = 0
    errors = []
    
    for sub in user_subs:
        try:
            webpush(
                subscription_info={
                    "endpoint": sub["endpoint"],
                    "keys": {
                        "p256dh": sub["p256dh"],
                        "auth": sub["auth"]
                    }
                },
                data=json.dumps({
                    "title": "🎉 Notification Test Successful!",
                    "body": "Your device is ready to receive CuraMind health alerts."
                }),
                vapid_private_key=vapid_private_key,
                vapid_claims=vapid_claims
            )
            success_count += 1
        except Exception as e:
            errors.append(str(e))
            
    if success_count == 0:
        raise HTTPException(status_code=500, detail=f"Failed to send push: {errors}")
        
    return {"status": "success", "message": f"Sent {success_count} test notifications."}

import uuid
from datetime import datetime

INAPP_NOTIFS_STORE_FILE = BACKEND_DIR / "curamind_inapp_notifications.json"

def _load_inapp_notifications():
    if os.path.exists(INAPP_NOTIFS_STORE_FILE):
        try:
            with open(INAPP_NOTIFS_STORE_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return {}
    return {}

def _save_inapp_notifications(data):
    try:
        with open(INAPP_NOTIFS_STORE_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
    except Exception as e:
        logger.error(f"Error saving inapp notifications: {e}")

def _get_current_user(request: Request) -> str:
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Unauthorized")
    token = auth_header.split(" ")[1]
    supabase = get_supabase()
    try:
        user_res = supabase.auth.get_user(token)
        if not user_res or not user_res.user:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user_res.user.id
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=401, detail="Authentication failed")

class InAppNotificationCreate(BaseModel):
    title: str
    body: str = ""

@router.get("/in-app")
async def get_inapp_notifications(request: Request):
    user_id = _get_current_user(request)
    all_notifs = _load_inapp_notifications()
    user_notifs = all_notifs.get(user_id, [])
    
    # Try fetching from Supabase
    try:
        supabase = get_supabase()
        res = supabase.table("in_app_notifications").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
        if res.data:
            # Sync to local
            all_notifs[user_id] = res.data
            _save_inapp_notifications(all_notifs)
            return res.data
    except Exception as e:
        logger.debug(f"Notice fetching notifications from supabase: {e}")
        
    return user_notifs

@router.post("/in-app")
async def create_inapp_notification(req: InAppNotificationCreate, request: Request):
    user_id = _get_current_user(request)
    new_notif = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "title": req.title,
        "body": req.body,
        "read": False,
        "created_at": datetime.utcnow().isoformat() + "Z"
    }
    
    all_notifs = _load_inapp_notifications()
    if user_id not in all_notifs:
        all_notifs[user_id] = []
    all_notifs[user_id].insert(0, new_notif)
    _save_inapp_notifications(all_notifs)
    
    try:
        supabase = get_supabase()
        supabase.table("in_app_notifications").insert(new_notif).execute()
    except Exception as e:
        logger.debug(f"Notice inserting notification to supabase: {e}")
        
    return new_notif

@router.patch("/in-app/{notif_id}/read")
async def mark_notification_read(notif_id: str, request: Request):
    user_id = _get_current_user(request)
    all_notifs = _load_inapp_notifications()
    user_notifs = all_notifs.get(user_id, [])
    
    for n in user_notifs:
        if n["id"] == notif_id:
            n["read"] = True
            break
            
    _save_inapp_notifications(all_notifs)
    
    try:
        supabase = get_supabase()
        supabase.table("in_app_notifications").update({"read": True}).eq("id", notif_id).eq("user_id", user_id).execute()
    except Exception as e:
        logger.debug(f"Notice updating notification in supabase: {e}")
        
    return {"status": "success"}

@router.post("/in-app/mark-all-read")
async def mark_all_notifications_read(request: Request):
    user_id = _get_current_user(request)
    all_notifs = _load_inapp_notifications()
    user_notifs = all_notifs.get(user_id, [])
    
    for n in user_notifs:
        n["read"] = True
            
    _save_inapp_notifications(all_notifs)
    
    try:
        supabase = get_supabase()
        supabase.table("in_app_notifications").update({"read": True}).eq("user_id", user_id).execute()
    except Exception as e:
        logger.debug(f"Notice updating all notifications in supabase: {e}")
        
    return {"status": "success"}

@router.delete("/in-app/{notif_id}")
async def delete_notification(notif_id: str, request: Request):
    user_id = _get_current_user(request)
    all_notifs = _load_inapp_notifications()
    user_notifs = all_notifs.get(user_id, [])
    
    all_notifs[user_id] = [n for n in user_notifs if n["id"] != notif_id]
    _save_inapp_notifications(all_notifs)
    
    try:
        supabase = get_supabase()
        supabase.table("in_app_notifications").delete().eq("id", notif_id).eq("user_id", user_id).execute()
    except Exception as e:
        logger.debug(f"Notice deleting notification in supabase: {e}")
        
    return {"status": "success"}
